import { Octokit } from "@octokit/rest";
import { prisma } from "@/lib/prisma";
import { GithubTokenMissingError } from "@/lib/github";

// AI開発スタジオのGitHub接続アダプタ(Adapter Pattern)。
// サービス層はこのインターフェースにのみ依存し、REST/GraphQLの実装詳細や
// 認証方式(OAuthトークン)から分離する。将来GitHub CLI / GitHub MCP /
// GitHub Appへ差し替える場合は、この実装を入れ替えるだけでよい。
//
// セキュリティ方針:
// - トークンはDBのAccountテーブル(OAuth)からのみ取得し、コードへ直書きしない
// - トークンをログ・エラーメッセージへ出力しない
// - 書き込み操作はHuman Approval済みの実行リクエストからのみ呼ばれる(route側で担保)

export type GraphqlVariables = Record<string, string | number | boolean | null>;

export interface GithubApiAdapter {
  /** REST APIクライアント(Octokit)。 */
  readonly rest: Octokit;
  /** GraphQL API。RESTで賄えない集計系クエリ用。 */
  graphql<T>(query: string, variables?: GraphqlVariables): Promise<T>;
  /** 認証ユーザーのGitHub login(操作ログの主体表示用)。 */
  readonly login: string | null;
}

class OctokitAdapter implements GithubApiAdapter {
  readonly rest: Octokit;
  readonly login: string | null;
  private readonly token: string;

  constructor(token: string, login: string | null) {
    this.rest = new Octokit({ auth: token });
    this.token = token;
    this.login = login;
  }

  async graphql<T>(query: string, variables?: GraphqlVariables): Promise<T> {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables: variables ?? {} }),
    });
    if (!res.ok) {
      // トークンを含めないよう、ステータスのみでエラー化する
      throw Object.assign(new Error(`GitHub GraphQL error`), { status: res.status });
    }
    const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
    if (json.errors?.length) {
      throw new Error(`GitHub GraphQL error: ${json.errors[0].message}`);
    }
    return json.data as T;
  }
}

/** ログインユーザーのOAuthトークンでアダプタを生成する。 */
export async function getGithubAdapterForUser(userId: string): Promise<GithubApiAdapter> {
  const [account, user] = await Promise.all([
    prisma.account.findFirst({ where: { userId, provider: "github" } }),
    prisma.user.findUnique({ where: { id: userId } }),
  ]);
  if (!account?.access_token) {
    throw new GithubTokenMissingError();
  }
  const login = (user as { githubLogin?: string | null } | null)?.githubLogin ?? null;
  return new OctokitAdapter(account.access_token, login);
}
