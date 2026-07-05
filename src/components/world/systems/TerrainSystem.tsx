import { useMemo } from "react";
import { DoubleSide } from "three";
import { getTierWorldConfig } from "../config/tierWorldConfig";
import { getNoiseTexture } from "../utils/proceduralTexture";
import { hashString, seededRandom } from "../utils/random";

function Ring({ radius, color, width = 0.08 }: { radius: number; color: string; width?: number }) {
  const stoneTex = useMemo(() => getNoiseTexture("soil", 10), []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} receiveShadow>
      <ringGeometry args={[radius - width, radius + width, 96]} />
      <meshStandardMaterial color={color} map={stoneTex ?? undefined} roughness={0.95} />
    </mesh>
  );
}

// 地面・広場・道路の同心円リング・遠景の山・城壁をまとめる地形System。
// season由来の地面色ブレンド(groundTint)にも対応する。
// プロシージャルなノイズテクスチャ(草の毛羽/土の粒/石畳)を乗算し、
// 単色のっぺりだった地面に質感を持たせている。
export function TerrainSystem({
  tier,
  radius,
  groundTint,
}: {
  tier: number;
  radius: number;
  groundTint?: string;
}) {
  const world = getTierWorldConfig(tier);
  const grassTex = useMemo(() => getNoiseTexture("grass", 9), []);
  const grassTexFar = useMemo(() => getNoiseTexture("grass", 18), []);
  const soilTex = useMemo(() => getNoiseTexture("soil", 7), []);
  const stoneTex = useMemo(() => getNoiseTexture("stone", 8), []);

  // 広場はTier3以降を石畳、それ以前は踏み固められた土にする
  const plazaTex = tier >= 3 ? stoneTex : soilTex;

  return (
    <group>
      {/* 地平線まで広がる遠景の大地(フォグで自然に消える)。世界が円盤状に
          浮いて見えないよう、メインの地面より広くひと回り暗い色で敷く。 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]} receiveShadow>
        <circleGeometry args={[radius * 3.2, 64]} />
        <meshStandardMaterial color={world.groundColor} map={grassTexFar ?? undefined} roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <circleGeometry args={[radius, 96]} />
        <meshStandardMaterial color={world.groundColor} map={grassTex ?? undefined} roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.015, 0]} receiveShadow>
        <circleGeometry args={[radius * 0.72, 96]} />
        <meshStandardMaterial
          color={world.secondaryGroundColor}
          map={grassTex ?? undefined}
          roughness={1}
          transparent
          opacity={0.6}
        />
      </mesh>
      {groundTint && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
          <circleGeometry args={[radius, 96]} />
          <meshStandardMaterial color={groundTint} transparent opacity={0.3} roughness={1} />
        </mesh>
      )}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
        <circleGeometry args={[world.layout.plazaRadius, 48]} />
        <meshStandardMaterial color={world.roadColor} map={plazaTex ?? undefined} roughness={0.9} />
      </mesh>
      {Array.from({ length: world.layout.roadRings }).map((_, i) => (
        <Ring key={i} radius={world.layout.plazaRadius + 1.35 + i * 1.7} color={world.roadColor} width={0.07} />
      ))}
      <FarMountains tier={tier} radius={radius} />
      <CityWallShape tier={tier} radius={radius} />
    </group>
  );
}

// 遠景の山並み。手前は森の丘、奥は岩肌+冠雪の高山の2列構成にして奥行きを出す。
// フラットシェーディングでローポリながら陰影がはっきり出るようにしている。
function FarMountains({ tier, radius }: { tier: number; radius: number }) {
  const world = getTierWorldConfig(tier);
  const rockTex = useMemo(() => getNoiseTexture("rock", 3), []);
  if (!world.layout.hasMountains) return null;

  const farPeaks = [-3.4, -1.6, 0.2, 1.9, 3.6];
  const nearHills = [-2.6, -0.9, 0.8, 2.5];

  return (
    <group>
      {/* 奥列: 高い岩山+冠雪 */}
      <group position={[0, 0, -radius - 3.2]}>
        {farPeaks.map((x, i) => {
          const seed = hashString(`peak-${tier}-${i}`);
          const h = 2.0 + seededRandom(seed) * 1.3;
          const r = 1.3 + seededRandom(seed * 2) * 0.5;
          const rotY = seededRandom(seed * 3) * Math.PI;
          return (
            <group key={i} position={[x * 1.4, h / 2 - 0.15, seededRandom(seed * 4) * 1.2]}>
              <mesh rotation={[0, rotY, 0]}>
                <coneGeometry args={[r, h, 6]} />
                <meshStandardMaterial
                  color="#8a8d94"
                  map={rockTex ?? undefined}
                  roughness={1}
                  flatShading
                />
              </mesh>
              <mesh position={[0, h * 0.36, 0]} rotation={[0, rotY, 0]}>
                <coneGeometry args={[r * 0.34, h * 0.3, 6]} />
                <meshStandardMaterial color="#f4f6f8" roughness={0.85} flatShading />
              </mesh>
            </group>
          );
        })}
      </group>
      {/* 手前列: 樹木に覆われた丘 */}
      <group position={[0, 0, -radius - 1.5]}>
        {nearHills.map((x, i) => {
          const seed = hashString(`hill-${tier}-${i}`);
          const h = 0.9 + seededRandom(seed) * 0.5;
          const r = 1.1 + seededRandom(seed * 2) * 0.45;
          return (
            <mesh
              key={i}
              position={[x * 1.5, h / 2 - 0.1, seededRandom(seed * 3) * 0.8]}
              rotation={[0, seededRandom(seed * 4) * Math.PI, 0]}
              castShadow
            >
              <coneGeometry args={[r, h, 7]} />
              <meshStandardMaterial
                color={i % 2 ? "#5d7350" : "#6b8259"}
                roughness={1}
                flatShading
              />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

// ティア4(王国)以降、街全体を囲む城壁が現れる。石のノイズテクスチャで
// 単色の帯に見えないようにする。
function CityWallShape({ tier, radius }: { tier: number; radius: number }) {
  const world = getTierWorldConfig(tier);
  const stoneTex = useMemo(() => getNoiseTexture("stone", 24), []);
  if (tier < 4 || !world.wallColor) return null;
  const color = world.wallColor;
  const segments = 36;
  return (
    <group>
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, 0.7, segments, 1, true]} />
        <meshStandardMaterial
          color={color}
          map={stoneTex ?? undefined}
          side={DoubleSide}
          roughness={0.9}
        />
      </mesh>
      {Array.from({ length: segments }).map((_, i) => {
        if (i % 2 !== 0) return null;
        const angle = (i / segments) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * radius, 0.78, Math.sin(angle) * radius]} castShadow>
            <boxGeometry args={[0.2, 0.22, 0.2]} />
            <meshStandardMaterial color={color} map={stoneTex ?? undefined} roughness={0.9} />
          </mesh>
        );
      })}
      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle) => (
        <group key={angle} position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]} rotation={[0, -angle, 0]}>
          <mesh position={[0, 0.7, 0]} castShadow>
            <cylinderGeometry args={[0.32, 0.42, 1.2, 10]} />
            <meshStandardMaterial color={color} map={stoneTex ?? undefined} roughness={0.9} />
          </mesh>
          <mesh position={[0, 1.45, 0]} castShadow>
            <coneGeometry args={[0.44, 0.48, 10]} />
            <meshStandardMaterial color={world.palette.roof} roughness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
