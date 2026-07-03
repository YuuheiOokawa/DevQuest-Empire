// 会社ランクはプレイヤーレベルから導出する派生値(専用テーブルは持たない)。
// AI社員による自動経営シミュレーションは別スコープとし、ここでは
// 「成長の到達点を会社経営に見立てたラベル」として軽量に提供する。

const COMPANY_RANKS = [
  { name: "個人開発者", minLevel: 1 },
  { name: "スタートアップ", minLevel: 10 },
  { name: "成長企業", minLevel: 20 },
  { name: "中堅企業", minLevel: 30 },
  { name: "大企業", minLevel: 40 },
  { name: "グローバル企業", minLevel: 50 },
] as const;

export type CompanyRankView = {
  rank: string;
  nextRank: string | null;
  nextRankLevel: number | null;
  levelsToNextRank: number | null;
};

export function getCompanyRank(playerLevel: number): CompanyRankView {
  let currentIndex = 0;
  for (let i = 0; i < COMPANY_RANKS.length; i++) {
    if (playerLevel >= COMPANY_RANKS[i].minLevel) {
      currentIndex = i;
    }
  }
  const current = COMPANY_RANKS[currentIndex];
  const next = COMPANY_RANKS[currentIndex + 1];

  return {
    rank: current.name,
    nextRank: next?.name ?? null,
    nextRankLevel: next?.minLevel ?? null,
    levelsToNextRank: next ? next.minLevel - playerLevel : null,
  };
}
