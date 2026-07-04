import { Flame, Gift } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { RankBadge } from "@/components/village/RankBadge";
import type { VillageScoreView } from "@/lib/game/buildings";

export function PlayerStats({
  currentStreak,
  longestStreak,
  loginBonusStreak,
  villageScore,
}: {
  currentStreak: number;
  longestStreak: number;
  loginBonusStreak: number;
  villageScore: VillageScoreView | null;
}) {
  return (
    <Card>
      <CardContent className="grid grid-cols-2 gap-4 py-4 sm:grid-cols-3">
        <div className="flex items-center gap-2">
          <Flame className="size-5 shrink-0 text-orange-500" />
          <div>
            <p className="text-muted-foreground text-xs">活動ストリーク</p>
            <p className="text-sm font-semibold">
              {currentStreak}日(最長{longestStreak}日)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Gift className="size-5 shrink-0 text-pink-500" />
          <div>
            <p className="text-muted-foreground text-xs">ログインボーナス</p>
            <p className="text-sm font-semibold">{loginBonusStreak}日連続</p>
          </div>
        </div>
        {villageScore && (
          <div className="flex items-center gap-2">
            <RankBadge rank={villageScore.rank} />
            <div>
              <p className="text-muted-foreground text-xs">村ランク</p>
              <p className="text-sm font-semibold">
                {villageScore.totalLevel} / {villageScore.maxTotalLevel}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
