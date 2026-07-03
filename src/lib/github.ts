import { Octokit } from "@octokit/rest";
import { prisma } from "@/lib/prisma";

export class GithubTokenMissingError extends Error {
  constructor() {
    super("GitHubアカウントのアクセストークンが見つかりません");
    this.name = "GithubTokenMissingError";
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
  const status = (error as { status?: number } | null)?.status;
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
  const commits = await octokit.paginate(octokit.repos.listCommits, {
    owner,
    repo,
    author: githubLogin,
    since: since?.toISOString(),
    per_page: 100,
  });

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
