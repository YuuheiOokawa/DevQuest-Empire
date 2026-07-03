// 経験値・レベルのルール定義
// 根拠: 18_Phase3_Detailed_Design.md Part1

export const EXP_RATES = {
  commit: 10,
  issueClose: 30,
  prOpen: 20,
  prMerge: 80,
} as const;

export function levelUpThreshold(level: number): number {
  return 100 + (level - 1) * 20;
}

export type LevelState = {
  level: number;
  currentExp: number;
  expToNextLevel: number;
};

/**
 * 累計経験値(totalExp)からレベル・現在バー用の経験値を算出する。
 * Player.exp(累計値)を唯一の正とし、レベルは都度この関数で導出する。
 */
export function recalcLevel(totalExp: number): LevelState {
  let level = 1;
  let remaining = totalExp;
  while (remaining >= levelUpThreshold(level)) {
    remaining -= levelUpThreshold(level);
    level += 1;
  }
  return { level, currentExp: remaining, expToNextLevel: levelUpThreshold(level) };
}
