import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { describeGithubError } from "@/lib/github";
import { getGithubAdapterForUser } from "@/lib/githubStudio/adapter";
import { getLatestRunSteps } from "@/services/github/githubActionsService";

const NAME_RE = /^[A-Za-z0-9_.-]+$/;

// 実CI結果の自動取り込み: 最新Runとステップ結果を返す(読み取り専用)。
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const owner = url.searchParams.get("owner") ?? "";
  const repo = url.searchParams.get("repo") ?? "";
  if (!NAME_RE.test(owner) || !NAME_RE.test(repo)) {
    return NextResponse.json({ error: "invalid owner/repo" }, { status: 400 });
  }
  try {
    const adapter = await getGithubAdapterForUser(session.user.id);
    const result = await getLatestRunSteps(adapter, owner, repo);
    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json({ error: describeGithubError(error) }, { status: 502 });
  }
}
