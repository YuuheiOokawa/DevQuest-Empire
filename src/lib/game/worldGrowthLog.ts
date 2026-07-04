// ワールド成長ログの生成ロジック。
// MVPでは専用のイベントログテーブルを持たないため、既存の実データ
// (建物の解放日時・初回GitHub同期日・直近ログインボーナス日時・今日のクエスト完了日時)
// から疑似的なログを組み立てる。将来的に専用のActivityLogテーブルを追加する場合は、
// この関数の中身をテーブル参照に差し替えるだけで済むよう、入力を明示的な引数にしている。

export type WorldGrowthLogEntry = {
  id: string;
  date: Date;
  message: string;
};

export function buildWorldGrowthLog(input: {
  buildingUnlocks: { type: string; name: string; unlockedAt: Date }[];
  firstSyncedAt: Date | null;
  lastLoginBonusAt: Date | null;
  todaysQuestCompletedAt: Date | null;
}): WorldGrowthLogEntry[] {
  const entries: WorldGrowthLogEntry[] = [];

  if (input.firstSyncedAt) {
    entries.push({
      id: "first_sync",
      date: input.firstSyncedAt,
      message: "初回GitHub同期により村が解放されました",
    });
  }

  for (const building of input.buildingUnlocks) {
    entries.push({
      id: `building_${building.type}`,
      date: building.unlockedAt,
      message: `${building.name}が建設されました`,
    });
  }

  if (input.lastLoginBonusAt) {
    entries.push({
      id: "login_bonus",
      date: input.lastLoginBonusAt,
      message: "ログインボーナスで村の活気が少し上がりました",
    });
  }

  if (input.todaysQuestCompletedAt) {
    entries.push({
      id: "todays_quest",
      date: input.todaysQuestCompletedAt,
      message: "今日のクエスト達成で建設予定地が1つ解放されました",
    });
  }

  return entries
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 10);
}
