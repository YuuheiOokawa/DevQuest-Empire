import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { PerspectiveCamera } from "three";
import { WORLD_CONFIG } from "../config/worldConfig";
import { useTierTransition } from "../hooks/useTierTransition";

// カメラの見下ろし角・自動周回・ズーム範囲を管理する。ティアが変化した直後は
// FOVを一時的に広げて「カメラが少し引く」演出を出す(OrbitControlsの内部状態と
// 競合しないよう、position ではなく fov だけを動かしている)。
export function CameraSystem({ tier, radius }: { tier: number; radius: number }) {
  const progressRef = useTierTransition(tier);

  useFrame(({ camera }) => {
    const persp = camera as PerspectiveCamera;
    const t = progressRef.current;
    const eased = 1 - Math.pow(1 - t, 3);
    const extraFov = (1 - eased) * 8;
    const nextFov = WORLD_CONFIG.camera.fov + extraFov;
    if (Math.abs(persp.fov - nextFov) > 0.01) {
      persp.fov = nextFov;
      persp.updateProjectionMatrix();
    }
  });

  return (
    <OrbitControls
      target={WORLD_CONFIG.camera.target}
      autoRotate
      autoRotateSpeed={tier >= 6 ? 0.45 : 0.32}
      enableRotate={false}
      enablePan={false}
      enableZoom
      minDistance={radius * WORLD_CONFIG.camera.minDistanceFactor}
      maxDistance={radius * WORLD_CONFIG.camera.maxDistanceFactor}
    />
  );
}
