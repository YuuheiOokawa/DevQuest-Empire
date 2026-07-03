import { getTierWorldConfig } from "../config/tierWorldConfig";
import { QUALITY_NPC_SCALE } from "../config/worldConfig";
import type { QualityTier } from "../types/worldTypes";
import { hashString, seededRandom } from "../utils/random";
import { getRoadSpokeAngles } from "./RoadSystem";
import { NPC3D, type NPCKind } from "../parts/NPC3D";

function pickKind(index: number, tier: number): NPCKind {
  const roll = index % 6;
  if (tier >= 5 && roll === 5) return "aiWorker";
  if (tier >= 4 && roll === 4) return "soldier";
  if (roll === 3) return "adventurer";
  if (roll === 2) return "merchant";
  if (roll === 1 && index % 4 === 1) return "animal";
  return "resident";
}

// 道路の上をゆっくり往復する簡易NPC。人数はtierWorldConfig.npcCountを
// useResponsiveQualityで縮小した数だけ生成する。パフォーマンス優先のため
// カプセル+球の2プリミティブのみで構成している(NPC3D参照)。
export function NPCSystem({
  tier,
  radius,
  quality,
}: {
  tier: number;
  radius: number;
  quality: QualityTier;
}) {
  const world = getTierWorldConfig(tier);
  const angles = getRoadSpokeAngles(tier);
  const count = Math.max(0, Math.round(world.npcCount * QUALITY_NPC_SCALE[quality]));
  const innerRadius = world.layout.plazaRadius + 0.6;
  const outerRadius = Math.max(innerRadius + 0.5, radius - 1);

  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const seed = hashString(`npc-${tier}-${i}`);
        const angle = angles[i % angles.length] + (seededRandom(seed) - 0.5) * 0.15;
        return (
          <NPC3D
            key={i}
            kind={pickKind(i, tier)}
            angle={angle}
            radiusMin={innerRadius}
            radiusMax={outerRadius}
            speed={0.15 + seededRandom(seed * 3) * 0.15}
            phase={seededRandom(seed * 7) * Math.PI * 2}
          />
        );
      })}
    </>
  );
}
