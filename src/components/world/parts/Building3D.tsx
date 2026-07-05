import { useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import type { Group, Mesh, MeshStandardMaterial } from "three";
import { getTierWorldConfig, type Palette3D } from "../config/tierWorldConfig";
import { BUILDING_CONFIG_3D, type Archetype, type BuildingConfig } from "../config/buildingConfig";
import { getNoiseTexture } from "../utils/proceduralTexture";
import { Tree3D } from "./Tree3D";
import { LockedBuildingSlot } from "./LockedBuildingSlot";

// 建材テクスチャ(プロシージャル生成・モジュールキャッシュ済みなので都度呼んで良い)
const tex = {
  plaster: () => getNoiseTexture("plaster", 1.5),
  shingle: () => getNoiseTexture("shingle", 1.5),
  brick: () => getNoiseTexture("brick", 1.2),
  plank: () => getNoiseTexture("plank", 1),
  stone: () => getNoiseTexture("stone", 1.4),
};

// 旗竿の先端に取り付ける、風にはためくアニメーション付きの小さな旗。
function Flag({ color, position }: { color: string; position: [number, number, number] }) {
  const ref = useRef<Mesh>(null);
  const [phase] = useState(() => Math.random() * Math.PI * 2);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.z = Math.sin(clock.elapsedTime * 2.6 + phase) * 0.35;
    }
  });
  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={[0.18, 0.1, 0.01]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// 煙突からゆっくり立ち上りフェードアウトする煙(3個を使い回すループ)。
function SmokePuff({ offset }: { offset: number }) {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = (clock.elapsedTime + offset) % 1.8;
    ref.current.position.y = t * 0.5;
    ref.current.position.x = Math.sin((clock.elapsedTime + offset) * 2) * 0.05;
    const material = ref.current.material as MeshStandardMaterial;
    material.opacity = Math.max(0, 0.5 - t * 0.28);
    const s = 0.05 + t * 0.05;
    ref.current.scale.setScalar(s);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial color="#e5e7eb" transparent opacity={0.5} />
    </mesh>
  );
}

function Smoke({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {[0, 0.6, 1.2].map((offset) => (
        <SmokePuff key={offset} offset={offset} />
      ))}
    </group>
  );
}

// 建物が初めてマウントされた時に、小さくポンと現れるポップインアニメーション。
function PopIn({ children }: { children: React.ReactNode }) {
  const ref = useRef<Group>(null);
  const born = useRef(0);
  useFrame(({ clock }) => {
    if (born.current === 0) born.current = clock.elapsedTime;
    if (ref.current) {
      const t = Math.min(1, (clock.elapsedTime - born.current) / 0.4);
      const eased = 1 - Math.pow(1 - t, 3);
      ref.current.scale.setScalar(Math.max(0.001, eased));
    }
  });
  return <group ref={ref}>{children}</group>;
}

// 選択中の建物だけ、ゆっくり上下に浮くアニメーション。
function SelectionBob({ active, children }: { active: boolean; children: React.ReactNode }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = active ? Math.sin(clock.elapsedTime * 2.4) * 0.03 + 0.06 : 0;
    }
  });
  return <group ref={ref}>{children}</group>;
}

// ---- 建物の共通パーツ --------------------------------------------------

// 切妻屋根(三角プリズム)。円錐を45°回した従来のピラミッド屋根に代わり、
// 実際の家屋らしい棟(むね)のあるシルエットにする。
// 断面は半径1の円に内接する三角形(頂点+Y、底辺y=-0.5)なので、
// scaleYはheight/1.5、scaleZはdepth/√3で実寸に合わせる。
function GableRoof({
  width,
  depth,
  height,
  y,
  color,
  overhang = 0.14,
}: {
  width: number;
  depth: number;
  height: number;
  y: number;
  color: string;
  overhang?: number;
}) {
  const scaleY = height / 1.5;
  const scaleZ = (depth + overhang * 2) / Math.sqrt(3);
  const len = width + overhang * 2;
  return (
    <group position={[0, y + 0.5 * scaleY, 0]} scale={[1, scaleY, scaleZ]}>
      <group rotation={[0, 0, Math.PI / 2]}>
        <mesh rotation={[0, Math.PI / 2, 0]} castShadow>
          <cylinderGeometry args={[1, 1, len, 3, 1]} />
          <meshStandardMaterial color={color} map={tex.shingle() ?? undefined} roughness={0.85} flatShading />
        </mesh>
      </group>
    </group>
  );
}

// 枠付きの窓。暗い枠の中に発光するガラス面を少し奥まらせて入れる。
function FramedWindow({
  position,
  w = 0.16,
  h = 0.2,
  p,
}: {
  position: [number, number, number];
  w?: number;
  h?: number;
  p: Palette3D;
}) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[w + 0.05, h + 0.05, 0.02]} />
        <meshStandardMaterial color="#3f3428" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0, 0.005]}>
        <boxGeometry args={[w, h, 0.02]} />
        <meshStandardMaterial color={p.window} emissive={p.window} emissiveIntensity={0.45} roughness={0.2} />
      </mesh>
      {/* 十字の桟 */}
      <mesh position={[0, 0, 0.017]}>
        <boxGeometry args={[0.015, h, 0.005]} />
        <meshStandardMaterial color="#3f3428" />
      </mesh>
      <mesh position={[0, 0, 0.017]}>
        <boxGeometry args={[w, 0.015, 0.005]} />
        <meshStandardMaterial color="#3f3428" />
      </mesh>
    </group>
  );
}

// 木の扉(枠+扉板+まぐさ石)。
function Door({
  position,
  w = 0.24,
  h = 0.36,
}: {
  position: [number, number, number];
  w?: number;
  h?: number;
}) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[w + 0.06, h + 0.04, 0.02]} />
        <meshStandardMaterial color="#8a7c68" map={tex.stone() ?? undefined} roughness={0.95} />
      </mesh>
      <mesh position={[0, -0.01, 0.008]}>
        <boxGeometry args={[w, h - 0.02, 0.02]} />
        <meshStandardMaterial color="#4f3a24" map={tex.plank() ?? undefined} roughness={0.9} />
      </mesh>
      <mesh position={[w * 0.28, -0.02, 0.02]}>
        <sphereGeometry args={[0.015, 6, 6]} />
        <meshStandardMaterial color="#b8a25a" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  );
}

// 石の土台。壁より少し広く、建物が地面に据わって見えるようにする。
function Foundation({ w, d, h = 0.1 }: { w: number; d: number; h?: number }) {
  return (
    <mesh position={[0, h / 2, 0]} receiveShadow castShadow>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial color="#8f867a" map={tex.stone() ?? undefined} roughness={1} />
    </mesh>
  );
}

// ---- 建物アーキタイプ --------------------------------------------------

function House({ p, opts, effects }: { p: Palette3D; opts: BuildingConfig; effects: { smoke: boolean } }) {
  const w = opts.wide ? 1.5 : 1.1;
  return (
    <group>
      <Foundation w={w + 0.12} d={1.0} />
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, 0.66, 0.9]} />
        <meshStandardMaterial color={p.wall} map={tex.plaster() ?? undefined} roughness={0.92} />
      </mesh>
      <GableRoof width={w} depth={0.9} height={0.44} y={0.75} color={p.roof} />
      <Door position={[w * -0.22, 0.26, 0.451]} />
      <FramedWindow position={[w * 0.26, 0.44, 0.451]} p={p} />
      {opts.wide && <FramedWindow position={[w * -0.02, 0.44, 0.451]} p={p} />}
      {opts.chimney && (
        <>
          <mesh position={[w * 0.32, 0.98, 0.15]} castShadow>
            <boxGeometry args={[0.12, 0.34, 0.12]} />
            <meshStandardMaterial color="#9a6a52" map={tex.brick() ?? undefined} roughness={0.95} />
          </mesh>
          {effects.smoke && <Smoke position={[w * 0.32, 1.18, 0.15]} />}
        </>
      )}
    </group>
  );
}

function HouseGrand({ p }: { p: Palette3D }) {
  return (
    <group>
      <Foundation w={1.72} d={1.1} />
      <mesh position={[0, 0.48, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.76, 1]} />
        <meshStandardMaterial color={p.wall} map={tex.plaster() ?? undefined} roughness={0.92} />
      </mesh>
      {/* 妻壁の梁(ハーフティンバー風のアクセント) */}
      {[-0.5, 0.5].map((x) => (
        <mesh key={x} position={[x, 0.48, 0.503]}>
          <boxGeometry args={[0.05, 0.76, 0.01]} />
          <meshStandardMaterial color="#5d4a35" roughness={0.9} />
        </mesh>
      ))}
      <GableRoof width={1.6} depth={1.0} height={0.48} y={0.86} color={p.roof} />
      <Door position={[0, 0.28, 0.503]} w={0.26} h={0.4} />
      {[-0.55, 0.55].map((x) => (
        <FramedWindow key={x} position={[x, 0.52, 0.503]} p={p} />
      ))}
    </group>
  );
}

function Tower({ p, opts, effects }: { p: Palette3D; opts: BuildingConfig; effects: { flags: boolean } }) {
  return (
    <group>
      <mesh position={[0, 0.09, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.46, 0.52, 0.18, 10]} />
        <meshStandardMaterial color="#8f867a" map={tex.stone() ?? undefined} roughness={1} />
      </mesh>
      <mesh position={[0, 0.65, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.35, 0.42, 1.15, 10]} />
        <meshStandardMaterial color={p.wall} map={tex.brick() ?? undefined} roughness={0.95} />
      </mesh>
      {/* 細い明かり窓 */}
      {[0.55, 0.95].map((y) => (
        <mesh key={y} position={[0, y, 0.4]}>
          <boxGeometry args={[0.06, 0.16, 0.02]} />
          <meshStandardMaterial color={p.window} emissive={p.window} emissiveIntensity={0.4} />
        </mesh>
      ))}
      {opts.dome ? (
        <mesh position={[0, 1.32, 0]} castShadow>
          <sphereGeometry args={[0.4, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={p.roof} metalness={0.35} roughness={0.4} />
        </mesh>
      ) : (
        <mesh position={[0, 1.45, 0]} castShadow>
          <coneGeometry args={[0.44, 0.55, 10]} />
          <meshStandardMaterial color={p.roof} map={tex.shingle() ?? undefined} roughness={0.85} flatShading />
        </mesh>
      )}
      {opts.flag && (
        <>
          <mesh position={[0, 1.78, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.3, 4]} />
            <meshStandardMaterial color={p.trim} />
          </mesh>
          {effects.flags ? (
            <Flag color={p.accent} position={[0.09, 1.88, 0]} />
          ) : (
            <mesh position={[0.09, 1.88, 0]}>
              <boxGeometry args={[0.18, 0.1, 0.01]} />
              <meshStandardMaterial color={p.accent} />
            </mesh>
          )}
        </>
      )}
    </group>
  );
}

function Church({ p }: { p: Palette3D }) {
  return (
    <group>
      <Foundation w={1.22} d={1.1} />
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.1, 0.9, 1]} />
        <meshStandardMaterial color={p.wall} map={tex.plaster() ?? undefined} roughness={0.92} />
      </mesh>
      <GableRoof width={1.1} depth={1.0} height={0.5} y={1.0} color={p.roof} />
      {/* 鐘楼 */}
      <mesh position={[0, 1.52, 0]} castShadow>
        <boxGeometry args={[0.3, 0.42, 0.3]} />
        <meshStandardMaterial color={p.wall} map={tex.plaster() ?? undefined} roughness={0.92} />
      </mesh>
      <mesh position={[0, 1.9, 0]} castShadow>
        <coneGeometry args={[0.24, 0.42, 4]} />
        <meshStandardMaterial color={p.roof} map={tex.shingle() ?? undefined} roughness={0.85} flatShading />
      </mesh>
      <mesh position={[0, 2.22, 0]}>
        <boxGeometry args={[0.05, 0.22, 0.05]} />
        <meshStandardMaterial color={p.trim} metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0, 2.16, 0]}>
        <boxGeometry args={[0.16, 0.05, 0.05]} />
        <meshStandardMaterial color={p.trim} metalness={0.4} roughness={0.5} />
      </mesh>
      {/* バラ窓(枠付き) */}
      <mesh position={[0, 0.72, 0.502]}>
        <ringGeometry args={[0.16, 0.21, 16]} />
        <meshStandardMaterial color="#3f3428" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.72, 0.501]}>
        <circleGeometry args={[0.17, 16]} />
        <meshStandardMaterial color={p.window} emissive={p.window} emissiveIntensity={0.55} />
      </mesh>
      {/* アーチ扉 */}
      <Door position={[0, 0.3, 0.502]} w={0.28} h={0.42} />
      <mesh position={[0, 0.53, 0.508]}>
        <circleGeometry args={[0.17, 12, 0, Math.PI]} />
        <meshStandardMaterial color="#4f3a24" map={tex.plank() ?? undefined} roughness={0.9} />
      </mesh>
    </group>
  );
}

function Castle({ p, opts, effects }: { p: Palette3D; opts: BuildingConfig; effects: { flags: boolean } }) {
  return (
    <group>
      <Foundation w={1.76} d={1.36} h={0.12} />
      <mesh position={[0, 0.56, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.92, 1.2]} />
        <meshStandardMaterial color={p.wall} map={tex.brick() ?? undefined} roughness={0.95} />
      </mesh>
      {opts.dome && (
        <mesh position={[0, 1.15, 0]} castShadow>
          <sphereGeometry args={[0.45, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={p.roof} metalness={0.35} roughness={0.4} />
        </mesh>
      )}
      {[-0.75, 0.75].map((x) => (
        <group key={x} position={[x, 0, -0.5]}>
          <mesh position={[0, 0.65, 0]} castShadow>
            <cylinderGeometry args={[0.24, 0.28, 1.3, 10]} />
            <meshStandardMaterial color={p.wall} map={tex.brick() ?? undefined} roughness={0.95} />
          </mesh>
          <mesh position={[0, 1.42, 0]} castShadow>
            <coneGeometry args={[0.3, 0.4, 10]} />
            <meshStandardMaterial color={p.roof} map={tex.shingle() ?? undefined} roughness={0.85} flatShading />
          </mesh>
          <mesh position={[0, 1.0, 0.25]}>
            <boxGeometry args={[0.06, 0.14, 0.02]} />
            <meshStandardMaterial color={p.window} emissive={p.window} emissiveIntensity={0.4} />
          </mesh>
        </group>
      ))}
      {/* 胸壁(クレネル) */}
      {[-0.6, -0.2, 0.2, 0.6].map((x) => (
        <mesh key={x} position={[x, 1.1, 0.55]} castShadow>
          <boxGeometry args={[0.16, 0.16, 0.1]} />
          <meshStandardMaterial color={p.wall} map={tex.brick() ?? undefined} roughness={0.95} />
        </mesh>
      ))}
      {/* 城門(アーチ+鉄格子風) */}
      <mesh position={[0, 0.34, 0.601]}>
        <boxGeometry args={[0.34, 0.52, 0.02]} />
        <meshStandardMaterial color="#3a3026" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.6, 0.602]}>
        <circleGeometry args={[0.17, 12, 0, Math.PI]} />
        <meshStandardMaterial color="#3a3026" roughness={0.95} />
      </mesh>
      {[-0.08, 0, 0.08].map((x) => (
        <mesh key={x} position={[x, 0.36, 0.612]}>
          <boxGeometry args={[0.015, 0.48, 0.01]} />
          <meshStandardMaterial color="#6b6459" metalness={0.5} roughness={0.5} />
        </mesh>
      ))}
      {opts.crown ? (
        <mesh position={[0, 1.2, 0]} castShadow>
          <coneGeometry args={[0.14, 0.22, 5]} />
          <meshStandardMaterial color={p.accent} emissive={p.accent} emissiveIntensity={0.3} />
        </mesh>
      ) : (
        opts.flag && (
          <>
            <mesh position={[0, 1.35, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 0.3, 4]} />
              <meshStandardMaterial color={p.trim} />
            </mesh>
            {effects.flags ? (
              <Flag color={p.accent} position={[0.09, 1.45, 0]} />
            ) : (
              <mesh position={[0.09, 1.45, 0]}>
                <boxGeometry args={[0.18, 0.1, 0.01]} />
                <meshStandardMaterial color={p.accent} />
              </mesh>
            )}
          </>
        )
      )}
    </group>
  );
}

function GrandHall({ p, opts }: { p: Palette3D; opts: BuildingConfig }) {
  const columns = [-0.6, -0.3, 0, 0.3, 0.6];
  return (
    <group>
      {opts.arches ? (
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.9, 0.9, 0.8, 16, 1, false, 0, Math.PI]} />
          <meshStandardMaterial color={p.wall} map={tex.stone() ?? undefined} roughness={0.9} side={2} />
        </mesh>
      ) : (
        <>
          {/* 基壇(2段の階段) */}
          <mesh position={[0, 0.04, 0]} receiveShadow>
            <boxGeometry args={[2.1, 0.08, 1.3]} />
            <meshStandardMaterial color="#9a9186" map={tex.stone() ?? undefined} roughness={1} />
          </mesh>
          <mesh position={[0, 0.11, 0]} receiveShadow>
            <boxGeometry args={[1.95, 0.06, 1.18]} />
            <meshStandardMaterial color="#a89f93" map={tex.stone() ?? undefined} roughness={1} />
          </mesh>
          {/* 内陣 */}
          <mesh position={[0, 0.5, -0.15]} castShadow receiveShadow>
            <boxGeometry args={[1.7, 0.75, 0.75]} />
            <meshStandardMaterial color={p.wall} map={tex.plaster() ?? undefined} roughness={0.9} />
          </mesh>
          {columns.map((x) => (
            <mesh key={x} position={[x, 0.5, 0.42]} castShadow>
              <cylinderGeometry args={[0.06, 0.07, 0.78, 10]} />
              <meshStandardMaterial color="#d8d2c6" map={tex.stone() ?? undefined} roughness={0.85} />
            </mesh>
          ))}
          {/* エンタブラチュア+ペディメント(三角破風) */}
          <mesh position={[0, 0.93, 0.1]} castShadow>
            <boxGeometry args={[1.9, 0.1, 0.95]} />
            <meshStandardMaterial color="#cfc8bb" map={tex.stone() ?? undefined} roughness={0.9} />
          </mesh>
          <GableRoof width={1.9} depth={0.95} height={0.4} y={0.98} color={p.roof} overhang={0.06} />
        </>
      )}
    </group>
  );
}

function MarketStall({ p, opts }: { p: Palette3D; opts: BuildingConfig }) {
  const w = opts.wide ? 1.6 : 1;
  return (
    <group>
      <Foundation w={w + 0.1} d={0.78} h={0.06} />
      <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, 0.44, 0.7]} />
        <meshStandardMaterial color={p.wall} map={tex.plank() ?? undefined} roughness={0.9} />
      </mesh>
      {/* カウンター(前面の台) */}
      <mesh position={[0, 0.3, 0.4]} castShadow>
        <boxGeometry args={[w * 0.86, 0.06, 0.14]} />
        <meshStandardMaterial color="#7a5c3a" map={tex.plank() ?? undefined} roughness={0.9} />
      </mesh>
      <GableRoof width={w} depth={0.85} height={0.3} y={0.52} color={p.accent} overhang={0.18} />
    </group>
  );
}

function Monument({ p }: { p: Palette3D }) {
  return (
    <group>
      <mesh position={[0, 0.15, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.62, 0.3, 0.62]} />
        <meshStandardMaterial color="#8f867a" map={tex.stone() ?? undefined} roughness={1} />
      </mesh>
      <mesh position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[0.25, 0.9, 0.25]} />
        <meshStandardMaterial color={p.wall} map={tex.stone() ?? undefined} roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.28, 0]} castShadow>
        <coneGeometry args={[0.2, 0.25, 4]} />
        <meshStandardMaterial color={p.roof} metalness={0.3} roughness={0.5} flatShading />
      </mesh>
    </group>
  );
}

function Harbor({ p }: { p: Palette3D }) {
  return (
    <group>
      <Foundation w={1.0} d={0.9} h={0.08} />
      <mesh position={[-0.2, 0.34, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.56, 0.8]} />
        <meshStandardMaterial color={p.wall} map={tex.plank() ?? undefined} roughness={0.9} />
      </mesh>
      <GableRoof width={0.9} depth={0.8} height={0.34} y={0.62} color={p.roof} />
      <FramedWindow position={[-0.2, 0.4, 0.401]} w={0.14} h={0.14} p={p} />
      {/* マストと帆旗 */}
      <mesh position={[0.5, 0.7, 0]}>
        <cylinderGeometry args={[0.02, 0.03, 1.4, 6]} />
        <meshStandardMaterial color="#6b5236" map={tex.plank() ?? undefined} roughness={0.9} />
      </mesh>
      <mesh position={[0.62, 1.15, 0]}>
        <boxGeometry args={[0.25, 0.16, 0.01]} />
        <meshStandardMaterial color={p.accent} />
      </mesh>
      {/* 桟橋 */}
      <mesh position={[0, 0.02, 0.55]} receiveShadow>
        <boxGeometry args={[1.4, 0.05, 0.3]} />
        <meshStandardMaterial color="#7a5c3a" map={tex.plank() ?? undefined} roughness={0.95} />
      </mesh>
      {[-0.5, 0, 0.5].map((x) => (
        <mesh key={x} position={[x, -0.04, 0.68]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.18, 6]} />
          <meshStandardMaterial color="#5d4327" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function ArchetypeShape({
  archetype,
  p,
  opts,
  effects,
}: {
  archetype: Archetype;
  p: Palette3D;
  opts: BuildingConfig;
  effects: { smoke: boolean; flags: boolean };
}) {
  switch (archetype) {
    case "house":
      return <House p={p} opts={opts} effects={effects} />;
    case "houseGrand":
      return <HouseGrand p={p} />;
    case "tower":
      return <Tower p={p} opts={opts} effects={effects} />;
    case "church":
      return <Church p={p} />;
    case "castle":
      return <Castle p={p} opts={opts} effects={effects} />;
    case "grandHall":
      return <GrandHall p={p} opts={opts} />;
    case "marketStall":
      return <MarketStall p={p} opts={opts} />;
    case "monument":
      return <Monument p={p} />;
    case "tree":
      return <Tree3D p={p} opts={opts} />;
    case "harbor":
      return <Harbor p={p} />;
  }
}

// MAX建物は台座が金色に光る。選択中の建物は台座が浮かず常時表示なので、
// EffectSystem側の選択リング(浮遊/発光)と役割が分かれている。
function LevelPedestal({
  level,
  maxLevel,
  unlocked,
  tier,
}: {
  level: number;
  maxLevel?: number;
  unlocked: boolean;
  tier: number;
}) {
  const world = getTierWorldConfig(tier);
  const isMaxed = unlocked && !!maxLevel && maxLevel > 0 && level >= maxLevel;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]} receiveShadow>
        <circleGeometry args={[0.72, 32]} />
        <meshStandardMaterial
          color={isMaxed ? "#facc15" : unlocked ? world.roadColor : "#6b7280"}
          transparent
          opacity={isMaxed ? 0.78 : 0.42}
          roughness={0.8}
        />
      </mesh>
      {isMaxed && (
        <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.78, 0.9, 48]} />
          <meshStandardMaterial color="#fde68a" emissive="#facc15" emissiveIntensity={0.45} transparent opacity={0.85} />
        </mesh>
      )}
    </group>
  );
}

export function Building3D({
  type,
  requiredTier,
  level,
  maxLevel,
  unlocked,
  position,
  rotationY,
  selected,
  onSelect,
}: {
  type: string;
  requiredTier: number;
  level: number;
  maxLevel?: number;
  unlocked: boolean;
  position: [number, number];
  rotationY: number;
  selected?: boolean;
  onSelect?: (type: string) => void;
}) {
  const config = BUILDING_CONFIG_3D[type] ?? { archetype: "house" };
  const world = getTierWorldConfig(requiredTier);
  const baseScale = config.scale ?? 1;
  const levelBoost = unlocked ? Math.min(1.25, 1 + level * 0.05) : 1;
  const scale = baseScale * levelBoost;

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = "pointer";
  };
  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = "auto";
  };
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect?.(type);
  };

  return (
    <group
      position={[position[0], 0, position[1]]}
      rotation={[0, rotationY, 0]}
      scale={scale}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <LevelPedestal level={level} maxLevel={maxLevel} unlocked={unlocked} tier={requiredTier} />
      {selected && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.74, 0.82, 40]} />
          <meshStandardMaterial color={world.palette.accent} emissive={world.palette.accent} emissiveIntensity={0.6} transparent opacity={0.9} />
        </mesh>
      )}
      <SelectionBob active={!!selected}>
        <PopIn>
          {unlocked ? (
            <ArchetypeShape archetype={config.archetype} p={world.palette} opts={config} effects={world.effects} />
          ) : (
            <LockedBuildingSlot tier={requiredTier} />
          )}
        </PopIn>
      </SelectionBob>
    </group>
  );
}
