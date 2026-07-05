// レベル帯の称号とランク文字を導出する。
// レベル帯は成長のロールプレイ的な肩書き、ランクはより細かい実力目安として
// 別テーブルで管理し、両方をホーム/プレイヤー画面のヒーロー部に表示する。

export type LevelRank = "E" | "D" | "C" | "B" | "A" | "S" | "SS";

const LEVEL_TITLES = [
  { title: "駆け出し冒険者", minLevel: 1 },
  { title: "見習い開発者", minLevel: 10 },
  { title: "熟練エンジニア", minLevel: 20 },
  { title: "伝説の開発者", minLevel: 30 },
  { title: "帝国の創造者", minLevel: 50 },
] as const;

const LEVEL_RANKS: { rank: LevelRank; minLevel: number }[] = [
  { rank: "E", minLevel: 1 },
  { rank: "D", minLevel: 5 },
  { rank: "C", minLevel: 10 },
  { rank: "B", minLevel: 15 },
  { rank: "A", minLevel: 20 },
  { rank: "S", minLevel: 30 },
  { rank: "SS", minLevel: 50 },
];

export type LevelBandView = {
  title: string;
  rank: LevelRank;
  nextTitle: string | null;
  nextTitleLevel: number | null;
  nextRank: LevelRank | null;
  nextRankLevel: number | null;
};

function findCurrentAndNext<T extends { minLevel: number }>(
  table: readonly T[],
  level: number
): { current: T; next: T | undefined } {
  let currentIndex = 0;
  for (let i = 0; i < table.length; i++) {
    if (level >= table[i].minLevel) currentIndex = i;
  }
  return { current: table[currentIndex], next: table[currentIndex + 1] };
}

export function getLevelBand(level: number): LevelBandView {
  const { current: title, next: nextTitle } = findCurrentAndNext(LEVEL_TITLES, level);
  const { current: rank, next: nextRank } = findCurrentAndNext(LEVEL_RANKS, level);
  return {
    title: title.title,
    rank: rank.rank,
    nextTitle: nextTitle?.title ?? null,
    nextTitleLevel: nextTitle?.minLevel ?? null,
    nextRank: nextRank?.rank ?? null,
    nextRankLevel: nextRank?.minLevel ?? null,
  };
}
