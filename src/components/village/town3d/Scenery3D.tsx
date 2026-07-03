import { GROUND_COLOR, WATER_COLOR, WALL_COLOR, TIER_PALETTE_3D, hashString, seededRandom } from "./palette3d";
import { Tree } from "./Building3D";

export function Ground({ tier, radius }: { tier: number; radius: number }) {
  const color = GROUND_COLOR[tier] ?? GROUND_COLOR[1];
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
      <circleGeometry args={[radius, 48]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// 川は開拓期(ティア4まで)の風景。都市化が進むと城壁の外の堀に置き換わる。
export function River({ tier, radius }: { tier: number; radius: number }) {
  if (tier > 4) return null;
  const color = WATER_COLOR[tier] ?? WATER_COLOR[1];
  return (
    <mesh rotation={[-Math.PI / 2, 0, Math.PI / 6]} position={[0, -0.01, radius * 0.15]}>
      <planeGeometry args={[radius * 2.6, radius * 0.32]} />
      <meshStandardMaterial color={color} transparent opacity={0.75} roughness={0.2} metalness={0.1} />
    </mesh>
  );
}

// ティア4(帝国)以降、街全体を囲む城壁が現れる。
export function CityWall({ tier, radius }: { tier: number; radius: number }) {
  if (tier < 4) return null;
  const color = WALL_COLOR[tier] ?? WALL_COLOR[4];
  const segments = 28;
  return (
    <group>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[radius, radius, 0.6, segments, 1, true]} />
        <meshStandardMaterial color={color} side={2} />
      </mesh>
      {Array.from({ length: segments }).map((_, i) => {
        if (i % 2 !== 0) return null;
        const angle = (i / segments) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * radius, 0.65, Math.sin(angle) * radius]}
          >
            <boxGeometry args={[0.18, 0.18, 0.18]} />
            <meshStandardMaterial color={color} />
          </mesh>
        );
      })}
      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle) => (
        <mesh key={angle} position={[Math.cos(angle) * radius, 0.7, Math.sin(angle) * radius]} castShadow>
          <cylinderGeometry args={[0.32, 0.38, 1.1, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
}

// 街の中心にある広場の噴水。全ティア共通で存在し、豪華さだけが変わっていく象徴。
export function Fountain({ tier }: { tier: number }) {
  const p = TIER_PALETTE_3D[tier] ?? TIER_PALETTE_3D[1];
  const water = WATER_COLOR[tier] ?? WATER_COLOR[1];
  return (
    <group>
      <mesh position={[0, 0.15, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.7, 0.75, 0.3, 16]} />
        <meshStandardMaterial color={p.trim} />
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.05, 16]} />
        <meshStandardMaterial color={water} transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.16, 0.4, 10]} />
        <meshStandardMaterial color={p.trim} />
      </mesh>
      <mesh position={[0, 0.75, 0]}>
        <sphereGeometry args={[0.09, 8, 6]} />
        <meshStandardMaterial
          color={water}
          emissive={water}
          emissiveIntensity={tier >= 5 ? 0.6 : 0.15}
        />
      </mesh>
      {tier >= 6 && <pointLight position={[0, 1.2, 0]} color={p.accent} intensity={1.2} distance={6} />}
    </group>
  );
}

// 城壁の外に広がる森。街が発展しても外周には自然が残る。
export function ForestRing({ radius }: { radius: number }) {
  const count = 14;
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const seed = hashString(`tree-${i}`);
        const angle = (i / count) * Math.PI * 2 + seededRandom(seed) * 0.3;
        const r = radius + 0.8 + seededRandom(seed * 2) * 1.8;
        const scale = 0.6 + seededRandom(seed * 5) * 0.5;
        return (
          <group key={i} position={[Math.cos(angle) * r, 0, Math.sin(angle) * r]} scale={scale}>
            <Tree p={TIER_PALETTE_3D[1]} opts={{ archetype: "tree" }} />
          </group>
        );
      })}
    </>
  );
}
