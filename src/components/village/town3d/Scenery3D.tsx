import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh, MeshStandardMaterial } from "three";
import { getTierWorldConfig, TIER_WORLD_CONFIG } from "./tierWorldConfig";
import { hashString, seededRandom } from "./palette3d";
import { Tree } from "./Building3D";

export function Ground({ tier, radius }: { tier: number; radius: number }) {
  const color = getTierWorldConfig(tier).groundColor;
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
  const color = getTierWorldConfig(tier).waterColor;
  return (
    <mesh rotation={[-Math.PI / 2, 0, Math.PI / 6]} position={[0, -0.01, radius * 0.15]}>
      <planeGeometry args={[radius * 2.6, radius * 0.32]} />
      <meshStandardMaterial color={color} transparent opacity={0.75} roughness={0.2} metalness={0.1} />
    </mesh>
  );
}

// ティア4(帝国)以降、街全体を囲む城壁が現れる。
export function CityWall({ tier, radius }: { tier: number; radius: number }) {
  const world = getTierWorldConfig(tier);
  if (tier < 4 || !world.wallColor) return null;
  const color = world.wallColor;
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

// 噴水の水面。ティア3以降はきらめきアニメーションが加わる。
function FountainWater({ color, shimmer }: { color: string; shimmer: boolean }) {
  const diskRef = useRef<Mesh>(null);
  const sphereRef = useRef<Mesh>(null);
  const [phase] = useState(() => Math.random() * Math.PI * 2);

  useFrame(({ clock }) => {
    if (!shimmer) return;
    const t = clock.elapsedTime;
    const wave = 0.5 + Math.sin(t * 2.2 + phase) * 0.35;
    if (diskRef.current) {
      (diskRef.current.material as MeshStandardMaterial).opacity = 0.7 + wave * 0.2;
    }
    if (sphereRef.current) {
      (sphereRef.current.material as MeshStandardMaterial).emissiveIntensity = 0.3 + wave * 0.5;
    }
  });

  return (
    <>
      <mesh ref={diskRef} position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.05, 16]} />
        <meshStandardMaterial color={color} transparent opacity={0.85} />
      </mesh>
      <mesh ref={sphereRef} position={[0, 0.75, 0]}>
        <sphereGeometry args={[0.09, 8, 6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
    </>
  );
}

// 街の中心にある広場の噴水。全ティア共通で存在し、豪華さだけが変わっていく象徴。
export function Fountain({ tier }: { tier: number }) {
  const world = getTierWorldConfig(tier);
  const p = world.palette;
  return (
    <group>
      <mesh position={[0, 0.15, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.7, 0.75, 0.3, 16]} />
        <meshStandardMaterial color={p.trim} />
      </mesh>
      <FountainWater color={world.waterColor} shimmer={world.effects.waterShimmer} />
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.16, 0.4, 10]} />
        <meshStandardMaterial color={p.trim} />
      </mesh>
      {tier >= 6 && <pointLight position={[0, 1.2, 0]} color={p.accent} intensity={1.2} distance={6} />}
    </group>
  );
}

// 城壁の外に広がる森。街が発展しても外周には自然が残り、ティアが上がるほど本数も増える。
export function ForestRing({ tier, radius }: { tier: number; radius: number }) {
  const count = getTierWorldConfig(tier).treeCount;
  const treePalette = TIER_WORLD_CONFIG[1].palette;
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const seed = hashString(`tree-${i}`);
        const angle = (i / count) * Math.PI * 2 + seededRandom(seed) * 0.3;
        const r = radius + 0.8 + seededRandom(seed * 2) * 1.8;
        const scale = 0.6 + seededRandom(seed * 5) * 0.5;
        return (
          <group key={i} position={[Math.cos(angle) * r, 0, Math.sin(angle) * r]} scale={scale}>
            <Tree p={treePalette} opts={{ archetype: "tree" }} />
          </group>
        );
      })}
    </>
  );
}
