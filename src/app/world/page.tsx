import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getVillageBuildingsView,
  getVillageScore,
  getSettlementInfo,
} from "@/lib/game/buildings";
import { isDebugAdmin } from "@/lib/game/debugAdmin";
import { getNpcRoster } from "@/lib/game/npcRoster";
import { buildWorldGrowthLog } from "@/lib/game/worldGrowthLog";
import { getOrCreateTodaysQuest } from "@/lib/game/quest";
import { AppShell } from "@/components/layout/AppShell";
import { WorldScene } from "@/components/world/WorldScene";
import { WorldTierStatus } from "@/components/world/WorldTierStatus";
import { BuildingSection } from "@/components/world/BuildingSection";
import { NpcSection } from "@/components/world/NpcSection";
import { WorldGrowthLog } from "@/components/world/WorldGrowthLog";
import { getSeasonalDefaults } from "@/lib/game/season";
import { TIER_PAGE_BACKGROUND } from "@/components/village/SettlementBadge";
import { DebugTierPanel } from "@/components/debug/DebugTierPanel";

export default async function WorldPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const isAdmin = isDebugAdmin(session.user.email);
  const [buildings, settlement, debugPlayer, player, firstSyncedRepo, todaysQuest] =
    await Promise.all([
      getVillageBuildingsView(session.user.id),
      getSettlementInfo(session.user.id),
      isAdmin
        ? prisma.player.findUnique({
            where: { userId: session.user.id },
            select: { debugTierOverride: true },
          })
        : null,
      prisma.player.findUnique({
        where: { userId: session.user.id },
        select: { lastLoginBonusAt: true },
      }),
      prisma.githubRepository.findFirst({
        where: { userId: session.user.id, syncEnabled: true },
        orderBy: { createdAt: "asc" },
        select: { createdAt: true },
      }),
      getOrCreateTodaysQuest(session.user.id),
    ]);
  const { season, eventTheme } = getSeasonalDefaults(new Date());
  const score = buildings ? getVillageScore(buildings) : null;
  const backgroundClass = settlement
    ? (TIER_PAGE_BACKGROUND[settlement.tier] ?? "")
    : "";
  const npcRoster = settlement ? getNpcRoster(settlement.tier) : [];
  const growthLog = buildings
    ? buildWorldGrowthLog({
        buildingUnlocks: buildings
          .filter((b) => b.unlocked && b.unlockedAt)
          .map((b) => ({
            type: b.type,
            name: b.name,
            unlockedAt: b.unlockedAt as Date,
          })),
        firstSyncedAt: firstSyncedRepo?.createdAt ?? null,
        lastLoginBonusAt: player?.lastLoginBonusAt ?? null,
        todaysQuestCompletedAt:
          todaysQuest.status === "completed" && todaysQuest.completedAt
            ? todaysQuest.completedAt
            : null,
      })
    : [];

  return (
    <AppShell>
      <div className={backgroundClass}>
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10">
          <div className="space-y-1">
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <Sparkles className="text-primary size-6" />
              {settlement ? settlement.tierName : "村"}
            </h1>
            <p className="text-muted-foreground text-sm">
              GitHub活動・学習・資格・ミッションの積み重ねで、村はやがて国へと発展します。
            </p>
          </div>

          {isAdmin && settlement && (
            <DebugTierPanel
              currentTier={settlement.tier}
              isOverridden={debugPlayer?.debugTierOverride != null}
            />
          )}

          {!buildings || !score || !settlement ? (
            <p className="text-destructive text-sm">
              村の情報を取得できませんでした。
            </p>
          ) : (
            <>
              <WorldScene
                tier={settlement.tier as 1 | 2 | 3 | 4 | 5 | 6}
                buildings={buildings}
                season={season}
                weather="clear"
                eventTheme={eventTheme}
              />

              <WorldTierStatus
                settlement={settlement}
                score={score}
                buildingCount={buildings.length}
                unlockedCount={buildings.filter((b) => b.unlocked).length}
                maxedCount={
                  buildings.filter((b) => b.maxLevel > 0 && b.level >= b.maxLevel)
                    .length
                }
              />

              <BuildingSection buildings={buildings} currentTier={settlement.tier} />

              <NpcSection roster={npcRoster} />

              <WorldGrowthLog entries={growthLog} />
            </>
          )}
        </main>
      </div>
    </AppShell>
  );
}
