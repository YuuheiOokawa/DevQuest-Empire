import { redirect } from "next/navigation";
import { Lock, Sparkles } from "lucide-react";
import { auth } from "@/lib/auth";
import {
  getVillageBuildingsView,
  getVillageScore,
  getSettlementInfo,
} from "@/lib/game/buildings";
import { AppNav } from "@/components/layout/AppNav";
import { BuildingIcon } from "@/components/village/BuildingIcon";
import { TownScene } from "@/components/village/TownScene";
import {
  SettlementBadge,
  TIER_PAGE_BACKGROUND,
} from "@/components/village/SettlementBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const TIER_NAMES = ["村", "町", "大きな町", "帝国", "王国", "国"];

// カードの左端の色をティアごとに変え、施設が発展するほど豪華な色味になるようにする。
const TIER_ACCENT_BORDER: Record<number, string> = {
  1: "border-l-4 border-l-emerald-500",
  2: "border-l-4 border-l-sky-500",
  3: "border-l-4 border-l-violet-500",
  4: "border-l-4 border-l-fuchsia-500",
  5: "border-l-4 border-l-amber-500",
  6: "border-l-4 border-l-yellow-400 shadow-md shadow-amber-500/20",
};

export default async function VillagePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [buildings, settlement] = await Promise.all([
    getVillageBuildingsView(session.user.id),
    getSettlementInfo(session.user.id),
  ]);
  const score = buildings ? getVillageScore(buildings) : null;
  const tierProgressRate =
    settlement && settlement.requiredScoreForNextTier
      ? Math.min(
          100,
          Math.round(
            (settlement.scoreInCurrentTier / settlement.requiredScoreForNextTier) * 100
          )
        )
      : 100;

  const backgroundClass = settlement
    ? (TIER_PAGE_BACKGROUND[settlement.tier] ?? "")
    : "";

  return (
    <>
      <AppNav />
      <div className={backgroundClass}>
        <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
          <div className="space-y-1">
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <Sparkles className="text-primary size-6" />
              {settlement ? settlement.tierName : "村"}
            </h1>
            <p className="text-muted-foreground text-sm">
              GitHub活動・学習・資格・ミッションの積み重ねで、村はやがて国へと発展します。
            </p>
          </div>

          {!buildings || !score || !settlement ? (
            <p className="text-destructive text-sm">
              村の情報を取得できませんでした。
            </p>
          ) : (
            <>
              <TownScene tier={settlement.tier} buildings={buildings} />

              <Card>
                <CardContent className="flex items-center gap-4 py-4">
                  <SettlementBadge tier={settlement.tier} size="lg" />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">
                        {settlement.tierName}({settlement.roleName})
                      </span>
                      <span className="text-muted-foreground text-sm">
                        発展度 {score.totalLevel} / {score.maxTotalLevel} (
                        {score.rank})
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
                        次の発展段階: {settlement.nextTierName}(
                        {settlement.nextTierRole})
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {settlement.scoreInCurrentTier} /{" "}
                        {settlement.requiredScoreForNextTier}
                      </span>
                    </div>
                    <Progress value={tierProgressRate} className="h-1.5" />
                    <p className="text-muted-foreground text-xs">
                      到達すると新しい施設が{settlement.nextTierBuildingCount}
                      件解放されます。
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-amber-300 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
                  <CardContent className="py-4 text-center text-sm font-medium">
                    最高の発展段階「国」に到達しました。
                  </CardContent>
                </Card>
              )}

              {TIER_NAMES.slice(0, settlement.tier).map((tierName, index) => {
                const tier = index + 1;
                const tierBuildings = buildings.filter(
                  (b) => b.requiredTier === tier
                );
                if (tierBuildings.length === 0) return null;

                return (
                  <div key={tier} className="space-y-3">
                    <h2 className="text-muted-foreground text-sm font-semibold">
                      {tierName}の施設
                    </h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {tierBuildings.map((building) => {
                        const isMaxed =
                          building.maxLevel > 0 &&
                          building.level >= building.maxLevel;
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
                              <BuildingIcon
                                type={building.type}
                                unlocked={building.unlocked}
                              />
                              <div className="min-w-0 flex-1 space-y-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="truncate font-medium">
                                    {building.name}
                                  </span>
                                  {building.unlocked ? (
                                    <Badge
                                      className={
                                        isMaxed && tier >= 4
                                          ? "shrink-0 bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow shadow-amber-500/40"
                                          : "shrink-0"
                                      }
                                    >
                                      {isMaxed
                                        ? "MAX"
                                        : `Lv.${building.level}/${building.maxLevel}`}
                                    </Badge>
                                  ) : (
                                    <Badge
                                      variant="secondary"
                                      className="shrink-0 gap-1"
                                    >
                                      <Lock className="size-3" />
                                      未解放
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-muted-foreground text-sm">
                                  {building.description}
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
                                      次のレベルまで {building.currentMetricValue}{" "}
                                      / {building.nextThreshold}
                                    </p>
                                  </div>
                                )}
                                {building.unlocked && building.unlockedAt && (
                                  <p className="text-muted-foreground text-xs">
                                    建設日:{" "}
                                    {new Date(
                                      building.unlockedAt
                                    ).toLocaleDateString("ja-JP")}
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
          )}
        </main>
      </div>
    </>
  );
}
