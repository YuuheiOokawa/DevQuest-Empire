import { History } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { VillageBuildingView } from "@/lib/game/buildings";

export function WorldGrowthLog({
  buildings,
}: {
  buildings: VillageBuildingView[];
}) {
  const log = buildings
    .filter((b) => b.unlocked && b.unlockedAt)
    .sort(
      (a, b) =>
        new Date(b.unlockedAt as Date).getTime() -
        new Date(a.unlockedAt as Date).getTime()
    )
    .slice(0, 10);

  return (
    <div className="space-y-3">
      <h2 className="text-muted-foreground flex items-center gap-1.5 text-sm font-semibold">
        <History className="size-4" />
        ワールド成長ログ
      </h2>
      {log.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          まだ建物が建設されていません。GitHub活動や学習を記録して村を発展させましょう。
        </p>
      ) : (
        <Card>
          <CardContent className="divide-y py-0">
            {log.map((building) => (
              <div
                key={building.type}
                className="flex items-center justify-between gap-2 py-3 text-sm first:pt-4 last:pb-4"
              >
                <span className="min-w-0 truncate">
                  {building.name}が建設されました
                </span>
                <span className="text-muted-foreground shrink-0 text-xs">
                  {new Date(building.unlockedAt as Date).toLocaleDateString(
                    "ja-JP"
                  )}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
