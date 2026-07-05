import { useMemo } from "react";
import { hashString, seededRandom } from "../utils/random";
import { getTierWorldConfig } from "../config/tierWorldConfig";
import { BUILDING_CONFIG_3D, type Archetype } from "../config/buildingConfig";
import type { UserBuilding } from "../types/worldTypes";

export type District = "center" | "residential" | "commerce" | "culture" | "military" | "harbor" | "outer";

export type PlacedBuilding = UserBuilding & {
  position: [number, number];
  rotationY: number;
  district: District;
};

const DISTRICT_BY_TYPE: Record<string, District> = {
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

const DISTRICT_ANGLE: Record<District, number> = {
  center: -Math.PI / 2,
  residential: Math.PI * 0.75,
  commerce: Math.PI * 0.1,
  culture: Math.PI * 1.35,
  military: Math.PI * 1.75,
  harbor: Math.PI * 0.48,
  outer: Math.PI,
};

// アーキタイプごとの接地半径(屋根の張り出し込みのおおよその外接円)。
// 重なり解消(separation)の判定に使う。
const FOOTPRINT_BY_ARCHETYPE: Record<Archetype, number> = {
  house: 0.8,
  houseGrand: 1.0,
  tower: 0.55,
  church: 0.8,
  castle: 1.15,
  grandHall: 1.15,
  marketStall: 0.7,
  monument: 0.5,
  tree: 0.6,
  harbor: 1.0,
};

function footprintOf(building: UserBuilding): number {
  // 未解放スロットは工事予定地(約1.05四方)+台座ぶん
  if (!building.unlocked) return 0.8;
  const config = BUILDING_CONFIG_3D[building.type] ?? { archetype: "house" as Archetype };
  const base = FOOTPRINT_BY_ARCHETYPE[config.archetype] + (config.wide ? 0.15 : 0);
  const levelBoost = Math.min(1.25, 1 + building.level * 0.05);
  return base * (config.scale ?? 1) * levelBoost;
}

function districtOf(type: string, requiredTier: number): District {
  if (DISTRICT_BY_TYPE[type]) return DISTRICT_BY_TYPE[type];
  if (requiredTier >= 5) return "center";
  if (requiredTier >= 4) return "military";
  if (requiredTier >= 3) return "commerce";
  return "residential";
}

// 川の帯(z方向の位置と半幅)。堀のあるティア(4以降)は川が無いのでnull。
// WaterSystemの川の描画と、建物レイアウトの川回避の両方がこれを参照する。
export function getRiverBand(tier: number): { z: number; halfWidth: number } | null {
  const world = getTierWorldConfig(tier);
  if (world.layout.hasMoat) return null;
  const outer = outerRadiusForTier(tier);
  return { z: outer * 0.62, halfWidth: outer * 0.12 };
}

// 区画(district)ベースで建物を同心円状に配置する。古いティアの建物ほど中心に近く、
// 発展するほど外側の区画に新しい建物が並ぶ。初期配置のあと反復的な押し出し
// (separation)を行い、建物同士・広場・川・外周との重なりを解消する。
export function layoutBuildings(buildings: UserBuilding[], currentTier?: number): PlacedBuilding[] {
  const tier = currentTier ?? Math.max(1, ...buildings.map((b) => b.requiredTier));
  const world = getTierWorldConfig(tier);
  const density = world.layout.density;
  const outer = outerRadiusForTier(tier);
  const river = getRiverBand(tier);

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

  // --- 初期配置 ---
  const pos: { x: number; z: number; r: number }[] = sorted.map((building) => {
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

    // 同じ区画内では少しずつ外側へずらして初期状態から重なりにくくする
    const compressedRadius = baseRadius / density + index * 0.5;
    const spread = district === "center" ? 0.9 : district === "harbor" ? 0.55 : 1.2;
    const angleCenter = DISTRICT_ANGLE[district];
    const angleOffset = total <= 1 ? 0 : (index / (total - 1) - 0.5) * spread;
    const angle = angleCenter + angleOffset + (seededRandom(seed) - 0.5) * 0.18;
    const radius = compressedRadius + (seededRandom(seed * 3.13) - 0.5) * 0.5;

    return {
      x: Math.cos(angle) * radius,
      z: Math.sin(angle) * radius,
      r: footprintOf(building),
    };
  });

  // --- 重なり解消(反復押し出し) ---
  const PAIR_MARGIN = 0.3;
  const plazaKeepOut = world.layout.plazaRadius + 0.45;
  const wallKeepIn = outer - 1.1;

  for (let iter = 0; iter < 60; iter++) {
    let moved = false;

    // 建物同士
    for (let i = 0; i < pos.length; i++) {
      for (let j = i + 1; j < pos.length; j++) {
        const a = pos[i];
        const b = pos[j];
        const dx = b.x - a.x;
        const dz = b.z - a.z;
        const dist = Math.hypot(dx, dz);
        const minDist = a.r + b.r + PAIR_MARGIN;
        if (dist >= minDist) continue;
        moved = true;
        // 完全に同座標なら決定的な方向に分離する
        const nx = dist > 0.001 ? dx / dist : Math.cos(i * 2.399);
        const nz = dist > 0.001 ? dz / dist : Math.sin(i * 2.399);
        const push = (minDist - dist) / 2;
        a.x -= nx * push;
        a.z -= nz * push;
        b.x += nx * push;
        b.z += nz * push;
      }
    }

    for (const p of pos) {
      // 中央広場には建てない
      const distFromCenter = Math.hypot(p.x, p.z);
      const minCenter = plazaKeepOut + p.r;
      if (distFromCenter < minCenter) {
        moved = true;
        const nx = distFromCenter > 0.001 ? p.x / distFromCenter : 1;
        const nz = distFromCenter > 0.001 ? p.z / distFromCenter : 0;
        p.x = nx * minCenter;
        p.z = nz * minCenter;
      }
      // 外周(城壁・森)の内側に収める
      const maxCenter = wallKeepIn - p.r * 0.4;
      const distNow = Math.hypot(p.x, p.z);
      if (distNow > maxCenter) {
        moved = true;
        p.x = (p.x / distNow) * maxCenter;
        p.z = (p.z / distNow) * maxCenter;
      }
      // 川の上には建てない(近い側の岸へ押し出す)
      if (river) {
        const clearance = river.halfWidth + p.r + 0.2;
        const dz = p.z - river.z;
        if (Math.abs(dz) < clearance) {
          moved = true;
          p.z = river.z + (dz >= 0 ? clearance : -clearance);
        }
      }
    }

    if (!moved) break;
  }

  return sorted.map((building, i) => {
    const { x, z } = pos[i];
    const angle = Math.atan2(z, x);
    return {
      ...building,
      district: districtOf(building.type, building.requiredTier),
      position: [x, z] as [number, number],
      rotationY: -angle + Math.PI / 2,
    };
  });
}

export function outerRadiusForTier(tier: number): number {
  const world = getTierWorldConfig(tier);
  return 4.4 + (tier * 1.55) / Math.min(1.15, world.layout.density);
}

export function useBuildingLayout(buildings: UserBuilding[], tier: number): PlacedBuilding[] {
  return useMemo(() => layoutBuildings(buildings, tier), [buildings, tier]);
}
