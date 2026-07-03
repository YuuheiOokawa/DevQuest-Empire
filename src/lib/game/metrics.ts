import { prisma } from "@/lib/prisma";

export type ActivityMetrics = {
  commitCount: number;
  issueCloseCount: number;
  prOpenCount: number;
  prMergeCount: number;
  studyMinutesTotal: number;
  qualificationsPassedCount: number;
  missionsClaimedTotal: number;
  level: number;
};

/**
 * ユーザーの活動集計(GitHub + 学習 + 資格 + ミッション)。
 * 建物成長(buildings.ts)・実績判定(achievements.ts)の両方から利用する共通集計。
 */
export async function computeActivityMetrics(
  userId: string,
  level: number
): Promise<ActivityMetrics> {
  const [
    commitCount,
    issueCloseCount,
    prOpenCount,
    prMergeCount,
    studyMinutesAgg,
    qualificationsPassedCount,
    missionsClaimedTotal,
  ] = await Promise.all([
    prisma.githubCommit.count({
      where: { repository: { userId } },
    }),
    prisma.githubIssue.count({
      where: { state: "closed", repository: { userId } },
    }),
    prisma.githubPullRequest.count({
      where: { repository: { userId } },
    }),
    prisma.githubPullRequest.count({
      where: { mergedAt: { not: null }, repository: { userId } },
    }),
    prisma.studyLog.aggregate({
      where: { player: { userId } },
      _sum: { minutes: true },
    }),
    prisma.playerQualification.count({
      where: { player: { userId }, status: "passed" },
    }),
    prisma.playerMissionProgress.count({
      where: { player: { userId }, claimedAt: { not: null } },
    }),
  ]);

  return {
    commitCount,
    issueCloseCount,
    prOpenCount,
    prMergeCount,
    studyMinutesTotal: studyMinutesAgg._sum.minutes ?? 0,
    qualificationsPassedCount,
    missionsClaimedTotal,
    level,
  };
}

export type PeriodMetric =
  | "commitCount"
  | "issueCloseCount"
  | "prOpenCount"
  | "prMergeCount";

/**
 * 指定日時以降の活動件数を集計する(デイリー/ウィークリーミッション用)。
 */
export async function countMetricSince(
  userId: string,
  metric: PeriodMetric,
  since: Date
): Promise<number> {
  switch (metric) {
    case "commitCount":
      return prisma.githubCommit.count({
        where: { repository: { userId }, committedAt: { gte: since } },
      });
    case "issueCloseCount":
      return prisma.githubIssue.count({
        where: { repository: { userId }, closedAt: { gte: since } },
      });
    case "prOpenCount":
      return prisma.githubPullRequest.count({
        where: { repository: { userId }, createdAt: { gte: since } },
      });
    case "prMergeCount":
      return prisma.githubPullRequest.count({
        where: { repository: { userId }, mergedAt: { gte: since } },
      });
  }
}
