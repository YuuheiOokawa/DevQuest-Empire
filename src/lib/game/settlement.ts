// 村の発展段階(村→町→大きな町→帝国→王国→国)の定義。
// 各段階は「ひとつ前の段階に属する建物レベル合計」が閾値に達すると解放される。
// プレイヤーの役職(青年→村長→町長→帝国王様→王国王様→国王)も段階に連動する。

export const TIER_DEFINITIONS = [
  { tier: 1, name: "村", role: "村の青年", requiredScoreInPreviousTier: 0 },
  { tier: 2, name: "町", role: "村長", requiredScoreInPreviousTier: 25 },
  { tier: 3, name: "大きな町", role: "町長", requiredScoreInPreviousTier: 12 },
  { tier: 4, name: "帝国", role: "帝国王様", requiredScoreInPreviousTier: 12 },
  { tier: 5, name: "王国", role: "王国王様", requiredScoreInPreviousTier: 12 },
  { tier: 6, name: "国", role: "国王", requiredScoreInPreviousTier: 12 },
] as const;

export const MAX_TIER = 6;

export type SettlementInfo = {
  tier: number;
  tierName: string;
  roleName: string;
  scoreInCurrentTier: number;
  maxScoreInCurrentTier: number;
  nextTierName: string | null;
  nextTierRole: string | null;
  requiredScoreForNextTier: number | null;
  nextTierBuildingCount: number;
};

/**
 * tierごとの建物レベル合計(levelsByTier)とtierごとの最大レベル合計(maxLevelsByTier)から
 * 現在の発展段階を算出する。
 */
export function computeSettlementTier(
  levelsByTier: Record<number, number>,
  maxLevelsByTier: Record<number, number>,
  buildingCountByTier: Record<number, number>
): SettlementInfo {
  let currentTier = 1;
  for (let t = 2; t <= MAX_TIER; t++) {
    const def = TIER_DEFINITIONS.find((d) => d.tier === t)!;
    const prevTierScore = levelsByTier[t - 1] ?? 0;
    if (prevTierScore >= def.requiredScoreInPreviousTier) {
      currentTier = t;
    } else {
      break;
    }
  }

  const currentDef = TIER_DEFINITIONS[currentTier - 1];
  const nextDef = TIER_DEFINITIONS[currentTier]; // undefined if maxed out

  return {
    tier: currentTier,
    tierName: currentDef.name,
    roleName: currentDef.role,
    scoreInCurrentTier: levelsByTier[currentTier] ?? 0,
    maxScoreInCurrentTier: maxLevelsByTier[currentTier] ?? 0,
    nextTierName: nextDef?.name ?? null,
    nextTierRole: nextDef?.role ?? null,
    requiredScoreForNextTier: nextDef?.requiredScoreInPreviousTier ?? null,
    nextTierBuildingCount: nextDef ? (buildingCountByTier[nextDef.tier] ?? 0) : 0,
  };
}
