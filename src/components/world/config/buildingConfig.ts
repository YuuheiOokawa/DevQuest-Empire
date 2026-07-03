export type Archetype =
  | "house"
  | "houseGrand"
  | "tower"
  | "church"
  | "castle"
  | "grandHall"
  | "marketStall"
  | "monument"
  | "tree"
  | "harbor";

export type BuildingConfig = {
  archetype: Archetype;
  scale?: number;
  wide?: boolean;
  chimney?: boolean;
  dome?: boolean;
  crown?: boolean;
  flag?: boolean;
  arches?: boolean;
};

// 建物タイプ(DBの BuildingMaster.type)ごとに、3Dで使うアーキタイプと
// 見た目バリエーションを定義する。新しい建物を追加する際はここに1行足すだけでよい。
export const BUILDING_CONFIG_3D: Record<string, BuildingConfig> = {
  house_small: { archetype: "house", scale: 0.85 },
  house_large: { archetype: "house", scale: 1, wide: true },
  blacksmith: { archetype: "house", scale: 0.9, chimney: true },
  guild: { archetype: "houseGrand", scale: 1.05 },
  tavern: { archetype: "marketStall", scale: 0.9 },
  dev_base: { archetype: "tower", scale: 0.85, flag: true },
  castle: { archetype: "castle", scale: 1.2, flag: true },
  library: { archetype: "houseGrand", scale: 1 },
  academy: { archetype: "grandHall", scale: 0.95 },
  monument: { archetype: "monument", scale: 0.9 },
  market: { archetype: "marketStall", scale: 1 },
  school: { archetype: "houseGrand", scale: 0.95 },
  workshop: { archetype: "house", scale: 0.9, chimney: true },
  watchtower: { archetype: "tower", scale: 1.1, flag: true },
  cathedral: { archetype: "church", scale: 1.25 },
  arena: { archetype: "grandHall", scale: 1.1, arches: true },
  harbor: { archetype: "harbor", scale: 1 },
  observatory: { archetype: "tower", scale: 1.05, dome: true },
  grand_library: { archetype: "grandHall", scale: 1.1 },
  colosseum: { archetype: "grandHall", scale: 1.25, arches: true },
  senate: { archetype: "grandHall", scale: 1.15 },
  shipyard: { archetype: "harbor", scale: 1.15 },
  royal_palace: { archetype: "castle", scale: 1.3, dome: true, flag: true },
  great_academy: { archetype: "grandHall", scale: 1.2 },
  trade_hub: { archetype: "marketStall", scale: 1.2, wide: true },
  monastery: { archetype: "church", scale: 1 },
  imperial_capital: { archetype: "castle", scale: 1.4, dome: true, flag: true },
  world_tree: { archetype: "tree", scale: 1.3 },
  grand_colosseum: { archetype: "grandHall", scale: 1.4, arches: true },
  throne_room: { archetype: "castle", scale: 1.3, crown: true },
  bank: { archetype: "grandHall", scale: 1.1 },
  barracks: { archetype: "tower", scale: 1.05, flag: true },
  temple: { archetype: "church", scale: 1.15, dome: true },
  palace: { archetype: "castle", scale: 1.25, dome: true, flag: true },
  farm: { archetype: "house", scale: 0.78, wide: true, chimney: true },
};
