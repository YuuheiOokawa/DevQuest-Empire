import type { GithubApiAdapter } from "@/lib/githubStudio/adapter";

// Pull Requestの取得・作成・マージ。作成とマージはHuman Approval後のみ。

export type GithubPullSummary = {
  number: number;
  title: string;
  state: string;
  merged: boolean;
  author: string;
  head: string;
  base: string;
  createdAt: string;
  htmlUrl: string;
};

export async function listPullRequests(
  adapter: GithubApiAdapter,
  owner: string,
  repo: string
): Promise<GithubPullSummary[]> {
  const { data } = await adapter.rest.pulls.list({ owner, repo, state: "all", per_page: 30 });
  return data.map((p) => ({
    number: p.number,
    title: p.title,
    state: p.state,
    merged: p.merged_at !== null,
    author: p.user?.login ?? "unknown",
    head: p.head.ref,
    base: p.base.ref,
    createdAt: p.created_at,
    htmlUrl: p.html_url,
  }));
}

/** PR作成。必ずHuman Approval済みの実行リクエスト経由でのみ呼ぶこと。 */
export async function createPullRequest(
  adapter: GithubApiAdapter,
  params: { owner: string; repo: string; title: string; body: string; head: string; base: string }
): Promise<{ number: number; htmlUrl: string }> {
  const { data } = await adapter.rest.pulls.create(params);
  return { number: data.number, htmlUrl: data.html_url };
}

/** PRマージ。必ずHuman Approval済みの実行リクエスト経由でのみ呼ぶこと。 */
export async function mergePullRequest(
  adapter: GithubApiAdapter,
  params: { owner: string; repo: string; number: number }
): Promise<{ merged: boolean; sha: string }> {
  const { data } = await adapter.rest.pulls.merge({
    owner: params.owner,
    repo: params.repo,
    pull_number: params.number,
    merge_method: "squash",
  });
  return { merged: data.merged, sha: data.sha };
}
