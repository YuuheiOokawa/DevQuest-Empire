export type Rarity = "bronze" | "silver" | "gold" | "platinum";

export const RARITY_LABELS: Record<Rarity, string> = {
  bronze: "ブロンズ",
  silver: "シルバー",
  gold: "ゴールド",
  platinum: "プラチナ",
};

// バッジ(小さなチップ)用の配色。tierが上がるほど金・虹色寄りの豪華な配色にする。
export const RARITY_BADGE_CLASS: Record<Rarity, string> = {
  bronze:
    "border-0 bg-amber-700/15 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  silver:
    "border-0 bg-slate-400/20 text-slate-700 dark:bg-slate-500/25 dark:text-slate-200",
  gold: "border-0 bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow shadow-amber-500/40",
  platinum:
    "border-0 bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-500 text-white shadow shadow-indigo-500/40",
};

// カードの縁取り(unlocked時)。goldとplatinumはひと目でわかるよう強調する。
export const RARITY_RING_CLASS: Record<Rarity, string> = {
  bronze: "ring-1 ring-amber-700/20",
  silver: "ring-1 ring-slate-400/40",
  gold: "ring-2 ring-amber-400/60 shadow-md shadow-amber-500/10",
  platinum: "ring-2 ring-indigo-400/60 shadow-md shadow-indigo-500/20",
};

// 円形アイコンの背景色(unlocked時)。
export const RARITY_ICON_CLASS: Record<Rarity, string> = {
  bronze: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  silver: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  gold: "bg-gradient-to-br from-amber-300 to-yellow-500 text-white",
  platinum:
    "bg-gradient-to-br from-cyan-300 via-sky-400 to-indigo-500 text-white",
};
