export type Palette3D = {
  wall: string;
  roof: string;
  trim: string;
  window: string;
  accent: string;
};

export type Tier = 1 | 2 | 3 | 4 | 5 | 6;

export type TierWorldConfig = {
  palette: Palette3D;
  groundColor: string;
  waterColor: string;
  wallColor?: string;
  treeCount: number;
  effects: {
    smoke: boolean;
    flags: boolean;
    waterShimmer: boolean;
  };
};

// ティアごとの世界観設定を1箇所に集約する。建物の配色(建てられた時代を保持)・
// 地形/水面の色・城壁の有無・森の密度・環境エフェクトのON/OFFをここだけで管理し、
// 新しいティアや演出を追加する際もこのオブジェクトの追記だけで済むようにする。
export const TIER_WORLD_CONFIG: Record<Tier, TierWorldConfig> = {
  1: {
    palette: { wall: "#e8d3a0", roof: "#8b4a2b", trim: "#5c3a21", window: "#4a6fa5", accent: "#8b2e2e" },
    groundColor: "#4d8a3f",
    waterColor: "#4a90c2",
    treeCount: 14,
    effects: { smoke: true, flags: false, waterShimmer: false },
  },
  2: {
    palette: { wall: "#d3cabd", roof: "#b5502e", trim: "#7d7566", window: "#5a7fa8", accent: "#6b7280" },
    groundColor: "#6b9c4f",
    waterColor: "#4a90c2",
    treeCount: 15,
    effects: { smoke: true, flags: true, waterShimmer: false },
  },
  3: {
    palette: { wall: "#c07a5c", roof: "#3d4a5c", trim: "#4a3527", window: "#f2c94c", accent: "#6d5dd3" },
    groundColor: "#7a8f6a",
    waterColor: "#3d6d9c",
    treeCount: 16,
    effects: { smoke: true, flags: true, waterShimmer: true },
  },
  4: {
    palette: { wall: "#f1e4e0", roof: "#4f7a6b", trim: "#ffffff", window: "#f2c94c", accent: "#c2185b" },
    groundColor: "#c9b8a8",
    waterColor: "#5aa0c8",
    wallColor: "#c9b8a8",
    treeCount: 17,
    effects: { smoke: false, flags: true, waterShimmer: true },
  },
  5: {
    palette: { wall: "#f7ecd1", roof: "#d4a017", trim: "#c9a227", window: "#fff2c2", accent: "#c9a227" },
    groundColor: "#d9c48a",
    waterColor: "#7fc4e0",
    wallColor: "#d9c48a",
    treeCount: 18,
    effects: { smoke: false, flags: true, waterShimmer: true },
  },
  6: {
    palette: { wall: "#fff6dd", roof: "#f0c419", trim: "#ffe066", window: "#fff8e0", accent: "#ffe066" },
    groundColor: "#e8d18a",
    waterColor: "#a8e0f0",
    wallColor: "#f0dfa0",
    treeCount: 20,
    effects: { smoke: false, flags: true, waterShimmer: true },
  },
};

export function getTierWorldConfig(tier: number): TierWorldConfig {
  return TIER_WORLD_CONFIG[(tier as Tier) in TIER_WORLD_CONFIG ? (tier as Tier) : 1];
}
