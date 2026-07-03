import { Lock, X } from "lucide-react";
import type { VillageBuildingView } from "@/lib/game/buildings";
import { BuildingIcon } from "@/components/village/BuildingIcon";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const TIER_TEXT_COLOR: Record<number, string> = {
  1: "text-emerald-600 dark:text-emerald-400",
  2: "text-sky-600 dark:text-sky-400",
  3: "text-violet-600 dark:text-violet-400",
  4: "text-rose-600 dark:text-rose-400",
  5: "text-amber-600 dark:text-amber-400",
  6: "text-yellow-500",
};

const TIER_NAMES = ["村", "町", "大きな町", "帝国", "王国", "国"];

export function BuildingDetailPopup({
  building,
  onClose,
}: {
  building: VillageBuildingView;
  onClose: () => void;
}) {
  const isMaxed = building.maxLevel > 0 && building.level >= building.maxLevel;
  const tierColor = TIER_TEXT_COLOR[building.requiredTier] ?? TIER_TEXT_COLOR[1];

  return (
    <div
      className="absolute inset-0 z-10 flex items-end justify-center bg-black/30 sm:items-center"
      onClick={onClose}
    >
      <div
        className="bg-card w-full rounded-t-2xl p-4 shadow-xl sm:w-96 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <BuildingIcon type={building.type} unlocked={building.unlocked} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate font-semibold">{building.name}</span>
              <button
                type="button"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground shrink-0"
                aria-label="閉じる"
              >
                <X className="size-4" />
              </button>
            </div>
            <p className={`text-xs font-medium ${tierColor}`}>
              {TIER_NAMES[building.requiredTier - 1] ?? "村"}の施設
            </p>
          </div>
        </div>

        <p className="text-muted-foreground mt-3 text-sm">{building.description}</p>

        <div className="mt-3 space-y-1">
          <div className="flex items-center justify-between text-sm">
            {building.unlocked ? (
              <>
                <span>Lv.{building.level}</span>
                <Badge className={isMaxed ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-white" : ""}>
                  {isMaxed ? "MAX" : `${building.level} / ${building.maxLevel}`}
                </Badge>
              </>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <Lock className="size-3" />
                未解放
              </Badge>
            )}
          </div>
          {!isMaxed && building.nextThreshold !== null && (
            <>
              <Progress value={(building.currentMetricValue / building.nextThreshold) * 100} />
              <p className="text-muted-foreground text-xs">
                {building.unlocked ? "次のレベルまで" : "解放まで"} {building.currentMetricValue} /{" "}
                {building.nextThreshold}
              </p>
            </>
          )}
          {building.unlockedAt && (
            <p className="text-muted-foreground text-xs">
              建設日: {new Date(building.unlockedAt).toLocaleDateString("ja-JP")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
