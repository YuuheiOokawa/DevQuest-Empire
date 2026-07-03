import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

export type NPCKind = "resident" | "merchant" | "soldier" | "adventurer" | "aiWorker" | "animal";

const NPC_COLORS: Record<NPCKind, { body: string; head: string }> = {
  resident: { body: "#c8a876", head: "#e8c9a0" },
  merchant: { body: "#3b6ea5", head: "#e8c9a0" },
  soldier: { body: "#6b7280", head: "#c9a86b" },
  adventurer: { body: "#2f7d45", head: "#e8c9a0" },
  aiWorker: { body: "#7c3aed", head: "#e8c9a0" },
  animal: { body: "#8a6238", head: "#8a6238" },
};

// 低ポリのカプセル+球の簡易NPC。道路の一区間を往復移動するだけの
// 軽量な演出で、街に「人が住んでいる」感を出す。
export function NPC3D({
  kind,
  angle,
  radiusMin,
  radiusMax,
  speed,
  phase,
}: {
  kind: NPCKind;
  angle: number;
  radiusMin: number;
  radiusMax: number;
  speed: number;
  phase: number;
}) {
  const ref = useRef<Group>(null);
  const colors = NPC_COLORS[kind];
  const isAnimal = kind === "animal";

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = (Math.sin(clock.elapsedTime * speed + phase) + 1) / 2;
    const radius = radiusMin + (radiusMax - radiusMin) * t;
    const movingOutward = Math.cos(clock.elapsedTime * speed + phase) >= 0;
    ref.current.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
    ref.current.rotation.y = -angle + (movingOutward ? 0 : Math.PI);
  });

  return (
    <group ref={ref} scale={isAnimal ? 0.55 : 1}>
      <mesh position={[0, 0.16, 0]} castShadow>
        <capsuleGeometry args={[0.07, 0.18, 4, 8]} />
        <meshStandardMaterial color={colors.body} />
      </mesh>
      {!isAnimal && (
        <mesh position={[0, 0.34, 0]} castShadow>
          <sphereGeometry args={[0.055, 8, 6]} />
          <meshStandardMaterial color={colors.head} />
        </mesh>
      )}
    </group>
  );
}
