import type { ParticlePreset, QualityTier } from "../types/worldTypes";
import { QUALITY_PARTICLE_SCALE } from "./worldConfig";

// Weather/Season/EventSystem が同じ「降下パーティクル数の縮小ロジック」を
// 使えるようにする共通ヘルパー。個別Systemはpresetの定義だけに専念できる。
export function resolveParticleCount(preset: ParticlePreset | undefined, quality: QualityTier): number {
  if (!preset) return 0;
  return Math.max(0, Math.round(preset.count * QUALITY_PARTICLE_SCALE[quality]));
}
