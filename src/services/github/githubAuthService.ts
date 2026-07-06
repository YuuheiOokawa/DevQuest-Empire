import type { GithubApiAdapter } from "@/lib/githubStudio/adapter";

// 認証ユーザーのプロフィール・所属Organizationの取得。
// OAuthトークン自体はadapter内に閉じており、ここからは触れない。

export type GithubProfile = {
  login: string;
  name: string | null;
  avatarUrl: string;
  email: string | null;
  htmlUrl: string;
};

export type GithubOrg = {
  login: string;
  avatarUrl: string;
  description: string | null;
};

export async function getAuthenticatedProfile(adapter: GithubApiAdapter): Promise<GithubProfile> {
  const { data } = await adapter.rest.users.getAuthenticated();
  return {
    login: data.login,
    name: data.name,
    avatarUrl: data.avatar_url,
    email: data.email,
    htmlUrl: data.html_url,
  };
}

export async function listOrganizations(adapter: GithubApiAdapter): Promise<GithubOrg[]> {
  const { data } = await adapter.rest.orgs.listForAuthenticatedUser({ per_page: 50 });
  return data.map((o) => ({
    login: o.login,
    avatarUrl: o.avatar_url,
    description: o.description,
  }));
}
