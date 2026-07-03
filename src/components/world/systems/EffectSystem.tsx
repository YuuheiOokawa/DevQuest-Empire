import { DoubleSide } from "three";
import { getTierWorldConfig } from "../config/tierWorldConfig";

// 重いPostProcessing(Bloom等)は使わず、板ポリ+meshBasicMaterialの
// 疑似GodRayで軽量に「光の柱」を表現する。ティア5-6で本数が増える。
// 建物単体のMAX演出/選択エフェクトは Building3D(parts) 側に持たせている
// (建物ごとの状態と密結合なため、あえてここには寄せていない)。
function GodRays({ tier, radius }: { tier: number; radius: number }) {
  const world = getTierWorldConfig(tier);
  if (world.sky.godRayCount <= 0) return null;
  return (
    <group position={[radius * 0.35, 2.2, -radius * 0.85]} rotation={[0, 0, -0.35]}>
      {Array.from({ length: world.sky.godRayCount }).map((_, i) => (
        <mesh key={i} position={[(i - world.sky.godRayCount / 2) * 0.28, 0, 0]} rotation={[0, 0, (i - world.sky.godRayCount / 2) * 0.08]}>
          <planeGeometry args={[0.12, radius * 1.8]} />
          <meshBasicMaterial color="#fff2a6" transparent opacity={tier >= 6 ? 0.28 : 0.12} side={DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

export function EffectSystem({ tier, radius }: { tier: number; radius: number }) {
  return (
    <>
      <GodRays tier={tier} radius={radius} />
    </>
  );
}
