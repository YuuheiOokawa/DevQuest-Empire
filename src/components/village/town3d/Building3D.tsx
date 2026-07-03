import { TIER_PALETTE_3D, type Palette3D } from "./palette3d";

type Archetype =
  | "house"
  | "houseGrand"
  | "tower"
  | "church"
  | "castle"
  | "grandHall"
  | "marketStall"
  | "monument"
  | "tree"
  | "harbor";

type BuildingConfig = {
  archetype: Archetype;
  scale?: number;
  wide?: boolean;
  chimney?: boolean;
  dome?: boolean;
  crown?: boolean;
  flag?: boolean;
  arches?: boolean;
};

export const BUILDING_CONFIG_3D: Record<string, BuildingConfig> = {
  house_small: { archetype: "house", scale: 0.85 },
  house_large: { archetype: "house", scale: 1, wide: true },
  blacksmith: { archetype: "house", scale: 0.9, chimney: true },
  guild: { archetype: "houseGrand", scale: 1.05 },
  tavern: { archetype: "marketStall", scale: 0.9 },
  dev_base: { archetype: "tower", scale: 0.85, flag: true },
  castle: { archetype: "castle", scale: 1.2, flag: true },
  library: { archetype: "houseGrand", scale: 1 },
  academy: { archetype: "grandHall", scale: 0.95 },
  monument: { archetype: "monument", scale: 0.9 },
  market: { archetype: "marketStall", scale: 1 },
  school: { archetype: "houseGrand", scale: 0.95 },
  workshop: { archetype: "house", scale: 0.9, chimney: true },
  watchtower: { archetype: "tower", scale: 1.1, flag: true },
  cathedral: { archetype: "church", scale: 1.25 },
  arena: { archetype: "grandHall", scale: 1.1, arches: true },
  harbor: { archetype: "harbor", scale: 1 },
  observatory: { archetype: "tower", scale: 1.05, dome: true },
  grand_library: { archetype: "grandHall", scale: 1.1 },
  colosseum: { archetype: "grandHall", scale: 1.25, arches: true },
  senate: { archetype: "grandHall", scale: 1.15 },
  shipyard: { archetype: "harbor", scale: 1.15 },
  royal_palace: { archetype: "castle", scale: 1.3, dome: true, flag: true },
  great_academy: { archetype: "grandHall", scale: 1.2 },
  trade_hub: { archetype: "marketStall", scale: 1.2, wide: true },
  monastery: { archetype: "church", scale: 1 },
  imperial_capital: { archetype: "castle", scale: 1.4, dome: true, flag: true },
  world_tree: { archetype: "tree", scale: 1.3 },
  grand_colosseum: { archetype: "grandHall", scale: 1.4, arches: true },
  throne_room: { archetype: "castle", scale: 1.3, crown: true },
};

function House({ p, opts }: { p: Palette3D; opts: BuildingConfig }) {
  const w = opts.wide ? 1.5 : 1.1;
  return (
    <group>
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, 0.7, 0.9]} />
        <meshStandardMaterial color={p.wall} />
      </mesh>
      <mesh position={[0, 0.78, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1, 1, 0.85]} castShadow>
        <coneGeometry args={[w * 0.72, 0.42, 4]} />
        <meshStandardMaterial color={p.roof} />
      </mesh>
      <mesh position={[0, 0.28, 0.451]}>
        <boxGeometry args={[0.16, 0.16, 0.02]} />
        <meshStandardMaterial color={p.window} emissive={p.window} emissiveIntensity={0.4} />
      </mesh>
      {opts.chimney && (
        <>
          <mesh position={[w * 0.32, 0.95, 0.15]}>
            <boxGeometry args={[0.1, 0.28, 0.1]} />
            <meshStandardMaterial color={p.trim} />
          </mesh>
        </>
      )}
    </group>
  );
}

function HouseGrand({ p }: { p: Palette3D }) {
  return (
    <group>
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.8, 1]} />
        <meshStandardMaterial color={p.wall} />
      </mesh>
      <mesh position={[0, 0.9, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1, 1, 0.8]} castShadow>
        <coneGeometry args={[0.95, 0.4, 4]} />
        <meshStandardMaterial color={p.roof} />
      </mesh>
      {[-0.5, 0, 0.5].map((x) => (
        <mesh key={x} position={[x, 0.45, 0.501]}>
          <boxGeometry args={[0.16, 0.16, 0.02]} />
          <meshStandardMaterial color={p.window} emissive={p.window} emissiveIntensity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function Tower({ p, opts }: { p: Palette3D; opts: BuildingConfig }) {
  return (
    <group>
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.35, 0.4, 1.2, 8]} />
        <meshStandardMaterial color={p.wall} />
      </mesh>
      {opts.dome ? (
        <mesh position={[0, 1.35, 0]} castShadow>
          <sphereGeometry args={[0.4, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={p.roof} />
        </mesh>
      ) : (
        <mesh position={[0, 1.45, 0]} castShadow>
          <coneGeometry args={[0.42, 0.5, 8]} />
          <meshStandardMaterial color={p.roof} />
        </mesh>
      )}
      {opts.flag && (
        <>
          <mesh position={[0, 1.75, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.3, 4]} />
            <meshStandardMaterial color={p.trim} />
          </mesh>
          <mesh position={[0.09, 1.85, 0]}>
            <boxGeometry args={[0.18, 0.1, 0.01]} />
            <meshStandardMaterial color={p.accent} />
          </mesh>
        </>
      )}
    </group>
  );
}

function Church({ p }: { p: Palette3D }) {
  return (
    <group>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.1, 1, 1]} />
        <meshStandardMaterial color={p.wall} />
      </mesh>
      <mesh position={[0, 1.15, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[0.78, 0.6, 4]} />
        <meshStandardMaterial color={p.roof} />
      </mesh>
      <mesh position={[0, 1.7, 0]} castShadow>
        <coneGeometry args={[0.16, 0.45, 4]} />
        <meshStandardMaterial color={p.roof} />
      </mesh>
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[0.05, 0.22, 0.05]} />
        <meshStandardMaterial color={p.trim} />
      </mesh>
      <mesh position={[0, 1.94, 0]}>
        <boxGeometry args={[0.16, 0.05, 0.05]} />
        <meshStandardMaterial color={p.trim} />
      </mesh>
      <mesh position={[0, 0.65, 0.501]}>
        <circleGeometry args={[0.18, 12]} />
        <meshStandardMaterial color={p.window} emissive={p.window} emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

function Castle({ p, opts }: { p: Palette3D; opts: BuildingConfig }) {
  return (
    <group>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 1, 1.2]} />
        <meshStandardMaterial color={p.wall} />
      </mesh>
      {opts.dome && (
        <mesh position={[0, 1.15, 0]} castShadow>
          <sphereGeometry args={[0.45, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={p.roof} />
        </mesh>
      )}
      {[-0.75, 0.75].map((x) => (
        <group key={x} position={[x, 0, -0.5]}>
          <mesh position={[0, 0.65, 0]} castShadow>
            <cylinderGeometry args={[0.24, 0.26, 1.3, 8]} />
            <meshStandardMaterial color={p.wall} />
          </mesh>
          <mesh position={[0, 1.4, 0]} castShadow>
            <coneGeometry args={[0.28, 0.35, 8]} />
            <meshStandardMaterial color={p.roof} />
          </mesh>
        </group>
      ))}
      {[-0.6, -0.2, 0.2, 0.6].map((x) => (
        <mesh key={x} position={[x, 1.08, 0.6]}>
          <boxGeometry args={[0.16, 0.16, 0.05]} />
          <meshStandardMaterial color={p.wall} />
        </mesh>
      ))}
      <mesh position={[0, 0.35, 0.601]}>
        <boxGeometry args={[0.3, 0.5, 0.02]} />
        <meshStandardMaterial color={p.trim} />
      </mesh>
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
            <mesh position={[0.09, 1.45, 0]}>
              <boxGeometry args={[0.18, 0.1, 0.01]} />
              <meshStandardMaterial color={p.accent} />
            </mesh>
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
          <meshStandardMaterial color={p.wall} side={2} />
        </mesh>
      ) : (
        <>
          <mesh position={[0, 0.05, 0]} receiveShadow>
            <boxGeometry args={[2, 0.1, 1.2]} />
            <meshStandardMaterial color={p.trim} />
          </mesh>
          {columns.map((x) => (
            <mesh key={x} position={[x, 0.5, 0.4]} castShadow>
              <cylinderGeometry args={[0.06, 0.06, 0.8, 6]} />
              <meshStandardMaterial color={p.wall} />
            </mesh>
          ))}
          <mesh position={[0, 0.95, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1.1, 0.7, 0.55]} castShadow>
            <coneGeometry args={[1.4, 0.5, 4]} />
            <meshStandardMaterial color={p.roof} />
          </mesh>
        </>
      )}
    </group>
  );
}

function MarketStall({ p, opts }: { p: Palette3D; opts: BuildingConfig }) {
  const w = opts.wide ? 1.6 : 1;
  return (
    <group>
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, 0.5, 0.7]} />
        <meshStandardMaterial color={p.wall} />
      </mesh>
      <mesh position={[0, 0.6, 0]} rotation={[0, Math.PI / 4, 0]} scale={[w / 0.9, 0.5, 0.7]} castShadow>
        <coneGeometry args={[0.72, 0.35, 4]} />
        <meshStandardMaterial color={p.accent} />
      </mesh>
    </group>
  );
}

function Monument({ p }: { p: Palette3D }) {
  return (
    <group>
      <mesh position={[0, 0.15, 0]} receiveShadow>
        <boxGeometry args={[0.6, 0.3, 0.6]} />
        <meshStandardMaterial color={p.trim} />
      </mesh>
      <mesh position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[0.25, 0.9, 0.25]} />
        <meshStandardMaterial color={p.wall} />
      </mesh>
      <mesh position={[0, 1.28, 0]} castShadow>
        <coneGeometry args={[0.2, 0.25, 4]} />
        <meshStandardMaterial color={p.roof} />
      </mesh>
    </group>
  );
}

export function Tree({ p, opts }: { p: Palette3D; opts: BuildingConfig }) {
  const glow = opts.dome;
  const green = glow ? "#d4af37" : "#4a8f3c";
  return (
    <group>
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.11, 0.8, 6]} />
        <meshStandardMaterial color="#7a5230" />
      </mesh>
      <mesh position={[0, 1.05, 0]} castShadow>
        <sphereGeometry args={[0.55, 8, 6]} />
        <meshStandardMaterial color={green} emissive={glow ? green : "#000000"} emissiveIntensity={glow ? 0.3 : 0} />
      </mesh>
      <mesh position={[-0.35, 0.85, 0.2]} castShadow>
        <sphereGeometry args={[0.35, 8, 6]} />
        <meshStandardMaterial color={green} />
      </mesh>
      <mesh position={[0.4, 0.85, -0.15]} castShadow>
        <sphereGeometry args={[0.38, 8, 6]} />
        <meshStandardMaterial color={green} />
      </mesh>
      <mesh position={[0, 0.85, 0]}>
        <pointLight color={p.accent} intensity={glow ? 0.8 : 0} distance={2} />
      </mesh>
    </group>
  );
}

function Harbor({ p }: { p: Palette3D }) {
  return (
    <group>
      <mesh position={[-0.2, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.6, 0.8]} />
        <meshStandardMaterial color={p.wall} />
      </mesh>
      <mesh position={[-0.2, 0.72, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1, 1, 0.8]} castShadow>
        <coneGeometry args={[0.62, 0.35, 4]} />
        <meshStandardMaterial color={p.roof} />
      </mesh>
      <mesh position={[0.5, 0.7, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1.4, 4]} />
        <meshStandardMaterial color={p.trim} />
      </mesh>
      <mesh position={[0.62, 1.15, 0]}>
        <boxGeometry args={[0.25, 0.16, 0.01]} />
        <meshStandardMaterial color={p.accent} />
      </mesh>
      <mesh position={[0, 0.02, 0.55]} receiveShadow>
        <boxGeometry args={[1.4, 0.05, 0.3]} />
        <meshStandardMaterial color={p.trim} />
      </mesh>
    </group>
  );
}

function Archetype({ archetype, p, opts }: { archetype: Archetype; p: Palette3D; opts: BuildingConfig }) {
  switch (archetype) {
    case "house":
      return <House p={p} opts={opts} />;
    case "houseGrand":
      return <HouseGrand p={p} />;
    case "tower":
      return <Tower p={p} opts={opts} />;
    case "church":
      return <Church p={p} />;
    case "castle":
      return <Castle p={p} opts={opts} />;
    case "grandHall":
      return <GrandHall p={p} opts={opts} />;
    case "marketStall":
      return <MarketStall p={p} opts={opts} />;
    case "monument":
      return <Monument p={p} />;
    case "tree":
      return <Tree p={p} opts={opts} />;
    case "harbor":
      return <Harbor p={p} />;
  }
}

function ConstructionLot({ scale }: { scale: number }) {
  return (
    <group scale={scale}>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.1, 1.1]} />
        <meshStandardMaterial color="#8a6d4a" transparent opacity={0.4} />
      </mesh>
      <mesh position={[-0.3, 0.15, -0.3]}>
        <boxGeometry args={[0.08, 0.3, 0.08]} />
        <meshStandardMaterial color="#8a6d4a" transparent opacity={0.6} />
      </mesh>
      <mesh position={[0.3, 0.15, 0.3]}>
        <boxGeometry args={[0.08, 0.3, 0.08]} />
        <meshStandardMaterial color="#8a6d4a" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

export function Building3D({
  type,
  requiredTier,
  level,
  unlocked,
  position,
  rotationY,
}: {
  type: string;
  requiredTier: number;
  level: number;
  unlocked: boolean;
  position: [number, number];
  rotationY: number;
}) {
  const config = BUILDING_CONFIG_3D[type] ?? { archetype: "house" };
  const palette = TIER_PALETTE_3D[requiredTier] ?? TIER_PALETTE_3D[1];
  const baseScale = config.scale ?? 1;
  const levelBoost = unlocked ? Math.min(1.25, 1 + level * 0.05) : 1;
  const scale = baseScale * levelBoost;

  return (
    <group position={[position[0], 0, position[1]]} rotation={[0, rotationY, 0]} scale={scale}>
      {unlocked ? (
        <Archetype archetype={config.archetype} p={palette} opts={config} />
      ) : (
        <ConstructionLot scale={1} />
      )}
    </group>
  );
}
