import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { computeActivityMetrics } from "@/lib/game/metrics";

// 根拠: 18_Phase3_Detailed_Design.md Part2

const unlockConditionSchema = z.object({
  metric: z.enum([
    "commitCount",
    "issueCloseCount",
    "prOpenCount",
    "prMergeCount",
    "level",
  ]),
  operator: z.literal(">="),
  value: z.number(),
});

/**
 * 未アンロックの建物を判定し、条件を満たしたものをアンロックする。
 * 戻り値は新たにアンロックされた建物名の一覧。
 */
export async function unlockBuildings(
  userId: string,
  villageId: string,
  level: number
): Promise<string[]> {
  const metrics = await computeActivityMetrics(userId, level);

  const [allBuildings, existingUnlocks] = await Promise.all([
    prisma.buildingMaster.findMany(),
    prisma.villageBuilding.findMany({
      where: { villageId },
      select: { buildingMasterId: true },
    }),
  ]);
  const unlockedIds = new Set(existingUnlocks.map((u) => u.buildingMasterId));

  const newlyUnlocked: string[] = [];

  for (const building of allBuildings) {
    if (unlockedIds.has(building.id)) continue;

    const condition = unlockConditionSchema.safeParse(building.unlockCondition);
    if (!condition.success) continue;

    const metricValue = metrics[condition.data.metric];
    if (metricValue >= condition.data.value) {
      await prisma.villageBuilding.create({
        data: { villageId, buildingMasterId: building.id },
      });
      newlyUnlocked.push(building.name);
    }
  }

  return newlyUnlocked;
}

export type VillageBuildingView = {
  type: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt: Date | null;
};

/**
 * 村画面/API用に、全建物マスタと自分の村のアンロック状況をマージして返す。
 */
export async function getVillageBuildingsView(
  userId: string
): Promise<VillageBuildingView[] | null> {
  const player = await prisma.player.findUnique({
    where: { userId },
    include: { village: { include: { buildings: true } } },
  });

  if (!player?.village) return null;

  const unlockedMap = new Map(
    player.village.buildings.map((b) => [b.buildingMasterId, b.unlockedAt])
  );

  const allBuildings = await prisma.buildingMaster.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return allBuildings.map((building) => ({
      type: building.type,
      name: building.name,
      description: building.description,
      unlocked: unlockedMap.has(building.id),
      unlockedAt: unlockedMap.get(building.id) ?? null,
    }));
}
