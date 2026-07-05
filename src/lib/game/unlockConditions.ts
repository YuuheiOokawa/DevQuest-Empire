import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { computeActivityMetrics } from "@/lib/game/metrics";
import { getSettlementInfo } from "@/lib/game/buildings";

// 実績(AchievementMaster)・称号(TitleMaster)は、どちらも
// 「指標(metric)がある値以上になったらアンロック」という同じ形の条件を持つ。
// この共通の指標集計・条件評価ロジックを一箇所にまとめる。

export const UNLOCK_METRICS = [
  "level",
  "longestStreak",
  "commitCount",
  "issueCloseCount",
  "prOpenCount",
  "prMergeCount",
  "studyMinutesTotal",
  "qualificationsPassedCount",
  "missionsClaimedTotal",
  "villageTier",
  "questCompletedCount",
] as const;

export type UnlockMetric = (typeof UNLOCK_METRICS)[number];

export type UnlockMetrics = Record<UnlockMetric, number>;

export const unlockConditionSchema = z.object({
  metric: z.enum(UNLOCK_METRICS),
  operator: z.literal(">="),
  value: z.number(),
});

/** 指標の値が条件を満たすか判定する。条件JSONの形式が不正な場合はfalseを返す。 */
export function evaluateUnlockCondition(
  metrics: UnlockMetrics,
  rawCondition: unknown
): boolean {
  const parsed = unlockConditionSchema.safeParse(rawCondition);
  if (!parsed.success) return false;
  return metrics[parsed.data.metric] >= parsed.data.value;
}

/**
 * 実績・称号のアンロック判定に使う指標一式を集計する。
 * GitHub活動・学習・資格・ミッション・村の発展段階・クエスト完了数を横断する。
 */
export async function computeUnlockMetrics(
  userId: string,
  playerId: string,
  level: number
): Promise<UnlockMetrics> {
  const [activity, settlement, player, questCompletedCount] = await Promise.all([
    computeActivityMetrics(userId, level),
    getSettlementInfo(userId),
    prisma.player.findUniqueOrThrow({ where: { id: playerId } }),
    prisma.quest.count({ where: { playerId, status: "completed" } }),
  ]);

  return {
    level,
    longestStreak: player.longestStreak,
    commitCount: activity.commitCount,
    issueCloseCount: activity.issueCloseCount,
    prOpenCount: activity.prOpenCount,
    prMergeCount: activity.prMergeCount,
    studyMinutesTotal: activity.studyMinutesTotal,
    qualificationsPassedCount: activity.qualificationsPassedCount,
    missionsClaimedTotal: activity.missionsClaimedTotal,
    villageTier: settlement?.tier ?? 1,
    questCompletedCount,
  };
}
