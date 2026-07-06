import type { GithubApiAdapter } from "@/lib/githubStudio/adapter";

// Releaseの取得と、Human Approval後にのみ呼ばれるRelease作成。

export type GithubReleaseSummary = {
  id: number;
  tagName: string;
  name: string | null;
  draft: boolean;
  prerelease: boolean;
  createdAt: string;
  htmlUrl: string;
};

export async function listReleases(
  adapter: GithubApiAdapter,
  owner: string,
  repo: string
): Promise<GithubReleaseSummary[]> {
  const { data } = await adapter.rest.repos.listReleases({ owner, repo, per_page: 20 });
  return data.map((r) => ({
    id: r.id,
    tagName: r.tag_name,
    name: r.name,
    draft: r.draft,
    prerelease: r.prerelease,
    createdAt: r.created_at,
    htmlUrl: r.html_url,
  }));
}

/** Release作成。必ずHuman Approval済みの実行リクエスト経由でのみ呼ぶこと。 */
export async function createRelease(
  adapter: GithubApiAdapter,
  params: { owner: string; repo: string; tagName: string; name: string; body: string }
): Promise<{ tagName: string; htmlUrl: string }> {
  const { data } = await adapter.rest.repos.createRelease({
    owner: params.owner,
    repo: params.repo,
    tag_name: params.tagName,
    name: params.name,
    body: params.body,
    generate_release_notes: true,
  });
  return { tagName: data.tag_name, htmlUrl: data.html_url };
}
