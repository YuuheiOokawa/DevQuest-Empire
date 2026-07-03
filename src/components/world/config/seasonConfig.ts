import type { ParticlePreset, Season } from "../types/worldTypes";

export type SeasonConfig = {
  label: string;
  particle?: ParticlePreset;
  treeTint?: string;
  groundTint?: string;
};

// 季節ごとの装飾差分。DecorationSystem/TerrainSystemの色みと、
// SeasonSystemが降らせるパーティクル(花びら/落ち葉/雪)をここで定義する。
export const SEASON_CONFIG: Record<Season, SeasonConfig> = {
  spring: {
    label: "春",
    particle: { count: 26, color: "#f9c6d8", speed: 0.35, drift: 0.5, shape: "dot" },
    treeTint: "#f6b8d0",
  },
  summer: {
    label: "夏",
    particle: undefined,
  },
  autumn: {
    label: "秋",
    particle: { count: 22, color: ["#d97a3a", "#b8541f", "#e0a63a"], speed: 0.4, drift: 0.6, shape: "dot" },
    treeTint: "#c9762f",
  },
  winter: {
    label: "冬",
    particle: { count: 30, color: "#ffffff", speed: 0.22, drift: 0.3, shape: "dot" },
    groundTint: "#eef3f7",
  },
};

export function getSeasonConfig(season: Season | undefined): SeasonConfig | null {
  if (!season) return null;
  return SEASON_CONFIG[season];
}
