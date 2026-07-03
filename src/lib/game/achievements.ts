import { prisma } from "@/lib/prisma";
import { computeActivityMetrics } from "@/lib/game/metrics";

// 根拠: 18_Phase3_Detailed_Design.md Part3

function toUTCDateOnly(date: Date): Date {
  return new Date(date.toISOString().slice(0, 10));
}

function isSameUTCDate(a: Date, b: Date): boolean {
  return a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

export type StreakUpdateResult = {
  currentStreak: number;
  longestStreak: number;
};

/**
 * ストリーク(連続活動日数)を更新する。
 * hasActivityToday: 今回のsyncで実際にUTC今日の日付のcommit/issue close/pr作成が
 * 1件でもあったかどうか(syncGithub.ts側で判定して渡す)。
 */
export async function updateStreak(
  userId: string,
  hasActivityToday: boolean
): Promise<StreakUpdateResult> {
  const player = await prisma.player.findUniqueOrThrow({ where: { userId } });
  const today = toUTCDateOnly(new Date());

  let currentStreak = player.currentStreak;
  let lastActiveDate = player.lastActiveDate;

  if (player.lastActiveDate && isSameUTCDate(player.lastActiveDate, today)) {
    // 本日すでに記録済み: 変更なし
  } else if (
    hasActivityToday &&
    player.lastActiveDate &&
    isSameUTCDate(addDays(player.lastActiveDate, 1), today)
  ) {
    currentStreak += 1;
    lastActiveDate = today;
  } else if (hasActivityToday) {
    currentStreak = 1;
    lastActiveDate = today;
  } else {
    currentStreak = 0;
  }

  const longestStreak = Math.max(player.longestStreak, currentStreak);

  await prisma.player.update({
    where: { userId },
    data: { currentStreak, longestStreak, lastActiveDate },
  });

  return { currentStreak, longestStreak };
}

/**
 * 実績を判定し、条件を満たしたものをアンロックする。
 * 戻り値は新たにアンロックされた実績名の一覧。
 */
export async function unlockAchievements(
  userId: string,
  isFirstSync: boolean
): Promise<string[]> {
  const player = await prisma.player.findUniqueOrThrow({ where: { userId } });
  const metrics = await computeActivityMetrics(userId, player.level);
  const completedQuestCount = await prisma.quest.count({
    where: { playerId: player.id, status: "completed" },
  });

  const achieved: Record<string, boolean> = {
    first_sync: isFirstSync,
    streak_7: player.longestStreak >= 7,
    commit_100: metrics.commitCount >= 100,
    pr_merge_10: metrics.prMergeCount >= 10,
    quest_30: completedQuestCount >= 30,
  };

  const [allAchievements, existing] = await Promise.all([
    prisma.achievementMaster.findMany(),
    prisma.playerAchievement.findMany({
      where: { playerId: player.id },
      select: { achievementMasterId: true },
    }),
  ]);
  const existingIds = new Set(existing.map((e) => e.achievementMasterId));

  const newlyUnlocked: string[] = [];
  for (const achievement of allAchievements) {
    if (existingIds.has(achievement.id)) continue;
    if (achieved[achievement.type]) {
      await prisma.playerAchievement.create({
        data: { playerId: player.id, achievementMasterId: achievement.id },
      });
      newlyUnlocked.push(achievement.name);
    }
  }

  return newlyUnlocked;
}

export type AchievementView = {
  type: string;
  name: string;
  condition: string;
  unlocked: boolean;
  unlockedAt: Date | null;
};

export async function getAchievementsView(
  userId: string
): Promise<AchievementView[] | null> {
  const player = await prisma.player.findUnique({ where: { userId } });
  if (!player) return null;

  const [allAchievements, existing] = await Promise.all([
    prisma.achievementMaster.findMany(),
    prisma.playerAchievement.findMany({
      where: { playerId: player.id },
    }),
  ]);
  const unlockedMap = new Map(
    existing.map((e) => [e.achievementMasterId, e.unlockedAt])
  );

  return allAchievements.map((achievement) => ({
    type: achievement.type,
    name: achievement.name,
    condition: achievement.condition,
    unlocked: unlockedMap.has(achievement.id),
    unlockedAt: unlockedMap.get(achievement.id) ?? null,
  }));
}
