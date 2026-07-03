import { hashString, seededRandom } from "./palette3d";
import type { VillageBuildingView } from "@/lib/game/buildings";

export type PlacedBuilding = VillageBuildingView & {
  position: [number, number];
  rotationY: number;
};

// ティアごとに同心円状のリングへ配置する。古いティアほど中心に近く、
// 発展するほど外側へ環が広がっていく = 実際の街の成長過程を模した配置。
const RING_BASE_RADIUS = 1.8;
const RING_STEP = 2.1;

export function layoutBuildings(buildings: VillageBuildingView[]): PlacedBuilding[] {
  const byTier = new Map<number, VillageBuildingView[]>();
  for (const b of buildings) {
    const list = byTier.get(b.requiredTier) ?? [];
    list.push(b);
    byTier.set(b.requiredTier, list);
  }

  const placed: PlacedBuilding[] = [];
  for (const [tier, group] of byTier) {
    const ringRadius = RING_BASE_RADIUS + (tier - 1) * RING_STEP;
    const ringRotation = tier * 0.35;
    group.forEach((building, i) => {
      const seed = hashString(building.type);
      const angleBase = (i / group.length) * Math.PI * 2;
      const jitterAngle = (seededRandom(seed) - 0.5) * 0.4;
      const jitterRadius = (seededRandom(seed * 3.7) - 0.5) * (RING_STEP * 0.5);
      const angle = angleBase + jitterAngle + ringRotation;
      const radius = ringRadius + jitterRadius;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      placed.push({
        ...building,
        position: [x, z],
        rotationY: -angle + Math.PI / 2,
      });
    });
  }
  return placed;
}

export function outerRadiusForTier(tier: number): number {
  return RING_BASE_RADIUS + (tier - 1) * RING_STEP + RING_STEP * 0.5;
}
