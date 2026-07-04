import { redirect } from "next/navigation";
import Link from "next/link";
import { TrendingUp, Scroll, Castle } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recalcLevel } from "@/lib/game/exp";
import { getActivitySummary } from "@/lib/game/activity";
import {
  getVillageBuildingsView,
  getVillageScore,
  getSettlementInfo,
} from "@/lib/game/buildings";
import { getCompanyRank } from "@/lib/game/company";
import { getOrCreateTodaysQuest } from "@/lib/game/quest";
import { getLoginBonusStatus } from "@/lib/game/loginBonus";
import { getEquippedTitleName } from "@/lib/game/titles";
import { getMissionsView } from "@/lib/game/missions";
import { getRecommendedAction } from "@/lib/game/recommendation";
import { AppShell } from "@/components/layout/AppShell";
import {
  SettlementBadge,
  TIER_PAGE_BACKGROUND,
} from "@/components/village/SettlementBadge";
import { SyncButton } from "@/components/github/SyncButton";
import { LoginBonusCard } from "@/components/login-bonus/LoginBonusCard";
import { RecommendedActionCard } from "@/components/home/RecommendedActionCard";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default async function HomePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId = session.user.id;

  const player = await prisma.player.findUniqueOrThrow({ where: { userId } });
  const { level, currentExp, expToNextLevel } = recalcLevel(player.exp);

  const [
    activity,
    buildings,
    todaysQuest,
    loginBonus,
    equippedTitle,
    missions,
    settlement,
  ] = await Promise.all([
    getActivitySummary(userId),
    getVillageBuildingsView(userId),
    getOrCreateTodaysQuest(userId),
    getLoginBonusStatus(userId),
    getEquippedTitleName(userId),
    getMissionsView(userId),
    getSettlementInfo(userId),
  ]);

  const claimableMissionCount = missions?.filter((m) => m.claimable).length ?? 0;
  const villageScore = buildings ? getVillageScore(buildings) : null;
  const companyRank = getCompanyRank(level);
  const backgroundClass = settlement
    ? (TIER_PAGE_BACKGROUND[settlement.tier] ?? "")
    : "";

  const recommendedAction = getRecommendedAction({
    questCompleted: todaysQuest.status === "completed",
    claimableMissionCount,
    loginBonusClaimedToday: loginBonus.claimedToday,
    last7DaysCommits: activity.last7Days.commits,
    nextTierName: settlement?.nextTierName ?? null,
  });

  return (
    <AppShell>
      <div className={backgroundClass}>
        <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8">
          <Card>
            <CardContent className="flex items-center justify-between gap-4 py-5">
              <Link href="/player" className="flex min-w-0 items-center gap-3">
                {settlement && <SettlementBadge tier={settlement.tier} size="lg" />}
                <div className="min-w-0">
                  {equippedTitle && (
                    <p className="text-primary truncate text-xs font-medium">
                      {equippedTitle}
                    </p>
                  )}
                  <h1 className="truncate text-2xl font-bold">{player.name}</h1>
                  <p className="text-muted-foreground text-sm">
                    {settlement?.roleName ?? "村の青年"} ・ Lv.{level} ・{" "}
                    {companyRank.rank}
                  </p>
                </div>
              </Link>
              <SyncButton />
            </CardContent>
          </Card>

          <div className="space-y-1">
            <Progress value={(currentExp / expToNextLevel) * 100} />
            <p className="text-muted-foreground text-right text-xs">
              {currentExp} / {expToNextLevel} EXP
            </p>
          </div>

          <RecommendedActionCard action={recommendedAction} />

          <LoginBonusCard
            claimedToday={loginBonus.claimedToday}
            streak={loginBonus.streak}
            todayReward={loginBonus.todayReward}
          />

          <Card>
            <CardContent className="flex flex-col gap-2 py-4">
              <h2 className="flex items-center gap-1.5 font-semibold">
                <TrendingUp className="text-primary size-4" />
                直近7日間の活動
              </h2>
              <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <span>Commit {activity.last7Days.commits}</span>
                <span>Issue Close {activity.last7Days.issues}</span>
                <span>PR Merge {activity.last7Days.prs}</span>
              </div>
              <p className="text-sm">{activity.aiComment}</p>
            </CardContent>
          </Card>

          <Link href="/adventure">
            <Card className="hover:bg-accent transition-colors">
              <CardContent className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0">
                  <h2 className="flex items-center gap-1.5 font-semibold">
                    <Scroll className="text-primary size-4 shrink-0" />
                    今日のクエスト
                  </h2>
                  <p className="text-muted-foreground truncate text-sm">
                    {todaysQuest.title}
                  </p>
                </div>
                <span className="text-muted-foreground shrink-0 text-sm">
                  {todaysQuest.status === "completed" ? "達成済み" : "未達成"}
                </span>
              </CardContent>
            </Card>
          </Link>

          <Link href="/world">
            <Card className="hover:bg-accent transition-colors">
              <CardContent className="flex items-center gap-3 py-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                  <Castle className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold">
                    {settlement ? settlement.tierName : "村"}
                  </h2>
                  <p className="text-muted-foreground truncate text-sm">
                    {villageScore
                      ? `ランク${villageScore.rank} (${villageScore.totalLevel}/${villageScore.maxTotalLevel})`
                      : "-"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </main>
      </div>
    </AppShell>
  );
}
