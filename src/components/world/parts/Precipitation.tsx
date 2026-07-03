import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color } from "three";
import type { BufferAttribute, Points, LineSegments } from "three";
import type { ParticlePreset } from "../types/worldTypes";
import { hashString, seededRandom } from "../utils/random";

const AREA_HEIGHT = 3.2;

// Weather/Season/EventSystem共通の「降下パーティクル」プリミティブ。
// 1つのPoints(dot/confetti)またはLineSegments(rain)だけで描画するため、
// 個数が増えても draw call は1回で済み、スマホでも軽い。

function resolveColor(color: string | string[], seed: number): Color {
  if (Array.isArray(color)) {
    const idx = Math.floor(seededRandom(seed) * color.length) % color.length;
    return new Color(color[idx]);
  }
  return new Color(color);
}

function useParticleField(count: number, radius: number, seedPrefix: string) {
  return useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const driftPhases = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const seed = hashString(`${seedPrefix}-${i}`);
      positions[i * 3] = (seededRandom(seed) - 0.5) * radius * 1.8;
      positions[i * 3 + 1] = seededRandom(seed * 2) * AREA_HEIGHT;
      positions[i * 3 + 2] = (seededRandom(seed * 3) - 0.5) * radius * 1.8;
      speeds[i] = 0.6 + seededRandom(seed * 5) * 0.8;
      driftPhases[i] = seededRandom(seed * 7) * Math.PI * 2;
    }
    return { positions, speeds, driftPhases };
  }, [count, radius, seedPrefix]);
}

function DotPrecipitation({
  preset,
  radius,
  seedPrefix,
}: {
  preset: ParticlePreset;
  radius: number;
  seedPrefix: string;
}) {
  const { positions, speeds, driftPhases } = useParticleField(preset.count, radius, seedPrefix);
  const colors = useMemo(() => {
    const arr = new Float32Array(preset.count * 3);
    for (let i = 0; i < preset.count; i++) {
      const c = resolveColor(preset.color, hashString(`${seedPrefix}-c-${i}`));
      arr[i * 3] = c.r;
      arr[i * 3 + 1] = c.g;
      arr[i * 3 + 2] = c.b;
    }
    return arr;
  }, [preset.color, preset.count, seedPrefix]);
  const pointsRef = useRef<Points>(null);

  useFrame((_, delta) => {
    const geometry = pointsRef.current?.geometry;
    if (!geometry) return;
    const posAttr = geometry.getAttribute("position") as BufferAttribute;
    for (let i = 0; i < preset.count; i++) {
      let y = posAttr.getY(i) - preset.speed * speeds[i] * delta;
      const drift = Math.sin(driftPhases[i] + y * 0.6) * preset.drift * delta;
      if (y < 0) y = AREA_HEIGHT;
      posAttr.setY(i, y);
      posAttr.setX(i, posAttr.getX(i) + drift * 0.2);
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={preset.shape === "confetti" ? 0.09 : 0.055}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
      />
    </points>
  );
}

function LinePrecipitation({
  preset,
  radius,
  seedPrefix,
}: {
  preset: ParticlePreset;
  radius: number;
  seedPrefix: string;
}) {
  const dropLength = 0.22;
  const { positions, speeds } = useMemo(() => {
    const count = preset.count;
    const positions = new Float32Array(count * 2 * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const seed = hashString(`${seedPrefix}-${i}`);
      const x = (seededRandom(seed) - 0.5) * radius * 1.8;
      const y = seededRandom(seed * 2) * AREA_HEIGHT;
      const z = (seededRandom(seed * 3) - 0.5) * radius * 1.8;
      positions[i * 6] = x;
      positions[i * 6 + 1] = y;
      positions[i * 6 + 2] = z;
      positions[i * 6 + 3] = x;
      positions[i * 6 + 4] = y - dropLength;
      positions[i * 6 + 5] = z;
      speeds[i] = 0.7 + seededRandom(seed * 5) * 0.7;
    }
    return { positions, speeds };
  }, [preset.count, radius, seedPrefix]);
  const color = useMemo(() => resolveColor(preset.color, 1), [preset.color]);
  const lineRef = useRef<LineSegments>(null);

  useFrame((_, delta) => {
    const geometry = lineRef.current?.geometry;
    if (!geometry) return;
    const posAttr = geometry.getAttribute("position") as BufferAttribute;
    for (let i = 0; i < preset.count; i++) {
      let yTop = posAttr.getY(i * 2) - preset.speed * speeds[i] * delta;
      if (yTop < 0) yTop = AREA_HEIGHT;
      posAttr.setY(i * 2, yTop);
      posAttr.setY(i * 2 + 1, yTop - dropLength);
    }
    posAttr.needsUpdate = true;
  });

  return (
    <lineSegments ref={lineRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color={color} transparent opacity={0.5} />
    </lineSegments>
  );
}

export function Precipitation({
  preset,
  radius,
  seedPrefix,
}: {
  preset: ParticlePreset | undefined;
  radius: number;
  seedPrefix: string;
}) {
  if (!preset || preset.count <= 0) return null;
  if (preset.shape === "line") {
    return <LinePrecipitation preset={preset} radius={radius} seedPrefix={seedPrefix} />;
  }
  return <DotPrecipitation preset={preset} radius={radius} seedPrefix={seedPrefix} />;
}
