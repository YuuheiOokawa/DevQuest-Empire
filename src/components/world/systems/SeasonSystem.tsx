import type { QualityTier, Season } from "../types/worldTypes";
import { getSeasonConfig } from "../config/seasonConfig";
import { ParticleSystem } from "./ParticleSystem";

// 季節の降下パーティクル(花びら/落ち葉/雪)。木・地面の色みは
// seasonConfigのtreeTint/groundTintをTerrainSystem/DecorationSystemに直接渡して
// 反映するため、ここではパーティクルの描画のみを担当する。
export function SeasonSystem({
  season,
  radius,
  quality,
}: {
  season: Season | undefined;
  radius: number;
  quality: QualityTier;
}) {
  const config = getSeasonConfig(season);
  if (!config?.particle) return null;
  return <ParticleSystem preset={config.particle} radius={radius} quality={quality} seedPrefix={`season-${season}`} />;
}
