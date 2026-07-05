import { useMemo } from "react";
import { DoubleSide } from "three";
import { getTierWorldConfig } from "../config/tierWorldConfig";
import { getRiverBand } from "../hooks/useBuildingLayout";
import { getNoiseTexture } from "../utils/proceduralTexture";
import { Fountain } from "../parts/Fountain";

// 村の外側を流れる川。位置はuseBuildingLayoutのgetRiverBandと共有しており、
// 建物レイアウト側が川の帯を避けて配置するため、施設と川が重なることはない。
function River({ tier, radius }: { tier: number; radius: number }) {
  const world = getTierWorldConfig(tier);
  const band = getRiverBand(tier);
  const stoneTex = useMemo(() => getNoiseTexture("stone", 4), []);
  const soilTex = useMemo(() => getNoiseTexture("soil", 5), []);
  if (!band) return null;

  const { z: zc, halfWidth } = band;
  const bridgeX = -radius * 0.18;
  const pathStart = world.layout.plazaRadius + 0.15;
  const pathEnd = zc + halfWidth + 1.1;
  const pathLength = pathEnd - pathStart;

  return (
    <group>
      {/* 川面 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, zc]}>
        <planeGeometry args={[radius * 3.2, halfWidth * 2]} />
        <meshStandardMaterial color={world.waterColor} transparent opacity={0.85} roughness={0.08} metalness={0.45} />
      </mesh>
      {/* 岸辺(砂利の縁取り) */}
      {[zc - halfWidth - 0.11, zc + halfWidth + 0.11].map((z) => (
        <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, z]}>
          <planeGeometry args={[radius * 3.2, 0.22]} />
          <meshStandardMaterial color="#9a8d74" map={soilTex ?? undefined} roughness={1} />
        </mesh>
      ))}
      {world.layout.hasBridge && (
        <>
          {/* 広場から橋へ続く参道 */}
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[bridgeX, 0.014, pathStart + pathLength / 2]}
            receiveShadow
          >
            <planeGeometry args={[0.52, pathLength]} />
            <meshStandardMaterial color={world.roadColor} map={soilTex ?? undefined} roughness={0.95} />
          </mesh>
          {/* 石橋(デッキ+縁石+欄干+橋脚) */}
          <group position={[bridgeX, 0, zc]}>
            <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.6, 0.07, halfWidth * 2 + 0.5]} />
              <meshStandardMaterial color="#a89c8a" map={stoneTex ?? undefined} roughness={0.9} />
            </mesh>
            {[-0.27, 0.27].map((x) => (
              <mesh key={x} position={[x, 0.2, 0]} castShadow>
                <boxGeometry args={[0.06, 0.14, halfWidth * 2 + 0.5]} />
                <meshStandardMaterial color="#8f8371" map={stoneTex ?? undefined} roughness={0.95} />
              </mesh>
            ))}
            {[-0.27, 0.27].flatMap((x) =>
              [-(halfWidth + 0.2), halfWidth + 0.2].map((z) => (
                <mesh key={`${x}-${z}`} position={[x, 0.16, z]} castShadow>
                  <boxGeometry args={[0.1, 0.26, 0.1]} />
                  <meshStandardMaterial color="#8f8371" map={stoneTex ?? undefined} roughness={0.95} />
                </mesh>
              ))
            )}
            {/* 橋脚 */}
            {[-halfWidth * 0.4, halfWidth * 0.4].map((z) => (
              <mesh key={z} position={[0, 0.02, z]} castShadow>
                <boxGeometry args={[0.5, 0.12, 0.16]} />
                <meshStandardMaterial color="#7d7263" map={stoneTex ?? undefined} roughness={1} />
              </mesh>
            ))}
          </group>
        </>
      )}
    </group>
  );
}

function MoatAndHarbor({ tier, radius }: { tier: number; radius: number }) {
  const world = getTierWorldConfig(tier);
  if (!world.layout.hasMoat) return null;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
        <ringGeometry args={[radius - 0.55, radius - 0.23, 128]} />
        <meshStandardMaterial color={world.waterColor} transparent opacity={0.82} roughness={0.06} metalness={0.5} side={DoubleSide} />
      </mesh>
      {world.layout.hasHarbor && (
        <group
          position={[Math.cos(Math.PI * 0.48) * (radius - 0.38), 0.04, Math.sin(Math.PI * 0.48) * (radius - 0.38)]}
          rotation={[0, -0.7, 0]}
        >
          <mesh receiveShadow>
            <boxGeometry args={[1.7, 0.08, 0.32]} />
            <meshStandardMaterial color={world.palette.trim} />
          </mesh>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[-0.55 + i * 0.55, 0.12, 0.2]} castShadow>
              <cylinderGeometry args={[0.035, 0.035, 0.35, 6]} />
              <meshStandardMaterial color={world.palette.trim} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

// 川・堀・港・噴水など、水にまつわる表現をまとめるSystem。
// ティア4以降は川が堀に置き換わり、ティア5以降は港が追加される。
export function WaterSystem({ tier, radius }: { tier: number; radius: number }) {
  return (
    <group>
      <River tier={tier} radius={radius} />
      <MoatAndHarbor tier={tier} radius={radius} />
      <Fountain tier={tier} />
    </group>
  );
}
