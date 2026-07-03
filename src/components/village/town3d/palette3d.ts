export type Palette3D = {
  wall: string;
  roof: string;
  trim: string;
  window: string;
  accent: string;
};

// 建物が「建てられた時代(requiredTier)」ごとの配色。
// 古い建物はその時代の素朴な色のまま残り、新しい建物ほど大理石・金色に近づく。
export const TIER_PALETTE_3D: Record<number, Palette3D> = {
  1: { wall: "#e8d3a0", roof: "#8b4a2b", trim: "#5c3a21", window: "#4a6fa5", accent: "#8b2e2e" },
  2: { wall: "#d3cabd", roof: "#b5502e", trim: "#7d7566", window: "#5a7fa8", accent: "#6b7280" },
  3: { wall: "#c07a5c", roof: "#3d4a5c", trim: "#4a3527", window: "#f2c94c", accent: "#6d5dd3" },
  4: { wall: "#f1e4e0", roof: "#4f7a6b", trim: "#ffffff", window: "#f2c94c", accent: "#c2185b" },
  5: { wall: "#f7ecd1", roof: "#d4a017", trim: "#c9a227", window: "#fff2c2", accent: "#c9a227" },
  6: { wall: "#fff6dd", roof: "#f0c419", trim: "#ffe066", window: "#fff8e0", accent: "#ffe066" },
};

export const GROUND_COLOR: Record<number, string> = {
  1: "#4d8a3f",
  2: "#6b9c4f",
  3: "#7a8f6a",
  4: "#c9b8a8",
  5: "#d9c48a",
  6: "#e8d18a",
};

export const WATER_COLOR: Record<number, string> = {
  1: "#4a90c2",
  2: "#4a90c2",
  3: "#3d6d9c",
  4: "#5aa0c8",
  5: "#7fc4e0",
  6: "#a8e0f0",
};

export const WALL_COLOR: Record<number, string> = {
  4: "#c9b8a8",
  5: "#d9c48a",
  6: "#f0dfa0",
};

export function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(h, 31) + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}
