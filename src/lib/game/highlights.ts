import { prisma } from "@/lib/prisma";

export type RecentHighlight = {
  id: string;
  kind: "achievement" | "title" | "qualification";
  label: string;
  date: Date;
};

/**
 * ホーム画面の「最近の達成」表示用に、直近days日間に解放された
 * 実績・称号・合格資格をまとめて新しい順に返す。
 */
export async function getRecentHighlights(
  userId: string,
  days = 7,
  limit = 3
): Promise<RecentHighlight[]> {
  const player = await prisma.player.findUnique({ where: { userId } });
  if (!player) return [];

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [achievements, titles, qualifications] = await Promise.all([
    prisma.playerAchievement.findMany({
      where: { playerId: player.id, unlockedAt: { gte: since } },
      include: { achievementMaster: true },
      orderBy: { unlockedAt: "desc" },
    }),
    prisma.playerTitle.findMany({
      where: { playerId: player.id, unlockedAt: { gte: since } },
      include: { titleMaster: true },
      orderBy: { unlockedAt: "desc" },
    }),
    prisma.playerQualification.findMany({
      where: {
        playerId: player.id,
        status: "passed",
        passedDate: { gte: since },
      },
      include: { qualificationMaster: true },
      orderBy: { passedDate: "desc" },
    }),
  ]);

  const highlights: RecentHighlight[] = [
    ...achievements.map((a) => ({
      id: `achievement_${a.id}`,
      kind: "achievement" as const,
      label: `実績「${a.achievementMaster.name}」を解放`,
      date: a.unlockedAt,
    })),
    ...titles.map((t) => ({
      id: `title_${t.id}`,
      kind: "title" as const,
      label: `称号「${t.titleMaster.name}」を獲得`,
      date: t.unlockedAt,
    })),
    ...qualifications.map((q) => ({
      id: `qualification_${q.id}`,
      kind: "qualification" as const,
      label: `資格「${q.qualificationMaster.name}」に合格`,
      date: q.passedDate as Date,
    })),
  ];

  return highlights
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit);
}
