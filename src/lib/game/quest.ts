import { prisma } from "@/lib/prisma";
import { generateTodaysQuest } from "@/lib/ai/questPrompt";
import { recalcLevel } from "@/lib/game/exp";
import { updateVillageBuildings, formatBuildingUpdate } from "@/lib/game/buildings";
import { unlockProgressionRewards } from "@/lib/game/progression";

function todayDateOnly(): Date {
  return new Date(new Date().toISOString().slice(0, 10));
}

export type QuestView = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  expReward: number;
  status: string;
  completedAt: Date | null;
};

/**
 * 当日分のクエストを取得する。無ければAIで生成して保存する。
 */
export async function getOrCreateTodaysQuest(userId: string): Promise<QuestView> {
  const player = await prisma.player.findUniqueOrThrow({ where: { userId } });
  const questDate = todayDateOnly();

  const existing = await prisma.quest.findUnique({
    where: { playerId_questDate: { playerId: player.id, questDate } },
  });
  if (existing) return existing;

  const generated = await generateTodaysQuest(userId);

  const created = await prisma.quest.create({
    data: {
      playerId: player.id,
      questDate,
      title: generated.title,
      description: generated.description,
      difficulty: generated.difficulty,
      expReward: generated.expReward,
    },
  });

  return created;
}

/**
 * 過去7日分の完了済みクエスト履歴を取得する(ダッシュボード/クエスト画面用)。
 */
export async function getRecentQuestHistory(
  userId: string,
  days = 7
): Promise<QuestView[]> {
  const player = await prisma.player.findUniqueOrThrow({ where: { userId } });
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  return prisma.quest.findMany({
    where: { playerId: player.id, questDate: { gte: since } },
    orderBy: { questDate: "desc" },
  });
}

export type CompleteQuestResult = {
  newLevel: number;
  unlockedBuildings: string[];
  leveledUpBuildings: string[];
  tierUpTo: string | null;
  unlockedAchievements: string[];
  unlockedTitles: string[];
};

export async function completeQuest(
  userId: string,
  questId: string
): Promise<CompleteQuestResult> {
  const player = await prisma.player.findUniqueOrThrow({ where: { userId } });
  const quest = await prisma.quest.findUnique({ where: { id: questId } });

  if (!quest) {
    throw Object.assign(new Error("not_found"), { statusCode: 404 });
  }
  if (quest.playerId !== player.id) {
    throw Object.assign(new Error("forbidden"), { statusCode: 403 });
  }
  if (quest.status === "completed") {
    throw Object.assign(new Error("already_completed"), { statusCode: 409 });
  }

  await prisma.quest.update({
    where: { id: questId },
    data: { status: "completed", completedAt: new Date() },
  });

  const updatedPlayer = await prisma.player.update({
    where: { id: player.id },
    data: { exp: { increment: quest.expReward } },
    include: { village: true },
  });

  const { level } = recalcLevel(updatedPlayer.exp);
  if (level !== updatedPlayer.level) {
    await prisma.player.update({ where: { id: player.id }, data: { level } });
  }

  const buildingResult = updatedPlayer.village
    ? await updateVillageBuildings(userId, updatedPlayer.village.id, level)
    : { newlyUnlocked: [], leveledUp: [], tierUpTo: null };
  const { unlockedBuildings, leveledUpBuildings, tierUpTo } =
    formatBuildingUpdate(buildingResult);
  const { unlockedAchievements, unlockedTitles } = await unlockProgressionRewards(
    userId,
    player.id,
    level
  );

  return {
    newLevel: level,
    unlockedBuildings,
    leveledUpBuildings,
    tierUpTo,
    unlockedAchievements,
    unlockedTitles,
  };
}
