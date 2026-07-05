import type { Tier } from "../types/worldTypes";

export type Palette3D = {
  wall: string;
  roof: string;
  trim: string;
  window: string;
  accent: string;
};

export type TierWorldConfig = {
  name: string;
  role: string;
  description: string;
  palette: Palette3D;
  groundColor: string;
  secondaryGroundColor: string;
  roadColor: string;
  waterColor: string;
  wallColor?: string;
  treeColor: string;
  treeCount: number;
  npcCount: number;
  sky: {
    css: string;
    horizon: string;
    starCount: number;
    cloudCount: number;
    godRayCount: number;
  };
  layout: {
    density: number;
    roadRings: number;
    plazaRadius: number;
    hasBridge: boolean;
    hasMoat: boolean;
    hasHarbor: boolean;
    hasMountains: boolean;
  };
  lighting: {
    ambient: string;
    ambientIntensity: number;
    sun: string;
    sunIntensity: number;
    sunPosition: [number, number, number];
    fog?: string;
  };
  decoration: {
    farmPlots: number;
    flowerPatches: number;
    lamps: number;
    towers: number;
    banners: number;
  };
  effects: {
    smoke: boolean;
    flags: boolean;
    waterShimmer: boolean;
    windowsGlow: boolean;
    sparkles: boolean;
  };
};

// ティアごとの世界観設定を1箇所に集約する。空・地形・水・道路・城壁・装飾・NPC数・
// 演出フラグをすべてここで管理し、新しいティアや演出を追加する際もこの
// オブジェクトの追記だけで済むようにする。
export const TIER_WORLD_CONFIG: Record<Tier, TierWorldConfig> = {
  1: {
    name: "村",
    role: "小さな村の始まり",
    description: "牧歌的な草原、白い雲、少数の木造家屋。未解放の建物予定地が余白として見える段階。",
    palette: { wall: "#ddc9a3", roof: "#7d4a2e", trim: "#5c3a21", window: "#78a7c8", accent: "#4a7d45" },
    groundColor: "#5b7f43",
    secondaryGroundColor: "#749455",
    roadColor: "#a98d63",
    waterColor: "#3d7ba6",
    treeColor: "#43703b",
    treeCount: 14,
    npcCount: 3,
    sky: { css: "bg-gradient-to-b from-sky-300 via-sky-100 to-sky-50", horizon: "#d9f4ff", starCount: 0, cloudCount: 5, godRayCount: 0 },
    layout: { density: 0.72, roadRings: 0, plazaRadius: 0.72, hasBridge: true, hasMoat: false, hasHarbor: false, hasMountains: true },
    lighting: { ambient: "#ffffff", ambientIntensity: 0.76, sun: "#fff1d6", sunIntensity: 1.15, sunPosition: [6, 10, 4], fog: "#dfeadd" },
    decoration: { farmPlots: 4, flowerPatches: 5, lamps: 0, towers: 0, banners: 0 },
    effects: { smoke: true, flags: false, waterShimmer: false, windowsGlow: false, sparkles: false },
  },
  2: {
    name: "町",
    role: "交易が生まれる町",
    description: "道路と橋が整い、商店・広場・教会が見え始める。建物数と密度が一段増える。",
    palette: { wall: "#cfc6b6", roof: "#9e4f30", trim: "#7d7566", window: "#78a7c8", accent: "#3b6bc4" },
    groundColor: "#63854a",
    secondaryGroundColor: "#7d9c5c",
    roadColor: "#b3946a",
    waterColor: "#3d7ba6",
    treeColor: "#476f3d",
    treeCount: 15,
    npcCount: 5,
    sky: { css: "bg-gradient-to-b from-sky-400 via-sky-200 to-blue-50", horizon: "#caedff", starCount: 0, cloudCount: 6, godRayCount: 0 },
    layout: { density: 0.84, roadRings: 1, plazaRadius: 0.85, hasBridge: true, hasMoat: false, hasHarbor: false, hasMountains: true },
    lighting: { ambient: "#ffffff", ambientIntensity: 0.7, sun: "#fff2d8", sunIntensity: 1.05, sunPosition: [6, 10, 4], fog: "#e4ecdf" },
    decoration: { farmPlots: 5, flowerPatches: 6, lamps: 4, towers: 0, banners: 2 },
    effects: { smoke: true, flags: true, waterShimmer: false, windowsGlow: false, sparkles: false },
  },
  3: {
    name: "都市",
    role: "商業と文化の発展",
    description: "夕暮れのグラデーション、星の出始め、暖色の窓明かり。市場・工房・ギルドが密集。",
    palette: { wall: "#b3775c", roof: "#3a4556", trim: "#4a3527", window: "#eec25a", accent: "#7c5aca" },
    groundColor: "#6f7a5c",
    secondaryGroundColor: "#8c8060",
    roadColor: "#a3835c",
    waterColor: "#35608c",
    treeColor: "#3d5638",
    treeCount: 16,
    npcCount: 8,
    sky: { css: "bg-gradient-to-b from-indigo-700 via-violet-400 to-orange-200", horizon: "#f5a45f", starCount: 18, cloudCount: 4, godRayCount: 0 },
    layout: { density: 0.96, roadRings: 1, plazaRadius: 0.96, hasBridge: true, hasMoat: false, hasHarbor: false, hasMountains: true },
    lighting: { ambient: "#c7c2ff", ambientIntensity: 0.56, sun: "#ffb27a", sunIntensity: 0.9, sunPosition: [-6, 6, 4], fog: "#dba878" },
    decoration: { farmPlots: 2, flowerPatches: 5, lamps: 10, towers: 2, banners: 4 },
    effects: { smoke: true, flags: true, waterShimmer: true, windowsGlow: true, sparkles: false },
  },
  4: {
    name: "王国",
    role: "城壁を持つ王国の都",
    description: "夜空と星、城壁、門、塔、街灯。外周は防衛線、中心は広場と行政区になる。",
    palette: { wall: "#d8cfc6", roof: "#2e4560", trim: "#e8e3da", window: "#f0c25a", accent: "#c2385a" },
    groundColor: "#6d6a5e",
    secondaryGroundColor: "#82796a",
    roadColor: "#9a8d78",
    waterColor: "#2f5875",
    wallColor: "#a89a89",
    treeColor: "#2c3f30",
    treeCount: 17,
    npcCount: 12,
    sky: { css: "bg-gradient-to-b from-slate-950 via-indigo-900 to-rose-300", horizon: "#e0698a", starCount: 36, cloudCount: 2, godRayCount: 0 },
    layout: { density: 1.08, roadRings: 2, plazaRadius: 1.05, hasBridge: true, hasMoat: true, hasHarbor: false, hasMountains: false },
    lighting: { ambient: "#b9c2ff", ambientIntensity: 0.5, sun: "#ff9ecf", sunIntensity: 0.72, sunPosition: [-6, 5, 4], fog: "#2b2547" },
    decoration: { farmPlots: 0, flowerPatches: 3, lamps: 18, towers: 6, banners: 8 },
    effects: { smoke: false, flags: true, waterShimmer: true, windowsGlow: true, sparkles: true },
  },
  5: {
    name: "帝国",
    role: "高度文明の中心",
    description: "深い夜空、巨大ドーム、大学・劇場・銀行・港。建物は高く密集し、街全体が輝く。",
    palette: { wall: "#e8dcbc", roof: "#c19122", trim: "#b3922e", window: "#ffedb8", accent: "#e0961c" },
    groundColor: "#7f7d58",
    secondaryGroundColor: "#98916a",
    roadColor: "#b3a075",
    waterColor: "#5f9cb8",
    wallColor: "#bfae85",
    treeColor: "#48633e",
    treeCount: 18,
    npcCount: 18,
    sky: { css: "bg-gradient-to-b from-slate-950 via-blue-950 to-amber-300", horizon: "#e8b83a", starCount: 52, cloudCount: 1, godRayCount: 2 },
    layout: { density: 1.18, roadRings: 2, plazaRadius: 1.15, hasBridge: true, hasMoat: true, hasHarbor: true, hasMountains: false },
    lighting: { ambient: "#fff0c2", ambientIntensity: 0.62, sun: "#ffe08a", sunIntensity: 0.92, sunPosition: [6, 9, 4], fog: "#8a7850" },
    decoration: { farmPlots: 0, flowerPatches: 2, lamps: 28, towers: 8, banners: 12 },
    effects: { smoke: false, flags: true, waterShimmer: true, windowsGlow: true, sparkles: true },
  },
  6: {
    name: "天空帝国",
    role: "黄金の空に包まれた繁栄の頂点",
    description: "黄金の空、放射光、瞬く星、巨大王城、宮殿、神殿。都市全体が一つの天空帝国として完成。",
    palette: { wall: "#f5edd8", roof: "#d9b132", trim: "#e8cf7a", window: "#fff4d0", accent: "#e8bc3a" },
    groundColor: "#bfae7d",
    secondaryGroundColor: "#d4c795",
    roadColor: "#ddd0a3",
    waterColor: "#8fd0e8",
    wallColor: "#d4c795",
    treeColor: "#5a7a4c",
    treeCount: 20,
    npcCount: 24,
    sky: { css: "bg-gradient-to-b from-yellow-300 via-amber-100 to-orange-50", horizon: "#f5e98f", starCount: 68, cloudCount: 0, godRayCount: 9 },
    layout: { density: 1.28, roadRings: 3, plazaRadius: 1.24, hasBridge: true, hasMoat: true, hasHarbor: true, hasMountains: false },
    lighting: { ambient: "#fff6d0", ambientIntensity: 0.78, sun: "#ffe066", sunIntensity: 1.12, sunPosition: [6, 9, 4], fog: "#e8dda8" },
    decoration: { farmPlots: 0, flowerPatches: 4, lamps: 36, towers: 12, banners: 18 },
    effects: { smoke: false, flags: true, waterShimmer: true, windowsGlow: true, sparkles: true },
  },
};

export function getTierWorldConfig(tier: number): TierWorldConfig {
  return TIER_WORLD_CONFIG[(tier as Tier) in TIER_WORLD_CONFIG ? (tier as Tier) : 1];
}
