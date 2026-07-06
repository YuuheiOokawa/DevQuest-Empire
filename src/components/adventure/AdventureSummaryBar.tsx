import { Flame, Sun, Target, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { MissionView } from "@/lib/game/missions";
import type { QuestView } from "@/lib/game/quest";

// 冒険の現在地を一望するサマリー。連続達成日数(ストリーク)は
// クエスト履歴のcompletedAtから「今日または昨日を起点に」遡って数える
// (今日まだ未達成でもストリークは途切れていない扱いにする)。
export function computeQuestStreak(quests: QuestView[], now = new Date()): number {
  const days = new Set(
    quests
      .filter((q) => q.status === "completed" && q.completedAt)
      .map((q) => new Date(q.completedAt!).toISOString().slice(0, 10))
  );
  const cursor = new Date(now);
  const today = cursor.toISOString().slice(0, 10);
  if (!days.has(today)) cursor.setDate(cursor.getDate() - 1); // 今日未達成なら昨日起点
  let streak = 0;
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function AdventureSummaryBar({
  todaysQuest,
  history,
  dailyMissions,
}: {
  todaysQuest: QuestView;
  history: QuestView[];
  dailyMissions: MissionView[];
}) {
  const todayDone = todaysQuest.status === "completed";
  const streak = computeQuestStreak([todaysQuest, ...history]);
  const weekCompleted = [todaysQuest, ...history].filter((q) => q.status === "completed").length;
  const dailyDone = dailyMissions.filter((m) => m.progressValue >= m.targetValue).length;

  const stats = [
    {
      icon: Sun,
      label: "今日のクエスト",
      value: todayDone ? "達成!" : `未達成(+${todaysQuest.expReward}EXP)`,
      accent: todayDone ? "text-emerald-600" : "text-amber-600",
    },
    {
      icon: Flame,
      label: "連続達成",
      value: `${streak}日`,
      accent: streak >= 3 ? "text-orange-500" : "text-foreground",
    },
    {
      icon: TrendingUp,
      label: "直近7日の達成",
      value: `${weekCompleted}件`,
      accent: "text-foreground",
    },
    {
      icon: Target,
      label: "今日のミッション",
      value: `${dailyDone}/${dailyMissions.length}`,
      accent: dailyMissions.length > 0 && dailyDone === dailyMissions.length ? "text-emerald-600" : "text-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardContent className="flex flex-col items-center gap-0.5 py-3 text-center">
            <s.icon className={`size-4 ${s.accent}`} />
            <span className={`text-sm font-bold ${s.accent}`}>{s.value}</span>
            <span className="text-muted-foreground text-[10px]">{s.label}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
