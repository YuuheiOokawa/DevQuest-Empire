import { prisma } from "@/lib/prisma";

export type ActivityMetrics = {
  commitCount: number;
  issueCloseCount: number;
  prOpenCount: number;
  prMergeCount: number;
  level: number;
};

/**
 * ユーザーのGitHub活動集計。建物アンロック(buildings.ts)と
 * 実績判定(achievements.ts)の両方から利用する共通集計。
 */
export async function computeActivityMetrics(
  userId: string,
  level: number
): Promise<ActivityMetrics> {
  const [commitCount, issueCloseCount, prOpenCount, prMergeCount] =
    await Promise.all([
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
    ]);

  return { commitCount, issueCloseCount, prOpenCount, prMergeCount, level };
}
