import { getTierWorldConfig } from "../config/tierWorldConfig";
import { WORLD_CONFIG } from "../config/worldConfig";
import type { QualityTier } from "../types/worldTypes";

// ティア(と間接的に時間帯)に応じたライティング一式。
// Tier1-2は自然光中心、Tier3は夕暮れ、Tier4-5は夜景、Tier6は黄金の神々しい光。
// 太陽光(キーライト)+空色の逆方向フィルライトの2灯構成にし、影の中も
// 完全な黒に沈まない自然な陰影にしている。
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
  const [sx, sy, sz] = world.lighting.sunPosition;
  return (
    <>
      {fog && <fog attach="fog" args={[fog, radius * 0.9, radius * 3.0]} />}
      <ambientLight color={world.lighting.ambient} intensity={world.lighting.ambientIntensity * 0.8} />
      <hemisphereLight args={[world.sky.horizon, world.groundColor, 0.5]} />
      <directionalLight
        color={world.lighting.sun}
        intensity={world.lighting.sunIntensity * 1.25}
        position={world.lighting.sunPosition}
        castShadow
        shadow-mapSize={[shadowMapSize, shadowMapSize]}
        shadow-camera-left={-radius - 2}
        shadow-camera-right={radius + 2}
        shadow-camera-top={radius + 2}
        shadow-camera-bottom={-radius - 2}
        shadow-camera-far={50}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-radius={4}
      />
      {/* 太陽の反対側から弱く当てるフィルライト(空からの照り返し) */}
      <directionalLight
        color={world.sky.horizon}
        intensity={world.lighting.sunIntensity * 0.22}
        position={[-sx, sy * 0.6, -sz]}
      />
      {tier >= 4 && <pointLight color={world.palette.window} position={[0, 2.3, 0]} intensity={0.5} distance={radius * 1.4} />}
      {tier >= 6 && <pointLight color={world.palette.accent} position={[0, 5, -radius * 0.45]} intensity={1.2} distance={radius * 2} />}
    </>
  );
}
