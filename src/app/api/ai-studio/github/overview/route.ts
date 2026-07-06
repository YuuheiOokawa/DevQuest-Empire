import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { describeGithubError } from "@/lib/github";
import { getGithubAdapterForUser } from "@/lib/githubStudio/adapter";
import { getAuthenticatedProfile, listOrganizations } from "@/services/github/githubAuthService";
import { listRepositories } from "@/services/github/githubRepositoryService";

// GitHub連携ダッシュボード用の読み取り専用エンドポイント。
// 認証ユーザーのプロフィール・Organization・Repository一覧を返す。

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const adapter = await getGithubAdapterForUser(session.user.id);
    const [profile, orgs, repos] = await Promise.all([
      getAuthenticatedProfile(adapter),
      listOrganizations(adapter),
      listRepositories(adapter),
    ]);
    return NextResponse.json({ profile, orgs, repos });
  } catch (error) {
    return NextResponse.json({ error: describeGithubError(error) }, { status: 502 });
  }
}
