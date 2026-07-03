import { getTierWorldConfig } from "../config/tierWorldConfig";
import { WORLD_CONFIG } from "../config/worldConfig";
import type { QualityTier } from "../types/worldTypes";

// ティア(と間接的に時間帯)に応じたライティング一式。
// Tier1-2は自然光中心、Tier3は夕暮れ、Tier4-5は夜景、Tier6は黄金の神々しい光。
export function LightingSystem({
  tier,
  radius,
  quality = "high",
  fogOverride,
}: {
  tier: number;
  radius: number;
  quality?: QualityTier;
  fogOverride?: string;
}) {
  const world = getTierWorldConfig(tier);
  const shadowMapSize = WORLD_CONFIG.canvas.shadowMapSizeByQuality[quality];
  const fog = fogOverride ?? world.lighting.fog;
  return (
    <>
      {fog && <fog attach="fog" args={[fog, radius * 0.9, radius * 2.8]} />}
      <ambientLight color={world.lighting.ambient} intensity={world.lighting.ambientIntensity} />
      <hemisphereLight args={[world.sky.horizon, world.groundColor, 0.35]} />
      <directionalLight
        color={world.lighting.sun}
        intensity={world.lighting.sunIntensity}
        position={world.lighting.sunPosition}
        castShadow
        shadow-mapSize={[shadowMapSize, shadowMapSize]}
        shadow-camera-left={-radius - 2}
        shadow-camera-right={radius + 2}
        shadow-camera-top={radius + 2}
        shadow-camera-bottom={-radius - 2}
        shadow-camera-far={50}
      />
      {tier >= 4 && <pointLight color={world.palette.window} position={[0, 2.3, 0]} intensity={0.5} distance={radius * 1.4} />}
      {tier >= 6 && <pointLight color={world.palette.accent} position={[0, 5, -radius * 0.45]} intensity={1.2} distance={radius * 2} />}
    </>
  );
}
