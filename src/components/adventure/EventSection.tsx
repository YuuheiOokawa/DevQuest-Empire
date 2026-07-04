import { PartyPopper } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

export function EventSection({ eventTheme }: { eventTheme: EventTheme }) {
  const event = EVENT_INFO[eventTheme];

  return (
    <div className="space-y-3">
      <h2 className="flex items-center gap-1.5 text-lg font-semibold">
        <PartyPopper className="text-primary size-5" />
        イベント
      </h2>
      {event ? (
        <Card className="border-fuchsia-300 bg-fuchsia-50/50 dark:border-fuchsia-800 dark:bg-fuchsia-950/20">
          <CardContent className="flex items-center justify-between gap-3 py-4">
            <div className="min-w-0">
              <p className="font-medium">{event.name}</p>
              <p className="text-muted-foreground text-sm">{event.description}</p>
            </div>
            <Badge className="shrink-0 bg-fuchsia-500 text-white">開催中</Badge>
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
