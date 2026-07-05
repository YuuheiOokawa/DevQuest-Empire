// 会社全体の技術ツリー。研究すると開発・売上に恒久的なボーナスが付く。
// 効果はaiCompanyServiceのgetCompanyModifiersで集約して参照する。

export type TechNode = {
  id: string;
  name: string;
  description: string;
  cost: number; // 研究開始に必要な資金
  turns: number; // 研究完了までのターン数
  requires: string | null; // 前提ノード
  effect: {
    workSpeed?: number; // 開発速度倍率(加算: 0.1 = +10%)
    bugReduction?: number; // バグ発生率の低減(0.2 = -20%)
    revenueBoost?: number; // 売上倍率(加算)
    userGrowth?: number; // ユーザー成長率(加算)
    qualityBoost?: number; // 工程の品質上昇量(加算: 0.15 = +15%)
  };
};

export const TECH_TREE: TechNode[] = [
  {
    id: "design-system",
    name: "デザインシステム",
    description: "UIコンポーネントを体系化し、画面実装の品質と速度を上げる",
    cost: 15000,
    turns: 4,
    requires: null,
    effect: { qualityBoost: 0.15, workSpeed: 0.05 },
  },
  {
    id: "cicd",
    name: "CI/CD自動化",
    description: "テストとデプロイを自動化し、バグの混入を減らす",
    cost: 20000,
    turns: 5,
    requires: null,
    effect: { bugReduction: 0.25, workSpeed: 0.05 },
  },
  {
    id: "ai-codegen",
    name: "AIコード生成",
    description: "AIペアプログラミングを導入し、実装速度を大幅に上げる",
    cost: 35000,
    turns: 6,
    requires: "cicd",
    effect: { workSpeed: 0.2 },
  },
  {
    id: "cloud-infra",
    name: "クラウドインフラ",
    description: "スケーラブルな基盤で安定性と売上を伸ばす",
    cost: 30000,
    turns: 5,
    requires: "cicd",
    effect: { revenueBoost: 0.1, bugReduction: 0.1 },
  },
  {
    id: "growth-hack",
    name: "グロースハック",
    description: "データドリブンな改善サイクルでユーザー獲得を加速する",
    cost: 25000,
    turns: 4,
    requires: "design-system",
    effect: { userGrowth: 0.02, revenueBoost: 0.05 },
  },
  {
    id: "ml-platform",
    name: "機械学習基盤",
    description: "レコメンドと分析を強化し、売上を底上げする",
    cost: 50000,
    turns: 7,
    requires: "ai-codegen",
    effect: { revenueBoost: 0.15, userGrowth: 0.01 },
  },
];

// 経営投資の定義(レベル0〜5)。アップグレード費用 = base × (現在Lv+1)
export type InvestmentDef = {
  kind: "facility" | "welfare" | "education" | "advertising" | "server" | "marketing" | "sales";
  name: string;
  description: string;
  baseCost: number;
  maxLevel: number;
};

export const INVESTMENT_DEFS: InvestmentDef[] = [
  { kind: "facility", name: "設備", description: "開発マシンと椅子。開発速度が上がる", baseCost: 8000, maxLevel: 5 },
  { kind: "welfare", name: "福利厚生", description: "休憩室と間食。体力回復とストレス軽減", baseCost: 6000, maxLevel: 5 },
  { kind: "education", name: "教育", description: "研修と書籍。社員の成長速度が上がる", baseCost: 7000, maxLevel: 5 },
  { kind: "advertising", name: "広告", description: "アプリの新規ユーザー獲得が増える", baseCost: 9000, maxLevel: 5 },
  { kind: "server", name: "サーバー/クラウド", description: "安定性が上がり障害が減る", baseCost: 8000, maxLevel: 5 },
  { kind: "marketing", name: "マーケティング", description: "売上が底上げされる", baseCost: 10000, maxLevel: 5 },
  { kind: "sales", name: "営業", description: "受託案件で毎週の副収入が入る", baseCost: 10000, maxLevel: 5 },
];
