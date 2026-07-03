import { getTierWorldConfig } from "../config/tierWorldConfig";

// 未解放の建物を「工事予定地」として表示する。点線の区画+杭+鍵アイコン風の
// シルエットで、解放条件を満たせばここに建物が建つことを予告する。
export function LockedBuildingSlot({ tier = 1 }: { tier?: number }) {
  const world = getTierWorldConfig(tier);
  return (
    <group>
      <mesh position={[0, 0.018, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.48, 0.62, 6]} />
        <meshStandardMaterial color={world.palette.accent} transparent opacity={0.42} />
      </mesh>
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.05, 1.05]} />
        <meshStandardMaterial color="#4b5563" transparent opacity={0.18} wireframe />
      </mesh>
      {[-0.38, 0.38].map((x) => (
        <mesh key={x} position={[x, 0.18, -0.38]}>
          <boxGeometry args={[0.06, 0.36, 0.06]} />
          <meshStandardMaterial color="#6b7280" transparent opacity={0.55} />
        </mesh>
      ))}
      <group position={[0, 0.55, 0]}>
        <mesh position={[0, -0.08, 0]}>
          <boxGeometry args={[0.34, 0.26, 0.08]} />
          <meshStandardMaterial color="#111827" transparent opacity={0.62} />
        </mesh>
        <mesh position={[0, 0.08, 0]}>
          <torusGeometry args={[0.14, 0.035, 6, 16, Math.PI]} />
          <meshStandardMaterial color="#111827" transparent opacity={0.62} />
        </mesh>
      </group>
    </group>
  );
}
