import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recalcLevel } from "@/lib/game/exp";
import { getActivitySummary } from "@/lib/game/activity";
import { getVillageBuildingsView } from "@/lib/game/buildings";
import { getAchievementsView } from "@/lib/game/achievements";
import { getOrCreateTodaysQuest } from "@/lib/game/quest";
import { getLoginBonusStatus } from "@/lib/game/loginBonus";
import { getTitlesView, getEquippedTitleName } from "@/lib/game/titles";
import { getMissionsView } from "@/lib/game/missions";
import { getStudySummary } from "@/lib/game/study";
import { getQualificationsView } from "@/lib/game/qualifications";
import { AppNav } from "@/components/layout/AppNav";
import { SyncButton } from "@/components/github/SyncButton";
import { LoginBonusCard } from "@/components/login-bonus/LoginBonusCard";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default async function DashboardPage() {
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
    achievements,
    todaysQuest,
    loginBonus,
    titles,
    equippedTitle,
    missions,
    studySummary,
    qualifications,
  ] = await Promise.all([
    getActivitySummary(userId),
    getVillageBuildingsView(userId),
    getAchievementsView(userId),
    getOrCreateTodaysQuest(userId),
    getLoginBonusStatus(userId),
    getTitlesView(userId),
    getEquippedTitleName(userId),
    getMissionsView(userId),
    getStudySummary(userId, 1),
    getQualificationsView(userId),
  ]);

  const unlockedBuildingCount = buildings?.filter((b) => b.unlocked).length ?? 0;
  const unlockedAchievementCount =
    achievements?.filter((a) => a.unlocked).length ?? 0;
  const unlockedTitleCount = titles?.filter((t) => t.unlocked).length ?? 0;
  const claimableMissionCount =
    missions?.filter((m) => m.claimable).length ?? 0;
  const passedQualificationCount =
    qualifications?.filter((q) => q.status === "passed").length ?? 0;

  return (
    <>
      <AppNav />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            {equippedTitle && (
              <p className="text-primary truncate text-xs font-medium">
                {equippedTitle}
              </p>
            )}
            <h1 className="truncate text-2xl font-bold">{player.name}</h1>
            <p className="text-muted-foreground text-sm">Lv.{level}</p>
          </div>
          <SyncButton />
        </div>

        <div className="space-y-1">
          <Progress value={(currentExp / expToNextLevel) * 100} />
          <p className="text-muted-foreground text-right text-xs">
            {currentExp} / {expToNextLevel} EXP
          </p>
        </div>

        <LoginBonusCard
          claimedToday={loginBonus.claimedToday}
          streak={loginBonus.streak}
          todayReward={loginBonus.todayReward}
        />

        <Card>
          <CardContent className="flex flex-col gap-2 py-4">
            <h2 className="font-semibold">直近7日間の活動</h2>
            <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <span>Commit {activity.last7Days.commits}</span>
              <span>Issue Close {activity.last7Days.issues}</span>
              <span>PR Merge {activity.last7Days.prs}</span>
            </div>
            <p className="text-sm">{activity.aiComment}</p>
          </CardContent>
        </Card>

        <Link href="/quest">
          <Card className="hover:bg-accent transition-colors">
            <CardContent className="flex items-center justify-between gap-4 py-4">
              <div className="min-w-0">
                <h2 className="font-semibold">今日のクエスト</h2>
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

        <Link href="/missions">
          <Card className="hover:bg-accent transition-colors">
            <CardContent className="flex items-center justify-between gap-4 py-4">
              <h2 className="font-semibold">ミッション</h2>
              <span className="text-muted-foreground shrink-0 text-sm">
                {claimableMissionCount > 0
                  ? `受け取り可能: ${claimableMissionCount}件`
                  : `全${missions?.length ?? 0}件`}
              </span>
            </CardContent>
          </Card>
        </Link>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link href="/village">
            <Card className="hover:bg-accent transition-colors">
              <CardContent className="py-4">
                <h2 className="font-semibold">村</h2>
                <p className="text-muted-foreground text-sm">
                  {unlockedBuildingCount} / {buildings?.length ?? 0} 建物
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/achievements">
            <Card className="hover:bg-accent transition-colors">
              <CardContent className="py-4">
                <h2 className="font-semibold">実績</h2>
                <p className="text-muted-foreground text-sm">
                  {unlockedAchievementCount} / {achievements?.length ?? 0} 達成
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/titles">
            <Card className="hover:bg-accent transition-colors">
              <CardContent className="py-4">
                <h2 className="font-semibold">称号</h2>
                <p className="text-muted-foreground text-sm">
                  {unlockedTitleCount} / {titles?.length ?? 0} 解放
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/study">
            <Card className="hover:bg-accent transition-colors">
              <CardContent className="py-4">
                <h2 className="font-semibold">学習</h2>
                <p className="text-muted-foreground text-sm">
                  累計{studySummary?.totalMinutes ?? 0}分
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/qualifications">
            <Card className="hover:bg-accent transition-colors">
              <CardContent className="py-4">
                <h2 className="font-semibold">資格</h2>
                <p className="text-muted-foreground text-sm">
                  {passedQualificationCount} / {qualifications?.length ?? 0} 合格
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </>
  );
}
