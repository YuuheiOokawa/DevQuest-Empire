import { redirect } from "next/navigation";
import { User, Trophy, Award, GraduationCap, BarChart3 } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recalcLevel } from "@/lib/game/exp";
import { getLevelBand } from "@/lib/game/levelTable";
import {
  getVillageBuildingsView,
  getVillageScore,
  getSettlementInfo,
} from "@/lib/game/buildings";
import { getAchievementsView } from "@/lib/game/achievements";
import { getTitlesView, getEquippedTitleName } from "@/lib/game/titles";
import { getMissionsView } from "@/lib/game/missions";
import { getStudySummary } from "@/lib/game/study";
import { getQualificationsView } from "@/lib/game/qualifications";
import { AppShell } from "@/components/layout/AppShell";
import {
  TIER_PAGE_BACKGROUND,
} from "@/components/village/SettlementBadge";
import { ProfileSummary } from "@/components/player/ProfileSummary";
import { PlayerStats } from "@/components/player/PlayerStats";
import { AchievementSection } from "@/components/player/AchievementSection";
import { TitleSection } from "@/components/player/TitleSection";
import { CertificationSection } from "@/components/player/CertificationSection";
import { ActivityStatsSection } from "@/components/player/ActivityStatsSection";
import { PlayerTabs, type PlayerTab } from "@/components/player/PlayerTabs";

export default async function PlayerPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId = session.user.id;

  const player = await prisma.player.findUniqueOrThrow({ where: { userId } });
  const { level, currentExp, expToNextLevel } = recalcLevel(player.exp);

  const [
    buildings,
    settlement,
    achievements,
    titles,
    equippedTitle,
    missions,
    studySummary,
    qualifications,
  ] = await Promise.all([
    getVillageBuildingsView(userId),
    getSettlementInfo(userId),
    getAchievementsView(userId),
    getTitlesView(userId),
    getEquippedTitleName(userId),
    getMissionsView(userId),
    getStudySummary(userId, 1),
    getQualificationsView(userId),
  ]);

  const villageScore = buildings ? getVillageScore(buildings) : null;
  const levelBand = getLevelBand(level);
  const backgroundClass = settlement
    ? (TIER_PAGE_BACKGROUND[settlement.tier] ?? "")
    : "";

  const titleItems = titles
    ? titles.map((t) => ({
        ...t,
        unlockedAt: t.unlockedAt ? t.unlockedAt.toISOString() : null,
      }))
    : null;

  const tabs: PlayerTab[] = [
    {
      id: "profile",
      label: (
        <>
          <User className="size-4" />
          概要
        </>
      ),
      content: (
        <div className="flex flex-col gap-4">
          <ProfileSummary
            name={player.name}
            equippedTitle={equippedTitle}
            settlement={settlement}
            level={level}
            levelTitle={levelBand.title}
            levelRank={levelBand.rank}
            currentExp={currentExp}
            expToNextLevel={expToNextLevel}
          />
          <PlayerStats
            currentStreak={player.currentStreak}
            longestStreak={player.longestStreak}
            loginBonusStreak={player.loginBonusStreak}
            villageScore={villageScore}
          />
        </div>
      ),
    },
    {
      id: "achievements",
      label: (
        <>
          <Trophy className="size-4" />
          実績
        </>
      ),
      content: <AchievementSection achievements={achievements} />,
    },
    {
      id: "titles",
      label: (
        <>
          <Award className="size-4" />
          称号
        </>
      ),
      content: <TitleSection titles={titleItems} />,
    },
    {
      id: "certifications",
      label: (
        <>
          <GraduationCap className="size-4" />
          資格
        </>
      ),
      content: <CertificationSection qualifications={qualifications} />,
    },
    {
      id: "stats",
      label: (
        <>
          <BarChart3 className="size-4" />
          統計
        </>
      ),
      content: (
        <ActivityStatsSection
          unlockedAchievementCount={
            achievements?.filter((a) => a.unlocked).length ?? 0
          }
          achievementCount={achievements?.length ?? 0}
          unlockedTitleCount={titles?.filter((t) => t.unlocked).length ?? 0}
          titleCount={titles?.length ?? 0}
          claimableMissionCount={missions?.filter((m) => m.claimable).length ?? 0}
          passedQualificationCount={
            qualifications?.filter((q) => q.status === "passed").length ?? 0
          }
          qualificationCount={qualifications?.length ?? 0}
          studySummary={studySummary}
        />
      ),
    },
  ];

  return (
    <AppShell initialLevel={level}>
      <div className={backgroundClass}>
        <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
          <div className="space-y-1">
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <User className="text-primary size-6" />
              プレイヤー
            </h1>
            <p className="text-muted-foreground text-sm">
              成長・実績・称号・資格をまとめて確認できます。
            </p>
          </div>

          <PlayerTabs tabs={tabs} />
        </main>
      </div>
    </AppShell>
  );
}
