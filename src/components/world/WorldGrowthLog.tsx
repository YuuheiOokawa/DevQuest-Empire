import { History } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { WorldGrowthLogEntry } from "@/lib/game/worldGrowthLog";

export function WorldGrowthLog({ entries }: { entries: WorldGrowthLogEntry[] }) {
  return (
    <div className="space-y-3">
      <h2 className="text-muted-foreground flex items-center gap-1.5 text-sm font-semibold">
        <History className="size-4" />
        ワールド成長ログ
      </h2>
      {entries.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          まだ成長の記録がありません。GitHub活動や学習を記録して村を発展させましょう。
        </p>
      ) : (
        <Card>
          <CardContent className="divide-y py-0">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between gap-2 py-3 text-sm first:pt-4 last:pb-4"
              >
                <span className="min-w-0 truncate">{entry.message}</span>
                <span className="text-muted-foreground shrink-0 text-xs">
                  {entry.date.toLocaleDateString("ja-JP")}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
