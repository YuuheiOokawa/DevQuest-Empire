import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { computeActivityMetrics, type ActivityMetrics } from "@/lib/game/metrics";

// 根拠: 18_Phase3_Detailed_Design.md Part2 を拡張し、建物ごとに
// レベル制(Lv1〜thresholds.length)を導入する(Phase5)。

const thresholdsSchema = z.array(z.number()).min(1);

function computeLevelForMetric(metricValue: number, thresholds: number[]): number {
  let level = 0;
  for (const threshold of thresholds) {
    if (metricValue >= threshold) level += 1;
    else break;
  }
  return level;
}

export type BuildingUpdateResult = {
  newlyUnlocked: string[];
  leveledUp: { name: string; level: number }[];
};

/**
 * 建物のレベルを最新の活動量に合わせて更新する。
 * 新規アンロック(Lv0→Lv1以上)とレベルアップ(既存Lvの上昇)を区別して返す。
 */
export async function updateVillageBuildings(
  userId: string,
  villageId: string,
  level: number
): Promise<BuildingUpdateResult> {
  const metrics = await computeActivityMetrics(userId, level);

  const [allBuildings, existingRows] = await Promise.all([
    prisma.buildingMaster.findMany(),
    prisma.villageBuilding.findMany({ where: { villageId } }),
  ]);
  const existingMap = new Map(existingRows.map((r) => [r.buildingMasterId, r]));

  const newlyUnlocked: string[] = [];
  const leveledUp: { name: string; level: number }[] = [];

  for (const building of allBuildings) {
    const thresholds = thresholdsSchema.safeParse(building.thresholds);
    if (!thresholds.success || !building.metric) continue;

    const metricValue = metrics[building.metric as keyof ActivityMetrics];
    if (typeof metricValue !== "number") continue;

    const targetLevel = computeLevelForMetric(metricValue, thresholds.data);
    if (targetLevel === 0) continue;

    const existing = existingMap.get(building.id);
    if (!existing) {
      await prisma.villageBuilding.create({
        data: { villageId, buildingMasterId: building.id, level: targetLevel },
      });
      newlyUnlocked.push(building.name);
      if (targetLevel > 1) {
        leveledUp.push({ name: building.name, level: targetLevel });
      }
    } else if (targetLevel > existing.level) {
      await prisma.villageBuilding.update({
        where: { id: existing.id },
        data: { level: targetLevel },
      });
      leveledUp.push({ name: building.name, level: targetLevel });
    }
  }

  return { newlyUnlocked, leveledUp };
}

/** 呼び出し元での通知表示用に、建物更新結果を文字列配列へ整形する */
export function formatBuildingUpdate(result: BuildingUpdateResult): {
  unlockedBuildings: string[];
  leveledUpBuildings: string[];
} {
  return {
    unlockedBuildings: result.newlyUnlocked,
    leveledUpBuildings: result.leveledUp.map(
      (b) => `${b.name} → Lv.${b.level}`
    ),
  };
}

export type VillageBuildingView = {
  type: string;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  unlocked: boolean;
  unlockedAt: Date | null;
  currentMetricValue: number;
  nextThreshold: number | null;
};

/**
 * 村画面/API用に、全建物マスタと自分の村のレベル状況をマージして返す。
 */
export async function getVillageBuildingsView(
  userId: string
): Promise<VillageBuildingView[] | null> {
  const player = await prisma.player.findUnique({
    where: { userId },
    include: { village: { include: { buildings: true } } },
  });

  if (!player?.village) return null;

  const metrics = await computeActivityMetrics(userId, player.level);
  const existingMap = new Map(
    player.village.buildings.map((b) => [b.buildingMasterId, b])
  );

  const allBuildings = await prisma.buildingMaster.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return allBuildings.map((building) => {
    const thresholds = thresholdsSchema.safeParse(building.thresholds);
    const thresholdArr = thresholds.success ? thresholds.data : [];
    const metricValue = building.metric
      ? ((metrics[building.metric as keyof ActivityMetrics] as number) ?? 0)
      : 0;
    const existing = existingMap.get(building.id);
    const level = existing?.level ?? 0;
    const maxLevel = thresholdArr.length;

    return {
      type: building.type,
      name: building.name,
      description: building.description,
      level,
      maxLevel,
      unlocked: !!existing,
      unlockedAt: existing?.unlockedAt ?? null,
      currentMetricValue: metricValue,
      nextThreshold: level < maxLevel ? thresholdArr[level] : null,
    };
  });
}

export type VillageRank = "S" | "A" | "B" | "C" | "D" | "E";

export type VillageScoreView = {
  totalLevel: number;
  maxTotalLevel: number;
  rank: VillageRank;
};

function rankFromScore(rate: number): VillageRank {
  if (rate >= 1) return "S";
  if (rate >= 0.8) return "A";
  if (rate >= 0.6) return "B";
  if (rate >= 0.4) return "C";
  if (rate >= 0.2) return "D";
  return "E";
}

/** 村の発展度スコア(全建物のレベル合計)とランクを算出する */
export function getVillageScore(
  buildings: VillageBuildingView[]
): VillageScoreView {
  const totalLevel = buildings.reduce((sum, b) => sum + b.level, 0);
  const maxTotalLevel = buildings.reduce((sum, b) => sum + b.maxLevel, 0);
  const rate = maxTotalLevel > 0 ? totalLevel / maxTotalLevel : 0;

  return { totalLevel, maxTotalLevel, rank: rankFromScore(rate) };
}
