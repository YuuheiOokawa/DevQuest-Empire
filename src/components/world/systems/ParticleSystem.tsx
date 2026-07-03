import type { ParticlePreset, QualityTier } from "../types/worldTypes";
import { resolveParticleCount } from "../config/particleConfig";
import { Precipitation } from "../parts/Precipitation";

// Weather/Season/EventSystemが共有する降下パーティクルの入口。
// 端末品質(quality)に応じてpresetのcountを縮小してからPrecipitationへ渡す。
export function ParticleSystem({
  preset,
  radius,
  quality,
  seedPrefix,
}: {
  preset: ParticlePreset | undefined;
  radius: number;
  quality: QualityTier;
  seedPrefix: string;
}) {
  if (!preset) return null;
  const scaledPreset: ParticlePreset = { ...preset, count: resolveParticleCount(preset, quality) };
  return <Precipitation preset={scaledPreset} radius={radius} seedPrefix={seedPrefix} />;
}
