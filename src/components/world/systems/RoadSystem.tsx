import { getTierWorldConfig } from "../config/tierWorldConfig";

// 中央広場から放射状に伸びる道路のスポーク角度。NPCSystemも同じ角度上を
// 歩かせることで、道路と建物配置・NPCの導線に一貫性を持たせる。
export function getRoadSpokeAngles(tier: number): number[] {
  const spokes = tier <= 1 ? 3 : tier <= 3 ? 5 : 8;
  return Array.from({ length: spokes }, (_, i) => (i / spokes) * Math.PI * 2 + 0.2);
}

export function RoadSystem({ tier, radius }: { tier: number; radius: number }) {
  const world = getTierWorldConfig(tier);
  const angles = getRoadSpokeAngles(tier);
  return (
    <group>
      {angles.map((angle, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, angle]} position={[0, 0.018, 0]} receiveShadow>
          <planeGeometry args={[0.22 + tier * 0.03, radius * 1.55]} />
          <meshStandardMaterial color={world.roadColor} transparent opacity={0.82} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}
