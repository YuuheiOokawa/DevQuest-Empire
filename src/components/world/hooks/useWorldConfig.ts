import { useMemo } from "react";
import { getTierWorldConfig } from "../config/tierWorldConfig";
import { getSeasonConfig } from "../config/seasonConfig";
import { getWeatherConfig } from "../config/weatherConfig";
import { getEventConfig } from "../config/eventConfig";
import { outerRadiusForTier } from "./useBuildingLayout";
import type { EventTheme, Season, Weather } from "../types/worldTypes";

// tier/season/weather/eventTheme から各Systemが必要とする値を1回にまとめて
// 解決するメモ化フック。WorldScene本体のprop受け渡しを簡潔にする。
export function useWorldConfig(tier: number, season?: Season, weather?: Weather, eventTheme?: EventTheme) {
  return useMemo(() => {
    const tierConfig = getTierWorldConfig(tier);
    const seasonConfig = getSeasonConfig(season);
    const weatherConfig = getWeatherConfig(weather);
    const eventConfig = getEventConfig(eventTheme);
    const radius = outerRadiusForTier(tier);

    return {
      tierConfig,
      seasonConfig,
      weatherConfig,
      eventConfig,
      radius,
      cloudBoost: weatherConfig.cloudBoost ?? 0,
      skyDimming: weatherConfig.skyDimming ?? 0,
      fog: eventConfig.fogOverride ?? tierConfig.lighting.fog,
      treeTint: seasonConfig?.treeTint,
      groundTint: seasonConfig?.groundTint,
    };
  }, [tier, season, weather, eventTheme]);
}
