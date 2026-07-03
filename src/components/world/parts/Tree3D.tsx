import type { Palette3D } from "../config/tierWorldConfig";
import type { BuildingConfig } from "../config/buildingConfig";

export function Tree3D({
  p,
  opts,
  tint,
}: {
  p: Palette3D;
  opts: BuildingConfig;
  tint?: string;
}) {
  const glow = opts.dome;
  const green = tint ?? (glow ? "#d4af37" : "#4a8f3c");
  return (
    <group>
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.11, 0.8, 6]} />
        <meshStandardMaterial color="#7a5230" />
      </mesh>
      <mesh position={[0, 1.05, 0]} castShadow>
        <sphereGeometry args={[0.55, 8, 6]} />
        <meshStandardMaterial color={green} emissive={glow ? green : "#000000"} emissiveIntensity={glow ? 0.3 : 0} />
      </mesh>
      <mesh position={[-0.35, 0.85, 0.2]} castShadow>
        <sphereGeometry args={[0.35, 8, 6]} />
        <meshStandardMaterial color={green} />
      </mesh>
      <mesh position={[0.4, 0.85, -0.15]} castShadow>
        <sphereGeometry args={[0.38, 8, 6]} />
        <meshStandardMaterial color={green} />
      </mesh>
      <mesh position={[0, 0.85, 0]}>
        <pointLight color={p.accent} intensity={glow ? 0.8 : 0} distance={2} />
      </mesh>
    </group>
  );
}
