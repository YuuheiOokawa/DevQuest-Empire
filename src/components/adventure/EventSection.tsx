import { Crown, PartyPopper } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { EventTheme } from "@/components/world/types/worldTypes";

const EVENT_INFO: Partial<Record<EventTheme, { name: string; description: string }>> = {
  sakura: {
    name: "桜祭りイベント",
    description: "ワールドが桜色に染まる春限定の演出が発生中です。",
  },
  summerFestival: {
    name: "夏祭りイベント",
    description: "提灯や花火など、夏らしい演出がワールドに登場しています。",
  },
  halloween: {
    name: "ハロウィンイベント",
    description: "かぼちゃの飾りなど、ハロウィン仕様の演出が発生中です。",
  },
  christmas: {
    name: "クリスマスイベント",
    description: "雪化粧とイルミネーションでワールドが彩られています。",
  },
};

// イベント限定称号(期間限定ミッション: 今月クエスト10回達成で獲得条件クリア)
const EVENT_TITLE: Partial<Record<EventTheme, string>> = {
  sakura: "桜の勇者",
  summerFestival: "夏祭りの覇者",
  halloween: "宵闇の狩人",
  christmas: "聖夜の守護者",
};
const EVENT_MISSION_TARGET = 10;

export function EventSection({
  eventTheme,
  monthlyCompleted = 0,
}: {
  eventTheme: EventTheme;
  monthlyCompleted?: number;
}) {
  const event = EVENT_INFO[eventTheme];
  const limitedTitle = EVENT_TITLE[eventTheme] ?? "季節の覇者";
  const progress = Math.min(monthlyCompleted, EVENT_MISSION_TARGET);
  const achieved = progress >= EVENT_MISSION_TARGET;

  return (
    <div className="space-y-3">
      <h2 className="flex items-center gap-1.5 text-lg font-semibold">
        <PartyPopper className="text-primary size-5" />
        イベント
      </h2>
      {event ? (
        <Card className="border-fuchsia-300 bg-fuchsia-50/50 dark:border-fuchsia-800 dark:bg-fuchsia-950/20">
          <CardContent className="flex flex-col gap-3 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium">{event.name}</p>
                <p className="text-muted-foreground text-sm">{event.description}</p>
              </div>
              <Badge className="shrink-0 bg-fuchsia-500 text-white">開催中</Badge>
            </div>

            {/* 期間限定ミッション(今月のクエスト達成数から自動集計) */}
            <div className="rounded-lg border border-fuchsia-200 bg-white/60 p-3 dark:border-fuchsia-900 dark:bg-black/20">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">限定ミッション: 今月クエストを{EVENT_MISSION_TARGET}回達成</span>
                <span className="text-muted-foreground text-xs">
                  {progress}/{EVENT_MISSION_TARGET}
                </span>
              </div>
              <Progress
                value={(progress / EVENT_MISSION_TARGET) * 100}
                className="mt-1.5 h-2 [&_[data-slot=progress-indicator]]:bg-fuchsia-500"
              />
              <div className="mt-2 flex items-center gap-1.5 text-xs">
                <Crown className={`size-3.5 ${achieved ? "text-amber-500" : "text-muted-foreground"}`} />
                {achieved ? (
                  <span className="font-semibold text-amber-600">
                    限定称号「{limitedTitle}」の獲得条件を達成しました!
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    達成報酬: 限定称号「{limitedTitle}」
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-4 text-center text-sm">
            <p className="text-muted-foreground">
              現在開催中のイベントはありません。季節が変わるとワールドの演出が変化します。
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
