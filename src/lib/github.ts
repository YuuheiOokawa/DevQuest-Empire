import { Octokit } from "@octokit/rest";
import { prisma } from "@/lib/prisma";

export class GithubTokenMissingError extends Error {
  constructor() {
    super("GitHubアカウントのアクセストークンが見つかりません");
    this.name = "GithubTokenMissingError";
  }
}

/** 同期の連打を防ぐためのクールダウン中に投げるエラー。 */
export class SyncCooldownError extends Error {
  readonly retryAfterSeconds: number;
  constructor(retryAfterSeconds: number) {
    super(`同期のクールダウン中です(あと${retryAfterSeconds}秒)`);
    this.name = "SyncCooldownError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export async function getOctokitForUser(userId: string): Promise<Octokit> {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "github" },
  });

  if (!account?.access_token) {
    throw new GithubTokenMissingError();
  }

  return new Octokit({ auth: account.access_token });
}

/**
 * GitHub関連の例外を、画面に表示できる日本語メッセージへ変換する。
 * Rate Limit(403/429)・トークン欠落・その他で文言を出し分ける。
 */
export function describeGithubError(error: unknown): string {
  if (error instanceof GithubTokenMissingError) {
    return "GitHub連携が切れています。設定画面から再度連携してください。";
  }
  if (error instanceof SyncCooldownError) {
    return `同期は少し間隔を空けて行ってください(あと約${error.retryAfterSeconds}秒)。`;
  }
  const status = (error as { status?: number } | null)?.status;
  if (status === 401) {
    return "GitHubのアクセストークンが失効しています。設定画面から再度連携してください。";
  }
  if (status === 403 || status === 429) {
    return "GitHub APIの利用制限に達しました。しばらく時間をおいて再度お試しください。";
  }
  return "GitHubとの通信でエラーが発生しました。時間をおいて再度お試しください。";
}

export type RepositoryWithSyncState = {
  id: string;
  fullName: string;
  isPrivate: boolean;
  syncEnabled: boolean;
  privateConsent: boolean;
  lastSyncedAt: Date | null;
};

/**
 * GitHub上の自分が所有するリポジトリ一覧を取得し、
 * DBのGithubRepositoryレコードと突き合わせて(無ければ作成して)返す。
 * 同期はオプトアウト方式: 新規発見したリポジトリはデフォルトで同期ONにする
 * (不要なものは設定画面で個別にOFFにできる)。
 */
export async function getRepositoriesForUser(
  userId: string
): Promise<RepositoryWithSyncState[]> {
  const octokit = await getOctokitForUser(userId);

  const githubRepos = await octokit.paginate(
    octokit.repos.listForAuthenticatedUser,
    { affiliation: "owner", per_page: 100 }
  );

  const results: RepositoryWithSyncState[] = [];

  for (const repo of githubRepos) {
    const record = await prisma.githubRepository.upsert({
      where: { userId_fullName: { userId, fullName: repo.full_name } },
      update: { isPrivate: repo.private },
      create: {
        userId,
        fullName: repo.full_name,
        isPrivate: repo.private,
        syncEnabled: true,
        privateConsent: repo.private, // 自分所有リポジトリの自動登録なので同意済み扱い
      },
    });

    results.push({
      id: record.id,
      fullName: record.fullName,
      isPrivate: record.isPrivate,
      syncEnabled: record.syncEnabled,
      privateConsent: record.privateConsent,
      lastSyncedAt: record.lastSyncedAt,
    });
  }

  return results;
}

export type FetchedCommit = {
  sha: string;
  message: string;
  committedAt: Date;
};

export type FetchedIssue = {
  issueNumber: number;
  state: string;
  closedAt: Date | null;
};

export type FetchedPullRequest = {
  prNumber: number;
  state: string;
  createdAt: Date;
  mergedAt: Date | null;
};

/**
 * 指定リポジトリの、自分がauthorのコミットを取得する。
 * sinceを渡すと差分のみ(GitHub APIのネイティブフィルタ)を取得する。
 */
export async function fetchCommits(
  octokit: Octokit,
  owner: string,
  repo: string,
  githubLogin: string,
  since?: Date
): Promise<FetchedCommit[]> {
  let commits;
  try {
    commits = await octokit.paginate(octokit.repos.listCommits, {
      owner,
      repo,
      author: githubLogin,
      since: since?.toISOString(),
      per_page: 100,
    });
  } catch (err) {
    // コミットが1件も無い(空の)リポジトリに対してlistCommitsを呼ぶと
    // GitHub APIは409 "Git Repository is empty."を返す(削除・権限喪失時は404)。
    // 409は同期対象として正常なケース(コミット0件)なので、エラーにせず空配列を返す。
    const status = (err as { status?: number } | null)?.status;
    if (status === 409) {
      return [];
    }
    throw err;
  }

  return commits.map((c) => ({
    sha: c.sha,
    message: c.commit.message.split("\n")[0].slice(0, 500),
    committedAt: new Date(
      c.commit.author?.date ?? c.commit.committer?.date ?? Date.now()
    ),
  }));
}

/**
 * 指定リポジトリの、自分が作成してcloseされたIssueを取得する。
 * (GitHubのissues APIはPRも一緒に返すため pull_request プロパティで除外する)
 */
export async function fetchClosedIssues(
  octokit: Octokit,
  owner: string,
  repo: string,
  githubLogin: string,
  since?: Date
): Promise<FetchedIssue[]> {
  const issues = await octokit.paginate(octokit.issues.listForRepo, {
    owner,
    repo,
    creator: githubLogin,
    state: "closed",
    since: since?.toISOString(),
    per_page: 100,
  });

  return issues
    .filter((issue) => !("pull_request" in issue))
    .map((issue) => ({
      issueNumber: issue.number,
      state: issue.state,
      closedAt: issue.closed_at ? new Date(issue.closed_at) : null,
    }));
}

/**
 * 指定リポジトリの、自分がauthorのPull Requestを取得する。
 * pulls.list APIには author/since フィルタが無いため、updated降順で取得しながら
 * sinceより古い更新日時に達した時点で打ち切る(全件走査を避ける)。
 */
export async function fetchPullRequestsByUser(
  octokit: Octokit,
  owner: string,
  repo: string,
  githubLogin: string,
  since?: Date
): Promise<FetchedPullRequest[]> {
  const results: FetchedPullRequest[] = [];
  let page = 1;

  while (true) {
    const { data } = await octokit.pulls.list({
      owner,
      repo,
      state: "all",
      sort: "updated",
      direction: "desc",
      per_page: 100,
      page,
    });

    if (data.length === 0) break;

    for (const pr of data) {
      if (since && new Date(pr.updated_at) < since) {
        return results;
      }
      if (pr.user?.login === githubLogin) {
        results.push({
          prNumber: pr.number,
          state: pr.state,
          createdAt: new Date(pr.created_at),
          mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
        });
      }
    }

    if (data.length < 100) break;
    page += 1;
  }

  return results;
}
