import { redirect } from "next/navigation";
import { Trophy } from "lucide-react";
import { auth } from "@/lib/auth";
import { getAchievementsView } from "@/lib/game/achievements";
import { achievementIcon } from "@/lib/game/rewardIcons";
import { RARITY_RING_CLASS } from "@/lib/game/rarity";
import { AppNav } from "@/components/layout/AppNav";
import { RewardIcon } from "@/components/ui/reward-icon";
import { RarityBadge } from "@/components/ui/rarity-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default async function AchievementsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const achievements = await getAchievementsView(session.user.id);
  const unlockedCount = achievements?.filter((a) => a.unlocked).length ?? 0;

  return (
    <>
      <AppNav />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Trophy className="text-primary size-6" />
            実績
          </h1>
          <p className="text-muted-foreground text-sm">
            GitHub活動・学習・資格・ミッション・村の発展の積み重ねで解放されていきます。
          </p>
        </div>

        {!achievements ? (
          <p className="text-destructive text-sm">実績情報を取得できませんでした。</p>
        ) : (
          <>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">実績コレクション</span>
                <span className="text-muted-foreground">
                  {unlockedCount} / {achievements.length}
                </span>
              </div>
              <Progress value={(unlockedCount / achievements.length) * 100} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {achievements.map((achievement) => {
                const Icon = achievementIcon(achievement.type);
                return (
                  <Card
                    key={achievement.type}
                    className={
                      achievement.unlocked
                        ? RARITY_RING_CLASS[achievement.rarity]
                        : "opacity-60"
                    }
                  >
                    <CardContent className="flex items-start gap-3 py-4">
                      <RewardIcon
                        icon={Icon}
                        rarity={achievement.rarity}
                        unlocked={achievement.unlocked}
                      />
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div className="flex items-start justify-between gap-2">
                          <span className="min-w-0 truncate font-medium">
                            {achievement.name}
                          </span>
                          <RarityBadge
                            rarity={achievement.rarity}
                            className="shrink-0"
                          />
                        </div>
                        <span className="text-muted-foreground text-sm">
                          {achievement.condition}
                        </span>
                        {achievement.unlocked && achievement.unlockedAt && (
                          <span className="text-muted-foreground text-xs">
                            達成日:{" "}
                            {new Date(achievement.unlockedAt).toLocaleDateString(
                              "ja-JP"
                            )}
                          </span>
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
