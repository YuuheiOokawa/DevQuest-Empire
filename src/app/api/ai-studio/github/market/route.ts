import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { describeGithubError } from "@/lib/github";
import { getGithubAdapterForUser } from "@/lib/githubStudio/adapter";

// 市場分析の実データ連携: GitHub Search API(公式API・スクレイピング不使用)で
// カテゴリ関連の人気リポジトリを取得し、市場シグナルとして返す(読み取り専用)。
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const q = (new URL(request.url).searchParams.get("q") ?? "").slice(0, 80);
  if (!q.trim()) return NextResponse.json({ error: "q required" }, { status: 400 });

  try {
    const adapter = await getGithubAdapterForUser(session.user.id);
    const { data } = await adapter.rest.search.repos({
      q: `${q} in:name,description,topics`,
      sort: "stars",
      order: "desc",
      per_page: 5,
    });
    const signals = data.items.map(
      (r) => `${r.full_name}(★${r.stargazers_count.toLocaleString()}): ${(r.description ?? "").slice(0, 60)}`
    );
    return NextResponse.json({ totalCount: data.total_count, signals });
  } catch (error) {
    return NextResponse.json({ error: describeGithubError(error) }, { status: 502 });
  }
}
