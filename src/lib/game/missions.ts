import { prisma } from "@/lib/prisma";
import { countMetricSince, type PeriodMetric } from "@/lib/game/metrics";
import { recalcLevel } from "@/lib/game/exp";
import { updateVillageBuildings, formatBuildingUpdate } from "@/lib/game/buildings";
import { unlockAchievements } from "@/lib/game/achievements";
import { unlockTitles } from "@/lib/game/titles";

function todayPeriodStart(): Date {
  return new Date(new Date().toISOString().slice(0, 10));
}

function todayPeriodKey(): string {
  return todayPeriodStart().toISOString().slice(0, 10);
}

/** 週の開始(月曜 00:00 UTC)を求める */
function weekPeriodStart(): Date {
  const now = new Date();
  const day = now.getUTCDay(); // 0=日,1=月,...6=土
  const diffToMonday = (day + 6) % 7;
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - diffToMonday)
  );
}

function weekPeriodKey(): string {
  return weekPeriodStart().toISOString().slice(0, 10);
}

function periodStartAndKey(period: string): { start: Date; key: string } {
  return period === "weekly"
    ? { start: weekPeriodStart(), key: weekPeriodKey() }
    : { start: todayPeriodStart(), key: todayPeriodKey() };
}

export type MissionView = {
  id: string;
  name: string;
  description: string;
  period: string;
  progressValue: number;
  targetValue: number;
  expReward: number;
  claimed: boolean;
  claimable: boolean;
};

export async function getMissionsView(userId: string): Promise<MissionView[] | null> {
  const player = await prisma.player.findUnique({ where: { userId } });
  if (!player) return null;

  const missions = await prisma.missionMaster.findMany({
    orderBy: [{ period: "asc" }, { name: "asc" }],
  });

  const views: MissionView[] = [];
  for (const mission of missions) {
    const { start, key } = periodStartAndKey(mission.period);
    const progressValue = await countMetricSince(
      userId,
      mission.metric as PeriodMetric,
      start
    );
    const existing = await prisma.playerMissionProgress.findUnique({
      where: {
        playerId_missionMasterId_periodKey: {
          playerId: player.id,
          missionMasterId: mission.id,
          periodKey: key,
        },
      },
    });

    views.push({
      id: mission.id,
      name: mission.name,
      description: mission.description,
      period: mission.period,
      progressValue: Math.min(progressValue, mission.targetValue),
      targetValue: mission.targetValue,
      expReward: mission.expReward,
      claimed: !!existing?.claimedAt,
      claimable: progressValue >= mission.targetValue && !existing?.claimedAt,
    });
  }

  return views;
}

export type ClaimMissionResult = {
  expGained: number;
  newLevel: number;
  unlockedBuildings: string[];
  leveledUpBuildings: string[];
  tierUpTo: string | null;
  unlockedAchievements: string[];
  unlockedTitles: string[];
};

export async function claimMission(
  userId: string,
  missionMasterId: string
): Promise<ClaimMissionResult> {
  const player = await prisma.player.findUniqueOrThrow({ where: { userId } });
  const mission = await prisma.missionMaster.findUnique({
    where: { id: missionMasterId },
  });
  if (!mission) {
    throw Object.assign(new Error("not_found"), { statusCode: 404 });
  }

  const { start, key } = periodStartAndKey(mission.period);
  const progressValue = await countMetricSince(
    userId,
    mission.metric as PeriodMetric,
    start
  );
  if (progressValue < mission.targetValue) {
    throw Object.assign(new Error("not_completed"), { statusCode: 409 });
  }

  const existing = await prisma.playerMissionProgress.findUnique({
    where: {
      playerId_missionMasterId_periodKey: {
        playerId: player.id,
        missionMasterId: mission.id,
        periodKey: key,
      },
    },
  });
  if (existing?.claimedAt) {
    throw Object.assign(new Error("already_claimed"), { statusCode: 409 });
  }

  await prisma.playerMissionProgress.upsert({
    where: {
      playerId_missionMasterId_periodKey: {
        playerId: player.id,
        missionMasterId: mission.id,
        periodKey: key,
      },
    },
    update: { claimedAt: new Date() },
    create: {
      playerId: player.id,
      missionMasterId: mission.id,
      periodKey: key,
      claimedAt: new Date(),
    },
  });

  const updatedPlayer = await prisma.player.update({
    where: { userId },
    data: { exp: { increment: mission.expReward } },
    include: { village: true },
  });

  const { level } = recalcLevel(updatedPlayer.exp);
  if (level !== updatedPlayer.level) {
    await prisma.player.update({ where: { userId }, data: { level } });
  }

  const buildingResult = updatedPlayer.village
    ? await updateVillageBuildings(userId, updatedPlayer.village.id, level)
    : { newlyUnlocked: [], leveledUp: [], tierUpTo: null };
  const { unlockedBuildings, leveledUpBuildings, tierUpTo } =
    formatBuildingUpdate(buildingResult);
  const unlockedAchievements = await unlockAchievements(userId, false);
  const unlockedTitles = await unlockTitles(player.id, level);

  return {
    expGained: mission.expReward,
    newLevel: level,
    unlockedBuildings,
    leveledUpBuildings,
    tierUpTo,
    unlockedAchievements,
    unlockedTitles,
  };
}
