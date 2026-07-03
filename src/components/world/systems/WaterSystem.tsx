import { DoubleSide } from "three";
import { getTierWorldConfig } from "../config/tierWorldConfig";
import { Fountain } from "../parts/Fountain";

function River({ tier, radius }: { tier: number; radius: number }) {
  const world = getTierWorldConfig(tier);
  if (world.layout.hasMoat) return null;
  return (
    <group rotation={[0, Math.PI / 6, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, radius * 0.15]}>
        <planeGeometry args={[radius * 2.7, radius * 0.34]} />
        <meshStandardMaterial color={world.waterColor} transparent opacity={0.78} roughness={0.18} metalness={0.08} />
      </mesh>
      {world.layout.hasBridge && (
        <mesh position={[0, 0.07, radius * 0.15]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.42, 0.12, 1.25]} />
          <meshStandardMaterial color={world.roadColor} />
        </mesh>
      )}
    </group>
  );
}

function MoatAndHarbor({ tier, radius }: { tier: number; radius: number }) {
  const world = getTierWorldConfig(tier);
  if (!world.layout.hasMoat) return null;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
        <ringGeometry args={[radius - 0.55, radius - 0.23, 128]} />
        <meshStandardMaterial color={world.waterColor} transparent opacity={0.7} roughness={0.1} metalness={0.12} side={DoubleSide} />
      </mesh>
      {world.layout.hasHarbor && (
        <group
          position={[Math.cos(Math.PI * 0.48) * (radius - 0.38), 0.04, Math.sin(Math.PI * 0.48) * (radius - 0.38)]}
          rotation={[0, -0.7, 0]}
        >
          <mesh receiveShadow>
            <boxGeometry args={[1.7, 0.08, 0.32]} />
            <meshStandardMaterial color={world.palette.trim} />
          </mesh>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[-0.55 + i * 0.55, 0.12, 0.2]} castShadow>
              <cylinderGeometry args={[0.035, 0.035, 0.35, 6]} />
              <meshStandardMaterial color={world.palette.trim} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

// 川・堀・港・噴水など、水にまつわる表現をまとめるSystem。
// ティア4以降は川が堀に置き換わり、ティア5以降は港が追加される。
export function WaterSystem({ tier, radius }: { tier: number; radius: number }) {
  return (
    <group>
      <River tier={tier} radius={radius} />
      <MoatAndHarbor tier={tier} radius={radius} />
      <Fountain tier={tier} />
    </group>
  );
}
