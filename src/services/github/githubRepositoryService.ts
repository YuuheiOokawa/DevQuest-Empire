import type { GithubApiAdapter } from "@/lib/githubStudio/adapter";

// Repository一覧の取得と、Human Approval後にのみ呼ばれるRepository作成。

export type GithubRepoSummary = {
  fullName: string;
  name: string;
  owner: string;
  isPrivate: boolean;
  description: string | null;
  defaultBranch: string;
  htmlUrl: string;
  updatedAt: string | null;
  language: string | null;
  stargazers: number;
};

export async function listRepositories(adapter: GithubApiAdapter): Promise<GithubRepoSummary[]> {
  const { data } = await adapter.rest.repos.listForAuthenticatedUser({
    affiliation: "owner",
    sort: "updated",
    per_page: 100,
  });
  return data.map((r) => ({
    fullName: r.full_name,
    name: r.name,
    owner: r.owner.login,
    isPrivate: r.private,
    description: r.description,
    defaultBranch: r.default_branch ?? "main",
    htmlUrl: r.html_url,
    updatedAt: r.updated_at ?? null,
    language: r.language ?? null,
    stargazers: r.stargazers_count ?? 0,
  }));
}

/**
 * Repository作成(POST /user/repos)。
 * 必ずHuman Approval済みの実行リクエスト経由でのみ呼ぶこと。
 * auto_init: true でmainブランチと初期コミットを作り、直後のブランチ作成を可能にする。
 */
export async function createRepository(
  adapter: GithubApiAdapter,
  params: { name: string; description: string; isPrivate: boolean }
): Promise<{ fullName: string; owner: string; name: string; htmlUrl: string; defaultBranch: string }> {
  const { data } = await adapter.rest.repos.createForAuthenticatedUser({
    name: params.name,
    description: params.description,
    private: params.isPrivate,
    auto_init: true,
  });
  return {
    fullName: data.full_name,
    owner: data.owner.login,
    name: data.name,
    htmlUrl: data.html_url,
    defaultBranch: data.default_branch ?? "main",
  };
}
