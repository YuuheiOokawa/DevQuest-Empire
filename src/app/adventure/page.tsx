import { redirect } from "next/navigation";
import { Swords, Skull } from "lucide-react";
import { auth } from "@/lib/auth";
import { getOrCreateTodaysQuest, getRecentQuestHistory } from "@/lib/game/quest";
import { getMissionsView } from "@/lib/game/missions";
import { getSeasonalDefaults } from "@/lib/game/season";
import { AppShell } from "@/components/layout/AppShell";
import { TodayQuestSection } from "@/components/adventure/TodayQuestSection";
import { DailyMissionSection } from "@/components/adventure/DailyMissionSection";
import { WeeklyMissionSection } from "@/components/adventure/WeeklyMissionSection";
import { MonthlyMissionSection } from "@/components/adventure/MonthlyMissionSection";
import { EventSection } from "@/components/adventure/EventSection";
import { AdventureHistorySection } from "@/components/adventure/AdventureHistorySection";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdventurePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId = session.user.id;

  const [todaysQuest, history, missions] = await Promise.all([
    getOrCreateTodaysQuest(userId),
    getRecentQuestHistory(userId),
    getMissionsView(userId),
  ]);
  const { eventTheme } = getSeasonalDefaults(new Date());
  const pastQuests = history.filter((q) => q.id !== todaysQuest.id);

  return (
    <AppShell>
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-10">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Swords className="text-primary size-6" />
            冒険
          </h1>
          <p className="text-muted-foreground text-sm">
            クエスト・ミッション・イベントに挑戦して経験値を獲得しましょう。
          </p>
        </div>

        <TodayQuestSection quest={todaysQuest} />

        {!missions ? (
          <p className="text-destructive text-sm">
            ミッション情報を取得できませんでした。
          </p>
        ) : (
          <>
            <DailyMissionSection
              missions={missions.filter((m) => m.period === "daily")}
            />
            <WeeklyMissionSection
              missions={missions.filter((m) => m.period === "weekly")}
            />
            <MonthlyMissionSection
              missions={missions.filter((m) => m.period === "monthly")}
            />
          </>
        )}

        <EventSection eventTheme={eventTheme} />

        <div className="space-y-3">
          <h2 className="flex items-center gap-1.5 text-lg font-semibold">
            <Skull className="text-primary size-5" />
            ボス/ダンジョン
          </h2>
          <Card className="border-dashed">
            <CardContent className="flex items-center justify-between gap-3 py-4">
              <p className="text-muted-foreground text-sm">
                強力なボスに挑む機能は近日公開予定です。お楽しみに。
              </p>
              <Badge variant="secondary" className="shrink-0">
                近日公開
              </Badge>
            </CardContent>
          </Card>
        </div>

        <AdventureHistorySection quests={pastQuests} />
      </main>
    </AppShell>
  );
}
