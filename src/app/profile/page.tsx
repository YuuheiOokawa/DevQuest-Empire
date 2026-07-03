import { redirect } from "next/navigation";
import {
  User,
  Flame,
  Gift,
  Trophy,
  Award,
  BookOpen,
  GraduationCap,
  Target,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recalcLevel } from "@/lib/game/exp";
import {
  getVillageBuildingsView,
  getVillageScore,
  getSettlementInfo,
} from "@/lib/game/buildings";
import { getCompanyRank } from "@/lib/game/company";
import { getAchievementsView } from "@/lib/game/achievements";
import { getTitlesView, getEquippedTitleName } from "@/lib/game/titles";
import { getMissionsView } from "@/lib/game/missions";
import { getStudySummary } from "@/lib/game/study";
import { getQualificationsView } from "@/lib/game/qualifications";
import { AppNav } from "@/components/layout/AppNav";
import { SettlementBadge } from "@/components/village/SettlementBadge";
import { RankBadge } from "@/components/village/RankBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default async function ProfilePage() {
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
  const companyRank = getCompanyRank(level);

  const stats = [
    {
      icon: Trophy,
      label: "実績",
      value: `${achievements?.filter((a) => a.unlocked).length ?? 0} / ${achievements?.length ?? 0}`,
    },
    {
      icon: Award,
      label: "称号",
      value: `${titles?.filter((t) => t.unlocked).length ?? 0} / ${titles?.length ?? 0}`,
    },
    {
      icon: Target,
      label: "ミッション受取可能",
      value: `${missions?.filter((m) => m.claimable).length ?? 0}件`,
    },
    {
      icon: BookOpen,
      label: "累計学習時間",
      value: `${studySummary?.totalMinutes ?? 0}分`,
    },
    {
      icon: GraduationCap,
      label: "資格合格",
      value: `${qualifications?.filter((q) => q.status === "passed").length ?? 0} / ${qualifications?.length ?? 0}`,
    },
  ];

  return (
    <>
      <AppNav />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <User className="text-primary size-6" />
            プロフィール
          </h1>
          <p className="text-muted-foreground text-sm">
            あなたの発展段階・役職・成長パラメータの一覧です。
          </p>
        </div>

        <Card>
          <CardContent className="flex flex-col gap-4 py-5">
            <div className="flex items-center gap-4">
              {settlement && <SettlementBadge tier={settlement.tier} size="lg" />}
              <div className="min-w-0 flex-1">
                {equippedTitle && (
                  <p className="text-primary truncate text-xs font-medium">
                    {equippedTitle}
                  </p>
                )}
                <h2 className="truncate text-xl font-bold">{player.name}</h2>
                <p className="text-muted-foreground text-sm">
                  {settlement?.roleName ?? "村の青年"} ・ Lv.{level} ・{" "}
                  {companyRank.rank}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">経験値</span>
                <span className="text-muted-foreground">
                  {currentExp} / {expToNextLevel} EXP
                </span>
              </div>
              <Progress value={(currentExp / expToNextLevel) * 100} />
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-2">
                <Flame className="size-5 shrink-0 text-orange-500" />
                <div>
                  <p className="text-muted-foreground text-xs">活動ストリーク</p>
                  <p className="text-sm font-semibold">
                    {player.currentStreak}日(最長{player.longestStreak}日)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Gift className="size-5 shrink-0 text-pink-500" />
                <div>
                  <p className="text-muted-foreground text-xs">
                    ログインボーナス
                  </p>
                  <p className="text-sm font-semibold">
                    {player.loginBonusStreak}日連続
                  </p>
                </div>
              </div>
              {villageScore && (
                <div className="flex items-center gap-2">
                  <RankBadge rank={villageScore.rank} />
                  <div>
                    <p className="text-muted-foreground text-xs">村ランク</p>
                    <p className="text-sm font-semibold">
                      {villageScore.totalLevel} / {villageScore.maxTotalLevel}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-3 py-4">
                <stat.icon className="text-primary size-5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-muted-foreground text-xs">{stat.label}</p>
                  <p className="truncate font-semibold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
