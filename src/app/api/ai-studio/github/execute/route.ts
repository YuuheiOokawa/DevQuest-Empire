import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { describeGithubError } from "@/lib/github";
import { getGithubAdapterForUser } from "@/lib/githubStudio/adapter";
import { getAuthenticatedProfile } from "@/services/github/githubAuthService";
import { createRepository } from "@/services/github/githubRepositoryService";
import { createBranch } from "@/services/github/githubBranchService";
import { commitAndPushFiles } from "@/services/github/githubCommitService";
import { createIssue } from "@/services/github/githubIssueService";
import { createPullRequest, mergePullRequest } from "@/services/github/githubPullRequestService";
import { createRelease } from "@/services/github/githubReleaseService";
import { dispatchWorkflow } from "@/services/github/githubActionsService";
import { submitReview } from "@/services/github/githubReviewService";

// ============================================================
// Human Approval済み操作の実行エンドポイント(書き込みはここだけ)。
//
// 安全設計:
// - 操作はホワイトリストの9種のみ(それ以外は400)
// - 対象は認証ユーザー自身のアカウント配下のリポジトリのみ(403)
// - UI側でCEOがApprove→実行ボタンを押したときにのみ呼ばれる。
//   AI(ルールベースの進行ロジック)がこのエンドポイントを叩く経路は存在しない
// - トークンはアダプタ内に閉じ、ログ・レスポンスへ出さない
// - CSRF: セッションCookie(HttpOnly/SameSite=Lax)+JSONボディ必須のため
//   クロスサイトのフォーム送信では実行できない
// ============================================================

const NAME_RE = /^[A-Za-z0-9_.-]+$/;
const BRANCH_RE = /^[A-Za-z0-9_./-]+$/;
const MAX_FILES = 40;
const MAX_FILE_SIZE = 100_000; // 100KB/ファイル(スキャフォールド用途)

type ExecuteBody =
  | { action: "createRepository"; name: string; description: string; isPrivate: boolean }
  | { action: "createIssue"; owner: string; repo: string; title: string; body: string }
  | { action: "createBranch"; owner: string; repo: string; branch: string; baseBranch: string }
  | {
      action: "pushFiles";
      owner: string;
      repo: string;
      branch: string;
      message: string;
      files: { path: string; content: string }[];
    }
  | { action: "createPullRequest"; owner: string; repo: string; title: string; body: string; head: string; base: string }
  | { action: "mergePullRequest"; owner: string; repo: string; number: number }
  | { action: "createRelease"; owner: string; repo: string; tagName: string; name: string; body: string }
  | { action: "dispatchWorkflow"; owner: string; repo: string; workflowFile: string; ref: string }
  | { action: "submitReview"; owner: string; repo: string; number: number; body: string };

function isSafePath(path: string): boolean {
  return (
    path.length > 0 &&
    path.length < 200 &&
    !path.startsWith("/") &&
    !path.includes("..") &&
    !path.includes("\\")
  );
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: ExecuteBody;
  try {
    body = (await request.json()) as ExecuteBody;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  try {
    const adapter = await getGithubAdapterForUser(session.user.id);
    // 操作対象を認証ユーザー自身のリポジトリに限定する
    const profile = await getAuthenticatedProfile(adapter);
    if ("owner" in body && body.owner !== profile.login) {
      return NextResponse.json({ error: "自分のアカウント配下のリポジトリのみ操作できます" }, { status: 403 });
    }

    switch (body.action) {
      case "createRepository": {
        if (!NAME_RE.test(body.name)) {
          return NextResponse.json({ error: "invalid repository name" }, { status: 400 });
        }
        const result = await createRepository(adapter, {
          name: body.name,
          description: String(body.description).slice(0, 300),
          isPrivate: body.isPrivate !== false, // 明示しない限りprivate
        });
        return NextResponse.json({ ok: true, result });
      }
      case "createIssue": {
        const result = await createIssue(adapter, {
          owner: body.owner,
          repo: body.repo,
          title: String(body.title).slice(0, 200),
          body: String(body.body).slice(0, 5000),
        });
        return NextResponse.json({ ok: true, result });
      }
      case "createBranch": {
        if (!BRANCH_RE.test(body.branch) || !BRANCH_RE.test(body.baseBranch)) {
          return NextResponse.json({ error: "invalid branch name" }, { status: 400 });
        }
        const result = await createBranch(adapter, body);
        return NextResponse.json({ ok: true, result });
      }
      case "pushFiles": {
        if (!BRANCH_RE.test(body.branch)) {
          return NextResponse.json({ error: "invalid branch name" }, { status: 400 });
        }
        if (!Array.isArray(body.files) || body.files.length === 0 || body.files.length > MAX_FILES) {
          return NextResponse.json({ error: `files must be 1-${MAX_FILES}` }, { status: 400 });
        }
        for (const f of body.files) {
          if (!isSafePath(f.path) || typeof f.content !== "string" || f.content.length > MAX_FILE_SIZE) {
            return NextResponse.json({ error: `invalid file: ${f.path}` }, { status: 400 });
          }
        }
        const result = await commitAndPushFiles(adapter, {
          owner: body.owner,
          repo: body.repo,
          branch: body.branch,
          message: String(body.message).slice(0, 300),
          files: body.files,
        });
        return NextResponse.json({ ok: true, result });
      }
      case "createPullRequest": {
        const result = await createPullRequest(adapter, {
          owner: body.owner,
          repo: body.repo,
          title: String(body.title).slice(0, 200),
          body: String(body.body).slice(0, 20000),
          head: body.head,
          base: body.base,
        });
        return NextResponse.json({ ok: true, result });
      }
      case "mergePullRequest": {
        const result = await mergePullRequest(adapter, {
          owner: body.owner,
          repo: body.repo,
          number: Number(body.number),
        });
        return NextResponse.json({ ok: true, result });
      }
      case "createRelease": {
        if (!BRANCH_RE.test(body.tagName)) {
          return NextResponse.json({ error: "invalid tag name" }, { status: 400 });
        }
        const result = await createRelease(adapter, {
          owner: body.owner,
          repo: body.repo,
          tagName: body.tagName,
          name: String(body.name).slice(0, 200),
          body: String(body.body).slice(0, 10000),
        });
        return NextResponse.json({ ok: true, result });
      }
      case "dispatchWorkflow": {
        if (!isSafePath(body.workflowFile) || !BRANCH_RE.test(body.ref)) {
          return NextResponse.json({ error: "invalid workflow/ref" }, { status: 400 });
        }
        const result = await dispatchWorkflow(adapter, {
          owner: body.owner,
          repo: body.repo,
          workflowFile: body.workflowFile,
          ref: body.ref,
        });
        return NextResponse.json({ ok: true, result });
      }
      case "submitReview": {
        const result = await submitReview(adapter, {
          owner: body.owner,
          repo: body.repo,
          number: Number(body.number),
          body: String(body.body).slice(0, 5000),
        });
        return NextResponse.json({ ok: true, result });
      }
      default:
        return NextResponse.json({ error: "unknown action" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: describeGithubError(error) }, { status: 502 });
  }
}
