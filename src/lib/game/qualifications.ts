import { prisma } from "@/lib/prisma";
import { recalcLevel } from "@/lib/game/exp";
import { updateVillageBuildings, formatBuildingUpdate } from "@/lib/game/buildings";
import { unlockAchievements } from "@/lib/game/achievements";
import { unlockTitles } from "@/lib/game/titles";

// 資格合格時の一括ボーナス。GitHub活動の日々の積み重ねに対し、
// 現実の大きな達成として意味のある値にする。
const QUALIFICATION_PASS_EXP = 500;

export type QualificationView = {
  id: string;
  type: string;
  name: string;
  category: string;
  status: "not_started" | "planning" | "passed";
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
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return allQualifications.map((q) => {
    const record = recordMap.get(q.id);
    return {
      id: q.id,
      type: q.type,
      name: q.name,
      category: q.category,
      status: (record?.status as "planning" | "passed") ?? "not_started",
      examDate: record?.examDate ? record.examDate.toISOString().slice(0, 10) : null,
      passedDate: record?.passedDate
        ? record.passedDate.toISOString().slice(0, 10)
        : null,
    };
  });
}

export async function planQualification(
  userId: string,
  qualificationMasterId: string,
  examDate: string
): Promise<void> {
  const player = await prisma.player.findUniqueOrThrow({ where: { userId } });
  const parsedDate = new Date(examDate);
  if (Number.isNaN(parsedDate.getTime())) {
    throw Object.assign(new Error("invalid_date"), { statusCode: 400 });
  }

  await prisma.playerQualification.upsert({
    where: {
      playerId_qualificationMasterId: {
        playerId: player.id,
        qualificationMasterId,
      },
    },
    update: { status: "planning", examDate: parsedDate },
    create: {
      playerId: player.id,
      qualificationMasterId,
      status: "planning",
      examDate: parsedDate,
    },
  });
}

export async function cancelQualificationPlan(
  userId: string,
  qualificationMasterId: string
): Promise<void> {
  const player = await prisma.player.findUniqueOrThrow({ where: { userId } });
  await prisma.playerQualification.deleteMany({
    where: {
      playerId: player.id,
      qualificationMasterId,
      status: "planning",
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
    data: { exp: { increment: QUALIFICATION_PASS_EXP } },
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
    expGained: QUALIFICATION_PASS_EXP,
    newLevel: level,
    unlockedBuildings,
    leveledUpBuildings,
    tierUpTo,
    unlockedAchievements,
    unlockedTitles,
  };
}
