import { INVESTMENT_DEFS, TECH_TREE, type TechNode } from "@/data/techTree";
import type { GameState, InvestmentKind, Investments } from "@/services/aiCompanyTypes";

// 技術ツリー研究と経営投資の効果を集約するサービス。
// シミュレーション各所はgetCompanyModifiersだけを参照すれば良い。

export type CompanyModifiers = {
  workSpeed: number; // 開発速度倍率
  bugReduction: number; // バグ発生率倍率(小さいほど良い)
  revenueBoost: number; // 売上倍率
  userGrowth: number; // ユーザー成長率の加算
  qualityBoost: number; // 品質上昇量倍率
  staminaRecovery: number; // 体力回復の加算
  expBoost: number; // 経験値倍率
  salesIncome: number; // 営業による週次副収入
};

export function createInitialInvestments(): Investments {
  return { facility: 0, welfare: 0, education: 0, advertising: 0, server: 0, marketing: 0, sales: 0 };
}

export function getCompanyModifiers(state: Pick<GameState, "research" | "investments">): CompanyModifiers {
  const mods: CompanyModifiers = {
    workSpeed: 1,
    bugReduction: 1,
    revenueBoost: 1,
    userGrowth: 0,
    qualityBoost: 1,
    staminaRecovery: 0,
    expBoost: 1,
    salesIncome: 0,
  };

  for (const id of state.research.completed) {
    const node = TECH_TREE.find((n) => n.id === id);
    if (!node) continue;
    mods.workSpeed += node.effect.workSpeed ?? 0;
    mods.bugReduction -= node.effect.bugReduction ?? 0;
    mods.revenueBoost += node.effect.revenueBoost ?? 0;
    mods.userGrowth += node.effect.userGrowth ?? 0;
    mods.qualityBoost += node.effect.qualityBoost ?? 0;
  }

  const inv = state.investments;
  mods.workSpeed += inv.facility * 0.04;
  mods.staminaRecovery += inv.welfare * 2;
  mods.expBoost += inv.education * 0.1;
  mods.userGrowth += inv.advertising * 0.005;
  mods.bugReduction -= inv.server * 0.04;
  mods.revenueBoost += inv.marketing * 0.05;
  mods.salesIncome += inv.sales * 800;

  mods.bugReduction = Math.max(0.4, mods.bugReduction);
  return mods;
}

export function availableTechNodes(state: GameState): TechNode[] {
  return TECH_TREE.filter(
    (node) =>
      !state.research.completed.includes(node.id) &&
      state.research.current?.nodeId !== node.id &&
      (node.requires === null || state.research.completed.includes(node.requires))
  );
}

export function investmentUpgradeCost(kind: InvestmentKind, currentLevel: number): number {
  const def = INVESTMENT_DEFS.find((d) => d.kind === kind)!;
  return def.baseCost * (currentLevel + 1);
}
