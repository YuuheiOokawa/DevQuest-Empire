import { DoubleSide } from "three";
import { getTierWorldConfig } from "../config/tierWorldConfig";

function Ring({ radius, color, width = 0.08 }: { radius: number; color: string; width?: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} receiveShadow>
      <ringGeometry args={[radius - width, radius + width, 96]} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  );
}

// 地面・広場・道路の同心円リング・遠景の山・城壁をまとめる地形System。
// season由来の地面色ブレンド(groundTint)にも対応する。
export function TerrainSystem({
  tier,
  radius,
  groundTint,
}: {
  tier: number;
  radius: number;
  groundTint?: string;
}) {
  const world = getTierWorldConfig(tier);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <circleGeometry args={[radius, 96]} />
        <meshStandardMaterial color={world.groundColor} roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.015, 0]} receiveShadow>
        <circleGeometry args={[radius * 0.72, 96]} />
        <meshStandardMaterial color={world.secondaryGroundColor} roughness={0.95} transparent opacity={0.72} />
      </mesh>
      {groundTint && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
          <circleGeometry args={[radius, 96]} />
          <meshStandardMaterial color={groundTint} transparent opacity={0.3} roughness={1} />
        </mesh>
      )}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
        <circleGeometry args={[world.layout.plazaRadius, 48]} />
        <meshStandardMaterial color={world.roadColor} roughness={0.8} />
      </mesh>
      {Array.from({ length: world.layout.roadRings }).map((_, i) => (
        <Ring key={i} radius={world.layout.plazaRadius + 1.35 + i * 1.7} color={world.roadColor} width={0.07} />
      ))}
      <FarMountains tier={tier} radius={radius} />
      <CityWallShape tier={tier} radius={radius} />
    </group>
  );
}

function FarMountains({ tier, radius }: { tier: number; radius: number }) {
  const world = getTierWorldConfig(tier);
  if (!world.layout.hasMountains) return null;
  return (
    <group position={[0, 0, -radius - 1.4]}>
      {[-2.8, -1.3, 0.4, 2.2].map((x, i) => (
        <mesh key={x} position={[x, 0.55, 0]} castShadow>
          <coneGeometry args={[1.0 + i * 0.2, 1.25 + i * 0.2, 4]} />
          <meshStandardMaterial color={i % 2 ? "#7c8f70" : "#8ea275"} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

// ティア4(王国)以降、街全体を囲む城壁が現れる。
function CityWallShape({ tier, radius }: { tier: number; radius: number }) {
  const world = getTierWorldConfig(tier);
  if (tier < 4 || !world.wallColor) return null;
  const color = world.wallColor;
  const segments = 36;
  return (
    <group>
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, 0.7, segments, 1, true]} />
        <meshStandardMaterial color={color} side={DoubleSide} roughness={0.75} />
      </mesh>
      {Array.from({ length: segments }).map((_, i) => {
        if (i % 2 !== 0) return null;
        const angle = (i / segments) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * radius, 0.78, Math.sin(angle) * radius]} castShadow>
            <boxGeometry args={[0.2, 0.22, 0.2]} />
            <meshStandardMaterial color={color} />
          </mesh>
        );
      })}
      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle) => (
        <group key={angle} position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]} rotation={[0, -angle, 0]}>
          <mesh position={[0, 0.7, 0]} castShadow>
            <cylinderGeometry args={[0.32, 0.42, 1.2, 8]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[0, 1.45, 0]} castShadow>
            <coneGeometry args={[0.44, 0.48, 8]} />
            <meshStandardMaterial color={world.palette.roof} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
