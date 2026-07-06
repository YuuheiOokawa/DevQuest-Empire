import { prisma } from "@/lib/prisma";

// 週間ふりかえり: 直近7日と前7日の活動を比較し、前週比つきで返す。
// 追加テーブルなし(quest/githubCommit/githubIssueの既存データから集計)。

export type WeeklyReview = {
  quests: { thisWeek: number; lastWeek: number };
  commits: { thisWeek: number; lastWeek: number };
  issues: { thisWeek: number; lastWeek: number };
  expGained: number; // 今週の獲得EXP(クエスト+コミット+Issue)
  comment: string; // ルールベースの一言ふりかえり
};

function buildComment(r: Omit<WeeklyReview, "comment">): string {
  const thisTotal = r.quests.thisWeek + r.commits.thisWeek + r.issues.thisWeek;
  const lastTotal = r.quests.lastWeek + r.commits.lastWeek + r.issues.lastWeek;
  if (thisTotal === 0) {
    return "今週はまだ活動がありません。今日のクエストから小さく始めましょう。";
  }
  if (lastTotal === 0) {
    return "先週から一転、活動が動き出しました。この勢いを維持しましょう!";
  }
  if (thisTotal >= lastTotal * 1.5) {
    return `先週比+${Math.round(((thisTotal - lastTotal) / lastTotal) * 100)}%の大幅ペースアップ!絶好調です。`;
  }
  if (thisTotal > lastTotal) {
    return "先週より着実にペースが上がっています。良い流れです。";
  }
  if (thisTotal === lastTotal) {
    return "先週と同じペースを維持できています。継続は力なりです。";
  }
  return "先週よりペースは控えめですが、続けていることが一番大事です。";
}

export async function getWeeklyReview(userId: string): Promise<WeeklyReview> {
  const player = await prisma.player.findUniqueOrThrow({ where: { userId } });
  const now = Date.now();
  const week1 = new Date(now - 7 * 24 * 60 * 60 * 1000); // 今週の起点
  const week2 = new Date(now - 14 * 24 * 60 * 60 * 1000); // 前週の起点

  const [
    questsThis,
    questsLast,
    commitsThis,
    commitsLast,
    issuesThis,
    issuesLast,
    questExp,
    commitExp,
    issueExp,
  ] = await Promise.all([
    prisma.quest.count({
      where: { playerId: player.id, status: "completed", completedAt: { gte: week1 } },
    }),
    prisma.quest.count({
      where: { playerId: player.id, status: "completed", completedAt: { gte: week2, lt: week1 } },
    }),
    prisma.githubCommit.count({
      where: { repository: { userId }, committedAt: { gte: week1 } },
    }),
    prisma.githubCommit.count({
      where: { repository: { userId }, committedAt: { gte: week2, lt: week1 } },
    }),
    prisma.githubIssue.count({
      where: { repository: { userId }, closedAt: { gte: week1 } },
    }),
    prisma.githubIssue.count({
      where: { repository: { userId }, closedAt: { gte: week2, lt: week1 } },
    }),
    prisma.quest.aggregate({
      _sum: { expReward: true },
      where: { playerId: player.id, status: "completed", completedAt: { gte: week1 } },
    }),
    prisma.githubCommit.aggregate({
      _sum: { expAwarded: true },
      where: { repository: { userId }, committedAt: { gte: week1 } },
    }),
    prisma.githubIssue.aggregate({
      _sum: { expAwarded: true },
      where: { repository: { userId }, closedAt: { gte: week1 } },
    }),
  ]);

  const base = {
    quests: { thisWeek: questsThis, lastWeek: questsLast },
    commits: { thisWeek: commitsThis, lastWeek: commitsLast },
    issues: { thisWeek: issuesThis, lastWeek: issuesLast },
    expGained:
      (questExp._sum.expReward ?? 0) +
      (commitExp._sum.expAwarded ?? 0) +
      (issueExp._sum.expAwarded ?? 0),
  };
  return { ...base, comment: buildComment(base) };
}
