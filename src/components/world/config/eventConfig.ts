import type { EventDecorationKind, EventTheme, ParticlePreset } from "../types/worldTypes";

export type EventConfig = {
  label: string;
  particle?: ParticlePreset;
  fogOverride?: string;
  decorations: EventDecorationKind[];
};

// 期間イベントのテーマ設定。sakuraはSeasonSystemの春演出と資産を共有するため
// ここではparticleを持たずdecorationsのみ追加する。他テーマは今回、装飾種別のみ
// 定義し、実際の見た目差分(EventSystem)は最小限の実装に留める(次回拡張前提)。
export const EVENT_CONFIG: Record<EventTheme, EventConfig> = {
  none: {
    label: "なし",
    decorations: [],
  },
  sakura: {
    label: "桜まつり",
    decorations: ["tree"],
  },
  summerFestival: {
    label: "夏祭り",
    particle: { count: 18, color: ["#facc15", "#fb923c", "#f87171"], speed: 0.8, drift: 1.1, shape: "confetti" },
    decorations: ["lantern", "firework"],
  },
  halloween: {
    label: "ハロウィン",
    fogOverride: "#3b2a52",
    decorations: ["pumpkin", "ghost"],
  },
  christmas: {
    label: "クリスマス",
    particle: { count: 40, color: "#ffffff", speed: 0.3, drift: 0.35, shape: "dot" },
    decorations: ["tree", "lantern"],
  },
};

export function getEventConfig(eventTheme: EventTheme | undefined): EventConfig {
  return EVENT_CONFIG[eventTheme ?? "none"];
}
