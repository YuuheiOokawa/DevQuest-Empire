import { prisma } from "@/lib/prisma";

// GitHub関連の集計処理をまとめるサービス層。
// 実際のGitHub API呼び出し(Octokit)はlib/github.ts・lib/sync/syncGithub.tsが担い、
// ここでは既に同期済みのローカルDBデータの集計のみを行う
// (GitHub APIのレート制限とは無関係だが、短時間の連続アクセスでのDB負荷を
// 抑えるため簡易的なメモリキャッシュを設けている)。

export type ActivityCounts = {
  commits: number;
  issues: number;
  prs: number;
};

export type ActivityHeatmapDay = {
  date: string; // YYYY-MM-DD
  count: number;
};

type CacheEntry<T> = { value: T; expiresAt: number };
const CACHE_TTL_MS = 30_000;
const cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt < Date.now()) {
    cache.delete(key);
    return undefined;
  }
  return entry.value as T;
}

function setCached<T>(key: string, value: T): void {
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

/**
 * 指定日数さかのぼった活動件数(コミット数・Issueクローズ数・PRマージ数)を集計する。
 * lib/game/activity.tsの7日間版と同じ考え方で、任意の日数(30日など)に対応する。
 */
export async function getActivitySummarySince(
  userId: string,
  days: number
): Promise<ActivityCounts> {
  const cacheKey = `summary:${userId}:${days}`;
  const cached = getCached<ActivityCounts>(cacheKey);
  if (cached) return cached;

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const [commits, issues, prs] = await Promise.all([
    prisma.githubCommit.count({
      where: { repository: { userId }, committedAt: { gte: since } },
    }),
    prisma.githubIssue.count({
      where: { repository: { userId }, closedAt: { gte: since } },
    }),
    prisma.githubPullRequest.count({
      where: { repository: { userId }, mergedAt: { gte: since } },
    }),
  ]);

  const result = { commits, issues, prs };
  setCached(cacheKey, result);
  return result;
}

/**
 * 直近days日分の、日別コミット数を返す(GitHubのコントリビューショングラフ風の表示用)。
 * 日付が抜けている日も0件として埋めて返す。
 */
export async function getActivityHeatmap(
  userId: string,
  days = 90
): Promise<ActivityHeatmapDay[]> {
  const cacheKey = `heatmap:${userId}:${days}`;
  const cached = getCached<ActivityHeatmapDay[]>(cacheKey);
  if (cached) return cached;

  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));

  const commits = await prisma.githubCommit.findMany({
    where: { repository: { userId }, committedAt: { gte: since } },
    select: { committedAt: true },
  });

  const counts = new Map<string, number>();
  for (const commit of commits) {
    const key = commit.committedAt.toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const result: ActivityHeatmapDay[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(since);
    date.setDate(date.getDate() + i);
    const key = date.toISOString().slice(0, 10);
    result.push({ date: key, count: counts.get(key) ?? 0 });
  }

  setCached(cacheKey, result);
  return result;
}
