import { History } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { QuestView } from "@/lib/game/quest";

export function AdventureHistorySection({ quests }: { quests: QuestView[] }) {
  return (
    <div className="space-y-3">
      <h2 className="flex items-center gap-1.5 text-lg font-semibold">
        <History className="text-primary size-5" />
        達成履歴(過去7日間)
      </h2>
      {quests.length === 0 ? (
        <p className="text-muted-foreground text-sm">まだ履歴がありません。</p>
      ) : (
        <div className="flex flex-col gap-2">
          {quests.map((quest) => (
            <Card key={quest.id}>
              <CardContent className="flex items-center justify-between gap-2 py-3">
                <span className="min-w-0 truncate text-sm">{quest.title}</span>
                <Badge
                  variant={quest.status === "completed" ? "default" : "secondary"}
                  className="shrink-0"
                >
                  {quest.status === "completed" ? "達成済み" : "未達成"}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
