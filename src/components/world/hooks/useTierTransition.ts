import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { WORLD_CONFIG } from "../config/worldConfig";

// ティアが変化した瞬間から一定時間、0→1へ進むイージング進捗をrefで返す。
// setState を使わず ref を直接更新するのは、毎フレームの再レンダーを避けるため
// (CameraSystem 側の useFrame でこの ref を読んでカメラを一時的にズームアウトさせる)。
export function useTierTransition(tier: number) {
  const prevTier = useRef(tier);
  const startTime = useRef<number | null>(null);
  const progressRef = useRef(1);

  useFrame(({ clock }) => {
    if (prevTier.current !== tier) {
      prevTier.current = tier;
      startTime.current = clock.elapsedTime;
    }
    if (startTime.current !== null) {
      const t = Math.min(1, (clock.elapsedTime - startTime.current) / WORLD_CONFIG.tierTransition.durationSeconds);
      progressRef.current = t;
      if (t >= 1) startTime.current = null;
    } else {
      progressRef.current = 1;
    }
  });

  return progressRef;
}
