import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";

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
