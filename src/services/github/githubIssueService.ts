import type { GithubApiAdapter } from "@/lib/githubStudio/adapter";

// Issue一覧の取得と、プロジェクト開始時のトラッキングIssue作成。

export type GithubIssueSummary = {
  number: number;
  title: string;
  state: string;
  author: string;
  createdAt: string;
  htmlUrl: string;
};

export async function listIssues(
  adapter: GithubApiAdapter,
  owner: string,
  repo: string
): Promise<GithubIssueSummary[]> {
  const { data } = await adapter.rest.issues.listForRepo({ owner, repo, state: "all", per_page: 30 });
  return data
    .filter((i) => !("pull_request" in i))
    .map((i) => ({
      number: i.number,
      title: i.title,
      state: i.state,
      author: i.user?.login ?? "unknown",
      createdAt: i.created_at,
      htmlUrl: i.html_url,
    }));
}

export async function createIssue(
  adapter: GithubApiAdapter,
  params: { owner: string; repo: string; title: string; body: string }
): Promise<{ number: number; htmlUrl: string }> {
  const { data } = await adapter.rest.issues.create(params);
  return { number: data.number, htmlUrl: data.html_url };
}
