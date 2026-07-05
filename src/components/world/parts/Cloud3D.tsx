import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

// 複数の球を寄せた積雲らしいシルエットの雲。ゆっくり横に流れる。
export function Cloud3D({
  x,
  z,
  y,
  scale,
  speed,
}: {
  x: number;
  z: number;
  y: number;
  scale: number;
  speed: number;
}) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.x = x + Math.sin(clock.elapsedTime * speed + z) * 0.35;
  });
  return (
    <group ref={ref} position={[x, y, z]} scale={scale}>
      <mesh position={[0, 0, 0]} scale={[1.5, 0.55, 0.85]}>
        <sphereGeometry args={[0.4, 12, 8]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.6} roughness={1} />
      </mesh>
      <mesh position={[-0.45, 0.1, 0.05]} scale={[0.9, 0.6, 0.7]}>
        <sphereGeometry args={[0.34, 12, 8]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.55} roughness={1} />
      </mesh>
      <mesh position={[0.5, 0.12, -0.06]} scale={[1.0, 0.65, 0.75]}>
        <sphereGeometry args={[0.32, 12, 8]} />
        <meshStandardMaterial color="#fdfdfa" transparent opacity={0.55} roughness={1} />
      </mesh>
      <mesh position={[0.05, 0.24, 0]} scale={[0.85, 0.7, 0.7]}>
        <sphereGeometry args={[0.3, 12, 8]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.5} roughness={1} />
      </mesh>
    </group>
  );
}
