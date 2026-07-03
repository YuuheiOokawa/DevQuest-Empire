import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh, MeshStandardMaterial } from "three";
import { getTierWorldConfig } from "../config/tierWorldConfig";

function FountainWater({ color, shimmer }: { color: string; shimmer: boolean }) {
  const diskRef = useRef<Mesh>(null);
  const sphereRef = useRef<Mesh>(null);
  const [phase] = useState(() => Math.random() * Math.PI * 2);
  useFrame(({ clock }) => {
    if (!shimmer) return;
    const t = clock.elapsedTime;
    const wave = 0.5 + Math.sin(t * 2.2 + phase) * 0.35;
    if (diskRef.current) (diskRef.current.material as MeshStandardMaterial).opacity = 0.68 + wave * 0.25;
    if (sphereRef.current) (sphereRef.current.material as MeshStandardMaterial).emissiveIntensity = 0.25 + wave * 0.65;
  });
  return (
    <>
      <mesh ref={diskRef} position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.05, 24]} />
        <meshStandardMaterial color={color} transparent opacity={0.85} />
      </mesh>
      <mesh ref={sphereRef} position={[0, 0.75, 0]}>
        <sphereGeometry args={[0.09, 10, 8]} />
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
        <cylinderGeometry args={[0.7 + tier * 0.03, 0.76 + tier * 0.03, 0.3, 24]} />
        <meshStandardMaterial color={p.trim} />
      </mesh>
      <FountainWater color={world.waterColor} shimmer={world.effects.waterShimmer} />
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.16, 0.4 + tier * 0.03, 12]} />
        <meshStandardMaterial color={p.trim} />
      </mesh>
      {tier >= 5 && (
        <mesh position={[0, 1.05, 0]} castShadow>
          <sphereGeometry args={[0.16, 12, 8]} />
          <meshStandardMaterial color={p.accent} emissive={p.accent} emissiveIntensity={0.7} />
        </mesh>
      )}
      {tier >= 6 && <pointLight position={[0, 1.4, 0]} color={p.accent} intensity={1.4} distance={7} />}
    </group>
  );
}
