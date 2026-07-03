import { prisma } from "@/lib/prisma";
import { generateActivityComment } from "@/lib/ai/activityCommentPrompt";

function todayDateOnly(): Date {
  return new Date(new Date().toISOString().slice(0, 10));
}

export type ActivitySummary = {
  last7Days: { commits: number; issues: number; prs: number };
  aiComment: string;
};

/**
 * 直近7日間の活動サマリーとAIコメントを返す。
 * AIコメントは1日1回のみ生成し、GithubActivityCommentにキャッシュする。
 */
export async function getActivitySummary(userId: string): Promise<ActivitySummary> {
  const player = await prisma.player.findUniqueOrThrow({ where: { userId } });
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [commits, issues, prs] = await Promise.all([
    prisma.githubCommit.count({
      where: { repository: { userId }, committedAt: { gte: sevenDaysAgo } },
    }),
    prisma.githubIssue.count({
      where: { repository: { userId }, closedAt: { gte: sevenDaysAgo } },
    }),
    prisma.githubPullRequest.count({
      where: { repository: { userId }, mergedAt: { gte: sevenDaysAgo } },
    }),
  ]);

  const commentDate = todayDateOnly();
  let cached = await prisma.githubActivityComment.findUnique({
    where: {
      playerId_commentDate: { playerId: player.id, commentDate },
    },
  });

  if (!cached) {
    const comment = await generateActivityComment(userId);
    cached = await prisma.githubActivityComment.create({
      data: { playerId: player.id, commentDate, comment },
    });
  }

  return {
    last7Days: { commits, issues, prs },
    aiComment: cached.comment,
  };
}
