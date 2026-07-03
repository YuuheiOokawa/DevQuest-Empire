import type { VillageBuildingView } from "@/lib/game/buildings";

export type Tier = 1 | 2 | 3 | 4 | 5 | 6;

export type Season = "spring" | "summer" | "autumn" | "winter";

export type Weather = "clear" | "cloudy" | "rain" | "snow" | "festival";

export type EventTheme = "none" | "sakura" | "summerFestival" | "halloween" | "christmas";

// ドメイン側の型(getVillageBuildingsView の戻り値)をそのまま使う。
// 建物の一意キーは `type`(建物マスタの種別文字列)であり、汎用的な `id` は存在しないため
// WorldScene の props では `type` を building id として扱う。
export type UserBuilding = VillageBuildingView;

export type WorldSceneProps = {
  tier: Tier;
  buildings: UserBuilding[];
  selectedBuildingId?: string;
  onSelectBuilding?: (buildingId: string) => void;
  season?: Season;
  weather?: Weather;
  eventTheme?: EventTheme;
};

export type QualityTier = "low" | "mid" | "high";

export type ParticleShape = "line" | "dot" | "confetti";

export type ParticlePreset = {
  count: number;
  color: string | string[];
  speed: number;
  drift: number;
  shape: ParticleShape;
};

export type EventDecorationKind = "lantern" | "pumpkin" | "tree" | "firework" | "ghost";
