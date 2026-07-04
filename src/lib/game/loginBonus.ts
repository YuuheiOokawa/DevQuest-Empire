import { prisma } from "@/lib/prisma";
import { recalcLevel } from "@/lib/game/exp";
import { updateVillageBuildings, formatBuildingUpdate } from "@/lib/game/buildings";
import { unlockProgressionRewards } from "@/lib/game/progression";

function todayDateOnly(): Date {
  return new Date(new Date().toISOString().slice(0, 10));
}

function isSameUTCDate(a: Date, b: Date): boolean {
  return a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

/** streak日数(1〜)に応じた経験値。7日目以降は35EXPで頭打ち */
export function loginBonusExp(streakDay: number): number {
  return Math.min(streakDay, 7) * 5;
}

export type LoginBonusStatus = {
  claimedToday: boolean;
  streak: number;
  todayReward: number;
};

/**
 * 本日分がすでに受け取り済みかどうかを判定する(受け取り処理は行わない)。
 */
export async function getLoginBonusStatus(
  userId: string
): Promise<LoginBonusStatus> {
  const player = await prisma.player.findUniqueOrThrow({ where: { userId } });
  const today = todayDateOnly();

  const claimedToday = !!(
    player.lastLoginBonusAt && isSameUTCDate(player.lastLoginBonusAt, today)
  );

  const nextStreak = claimedToday
    ? player.loginBonusStreak
    : player.lastLoginBonusAt &&
        isSameUTCDate(addDays(player.lastLoginBonusAt, 1), today)
      ? player.loginBonusStreak + 1
      : 1;

  return {
    claimedToday,
    streak: nextStreak,
    todayReward: loginBonusExp(nextStreak),
  };
}

export type ClaimLoginBonusResult = {
  expGained: number;
  streak: number;
  newLevel: number;
  unlockedBuildings: string[];
  leveledUpBuildings: string[];
  tierUpTo: string | null;
  unlockedAchievements: string[];
  unlockedTitles: string[];
};

/**
 * ログインボーナスを受け取る。同日2回目以降の呼び出しはエラーにする。
 */
export async function claimLoginBonus(
  userId: string
): Promise<ClaimLoginBonusResult> {
  const player = await prisma.player.findUniqueOrThrow({ where: { userId } });
  const today = todayDateOnly();

  if (player.lastLoginBonusAt && isSameUTCDate(player.lastLoginBonusAt, today)) {
    throw Object.assign(new Error("already_claimed"), { statusCode: 409 });
  }

  const streak =
    player.lastLoginBonusAt &&
    isSameUTCDate(addDays(player.lastLoginBonusAt, 1), today)
      ? player.loginBonusStreak + 1
      : 1;
  const expGained = loginBonusExp(streak);

  const updatedPlayer = await prisma.player.update({
    where: { userId },
    data: {
      exp: { increment: expGained },
      loginBonusStreak: streak,
      lastLoginBonusAt: today,
    },
    include: { village: true },
  });

  const { level } = recalcLevel(updatedPlayer.exp);
  if (level !== updatedPlayer.level) {
    await prisma.player.update({ where: { userId }, data: { level } });
  }

  const buildingResult = updatedPlayer.village
    ? await updateVillageBuildings(userId, updatedPlayer.village.id, level)
    : { newlyUnlocked: [], leveledUp: [], tierUpTo: null };
  const { unlockedBuildings, leveledUpBuildings, tierUpTo } =
    formatBuildingUpdate(buildingResult);
  const { unlockedAchievements, unlockedTitles } = await unlockProgressionRewards(
    userId,
    updatedPlayer.id,
    level
  );

  return {
    expGained,
    streak,
    newLevel: level,
    unlockedBuildings,
    leveledUpBuildings,
    tierUpTo,
    unlockedAchievements,
    unlockedTitles,
  };
}
