import { prisma } from "@/lib/prisma";
import { recalcLevel } from "@/lib/game/exp";
import { updateVillageBuildings, formatBuildingUpdate } from "@/lib/game/buildings";
import { unlockAchievements } from "@/lib/game/achievements";
import { unlockTitles } from "@/lib/game/titles";

// 10分あたり5EXP(端数切り捨て)。GitHub活動と同様、自己申告制で悪用対策は無い。
function studyExp(minutes: number): number {
  return Math.floor(minutes / 10) * 5;
}

export type RecordStudyLogInput = {
  category: string;
  title: string;
  minutes: number;
  note?: string;
};

export type RecordStudyLogResult = {
  expGained: number;
  newLevel: number;
  unlockedBuildings: string[];
  leveledUpBuildings: string[];
  tierUpTo: string | null;
  unlockedAchievements: string[];
  unlockedTitles: string[];
};

export async function recordStudyLog(
  userId: string,
  input: RecordStudyLogInput
): Promise<RecordStudyLogResult> {
  if (input.minutes <= 0 || input.minutes > 1440) {
    throw Object.assign(new Error("invalid_minutes"), { statusCode: 400 });
  }
  if (!input.category.trim() || !input.title.trim()) {
    throw Object.assign(new Error("invalid_input"), { statusCode: 400 });
  }

  const player = await prisma.player.findUniqueOrThrow({ where: { userId } });
  const expGained = studyExp(input.minutes);

  await prisma.studyLog.create({
    data: {
      playerId: player.id,
      category: input.category.trim().slice(0, 50),
      title: input.title.trim().slice(0, 100),
      minutes: input.minutes,
      note: input.note?.trim().slice(0, 500) || null,
      expAwarded: expGained,
      recordedAt: new Date(),
    },
  });

  const updatedPlayer = await prisma.player.update({
    where: { userId },
    data: { exp: { increment: expGained } },
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
  const unlockedAchievements = await unlockAchievements(userId, false);
  const unlockedTitles = await unlockTitles(player.id, level);

  return {
    expGained,
    newLevel: level,
    unlockedBuildings,
    leveledUpBuildings,
    tierUpTo,
    unlockedAchievements,
    unlockedTitles,
  };
}

export type StudyLogView = {
  id: string;
  category: string;
  title: string;
  minutes: number;
  note: string | null;
  expAwarded: number;
  recordedAt: Date;
};

export type StudySummary = {
  totalMinutes: number;
  last7DaysMinutes: number;
  logs: StudyLogView[];
};

export async function getStudySummary(
  userId: string,
  logLimit = 20
): Promise<StudySummary | null> {
  const player = await prisma.player.findUnique({ where: { userId } });
  if (!player) return null;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [totalAgg, last7DaysAgg, logs] = await Promise.all([
    prisma.studyLog.aggregate({
      where: { playerId: player.id },
      _sum: { minutes: true },
    }),
    prisma.studyLog.aggregate({
      where: { playerId: player.id, recordedAt: { gte: sevenDaysAgo } },
      _sum: { minutes: true },
    }),
    prisma.studyLog.findMany({
      where: { playerId: player.id },
      orderBy: { recordedAt: "desc" },
      take: logLimit,
    }),
  ]);

  return {
    totalMinutes: totalAgg._sum.minutes ?? 0,
    last7DaysMinutes: last7DaysAgg._sum.minutes ?? 0,
    logs,
  };
}
