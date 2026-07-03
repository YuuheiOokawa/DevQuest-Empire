"use client";

import { useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { VillageBuildingView } from "@/lib/game/buildings";
import { BuildingDetailPopup } from "@/components/village/BuildingDetailPopup";
import { Building3D } from "./town3d/Building3D";
import {
  Clouds3D,
  CityWall,
  DecorationLayer,
  FarMountains,
  ForestRing,
  Fountain,
  GodRays3D,
  Ground,
  MoatAndHarbor,
  River,
  RoadNetwork,
  Stars3D,
} from "./town3d/Scenery3D";
import { layoutBuildings, outerRadiusForTier } from "./town3d/layout";
import { getTierWorldConfig } from "./town3d/tierWorldConfig";

function SkyDecoration({ tier }: { tier: number }) {
  const world = getTierWorldConfig(tier);
  return (
    <>
      {tier <= 2 && (
        <>
          <div className="absolute right-8 top-4 size-12 rounded-full bg-yellow-100/80 shadow-[0_0_36px_12px_rgba(250,204,21,0.28)]" />
          <div className="absolute left-[12%] top-8 h-4 w-20 animate-pulse rounded-full bg-white/70 blur-[1px]" />
          <div className="absolute left-[48%] top-5 h-3 w-14 animate-pulse rounded-full bg-white/60 blur-[1px]" />
        </>
      )}
      {tier >= 3 &&
        Array.from({ length: Math.min(26, world.sky.starCount) }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
            style={{
              left: `${6 + ((i * 17) % 88)}%`,
              top: `${4 + ((i * 11) % 30)}%`,
              width: tier >= 6 && i % 4 === 0 ? 3 : 2,
              height: tier >= 6 && i % 4 === 0 ? 3 : 2,
              opacity: 0.45 + (i % 5) * 0.1,
            }}
          />
        ))}
      {tier >= 5 && (
        <div
          className="absolute inset-x-0 top-0 h-32 opacity-60"
          style={{
            background:
              "repeating-conic-gradient(from 0deg at 82% 6%, rgba(253,224,71,0.58) 0deg 5deg, transparent 5deg 16deg)",
          }}
        />
      )}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/35 to-transparent" />
    </>
  );
}

export function TownScene3D({
  tier,
  buildings,
}: {
  tier: number;
  buildings: VillageBuildingView[];
}) {
  const world = getTierWorldConfig(tier);
  const radius = outerRadiusForTier(tier);
  const placed = useMemo(() => layoutBuildings(buildings, tier), [buildings, tier]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const selectedBuilding = buildings.find((b) => b.type === selectedType) ?? null;
  const unlockedCount = buildings.filter((b) => b.unlocked).length;
  const maxedCount = buildings.filter((b) => b.maxLevel > 0 && b.level >= b.maxLevel).length;

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
        <span>{world.name} / 3D発展シーン</span>
        <span>建物 {unlockedCount}/{buildings.length} ・ MAX {maxedCount}</span>
      </div>
      <div className={`relative h-80 w-full overflow-hidden rounded-2xl ring-1 ring-black/10 sm:h-[420px] ${tier >= 6 ? "shadow-xl shadow-amber-500/30" : "shadow-sm"}`}>
        <div className={`absolute inset-0 ${world.sky.css}`}>
          <SkyDecoration tier={tier} />
        </div>
        <Canvas
          shadows
          dpr={[1, 1.5]}
          camera={{ position: [0, radius * 0.78, radius * 1.2], fov: 38 }}
          gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
          style={{ position: "absolute", inset: 0 }}
        >
          {world.lighting.fog && <fog attach="fog" args={[world.lighting.fog, radius * 0.9, radius * 2.8]} />}
          <ambientLight color={world.lighting.ambient} intensity={world.lighting.ambientIntensity} />
          <hemisphereLight args={[world.sky.horizon, world.groundColor, 0.35]} />
          <directionalLight
            color={world.lighting.sun}
            intensity={world.lighting.sunIntensity}
            position={world.lighting.sunPosition}
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-camera-left={-radius - 2}
            shadow-camera-right={radius + 2}
            shadow-camera-top={radius + 2}
            shadow-camera-bottom={-radius - 2}
            shadow-camera-far={50}
          />
          {tier >= 4 && <pointLight color={world.palette.window} position={[0, 2.3, 0]} intensity={0.5} distance={radius * 1.4} />}
          {tier >= 6 && <pointLight color={world.palette.accent} position={[0, 5, -radius * 0.45]} intensity={1.2} distance={radius * 2} />}

          <GodRays3D tier={tier} radius={radius} />
          <Stars3D tier={tier} radius={radius} />
          <Clouds3D tier={tier} radius={radius} />
          <FarMountains tier={tier} radius={radius} />
          <Ground tier={tier} radius={radius + 1.5} />
          <RoadNetwork tier={tier} radius={radius} />
          <River tier={tier} radius={radius} />
          <MoatAndHarbor tier={tier} radius={radius} />
          <CityWall tier={tier} radius={radius} />
          <DecorationLayer tier={tier} radius={radius} />
          <ForestRing tier={tier} radius={radius} />
          <Fountain tier={tier} />

          {placed.map((b) => (
            <Building3D
              key={b.type}
              type={b.type}
              requiredTier={b.requiredTier}
              level={b.level}
              maxLevel={b.maxLevel}
              unlocked={b.unlocked}
              position={b.position}
              rotationY={b.rotationY}
              onSelect={setSelectedType}
            />
          ))}
          <OrbitControls
            target={[0, 0.45, 0]}
            autoRotate
            autoRotateSpeed={tier >= 6 ? 0.45 : 0.32}
            enableRotate={false}
            enableZoom={false}
            enablePan={false}
          />
        </Canvas>
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-xl bg-black/35 px-3 py-2 text-xs text-white backdrop-blur">
          <div className="font-semibold">Tier {tier}: {world.name}</div>
          <div className="opacity-85">{world.description}</div>
        </div>
      </div>
      {selectedBuilding && (
        <BuildingDetailPopup building={selectedBuilding} onClose={() => setSelectedType(null)} />
      )}
    </section>
  );
}
