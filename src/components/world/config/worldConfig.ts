import type { QualityTier } from "../types/worldTypes";

// Canvas全体・カメラ・品質まわりの既定値。ティアに依らない横断的な設定はここに置く。
export const WORLD_CONFIG = {
  canvas: {
    heightClass: "h-80 sm:h-[420px]",
    dprByQuality: { low: [1, 1] as [number, number], mid: [1, 1.5] as [number, number], high: [1, 1.75] as [number, number] },
    shadowMapSizeByQuality: { low: 512, mid: 1024, high: 1024 },
  },
  camera: {
    fov: 38,
    distanceFactor: 1.2,
    heightFactor: 0.78,
    minDistanceFactor: 0.55,
    maxDistanceFactor: 1.9,
    target: [0, 0.45, 0] as [number, number, number],
  },
  tierTransition: {
    durationSeconds: 1.2,
    zoomOutFactor: 1.25,
  },
} as const;

// パーティクル数は端末幅(useResponsiveQuality)に応じてこの係数で縮小する。
export const QUALITY_PARTICLE_SCALE: Record<QualityTier, number> = {
  low: 0.4,
  mid: 0.7,
  high: 1,
};

export const QUALITY_NPC_SCALE: Record<QualityTier, number> = {
  low: 0.5,
  mid: 0.8,
  high: 1,
};
