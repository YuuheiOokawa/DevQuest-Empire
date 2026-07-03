import { hashString, seededRandom } from "./palette3d";
import { getTierWorldConfig } from "./tierWorldConfig";
import type { VillageBuildingView } from "@/lib/game/buildings";

export type PlacedBuilding = VillageBuildingView & {
  position: [number, number];
  rotationY: number;
  district: "center" | "residential" | "commerce" | "culture" | "military" | "harbor" | "outer";
};

const DISTRICT_BY_TYPE: Record<string, PlacedBuilding["district"]> = {
  castle: "center",
  royal_palace: "center",
  imperial_capital: "center",
  throne_room: "center",
  monument: "center",
  guild: "commerce",
  market: "commerce",
  tavern: "commerce",
  trade_hub: "commerce",
  blacksmith: "commerce",
  workshop: "commerce",
  library: "culture",
  grand_library: "culture",
  academy: "culture",
  great_academy: "culture",
  school: "culture",
  observatory: "culture",
  church: "culture",
  cathedral: "culture",
  monastery: "culture",
  arena: "military",
  colosseum: "military",
  grand_colosseum: "military",
  senate: "center",
  watchtower: "military",
  harbor: "harbor",
  shipyard: "harbor",
  house_small: "residential",
  house_large: "residential",
};

const DISTRICT_ANGLE: Record<PlacedBuilding["district"], number> = {
  center: -Math.PI / 2,
  residential: Math.PI * 0.75,
  commerce: Math.PI * 0.1,
  culture: Math.PI * 1.35,
  military: Math.PI * 1.75,
  harbor: Math.PI * 0.48,
  outer: Math.PI,
};

function districtOf(type: string, requiredTier: number): PlacedBuilding["district"] {
  if (DISTRICT_BY_TYPE[type]) return DISTRICT_BY_TYPE[type];
  if (requiredTier >= 5) return "center";
  if (requiredTier >= 4) return "military";
  if (requiredTier >= 3) return "commerce";
  return "residential";
}

export function layoutBuildings(buildings: VillageBuildingView[], currentTier?: number): PlacedBuilding[] {
  const tier = currentTier ?? Math.max(1, ...buildings.map((b) => b.requiredTier));
  const world = getTierWorldConfig(tier);
  const density = world.layout.density;

  const sorted = [...buildings].sort((a, b) => {
    if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
    if (a.requiredTier !== b.requiredTier) return a.requiredTier - b.requiredTier;
    return a.type.localeCompare(b.type);
  });

  const districtIndex = new Map<string, number>();
  const districtTotal = new Map<string, number>();
  for (const b of sorted) {
    const d = districtOf(b.type, b.requiredTier);
    districtTotal.set(d, (districtTotal.get(d) ?? 0) + 1);
  }

  return sorted.map((building) => {
    const seed = hashString(`${building.type}-${building.requiredTier}`);
    const district = districtOf(building.type, building.requiredTier);
    const index = districtIndex.get(district) ?? 0;
    const total = districtTotal.get(district) ?? 1;
    districtIndex.set(district, index + 1);

    const baseRadius =
      district === "center"
        ? 1.15 + building.requiredTier * 0.28
        : district === "harbor"
          ? 4.2 + building.requiredTier * 0.42
          : 2.0 + building.requiredTier * 0.86;

    const compressedRadius = baseRadius / density;
    const spread = district === "center" ? 0.7 : district === "harbor" ? 0.55 : 1.2;
    const angleCenter = DISTRICT_ANGLE[district];
    const angleOffset = total <= 1 ? 0 : ((index / (total - 1)) - 0.5) * spread;
    const angle = angleCenter + angleOffset + (seededRandom(seed) - 0.5) * 0.18;
    const radius = compressedRadius + (seededRandom(seed * 3.13) - 0.5) * 0.65;

    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    return {
      ...building,
      district,
      position: [x, z],
      rotationY: -angle + Math.PI / 2,
    };
  });
}

export function outerRadiusForTier(tier: number): number {
  const world = getTierWorldConfig(tier);
  return 4.4 + tier * 1.55 / Math.min(1.15, world.layout.density);
}
