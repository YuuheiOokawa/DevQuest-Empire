import type { QualityTier, Weather } from "../types/worldTypes";
import { getWeatherConfig } from "../config/weatherConfig";
import { ParticleSystem } from "./ParticleSystem";

// 天候の可視化。clear/cloudyはパーティクルを持たない(cloudyの雲量アップはSkySystem側で処理)。
// rain/snow/festivalはParticleSystem(共通の降下パーティクル)にpresetを渡すだけ。
export function WeatherSystem({
  weather,
  radius,
  quality,
}: {
  weather: Weather | undefined;
  radius: number;
  quality: QualityTier;
}) {
  const config = getWeatherConfig(weather);
  if (!config.particle) return null;
  return <ParticleSystem preset={config.particle} radius={radius} quality={quality} seedPrefix={`weather-${weather}`} />;
}
