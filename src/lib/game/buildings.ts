import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { computeActivityMetrics, type ActivityMetrics } from "@/lib/game/metrics";
import {
  computeSettlementTier,
  buildSettlementInfoForTier,
  type SettlementInfo,
} from "@/lib/game/settlement";

// 根拠: 18_Phase3_Detailed_Design.md Part2 を拡張し、建物ごとに
// レベル制(Lv1〜thresholds.length)を導入(Phase5)。さらに発展段階
// (村→町→都市→王国→帝国→天空帝国)による建物の出現ゲートを追加(Phase6)。

const thresholdsSchema = z.array(z.number()).min(1);
const flavorTextsSchema = z.array(z.string()).min(1);

function computeLevelForMetric(metricValue: number, thresholds: number[]): number {
  let level = 0;
  for (const threshold of thresholds) {
    if (metricValue >= threshold) level += 1;
    else break;
  }
  return level;
}

/**
 * 全建物マスタについて、現在の活動量から「あるべきレベル(未解放でも0以上で計算)」を
 * 求め、発展段階(tier)も同時に算出する。tierの判定はDB上の解放状態に依存せず、
 * 常に生の活動量から再計算するため、解放前後で矛盾が起きない。
 */
async function computeBuildingState(userId: string, playerLevel: number) {
  const metrics = await computeActivityMetrics(userId, playerLevel);
  const allBuildings = await prisma.buildingMaster.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const potentialLevels = new Map<string, number>();
  const maxLevels = new Map<string, number>();

  for (const building of allBuildings) {
    const thresholds = thresholdsSchema.safeParse(building.thresholds);
    const thresholdArr = thresholds.success ? thresholds.data : [];
    maxLevels.set(building.id, thresholdArr.length);

    if (!thresholds.success || !building.metric) {
      potentialLevels.set(building.id, 0);
      continue;
    }
    const metricValue = metrics[building.metric as keyof ActivityMetrics];
    const level =
      typeof metricValue === "number"
        ? computeLevelForMetric(metricValue, thresholds.data)
        : 0;
    potentialLevels.set(building.id, level);
  }

  const levelsByTier: Record<number, number> = {};
  const maxLevelsByTier: Record<number, number> = {};
  const buildingCountByTier: Record<number, number> = {};
  for (const building of allBuildings) {
    const tier = building.requiredTier;
    levelsByTier[tier] = (levelsByTier[tier] ?? 0) + (potentialLevels.get(building.id) ?? 0);
    maxLevelsByTier[tier] = (maxLevelsByTier[tier] ?? 0) + (maxLevels.get(building.id) ?? 0);
    buildingCountByTier[tier] = (buildingCountByTier[tier] ?? 0) + 1;
  }

  const settlement = computeSettlementTier(levelsByTier, maxLevelsByTier, buildingCountByTier);

  return {
    metrics,
    allBuildings,
    potentialLevels,
    maxLevels,
    levelsByTier,
    maxLevelsByTier,
    buildingCountByTier,
    settlement,
  };
}

/**
 * 表示用の発展段階を解決する。debugTierOverrideが設定されている場合のみ、
 * 実際の活動量に基づく段階を無視して指定のtierを表示する。
 *
 * 検証用の一時的な仕組み(src/lib/game/debugAdmin.ts参照)。確認作業が終わり次第、
 * この関数・呼び出し箇所・debugTierOverrideフィールドをまとめて削除する予定。
 */
function resolveDisplaySettlement(
  debugTierOverride: number | null,
  computed: Awaited<ReturnType<typeof computeBuildingState>>
): SettlementInfo {
  if (debugTierOverride == null) return computed.settlement;
  return buildSettlementInfoForTier(
    debugTierOverride,
    computed.levelsByTier,
    computed.maxLevelsByTier,
    computed.buildingCountByTier
  );
}

export type BuildingUpdateResult = {
  newlyUnlocked: string[];
  leveledUp: { name: string; level: number }[];
  tierUpTo: string | null;
};

/**
 * 建物のレベルを最新の活動量に合わせて更新する。発展段階がまだ解放していない
 * (requiredTierが現在のtierを超える)建物は対象外とする。
 */
export async function updateVillageBuildings(
  userId: string,
  villageId: string,
  level: number
): Promise<BuildingUpdateResult> {
  const {
    allBuildings,
    potentialLevels,
    maxLevelsByTier,
    buildingCountByTier,
    settlement,
  } = await computeBuildingState(userId, level);

  const existingRows = await prisma.villageBuilding.findMany({ where: { villageId } });
  const existingMap = new Map(existingRows.map((r) => [r.buildingMasterId, r]));

  // 更新前(=現在DBに保存されている建物レベル)から見た発展段階を求め、
  // 今回の更新で新たにtierが上がったかどうかを判定する。
  const previousLevelsByTier: Record<number, number> = {};
  for (const row of existingRows) {
    const building = allBuildings.find((b) => b.id === row.buildingMasterId);
    if (!building) continue;
    previousLevelsByTier[building.requiredTier] =
      (previousLevelsByTier[building.requiredTier] ?? 0) + row.level;
  }
  const previousSettlement = computeSettlementTier(
    previousLevelsByTier,
    maxLevelsByTier,
    buildingCountByTier
  );

  const newlyUnlocked: string[] = [];
  const leveledUp: { name: string; level: number }[] = [];

  for (const building of allBuildings) {
    if (building.requiredTier > settlement.tier) continue;

    const targetLevel = potentialLevels.get(building.id) ?? 0;
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

  return {
    newlyUnlocked,
    leveledUp,
    tierUpTo:
      settlement.tier > previousSettlement.tier ? settlement.tierName : null,
  };
}

/** 呼び出し元での通知表示用に、建物更新結果を文字列配列へ整形する */
export function formatBuildingUpdate(result: BuildingUpdateResult): {
  unlockedBuildings: string[];
  leveledUpBuildings: string[];
  tierUpTo: string | null;
} {
  return {
    unlockedBuildings: result.newlyUnlocked,
    leveledUpBuildings: result.leveledUp.map(
      (b) => `${b.name} → Lv.${b.level}`
    ),
    tierUpTo: result.tierUpTo,
  };
}

export type VillageBuildingView = {
  type: string;
  name: string;
  description: string;
  flavorText: string;
  level: number;
  maxLevel: number;
  unlocked: boolean;
  unlockedAt: Date | null;
  currentMetricValue: number;
  nextThreshold: number | null;
  requiredTier: number;
};

/**
 * 村画面/API用に、現在の発展段階で解放されている建物マスタと
 * 自分の村のレベル状況をマージして返す。
 */
export async function getVillageBuildingsView(
  userId: string
): Promise<VillageBuildingView[] | null> {
  const player = await prisma.player.findUnique({
    where: { userId },
    include: { village: { include: { buildings: true } } },
  });

  if (!player?.village) return null;

  const computed = await computeBuildingState(userId, player.level);
  const { metrics, allBuildings, maxLevels } = computed;
  const settlement = resolveDisplaySettlement(player.debugTierOverride, computed);
  const existingMap = new Map(
    player.village.buildings.map((b) => [b.buildingMasterId, b])
  );

  return allBuildings
    .filter((building) => building.requiredTier <= settlement.tier)
    .map((building) => {
      const thresholds = thresholdsSchema.safeParse(building.thresholds);
      const thresholdArr = thresholds.success ? thresholds.data : [];
      const metricValue = building.metric
        ? ((metrics[building.metric as keyof ActivityMetrics] as number) ?? 0)
        : 0;
      const existing = existingMap.get(building.id);
      const level = existing?.level ?? 0;
      const maxLevel = maxLevels.get(building.id) ?? 0;
      const flavorTexts = flavorTextsSchema.safeParse(building.flavorTexts);
      const flavorText =
        level > 0 && flavorTexts.success
          ? (flavorTexts.data[level - 1] ?? building.description)
          : building.description;

      return {
        type: building.type,
        name: building.name,
        description: building.description,
        flavorText,
        level,
        maxLevel,
        unlocked: !!existing,
        unlockedAt: existing?.unlockedAt ?? null,
        currentMetricValue: metricValue,
        nextThreshold: level < maxLevel ? thresholdArr[level] : null,
        requiredTier: building.requiredTier,
      };
    });
}

/** 村画面/ダッシュボード用に、現在の発展段階(村〜国、役職)を取得する */
export async function getSettlementInfo(
  userId: string
): Promise<SettlementInfo | null> {
  const player = await prisma.player.findUnique({ where: { userId } });
  if (!player) return null;
  const computed = await computeBuildingState(userId, player.level);
  return resolveDisplaySettlement(player.debugTierOverride, computed);
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

/** 現在解放されている建物群でのスコア(レベル合計)とランクを算出する */
export function getVillageScore(
  buildings: VillageBuildingView[]
): VillageScoreView {
  const totalLevel = buildings.reduce((sum, b) => sum + b.level, 0);
  const maxTotalLevel = buildings.reduce((sum, b) => sum + b.maxLevel, 0);
  const rate = maxTotalLevel > 0 ? totalLevel / maxTotalLevel : 0;

  return { totalLevel, maxTotalLevel, rank: rankFromScore(rate) };
}
