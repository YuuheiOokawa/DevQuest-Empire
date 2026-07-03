"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { VillageBuildingView } from "@/lib/game/buildings";
import { BuildingDetailPopup } from "@/components/village/BuildingDetailPopup";
import { Building3D } from "./town3d/Building3D";
import { Ground, River, CityWall, Fountain, ForestRing } from "./town3d/Scenery3D";
import { layoutBuildings, outerRadiusForTier } from "./town3d/layout";

type SkyTheme = {
  sky: string;
  outerRing: string;
  decorations: React.ReactNode;
};

// 3Dの地形/建物の背後に敷くCSS製の空(グラデーション+雲/星)。
// WebGLキャンバスは背景を透過させ、この空を通して見せることで
// 3Dシーン側は地形と建物だけに専念できるようにしている。
const SKY_THEME: Record<number, SkyTheme> = {
  1: {
    sky: "bg-gradient-to-b from-sky-300 via-sky-100 to-sky-50",
    outerRing: "",
    decorations: (
      <>
        <div className="bg-primary/10 absolute top-1 right-6 size-10 rounded-full opacity-70" />
        <div className="animate-drift absolute top-4 left-[10%] h-4 w-14 rounded-full bg-white/80 blur-[1px]" />
        <div className="animate-drift-slow absolute top-9 left-[45%] h-3 w-10 rounded-full bg-white/70 blur-[1px]" />
      </>
    ),
  },
  2: {
    sky: "bg-gradient-to-b from-sky-400 via-sky-200 to-blue-50",
    outerRing: "",
    decorations: (
      <>
        <div className="bg-primary/10 absolute top-1 right-6 size-10 rounded-full opacity-70" />
        <div className="animate-drift absolute top-3 left-[15%] h-4 w-16 rounded-full bg-white/80 blur-[1px]" />
        <div className="animate-drift-slow absolute top-8 left-[55%] h-4 w-12 rounded-full bg-white/70 blur-[1px]" />
      </>
    ),
  },
  3: {
    sky: "bg-gradient-to-b from-violet-400 via-indigo-200 to-indigo-50",
    outerRing: "",
    decorations: (
      <>
        <div className="absolute top-2 right-8 size-9 rounded-full bg-indigo-100/60" />
        {[12, 28, 44, 62, 78, 90].map((left, i) => (
          <div
            key={left}
            className="animate-twinkle absolute size-1 rounded-full bg-white"
            style={{ left: `${left}%`, top: `${8 + (i % 3) * 8}%`, animationDelay: `${i * 0.4}s` }}
          />
        ))}
      </>
    ),
  },
  4: {
    sky: "bg-gradient-to-b from-fuchsia-400 via-pink-200 to-rose-50",
    outerRing: "",
    decorations: (
      <div className="absolute top-1 right-8 size-11 rounded-full bg-amber-100/70 shadow-[0_0_30px_10px_rgba(251,191,36,0.3)]" />
    ),
  },
  5: {
    sky: "bg-gradient-to-b from-amber-300 via-yellow-100 to-amber-50",
    outerRing: "ring-2 ring-amber-300",
    decorations: (
      <>
        <div className="absolute top-0 right-10 size-14 rounded-full bg-yellow-200/80 shadow-[0_0_40px_16px_rgba(250,204,21,0.35)]" />
        <div
          className="absolute inset-x-0 top-0 h-24 opacity-40"
          style={{
            background:
              "repeating-conic-gradient(from 0deg at 85% 10%, rgba(253,224,71,0.5) 0deg 6deg, transparent 6deg 18deg)",
          }}
        />
      </>
    ),
  },
  6: {
    sky: "bg-gradient-to-b from-yellow-300 via-amber-100 to-orange-50",
    outerRing: "ring-4 ring-yellow-300 shadow-lg shadow-amber-500/40",
    decorations: (
      <>
        <div className="absolute top-0 right-10 size-16 rounded-full bg-yellow-100 shadow-[0_0_50px_20px_rgba(250,204,21,0.5)]" />
        <div
          className="absolute inset-x-0 top-0 h-28 opacity-50"
          style={{
            background:
              "repeating-conic-gradient(from 0deg at 85% 5%, rgba(253,224,71,0.6) 0deg 6deg, transparent 6deg 16deg)",
          }}
        />
        {[8, 22, 38, 58, 72, 86, 95].map((left, i) => (
          <div
            key={left}
            className="animate-twinkle absolute size-1.5 rounded-full bg-white"
            style={{ left: `${left}%`, top: `${6 + (i % 4) * 6}%`, animationDelay: `${i * 0.3}s` }}
          />
        ))}
      </>
    ),
  },
};

type LightTheme = {
  ambient: string;
  ambientIntensity: number;
  sun: string;
  sunIntensity: number;
  sunPos: [number, number, number];
};

const LIGHT_THEME: Record<number, LightTheme> = {
  1: { ambient: "#ffffff", ambientIntensity: 0.7, sun: "#fff6e0", sunIntensity: 1.1, sunPos: [6, 10, 4] },
  2: { ambient: "#ffffff", ambientIntensity: 0.65, sun: "#fff2d8", sunIntensity: 1.0, sunPos: [6, 10, 4] },
  3: { ambient: "#c7c2ff", ambientIntensity: 0.5, sun: "#ffb27a", sunIntensity: 0.85, sunPos: [-6, 6, 4] },
  4: { ambient: "#ffd9ea", ambientIntensity: 0.55, sun: "#ff9ecf", sunIntensity: 0.8, sunPos: [-6, 6, 4] },
  5: { ambient: "#fff0c2", ambientIntensity: 0.65, sun: "#ffe08a", sunIntensity: 0.95, sunPos: [6, 9, 4] },
  6: { ambient: "#fff6d0", ambientIntensity: 0.75, sun: "#ffe066", sunIntensity: 1.05, sunPos: [6, 9, 4] },
};

export function TownScene3D({
  tier,
  buildings,
}: {
  tier: number;
  buildings: VillageBuildingView[];
}) {
  const sky = SKY_THEME[tier] ?? SKY_THEME[1];
  const light = LIGHT_THEME[tier] ?? LIGHT_THEME[1];
  const placed = layoutBuildings(buildings);
  const radius = outerRadiusForTier(tier);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const selectedBuilding = buildings.find((b) => b.type === selectedType) ?? null;

  return (
    <div
      className={`relative h-72 w-full overflow-hidden rounded-2xl sm:h-96 ${sky.outerRing}`}
    >
      <div className={`absolute inset-0 ${sky.sky}`}>{sky.decorations}</div>
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [0, radius * 0.85, radius * 1.25], fov: 38 }}
        gl={{ alpha: true, antialias: true }}
        style={{ position: "absolute", inset: 0 }}
      >
        <ambientLight color={light.ambient} intensity={light.ambientIntensity} />
        <directionalLight
          color={light.sun}
          intensity={light.sunIntensity}
          position={light.sunPos}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-radius - 2}
          shadow-camera-right={radius + 2}
          shadow-camera-top={radius + 2}
          shadow-camera-bottom={-radius - 2}
          shadow-camera-far={40}
        />
        <Ground tier={tier} radius={radius + 2} />
        <River tier={tier} radius={radius} />
        <CityWall tier={tier} radius={radius} />
        <ForestRing tier={tier} radius={radius} />
        <Fountain tier={tier} />
        {placed.map((b) => (
          <Building3D
            key={b.type}
            type={b.type}
            requiredTier={b.requiredTier}
            level={b.level}
            unlocked={b.unlocked}
            position={b.position}
            rotationY={b.rotationY}
            onSelect={setSelectedType}
          />
        ))}
        <OrbitControls
          target={[0, 0.3, 0]}
          autoRotate
          autoRotateSpeed={0.6}
          enableRotate={false}
          enableZoom={false}
          enablePan={false}
        />
      </Canvas>
      {selectedBuilding && (
        <BuildingDetailPopup building={selectedBuilding} onClose={() => setSelectedType(null)} />
      )}
    </div>
  );
}
