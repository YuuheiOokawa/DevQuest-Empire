import type { ParticlePreset, Weather } from "../types/worldTypes";

export type WeatherConfig = {
  label: string;
  particle?: ParticlePreset;
  cloudBoost?: number;
  skyDimming?: number;
};

// 天候ごとの演出。雨/雪/祭りはParticleSystemの共通コンポーネント(Precipitation)に
// presetを渡すだけで表現し、cloudyはSkySystemの雲の数を底上げするだけに留める。
export const WEATHER_CONFIG: Record<Weather, WeatherConfig> = {
  clear: {
    label: "快晴",
  },
  cloudy: {
    label: "曇り",
    cloudBoost: 4,
    skyDimming: 0.12,
  },
  rain: {
    label: "雨",
    particle: { count: 90, color: "#9fc7e8", speed: 3.2, drift: 0.05, shape: "line" },
    skyDimming: 0.25,
  },
  snow: {
    label: "雪",
    particle: { count: 60, color: "#ffffff", speed: 0.5, drift: 0.4, shape: "dot" },
    skyDimming: 0.08,
  },
  festival: {
    label: "祭り",
    particle: {
      count: 50,
      color: ["#f87171", "#facc15", "#34d399", "#60a5fa", "#f472b6"],
      speed: 0.6,
      drift: 0.9,
      shape: "confetti",
    },
  },
};

export function getWeatherConfig(weather: Weather | undefined): WeatherConfig {
  return WEATHER_CONFIG[weather ?? "clear"];
}
