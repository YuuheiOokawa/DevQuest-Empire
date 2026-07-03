import { redirect } from "next/navigation";
import { Castle, Lock } from "lucide-react";
import { auth } from "@/lib/auth";
import { getVillageBuildingsView, getVillageScore } from "@/lib/game/buildings";
import { AppNav } from "@/components/layout/AppNav";
import { BuildingIcon } from "@/components/village/BuildingIcon";
import { RankBadge } from "@/components/village/RankBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default async function VillagePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const buildings = await getVillageBuildingsView(session.user.id);
  const score = buildings ? getVillageScore(buildings) : null;
  const scoreRate =
    score && score.maxTotalLevel > 0
      ? Math.round((score.totalLevel / score.maxTotalLevel) * 100)
      : 0;

  return (
    <>
      <AppNav />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Castle className="text-primary size-6" />
            村
          </h1>
          <p className="text-muted-foreground text-sm">
            GitHub活動・学習・資格・ミッションの積み重ねで建物が発展します。
          </p>
        </div>

        {!buildings || !score ? (
          <p className="text-destructive text-sm">
            村の情報を取得できませんでした。
          </p>
        ) : (
          <>
            <Card>
              <CardContent className="flex items-center gap-4 py-4">
                <RankBadge rank={score.rank} />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">村ランク</span>
                    <span className="text-muted-foreground text-sm">
                      発展度 {score.totalLevel} / {score.maxTotalLevel}
                    </span>
                  </div>
                  <Progress value={scoreRate} />
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {buildings.map((building) => {
                const isMaxed = building.maxLevel > 0 && building.level >= building.maxLevel;
                return (
                  <Card
                    key={building.type}
                    className={building.unlocked ? "" : "opacity-60"}
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
                            <Badge className="shrink-0">
                              {isMaxed ? "MAX" : `Lv.${building.level}/${building.maxLevel}`}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="shrink-0 gap-1">
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
          </>
        )}
      </main>
    </>
  );
}
