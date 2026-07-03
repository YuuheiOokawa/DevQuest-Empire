import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { EventTheme, QualityTier } from "../types/worldTypes";
import { getEventConfig } from "../config/eventConfig";
import { hashString, seededRandom } from "../utils/random";
import { ParticleSystem } from "./ParticleSystem";

function Lantern({ angle, radius, height }: { angle: number; radius: number; height: number }) {
  return (
    <group position={[Math.cos(angle) * radius, height, Math.sin(angle) * radius]}>
      <mesh>
        <sphereGeometry args={[0.09, 8, 6]} />
        <meshStandardMaterial color="#ff8a3d" emissive="#ff8a3d" emissiveIntensity={0.9} transparent opacity={0.9} />
      </mesh>
      <pointLight color="#ff8a3d" intensity={0.35} distance={1.6} />
    </group>
  );
}

function Pumpkin({ angle, radius }: { angle: number; radius: number }) {
  return (
    <group position={[Math.cos(angle) * radius, 0.12, Math.sin(angle) * radius]}>
      <mesh castShadow>
        <sphereGeometry args={[0.14, 8, 6]} />
        <meshStandardMaterial color="#ea7c1f" />
      </mesh>
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.08, 5]} />
        <meshStandardMaterial color="#3f6212" />
      </mesh>
      <mesh position={[0, 0.02, 0.12]}>
        <boxGeometry args={[0.16, 0.06, 0.02]} />
        <meshStandardMaterial color="#111827" emissive="#f97316" emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

function Ghost({ angle, radius }: { angle: number; radius: number }) {
  const ref = useRef<Group>(null);
  const [phase] = useState(() => Math.random() * Math.PI * 2);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    ref.current.position.set(Math.cos(angle + t * 0.05) * radius, 0.6 + Math.sin(t * 0.8 + phase) * 0.15, Math.sin(angle + t * 0.05) * radius);
  });
  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[0.22, 10, 8]} />
        <meshStandardMaterial color="#e9d5ff" transparent opacity={0.45} emissive="#c4b5fd" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

function ChristmasTree({ x, z }: { x: number; z: number }) {
  const ornamentColors = ["#f87171", "#facc15", "#60a5fa"];
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 0.2, 6]} />
        <meshStandardMaterial color="#5c3a21" />
      </mesh>
      {[0, 1, 2].map((tier) => (
        <mesh key={tier} position={[0, 0.35 + tier * 0.28, 0]} castShadow>
          <coneGeometry args={[0.42 - tier * 0.11, 0.4, 8]} />
          <meshStandardMaterial color="#1f5c3a" />
        </mesh>
      ))}
      {ornamentColors.map((c, i) => (
        <mesh key={c} position={[Math.sin(i * 2.1) * 0.22, 0.5 + i * 0.22, Math.cos(i * 2.1) * 0.22]}>
          <sphereGeometry args={[0.035, 6, 6]} />
          <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.6} />
        </mesh>
      ))}
      <mesh position={[0, 1.28, 0]}>
        <coneGeometry args={[0.05, 0.1, 5]} />
        <meshStandardMaterial color="#fde68a" emissive="#fde68a" emissiveIntensity={0.7} />
      </mesh>
    </group>
  );
}

function FireworkBurst({ x, z, y }: { x: number; z: number; y: number }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.6;
  });
  const colors = ["#f87171", "#facc15", "#34d399", "#60a5fa", "#f472b6"];
  return (
    <group ref={ref} position={[x, y, z]}>
      {colors.map((c, i) => {
        const a = (i / colors.length) * Math.PI * 2;
        return (
          <mesh key={c} position={[Math.cos(a) * 0.3, Math.sin(a) * 0.3, 0]}>
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshStandardMaterial color={c} emissive={c} emissiveIntensity={1} />
          </mesh>
        );
      })}
    </group>
  );
}

// 期間イベントテーマの装飾差分。sakuraはSeasonSystem(春)の資産を流用するため
// ここではdecorationsを持たない。他テーマはここで簡易プリミティブを追加する。
export function EventSystem({
  eventTheme,
  radius,
  quality,
}: {
  eventTheme: EventTheme | undefined;
  radius: number;
  quality: QualityTier;
}) {
  const config = getEventConfig(eventTheme);
  if (config.decorations.length === 0 && !config.particle) return null;

  const ringRadius = radius - 0.6;
  const lanternCount = config.decorations.includes("lantern") ? 10 : 0;
  const pumpkinCount = config.decorations.includes("pumpkin") ? 8 : 0;
  const ghostCount = config.decorations.includes("ghost") ? 4 : 0;
  const treeCount = config.decorations.includes("tree") ? 3 : 0;
  const fireworkCount = config.decorations.includes("firework") ? 3 : 0;

  return (
    <group>
      {config.particle && (
        <ParticleSystem preset={config.particle} radius={radius} quality={quality} seedPrefix={`event-${eventTheme}`} />
      )}
      {Array.from({ length: lanternCount }).map((_, i) => (
        <Lantern key={`lantern-${i}`} angle={(i / lanternCount) * Math.PI * 2} radius={ringRadius} height={0.9 + (i % 2) * 0.2} />
      ))}
      {Array.from({ length: pumpkinCount }).map((_, i) => {
        const seed = hashString(`pumpkin-${i}`);
        return <Pumpkin key={`pumpkin-${i}`} angle={(i / pumpkinCount) * Math.PI * 2 + seededRandom(seed)} radius={ringRadius * 0.85} />;
      })}
      {Array.from({ length: ghostCount }).map((_, i) => (
        <Ghost key={`ghost-${i}`} angle={(i / ghostCount) * Math.PI * 2} radius={ringRadius * 0.6} />
      ))}
      {Array.from({ length: treeCount }).map((_, i) => {
        const seed = hashString(`xmas-tree-${i}`);
        const angle = (i / treeCount) * Math.PI * 2 + seededRandom(seed);
        return <ChristmasTree key={`xmas-${i}`} x={Math.cos(angle) * ringRadius * 0.7} z={Math.sin(angle) * ringRadius * 0.7} />;
      })}
      {Array.from({ length: fireworkCount }).map((_, i) => {
        const seed = hashString(`firework-${i}`);
        const angle = seededRandom(seed) * Math.PI * 2;
        return <FireworkBurst key={`fw-${i}`} x={Math.cos(angle) * radius * 0.5} z={Math.sin(angle) * radius * 0.5} y={2.6 + seededRandom(seed * 2)} />;
      })}
    </group>
  );
}
