import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { describeGithubError } from "@/lib/github";
import { getGithubAdapterForUser } from "@/lib/githubStudio/adapter";
import { listBranches } from "@/services/github/githubBranchService";
import { listCommits } from "@/services/github/githubCommitService";
import { listIssues } from "@/services/github/githubIssueService";
import { listPullRequests } from "@/services/github/githubPullRequestService";
import { listWorkflowRuns } from "@/services/github/githubActionsService";
import { listWorkflows } from "@/services/github/githubWorkflowService";
import { listReleases } from "@/services/github/githubReleaseService";
import { listReviewsForPull } from "@/services/github/githubReviewService";

const NAME_RE = /^[A-Za-z0-9_.-]+$/;

// 指定リポジトリの詳細(Branches/Commits/Issues/PRs/Actions/Workflows/Releases/Reviews)を
// まとめて返す読み取り専用エンドポイント。
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const owner = url.searchParams.get("owner") ?? "";
  const repo = url.searchParams.get("repo") ?? "";
  if (!NAME_RE.test(owner) || !NAME_RE.test(repo)) {
    return NextResponse.json({ error: "invalid owner/repo" }, { status: 400 });
  }

  try {
    const adapter = await getGithubAdapterForUser(session.user.id);
    const [branches, commits, issues, pulls, runs, workflows, releases] = await Promise.all([
      listBranches(adapter, owner, repo),
      listCommits(adapter, owner, repo),
      listIssues(adapter, owner, repo),
      listPullRequests(adapter, owner, repo),
      listWorkflowRuns(adapter, owner, repo).catch(() => []),
      listWorkflows(adapter, owner, repo).catch(() => []),
      listReleases(adapter, owner, repo).catch(() => []),
    ]);
    // レビューは直近PR(最大3件)分のみ取得してAPI消費を抑える
    const reviews = (
      await Promise.all(
        pulls.slice(0, 3).map((p) => listReviewsForPull(adapter, owner, repo, p.number).catch(() => []))
      )
    ).flat();

    return NextResponse.json({ branches, commits, issues, pulls, runs, workflows, releases, reviews });
  } catch (error) {
    return NextResponse.json({ error: describeGithubError(error) }, { status: 502 });
  }
}
