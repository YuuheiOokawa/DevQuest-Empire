import type { ReactNode } from "react";
import { getTierWorldConfig } from "../config/tierWorldConfig";
import { hashString, seededRandom } from "../utils/random";
import { Tree3D } from "../parts/Tree3D";

function ForestRing({ tier, radius, treeTint }: { tier: number; radius: number; treeTint?: string }) {
  const world = getTierWorldConfig(tier);
  const count = world.treeCount;
  const treePalette = { ...world.palette, roof: world.treeColor };
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const seed = hashString(`tree-${tier}-${i}`);
        const angle = (i / count) * Math.PI * 2 + seededRandom(seed) * 0.32;
        const r = radius + 0.65 + seededRandom(seed * 2) * 1.8;
        const scale = 0.55 + seededRandom(seed * 5) * 0.55;
        return (
          <group key={i} position={[Math.cos(angle) * r, 0, Math.sin(angle) * r]} scale={scale}>
            <Tree3D p={treePalette} opts={{ archetype: "tree" }} tint={treeTint} />
          </group>
        );
      })}
    </>
  );
}

function DecorationLayer({ tier, radius }: { tier: number; radius: number }) {
  const world = getTierWorldConfig(tier);
  return (
    <group>
      {Array.from({ length: world.decoration.farmPlots }).map((_, i) => {
        const angle = Math.PI * (0.8 + i * 0.13);
        const r = radius * 0.58 + i * 0.08;
        return (
          <mesh
            key={`farm-${i}`}
            position={[Math.cos(angle) * r, 0.025, Math.sin(angle) * r]}
            rotation={[-Math.PI / 2, 0, angle]}
            receiveShadow
          >
            <planeGeometry args={[0.75, 0.42]} />
            <meshStandardMaterial color={i % 2 ? "#a47b3f" : "#8f6b32"} />
          </mesh>
        );
      })}
      {Array.from({ length: world.decoration.lamps }).map((_, i) => {
        const angle = (i / world.decoration.lamps) * Math.PI * 2;
        const r = world.layout.plazaRadius + 0.8 + (i % 3) * 1.3;
        return (
          <group key={`lamp-${i}`} position={[Math.cos(angle) * r, 0, Math.sin(angle) * r]}>
            <mesh position={[0, 0.32, 0]} castShadow>
              <cylinderGeometry args={[0.025, 0.025, 0.64, 6]} />
              <meshStandardMaterial color={world.palette.trim} />
            </mesh>
            <mesh position={[0, 0.68, 0]}>
              <sphereGeometry args={[0.08, 8, 6]} />
              <meshStandardMaterial
                color={world.palette.window}
                emissive={world.palette.window}
                emissiveIntensity={world.effects.windowsGlow ? 0.9 : 0.25}
              />
            </mesh>
            {world.effects.windowsGlow && <pointLight position={[0, 0.7, 0]} color={world.palette.window} intensity={0.25} distance={1.4} />}
          </group>
        );
      })}
      {Array.from({ length: world.decoration.banners }).map((_, i) => {
        const angle = (i / Math.max(1, world.decoration.banners)) * Math.PI * 2;
        const r = radius - 0.85;
        return (
          <group key={`banner-${i}`} position={[Math.cos(angle) * r, 0.35, Math.sin(angle) * r]} rotation={[0, -angle, 0]}>
            <mesh position={[0, 0.28, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 0.55, 4]} />
              <meshStandardMaterial color={world.palette.trim} />
            </mesh>
            <mesh position={[0.12, 0.43, 0]}>
              <boxGeometry args={[0.2, 0.15, 0.012]} />
              <meshStandardMaterial color={world.palette.accent} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// 木・畑・街灯・旗といった常設装飾をまとめるSystem。season/eventの追加装飾
// (桜・かぼちゃ・提灯・クリスマスツリー等)は children として差し込む設計にし、
// DecorationSystem自体を書き換えずに拡張できるようにしている。
export function DecorationSystem({
  tier,
  radius,
  treeTint,
  children,
}: {
  tier: number;
  radius: number;
  treeTint?: string;
  children?: ReactNode;
}) {
  return (
    <group>
      <ForestRing tier={tier} radius={radius} treeTint={treeTint} />
      <DecorationLayer tier={tier} radius={radius} />
      {children}
    </group>
  );
}
