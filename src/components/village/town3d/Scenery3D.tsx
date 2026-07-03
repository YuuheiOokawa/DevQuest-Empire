import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh, MeshStandardMaterial } from "three";
import { DoubleSide } from "three";
import { getTierWorldConfig, TIER_WORLD_CONFIG } from "./tierWorldConfig";
import { hashString, seededRandom } from "./palette3d";
import { Tree } from "./Building3D";

function Ring({ radius, color, width = 0.08 }: { radius: number; color: string; width?: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} receiveShadow>
      <ringGeometry args={[radius - width, radius + width, 96]} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  );
}

export function Ground({ tier, radius }: { tier: number; radius: number }) {
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
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
        <circleGeometry args={[world.layout.plazaRadius, 48]} />
        <meshStandardMaterial color={world.roadColor} roughness={0.8} />
      </mesh>
      {Array.from({ length: world.layout.roadRings }).map((_, i) => (
        <Ring key={i} radius={world.layout.plazaRadius + 1.35 + i * 1.7} color={world.roadColor} width={0.07} />
      ))}
    </group>
  );
}

export function RoadNetwork({ tier, radius }: { tier: number; radius: number }) {
  const world = getTierWorldConfig(tier);
  const spokes = tier <= 1 ? 3 : tier <= 3 ? 5 : 8;
  return (
    <group>
      {Array.from({ length: spokes }).map((_, i) => {
        const angle = (i / spokes) * Math.PI * 2 + 0.2;
        return (
          <mesh key={i} rotation={[-Math.PI / 2, 0, angle]} position={[0, 0.018, 0]} receiveShadow>
            <planeGeometry args={[0.22 + tier * 0.03, radius * 1.55]} />
            <meshStandardMaterial color={world.roadColor} transparent opacity={0.82} roughness={0.9} />
          </mesh>
        );
      })}
    </group>
  );
}

export function River({ tier, radius }: { tier: number; radius: number }) {
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

export function MoatAndHarbor({ tier, radius }: { tier: number; radius: number }) {
  const world = getTierWorldConfig(tier);
  if (!world.layout.hasMoat) return null;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
        <ringGeometry args={[radius - 0.55, radius - 0.23, 128]} />
        <meshStandardMaterial color={world.waterColor} transparent opacity={0.7} roughness={0.1} metalness={0.12} side={DoubleSide} />
      </mesh>
      {world.layout.hasHarbor && (
        <group position={[Math.cos(Math.PI * 0.48) * (radius - 0.38), 0.04, Math.sin(Math.PI * 0.48) * (radius - 0.38)]} rotation={[0, -0.7, 0]}>
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

export function CityWall({ tier, radius }: { tier: number; radius: number }) {
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

export function ForestRing({ tier, radius }: { tier: number; radius: number }) {
  const world = getTierWorldConfig(tier);
  const count = world.treeCount;
  const treePalette = { ...TIER_WORLD_CONFIG[1].palette, roof: world.treeColor };
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const seed = hashString(`tree-${tier}-${i}`);
        const angle = (i / count) * Math.PI * 2 + seededRandom(seed) * 0.32;
        const r = radius + 0.65 + seededRandom(seed * 2) * 1.8;
        const scale = 0.55 + seededRandom(seed * 5) * 0.55;
        return (
          <group key={i} position={[Math.cos(angle) * r, 0, Math.sin(angle) * r]} scale={scale}>
            <Tree p={treePalette} opts={{ archetype: "tree" }} />
          </group>
        );
      })}
    </>
  );
}

export function DecorationLayer({ tier, radius }: { tier: number; radius: number }) {
  const world = getTierWorldConfig(tier);
  return (
    <group>
      {Array.from({ length: world.decoration.farmPlots }).map((_, i) => {
        const angle = Math.PI * (0.8 + i * 0.13);
        const r = radius * 0.58 + i * 0.08;
        return (
          <mesh key={`farm-${i}`} position={[Math.cos(angle) * r, 0.025, Math.sin(angle) * r]} rotation={[-Math.PI / 2, 0, angle]} receiveShadow>
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
              <meshStandardMaterial color={world.palette.window} emissive={world.palette.window} emissiveIntensity={world.effects.windowsGlow ? 0.9 : 0.25} />
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

export function FarMountains({ tier, radius }: { tier: number; radius: number }) {
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

function AnimatedCloud({ x, z, y, scale, speed }: { x: number; z: number; y: number; scale: number; speed: number }) {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.x = x + Math.sin(clock.elapsedTime * speed + z) * 0.35;
  });
  return (
    <mesh ref={ref} position={[x, y, z]} scale={[scale * 1.7, scale * 0.34, scale * 0.72]}>
      <sphereGeometry args={[0.38, 12, 8]} />
      <meshStandardMaterial color="#ffffff" transparent opacity={0.55} roughness={1} />
    </mesh>
  );
}

export function Clouds3D({ tier, radius }: { tier: number; radius: number }) {
  const count = getTierWorldConfig(tier).sky.cloudCount;
  return (
    <group>
      {Array.from({ length: count }).map((_, i) => {
        const seed = hashString(`cloud-${tier}-${i}`);
        return (
          <AnimatedCloud
            key={i}
            x={(seededRandom(seed) - 0.5) * radius * 1.7}
            z={-radius * 0.7 + seededRandom(seed * 2) * radius * 0.6}
            y={2.9 + seededRandom(seed * 3) * 1.2}
            scale={0.75 + seededRandom(seed * 4) * 0.65}
            speed={0.08 + seededRandom(seed * 5) * 0.08}
          />
        );
      })}
    </group>
  );
}

export function Stars3D({ tier, radius }: { tier: number; radius: number }) {
  const world = getTierWorldConfig(tier);
  if (world.sky.starCount <= 0) return null;
  return (
    <group>
      {Array.from({ length: world.sky.starCount }).map((_, i) => {
        const seed = hashString(`star-${tier}-${i}`);
        const x = (seededRandom(seed) - 0.5) * radius * 2.1;
        const y = 3 + seededRandom(seed * 2) * 2.6;
        const z = -radius * 0.85 + seededRandom(seed * 3) * radius * 0.8;
        const size = tier >= 6 ? 0.045 : 0.03;
        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[size, 6, 4]} />
            <meshStandardMaterial color="#fff7d6" emissive="#fff7d6" emissiveIntensity={tier >= 6 ? 1.1 : 0.7} />
          </mesh>
        );
      })}
    </group>
  );
}

export function GodRays3D({ tier, radius }: { tier: number; radius: number }) {
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
