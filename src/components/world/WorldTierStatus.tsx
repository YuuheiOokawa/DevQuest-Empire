import { SettlementBadge } from "@/components/village/SettlementBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { VillageScoreView } from "@/lib/game/buildings";
import type { SettlementInfo } from "@/lib/game/settlement";

export function WorldTierStatus({
  settlement,
  score,
  buildingCount,
  unlockedCount,
  maxedCount,
}: {
  settlement: SettlementInfo;
  score: VillageScoreView;
  buildingCount: number;
  unlockedCount: number;
  maxedCount: number;
}) {
  const tierProgressRate = settlement.requiredScoreForNextTier
    ? Math.min(
        100,
        Math.round(
          (settlement.scoreInCurrentTier / settlement.requiredScoreForNextTier) * 100
        )
      )
    : 100;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-2 text-center text-xs sm:text-sm">
        <Card>
          <CardContent className="py-3">
            <div className="font-semibold">Tier {settlement.tier}</div>
            <div className="text-muted-foreground">{settlement.tierName}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3">
            <div className="font-semibold">
              {unlockedCount}/{buildingCount}
            </div>
            <div className="text-muted-foreground">建設済み</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3">
            <div className="font-semibold">{maxedCount}</div>
            <div className="text-muted-foreground">MAX施設</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="flex items-center gap-4 py-4">
          <SettlementBadge tier={settlement.tier} size="lg" />
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold">
                {settlement.tierName}({settlement.roleName})
              </span>
              <span className="text-muted-foreground text-sm">
                発展度 {score.totalLevel} / {score.maxTotalLevel} ({score.rank})
              </span>
            </div>
            <Progress value={(score.totalLevel / score.maxTotalLevel) * 100} />
          </div>
        </CardContent>
      </Card>

      {settlement.nextTierName ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col gap-2 py-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">
                次の発展段階: {settlement.nextTierName}({settlement.nextTierRole})
              </span>
              <span className="text-muted-foreground text-xs">
                {settlement.scoreInCurrentTier} / {settlement.requiredScoreForNextTier}
              </span>
            </div>
            <Progress value={tierProgressRate} className="h-1.5" />
            <p className="text-muted-foreground text-xs">
              到達すると新しい施設が{settlement.nextTierBuildingCount}件解放されます。
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-amber-300 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
          <CardContent className="py-4 text-center text-sm font-medium">
            最高の発展段階「天空帝国」に到達しました。
          </CardContent>
        </Card>
      )}
    </div>
  );
}
