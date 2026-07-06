import { Scroll } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CompleteQuestButton } from "@/components/quest/CompleteQuestButton";
import type { QuestView } from "@/lib/game/quest";

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: "かんたん",
  medium: "ふつう",
  hard: "むずかしい",
};

export function TodayQuestSection({ quest }: { quest: QuestView }) {
  return (
    <div className="space-y-3">
      <h2 className="flex items-center gap-1.5 text-lg font-semibold">
        <Scroll className="text-primary size-5" />
        今日のクエスト
      </h2>
      <Card>
        <CardContent className="flex flex-col gap-3 py-4">
          <div className="flex items-center justify-between gap-2">
            <span className="min-w-0 truncate font-medium">{quest.title}</span>
            <Badge variant="secondary" className="shrink-0">
              {DIFFICULTY_LABEL[quest.difficulty] ?? quest.difficulty} ・ +
              {quest.expReward}EXP
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">{quest.description}</p>
          {quest.status === "completed" ? (
            <Badge>達成済み</Badge>
          ) : (
            <CompleteQuestButton questId={quest.id} baseExp={quest.expReward} showModeSelector />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
