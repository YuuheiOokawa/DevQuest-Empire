import { redirect } from "next/navigation";
import {
  Swords,
  Skull,
  Sun,
  CalendarCheck,
  CalendarDays,
  CalendarRange,
  PartyPopper,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recalcLevel } from "@/lib/game/exp";
import { getOrCreateTodaysQuest, getRecentQuestHistory } from "@/lib/game/quest";
import { getMissionsView } from "@/lib/game/missions";
import { getSeasonalDefaults } from "@/lib/game/season";
import { AppShell } from "@/components/layout/AppShell";
import { TodayQuestSection } from "@/components/adventure/TodayQuestSection";
import { DailyMissionSection } from "@/components/adventure/DailyMissionSection";
import { WeeklyMissionSection } from "@/components/adventure/WeeklyMissionSection";
import { MonthlyMissionSection } from "@/components/adventure/MonthlyMissionSection";
import { EventSection } from "@/components/adventure/EventSection";
import { BossSection } from "@/components/adventure/BossSection";
import { AdventureHistorySection } from "@/components/adventure/AdventureHistorySection";
import {
  AdventureCategoryTabs,
  type AdventureCategory,
} from "@/components/adventure/AdventureCategoryTabs";

export default async function AdventurePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId = session.user.id;

  const [player, todaysQuest, history, missions] = await Promise.all([
    prisma.player.findUniqueOrThrow({ where: { userId } }),
    getOrCreateTodaysQuest(userId),
    getRecentQuestHistory(userId),
    getMissionsView(userId),
  ]);
  const { level } = recalcLevel(player.exp);
  const { eventTheme } = getSeasonalDefaults(new Date());
  const pastQuests = history.filter((q) => q.id !== todaysQuest.id);
  const bosses = missions?.filter((m) => m.period === "boss") ?? [];

  const categories: AdventureCategory[] = [
    {
      id: "today",
      label: (
        <>
          <Sun className="mr-1 inline size-4" />
          今日
        </>
      ),
      content: <TodayQuestSection quest={todaysQuest} />,
    },
    {
      id: "daily",
      label: (
        <>
          <CalendarCheck className="mr-1 inline size-4" />
          デイリー
        </>
      ),
      content: (
        <DailyMissionSection
          missions={missions?.filter((m) => m.period === "daily") ?? []}
        />
      ),
    },
    {
      id: "weekly",
      label: (
        <>
          <CalendarDays className="mr-1 inline size-4" />
          ウィークリー
        </>
      ),
      content: (
        <WeeklyMissionSection
          missions={missions?.filter((m) => m.period === "weekly") ?? []}
        />
      ),
    },
    {
      id: "monthly",
      label: (
        <>
          <CalendarRange className="mr-1 inline size-4" />
          マンスリー
        </>
      ),
      content: (
        <MonthlyMissionSection
          missions={missions?.filter((m) => m.period === "monthly") ?? []}
        />
      ),
    },
    {
      id: "event",
      label: (
        <>
          <PartyPopper className="mr-1 inline size-4" />
          イベント
        </>
      ),
      content: <EventSection eventTheme={eventTheme} />,
    },
  ];

  return (
    <AppShell initialLevel={level}>
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

        {!missions ? (
          <p className="text-destructive text-sm">
            ミッション情報を取得できませんでした。
          </p>
        ) : (
          <AdventureCategoryTabs categories={categories} />
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-lg font-semibold">
              <Skull className="text-primary size-5" />
              ボス/ダンジョン
            </h2>
            <span className="text-muted-foreground text-xs">週替わり討伐</span>
          </div>
          <BossSection bosses={bosses} />
        </div>

        <AdventureHistorySection quests={pastQuests} />
      </main>
    </AppShell>
  );
}
