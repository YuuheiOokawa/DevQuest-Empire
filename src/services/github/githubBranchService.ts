import type { GithubApiAdapter } from "@/lib/githubStudio/adapter";

// Branch一覧の取得と、Human Approval後にのみ呼ばれるBranch作成。

export type GithubBranch = {
  name: string;
  sha: string;
  isProtected: boolean;
};

export async function listBranches(
  adapter: GithubApiAdapter,
  owner: string,
  repo: string
): Promise<GithubBranch[]> {
  const { data } = await adapter.rest.repos.listBranches({ owner, repo, per_page: 100 });
  return data.map((b) => ({ name: b.name, sha: b.commit.sha, isProtected: b.protected ?? false }));
}

/**
 * ブランチ作成。baseBranchの先頭コミットからrefを切る。
 * 必ずHuman Approval済みの実行リクエスト経由でのみ呼ぶこと。
 */
export async function createBranch(
  adapter: GithubApiAdapter,
  params: { owner: string; repo: string; branch: string; baseBranch: string }
): Promise<{ branch: string; sha: string }> {
  const { data: baseRef } = await adapter.rest.git.getRef({
    owner: params.owner,
    repo: params.repo,
    ref: `heads/${params.baseBranch}`,
  });
  const { data } = await adapter.rest.git.createRef({
    owner: params.owner,
    repo: params.repo,
    ref: `refs/heads/${params.branch}`,
    sha: baseRef.object.sha,
  });
  return { branch: params.branch, sha: data.object.sha };
}
