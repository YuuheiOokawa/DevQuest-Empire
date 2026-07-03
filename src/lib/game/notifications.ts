// サーバー/クライアント両方から使う純粋関数(DBアクセスなし)。
// 各成長アクション(同期・クエスト・ログインボーナス・ミッション・学習・資格)の
// 結果を、画面に表示する通知文の配列に整形する。

export type GrowthNotificationResult = {
  unlockedBuildings?: string[];
  leveledUpBuildings?: string[];
  unlockedAchievements?: string[];
  unlockedTitles?: string[];
  tierUpTo?: string | null;
};

export function formatGrowthNotifications(
  result: GrowthNotificationResult
): string[] {
  const lines: string[] = [];
  if (result.tierUpTo) {
    lines.push(`村が発展しました: ${result.tierUpTo}に到達！`);
  }
  if (result.unlockedBuildings?.length) {
    lines.push(`新しい建物: ${result.unlockedBuildings.join("、")}`);
  }
  if (result.leveledUpBuildings?.length) {
    lines.push(`建物レベルアップ: ${result.leveledUpBuildings.join("、")}`);
  }
  if (result.unlockedAchievements?.length) {
    lines.push(`実績解放: ${result.unlockedAchievements.join("、")}`);
  }
  if (result.unlockedTitles?.length) {
    lines.push(`称号解放: ${result.unlockedTitles.join("、")}`);
  }
  return lines;
}
