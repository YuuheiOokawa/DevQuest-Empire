import { Color } from "three";
import type { Palette3D } from "../config/tierWorldConfig";
import type { BuildingConfig } from "../config/buildingConfig";
import { seededRandom } from "../utils/random";

// seedごとに樹形(広葉樹/針葉樹)と色味を変え、同じ木のコピーが
// 並んでいるように見えないようにする。seed未指定時は広葉樹の既定形。
export function Tree3D({
  p,
  opts,
  tint,
  seed = 1,
}: {
  p: Palette3D;
  opts: BuildingConfig;
  tint?: string;
  seed?: number;
}) {
  const glow = opts.dome;
  const baseGreen = tint ?? (glow ? "#d4af37" : "#3f7034");
  // 個体ごとに明度・色相をわずかに揺らす
  const jitter = (seededRandom(seed * 13) - 0.5) * 0.16;
  const green = new Color(baseGreen).offsetHSL(jitter * 0.15, jitter * 0.3, jitter * 0.5).getStyle();
  const darkGreen = new Color(green).offsetHSL(0, 0.05, -0.07).getStyle();
  const isConifer = !glow && seededRandom(seed * 7) > 0.55;
  const lean = (seededRandom(seed * 17) - 0.5) * 0.12;

  if (isConifer) {
    // 針葉樹: 3段重ねのコーン
    return (
      <group rotation={[0, seededRandom(seed * 3) * Math.PI, lean]}>
        <mesh position={[0, 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.11, 0.6, 6]} />
          <meshStandardMaterial color="#5d4327" roughness={1} />
        </mesh>
        <mesh position={[0, 0.75, 0]} castShadow>
          <coneGeometry args={[0.52, 0.7, 8]} />
          <meshStandardMaterial color={darkGreen} roughness={1} flatShading />
        </mesh>
        <mesh position={[0, 1.2, 0]} castShadow>
          <coneGeometry args={[0.4, 0.62, 8]} />
          <meshStandardMaterial color={green} roughness={1} flatShading />
        </mesh>
        <mesh position={[0, 1.62, 0]} castShadow>
          <coneGeometry args={[0.26, 0.5, 8]} />
          <meshStandardMaterial color={green} roughness={1} flatShading />
        </mesh>
      </group>
    );
  }

  // 広葉樹: 不揃いな塊を寄せた自然なシルエット。幾何はicosahedronで
  // 球より有機的な面構成にする。
  return (
    <group rotation={[0, seededRandom(seed * 3) * Math.PI, lean]}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.13, 0.8, 6]} />
        <meshStandardMaterial color="#5d4327" roughness={1} />
      </mesh>
      <mesh position={[0, 1.05, 0]} scale={[1, 0.88, 1]} castShadow>
        <icosahedronGeometry args={[0.55, 1]} />
        <meshStandardMaterial
          color={green}
          roughness={1}
          flatShading
          emissive={glow ? green : "#000000"}
          emissiveIntensity={glow ? 0.3 : 0}
        />
      </mesh>
      <mesh position={[-0.34, 0.82, 0.2]} scale={[1, 0.85, 1]} castShadow>
        <icosahedronGeometry args={[0.36, 1]} />
        <meshStandardMaterial color={darkGreen} roughness={1} flatShading />
      </mesh>
      <mesh position={[0.38, 0.86, -0.16]} scale={[1, 0.9, 1]} castShadow>
        <icosahedronGeometry args={[0.38, 1]} />
        <meshStandardMaterial color={green} roughness={1} flatShading />
      </mesh>
      {glow && (
        <mesh position={[0, 0.85, 0]}>
          <pointLight color={p.accent} intensity={0.8} distance={2} />
        </mesh>
      )}
    </group>
  );
}
