import { z } from "zod";
import { prisma } from "@/lib/prisma";

// 称号はレベルに応じて自動アンロックする(建物・実績と同じ条件式パターン)

const unlockConditionSchema = z.object({
  metric: z.literal("level"),
  operator: z.literal(">="),
  value: z.number(),
});

/**
 * レベルに応じて未アンロックの称号をアンロックする。
 * 戻り値は新たにアンロックされた称号名の一覧。
 */
export async function unlockTitles(
  playerId: string,
  level: number
): Promise<string[]> {
  const [allTitles, existingUnlocks] = await Promise.all([
    prisma.titleMaster.findMany(),
    prisma.playerTitle.findMany({
      where: { playerId },
      select: { titleMasterId: true },
    }),
  ]);
  const unlockedIds = new Set(existingUnlocks.map((u) => u.titleMasterId));

  const newlyUnlocked: string[] = [];

  for (const title of allTitles) {
    if (unlockedIds.has(title.id)) continue;

    const condition = unlockConditionSchema.safeParse(title.unlockCondition);
    if (!condition.success) continue;

    if (level >= condition.data.value) {
      await prisma.playerTitle.create({
        data: { playerId, titleMasterId: title.id },
      });
      newlyUnlocked.push(title.name);
    }
  }

  return newlyUnlocked;
}

export type TitleView = {
  id: string;
  type: string;
  name: string;
  condition: string;
  unlocked: boolean;
  unlockedAt: Date | null;
  equipped: boolean;
};

export async function getTitlesView(userId: string): Promise<TitleView[] | null> {
  const player = await prisma.player.findUnique({
    where: { userId },
    include: { titles: true },
  });
  if (!player) return null;

  const unlockedMap = new Map(
    player.titles.map((t) => [t.titleMasterId, t.unlockedAt])
  );

  const allTitles = await prisma.titleMaster.findMany({
    orderBy: { name: "asc" },
  });

  return allTitles.map((title) => ({
    id: title.id,
    type: title.type,
    name: title.name,
    condition: title.condition,
    unlocked: unlockedMap.has(title.id),
    unlockedAt: unlockedMap.get(title.id) ?? null,
    equipped: player.equippedTitleId === title.id,
  }));
}

export async function equipTitle(
  userId: string,
  titleMasterId: string
): Promise<void> {
  const player = await prisma.player.findUniqueOrThrow({ where: { userId } });

  const owned = await prisma.playerTitle.findUnique({
    where: {
      playerId_titleMasterId: { playerId: player.id, titleMasterId },
    },
  });
  if (!owned) {
    throw Object.assign(new Error("title_not_unlocked"), { statusCode: 403 });
  }

  await prisma.player.update({
    where: { userId },
    data: { equippedTitleId: titleMasterId },
  });
}

export async function getEquippedTitleName(
  userId: string
): Promise<string | null> {
  const player = await prisma.player.findUnique({
    where: { userId },
    include: { equippedTitle: true },
  });
  return player?.equippedTitle?.name ?? null;
}
