import { CalendarHeart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { QuestView } from "@/lib/game/quest";

// 直近28日のクエスト達成ヒートマップ。completedAtの日付単位で塗る。
export function AdventureCalendarSection({ quests }: { quests: QuestView[] }) {
  const completedDays = new Set(
    quests
      .filter((q) => q.status === "completed" && q.completedAt)
      .map((q) => new Date(q.completedAt!).toISOString().slice(0, 10))
  );

  const days: { key: string; label: string; done: boolean; isToday: boolean }[] = [];
  const today = new Date().toISOString().slice(0, 10);
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ key, label: `${d.getMonth() + 1}/${d.getDate()}`, done: completedDays.has(key), isToday: key === today });
  }
  const doneCount = days.filter((d) => d.done).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-lg font-semibold">
          <CalendarHeart className="text-primary size-5" />
          冒険カレンダー(28日間)
        </h2>
        <span className="text-muted-foreground text-xs">{doneCount}/28日 達成</span>
      </div>
      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-7 gap-1.5">
            {days.map((d) => (
              <div
                key={d.key}
                title={`${d.label}: ${d.done ? "達成" : "未達成"}`}
                className={`flex aspect-square items-center justify-center rounded-md text-[10px] ${
                  d.done
                    ? "bg-emerald-500 font-semibold text-white"
                    : "bg-muted text-muted-foreground"
                } ${d.isToday ? "ring-primary ring-2" : ""}`}
              >
                {d.label}
              </div>
            ))}
          </div>
          <p className="text-muted-foreground mt-2 text-[10px]">
            緑=クエスト達成日。毎日の積み重ねがワールドを育てます。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
