import { getTierWorldConfig } from "../config/tierWorldConfig";
import { getNoiseTexture } from "../utils/proceduralTexture";

// 未解放の建物を「工事予定地」として表示する。以前は大きな南京錠が
// 空中に浮いていて景観を壊していたため、測量杭+ロープ+小さな立て看板の
// 控えめな更地表現に変更した。
export function LockedBuildingSlot({ tier = 1 }: { tier?: number }) {
  const world = getTierWorldConfig(tier);
  const soilTex = getNoiseTexture("soil", 2);
  const plankTex = getNoiseTexture("plank", 1);
  const corners: [number, number][] = [
    [-0.42, -0.42],
    [0.42, -0.42],
    [0.42, 0.42],
    [-0.42, 0.42],
  ];
  return (
    <group>
      {/* 整地された更地 */}
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[0.95, 0.95]} />
        <meshStandardMaterial color="#9a8c74" map={soilTex ?? undefined} transparent opacity={0.75} roughness={1} />
      </mesh>
      {/* 四隅の測量杭 */}
      {corners.map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[x, 0.11, z]} castShadow>
          <cylinderGeometry args={[0.018, 0.022, 0.22, 5]} />
          <meshStandardMaterial color="#7a6248" roughness={1} />
        </mesh>
      ))}
      {/* 杭をつなぐロープ */}
      {corners.map(([x, z], i) => {
        const [nx, nz] = corners[(i + 1) % corners.length];
        const cx = (x + nx) / 2;
        const cz = (z + nz) / 2;
        const len = Math.hypot(nx - x, nz - z);
        const angle = Math.atan2(nz - z, nx - x);
        return (
          <mesh key={`rope-${i}`} position={[cx, 0.18, cz]} rotation={[0, -angle, 0]}>
            <boxGeometry args={[len, 0.012, 0.012]} />
            <meshStandardMaterial color="#c9b48a" transparent opacity={0.85} roughness={1} />
          </mesh>
        );
      })}
      {/* 小さな立て看板(建設予定を示す) */}
      <group position={[0, 0, -0.28]}>
        <mesh position={[0, 0.16, 0]} castShadow>
          <cylinderGeometry args={[0.02, 0.024, 0.32, 5]} />
          <meshStandardMaterial color="#6b5236" map={plankTex ?? undefined} roughness={1} />
        </mesh>
        <mesh position={[0, 0.34, 0]} rotation={[-0.12, 0, 0]} castShadow>
          <boxGeometry args={[0.3, 0.2, 0.02]} />
          <meshStandardMaterial color="#a5875f" map={plankTex ?? undefined} roughness={0.95} />
        </mesh>
        {/* 看板の錠前マーク(未解放の印) */}
        <mesh position={[0, 0.33, 0.013]} rotation={[-0.12, 0, 0]}>
          <boxGeometry args={[0.08, 0.07, 0.006]} />
          <meshStandardMaterial color="#3f3428" />
        </mesh>
        <mesh position={[0, 0.375, 0.013]} rotation={[-0.12, 0, 0]}>
          <torusGeometry args={[0.028, 0.009, 5, 10, Math.PI]} />
          <meshStandardMaterial color="#3f3428" />
        </mesh>
      </group>
      {/* 区画の目印(薄い縁取り) */}
      <mesh position={[0, 0.016, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.54, 24]} />
        <meshStandardMaterial color={world.palette.accent} transparent opacity={0.25} />
      </mesh>
    </group>
  );
}
