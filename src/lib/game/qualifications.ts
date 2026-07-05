import { prisma } from "@/lib/prisma";
import { recalcLevel } from "@/lib/game/exp";
import { updateVillageBuildings, formatBuildingUpdate } from "@/lib/game/buildings";
import { unlockProgressionRewards } from "@/lib/game/progression";

export type QualificationStatus =
  | "not_started"
  | "learning"
  | "planning"
  | "passed"
  | "failed"
  | "on_hold";

export type QualificationDifficulty = "easy" | "normal" | "hard" | "expert";

export type QualificationView = {
  id: string;
  type: string;
  name: string;
  category: string;
  difficulty: QualificationDifficulty;
  expReward: number;
  status: QualificationStatus;
  examDate: string | null;
  passedDate: string | null;
};

export async function getQualificationsView(
  userId: string
): Promise<QualificationView[] | null> {
  const player = await prisma.player.findUnique({
    where: { userId },
    include: { qualifications: true },
  });
  if (!player) return null;

  const recordMap = new Map(
    player.qualifications.map((q) => [q.qualificationMasterId, q])
  );

  const allQualifications = await prisma.qualificationMaster.findMany({
    orderBy: [{ category: "asc" }, { recommendedOrder: "asc" }, { name: "asc" }],
  });

  return allQualifications.map((q) => {
    const record = recordMap.get(q.id);
    return {
      id: q.id,
      type: q.type,
      name: q.name,
      category: q.category,
      difficulty: (q.difficulty as QualificationDifficulty) ?? "normal",
      expReward: q.expReward,
      status: (record?.status as QualificationStatus) ?? "not_started",
      examDate: record?.examDate ? record.examDate.toISOString().slice(0, 10) : null,
      passedDate: record?.passedDate
        ? record.passedDate.toISOString().slice(0, 10)
        : null,
    };
  });
}

async function upsertStatus(
  userId: string,
  qualificationMasterId: string,
  status: Exclude<QualificationStatus, "not_started" | "passed">,
  extra: { examDate?: Date } = {}
): Promise<void> {
  const player = await prisma.player.findUniqueOrThrow({ where: { userId } });
  const existing = await prisma.playerQualification.findUnique({
    where: {
      playerId_qualificationMasterId: {
        playerId: player.id,
        qualificationMasterId,
      },
    },
  });
  if (existing?.status === "passed") {
    throw Object.assign(new Error("already_passed"), { statusCode: 409 });
  }

  await prisma.playerQualification.upsert({
    where: {
      playerId_qualificationMasterId: {
        playerId: player.id,
        qualificationMasterId,
      },
    },
    update: { status, ...extra },
    create: { playerId: player.id, qualificationMasterId, status, ...extra },
  });
}

/** 学習中に切り替える(受験日はまだ未定のケース)。 */
export async function startLearning(
  userId: string,
  qualificationMasterId: string
): Promise<void> {
  await upsertStatus(userId, qualificationMasterId, "learning");
}

/** 保留に切り替える(後回しにしたいが記録は残したいケース)。 */
export async function holdQualification(
  userId: string,
  qualificationMasterId: string
): Promise<void> {
  await upsertStatus(userId, qualificationMasterId, "on_hold");
}

/** 不合格として記録する(再挑戦を前提とし、EXPペナルティは課さない)。 */
export async function markQualificationFailed(
  userId: string,
  qualificationMasterId: string
): Promise<void> {
  await upsertStatus(userId, qualificationMasterId, "failed");
}

export async function planQualification(
  userId: string,
  qualificationMasterId: string,
  examDate: string
): Promise<void> {
  const parsedDate = new Date(examDate);
  if (Number.isNaN(parsedDate.getTime())) {
    throw Object.assign(new Error("invalid_date"), { statusCode: 400 });
  }
  await upsertStatus(userId, qualificationMasterId, "planning", {
    examDate: parsedDate,
  });
}

/** 未着手に戻す(合格済みのものは対象外)。 */
export async function resetQualification(
  userId: string,
  qualificationMasterId: string
): Promise<void> {
  const player = await prisma.player.findUniqueOrThrow({ where: { userId } });
  await prisma.playerQualification.deleteMany({
    where: {
      playerId: player.id,
      qualificationMasterId,
      status: { not: "passed" },
    },
  });
}

export type MarkPassedResult = {
  expGained: number;
  newLevel: number;
  unlockedBuildings: string[];
  leveledUpBuildings: string[];
  tierUpTo: string | null;
  unlockedAchievements: string[];
  unlockedTitles: string[];
};

export async function markQualificationPassed(
  userId: string,
  qualificationMasterId: string
): Promise<MarkPassedResult> {
  const player = await prisma.player.findUniqueOrThrow({ where: { userId } });
  const qualificationMaster = await prisma.qualificationMaster.findUniqueOrThrow({
    where: { id: qualificationMasterId },
  });

  const existing = await prisma.playerQualification.findUnique({
    where: {
      playerId_qualificationMasterId: {
        playerId: player.id,
        qualificationMasterId,
      },
    },
  });
  if (existing?.status === "passed") {
    throw Object.assign(new Error("already_passed"), { statusCode: 409 });
  }

  const expGained = qualificationMaster.expReward;

  await prisma.playerQualification.upsert({
    where: {
      playerId_qualificationMasterId: {
        playerId: player.id,
        qualificationMasterId,
      },
    },
    update: { status: "passed", passedDate: new Date() },
    create: {
      playerId: player.id,
      qualificationMasterId,
      status: "passed",
      passedDate: new Date(),
    },
  });

  const updatedPlayer = await prisma.player.update({
    where: { userId },
    data: { exp: { increment: expGained } },
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
  const { unlockedAchievements, unlockedTitles } = await unlockProgressionRewards(
    userId,
    player.id,
    level
  );

  return {
    expGained,
    newLevel: level,
    unlockedBuildings,
    leveledUpBuildings,
    tierUpTo,
    unlockedAchievements,
    unlockedTitles,
  };
}
