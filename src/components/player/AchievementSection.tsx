import { achievementIcon } from "@/lib/game/rewardIcons";
import { RARITY_RING_CLASS } from "@/lib/game/rarity";
import { RewardIcon } from "@/components/ui/reward-icon";
import { RarityBadge } from "@/components/ui/rarity-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { AchievementView } from "@/lib/game/achievements";

export function AchievementSection({
  achievements,
}: {
  achievements: AchievementView[] | null;
}) {
  if (!achievements) {
    return (
      <p className="text-destructive text-sm">実績情報を取得できませんでした。</p>
    );
  }

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="flex flex-col gap-4">
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
                    <RarityBadge rarity={achievement.rarity} className="shrink-0" />
                  </div>
                  <span className="text-muted-foreground text-sm">
                    {achievement.condition}
                  </span>
                  {achievement.unlocked && achievement.unlockedAt && (
                    <span className="text-muted-foreground text-xs">
                      達成日:{" "}
                      {new Date(achievement.unlockedAt).toLocaleDateString("ja-JP")}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
