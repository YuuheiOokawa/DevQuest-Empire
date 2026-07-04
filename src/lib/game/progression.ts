import { computeUnlockMetrics } from "@/lib/game/unlockConditions";
import { unlockAchievements } from "@/lib/game/achievements";
import { unlockTitles } from "@/lib/game/titles";

export type ProgressionRewards = {
  unlockedAchievements: string[];
  unlockedTitles: string[];
};

/**
 * 成長アクション(同期・クエスト完了・ログインボーナス・ミッション受取・学習記録・資格合格)の
 * 直後に呼び出し、実績・称号のアンロック判定をまとめて行う。
 * 指標の集計を1回にまとめることで、実績・称号それぞれで重複集計しないようにする。
 */
export async function unlockProgressionRewards(
  userId: string,
  playerId: string,
  level: number,
  isFirstSync = false
): Promise<ProgressionRewards> {
  const metrics = await computeUnlockMetrics(userId, playerId, level);

  const [unlockedAchievements, unlockedTitles] = await Promise.all([
    unlockAchievements(playerId, metrics, isFirstSync),
    unlockTitles(playerId, metrics),
  ]);

  return { unlockedAchievements, unlockedTitles };
}
