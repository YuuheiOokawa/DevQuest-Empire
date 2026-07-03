import type { EventTheme, Season } from "@/components/world/types/worldTypes";

// 実際のカレンダー月から季節・期間イベントテーマの既定値を算出する。
// 天候(weather)は気象APIを持たないため呼び出し側で "clear" 固定として扱う。
export function getSeasonalDefaults(date: Date): { season: Season; eventTheme: EventTheme } {
  const month = date.getMonth() + 1; // 1-12

  let season: Season;
  if (month >= 3 && month <= 5) season = "spring";
  else if (month >= 6 && month <= 8) season = "summer";
  else if (month >= 9 && month <= 11) season = "autumn";
  else season = "winter";

  let eventTheme: EventTheme = "none";
  if (month === 4) eventTheme = "sakura";
  else if (month === 8) eventTheme = "summerFestival";
  else if (month === 10) eventTheme = "halloween";
  else if (month === 12) eventTheme = "christmas";

  return { season, eventTheme };
}
