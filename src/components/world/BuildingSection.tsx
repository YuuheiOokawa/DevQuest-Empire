import { Lock, Crown } from "lucide-react";
import { BuildingIcon } from "@/components/village/BuildingIcon";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { VillageBuildingView } from "@/lib/game/buildings";

const TIER_NAMES = ["村", "小さな町", "大きな町", "都市", "大都市", "国"];

// カードの左端の色をティアごとに変え、施設が発展するほど豪華な色味になるようにする。
const TIER_ACCENT_BORDER: Record<number, string> = {
  1: "border-l-4 border-l-emerald-500",
  2: "border-l-4 border-l-sky-500",
  3: "border-l-4 border-l-violet-500",
  4: "border-l-4 border-l-rose-500",
  5: "border-l-4 border-l-amber-500",
  6: "border-l-4 border-l-yellow-400 shadow-md shadow-amber-500/20",
};

export function BuildingSection({
  buildings,
  currentTier,
}: {
  buildings: VillageBuildingView[];
  currentTier: number;
}) {
  return (
    <>
      {TIER_NAMES.slice(0, currentTier).map((tierName, index) => {
        const tier = index + 1;
        const tierBuildings = buildings.filter((b) => b.requiredTier === tier);
        if (tierBuildings.length === 0) return null;

        return (
          <div key={tier} className="space-y-3">
            <h2 className="text-muted-foreground text-sm font-semibold">
              {tierName}の施設
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {tierBuildings.map((building) => {
                const isMaxed =
                  building.maxLevel > 0 && building.level >= building.maxLevel;
                return (
                  <Card
                    key={building.type}
                    className={
                      building.unlocked
                        ? `${TIER_ACCENT_BORDER[tier] ?? ""} transition-transform hover:-translate-y-0.5`
                        : "opacity-60"
                    }
                  >
                    <CardContent className="flex items-start gap-3 py-4">
                      <BuildingIcon type={building.type} unlocked={building.unlocked} />
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate font-medium">
                            {building.name}
                          </span>
                          {building.unlocked ? (
                            <Badge
                              className={
                                isMaxed
                                  ? "shrink-0 gap-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow shadow-amber-500/40"
                                  : "shrink-0"
                              }
                            >
                              {isMaxed && <Crown className="size-3" />}
                              {isMaxed
                                ? "MAX"
                                : `Lv.${building.level}/${building.maxLevel}`}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="shrink-0 gap-1">
                              <Lock className="size-3" />
                              未解放
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground text-sm">
                          {building.unlocked
                            ? building.flavorText
                            : building.description}
                        </p>
                        {!isMaxed && building.nextThreshold !== null && (
                          <div className="space-y-0.5">
                            <Progress
                              value={
                                (building.currentMetricValue /
                                  building.nextThreshold) *
                                100
                              }
                              className="h-1.5"
                            />
                            <p className="text-muted-foreground text-xs">
                              次のレベルまで {building.currentMetricValue} /{" "}
                              {building.nextThreshold}
                            </p>
                          </div>
                        )}
                        {building.unlocked && building.unlockedAt && (
                          <p className="text-muted-foreground text-xs">
                            建設日:{" "}
                            {new Date(building.unlockedAt).toLocaleDateString(
                              "ja-JP"
                            )}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}
