"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ACESFilmicToneMapping } from "three";
import { WORLD_CONFIG } from "./config/worldConfig";
import { useWorldConfig } from "./hooks/useWorldConfig";
import { useResponsiveQuality } from "./hooks/useResponsiveQuality";
import { SkyBackdrop, SkySceneLayer } from "./systems/SkySystem";
import { LightingSystem } from "./systems/LightingSystem";
import { TerrainSystem } from "./systems/TerrainSystem";
import { WaterSystem } from "./systems/WaterSystem";
import { RoadSystem } from "./systems/RoadSystem";
import { BuildingSystem } from "./systems/BuildingSystem";
import { DecorationSystem } from "./systems/DecorationSystem";
import { NPCSystem } from "./systems/NPCSystem";
import { WeatherSystem } from "./systems/WeatherSystem";
import { SeasonSystem } from "./systems/SeasonSystem";
import { EventSystem } from "./systems/EventSystem";
import { CameraSystem } from "./systems/CameraSystem";
import { EffectSystem } from "./systems/EffectSystem";
import { UISystem } from "./systems/UISystem";
import type { WorldSceneProps } from "./types/worldTypes";

// 村ページ上部に表示する World Rendering Engine のエントリーポイント。
// Canvas全体の統括・各Systemの合成・レスポンシブ品質管理をここで行う。
export function WorldScene({
  tier,
  buildings,
  selectedBuildingId,
  onSelectBuilding,
  season,
  weather,
  eventTheme,
}: WorldSceneProps) {
  const world = useWorldConfig(tier, season, weather, eventTheme);
  const quality = useResponsiveQuality();
  const { radius, tierConfig, cloudBoost, skyDimming, fog, treeTint, groundTint } = world;

  // village/page.tsx はサーバーコンポーネントであり selectedBuildingId/onSelectBuilding を
  // 制御できないため、渡されなければ内部stateで管理する(制御/非制御の両対応)。
  const [internalSelected, setInternalSelected] = useState<string | null>(null);
  const isControlled = selectedBuildingId !== undefined;
  const activeSelectedId = isControlled ? selectedBuildingId : internalSelected;
  const handleSelect = (buildingId: string) => {
    if (onSelectBuilding) {
      onSelectBuilding(buildingId);
    }
    if (!isControlled) {
      setInternalSelected((prev) => (prev === buildingId ? null : buildingId));
    }
  };
  const handleClose = () => {
    if (!isControlled) setInternalSelected(null);
  };

  const selectedBuilding = buildings.find((b) => b.type === activeSelectedId) ?? null;
  const unlockedCount = buildings.filter((b) => b.unlocked).length;
  const maxedCount = buildings.filter((b) => b.maxLevel > 0 && b.level >= b.maxLevel).length;
  const [dpr] = WORLD_CONFIG.canvas.dprByQuality[quality];

  return (
    <section className="space-y-2">
      <div className="text-muted-foreground flex items-center justify-between px-1 text-xs">
        <span>{tierConfig.name} / World Scene</span>
        <span>
          建物 {unlockedCount}/{buildings.length} ・ MAX {maxedCount}
        </span>
      </div>
      <div
        className={`relative w-full overflow-hidden rounded-2xl ring-1 ring-black/10 ${WORLD_CONFIG.canvas.heightClass} ${
          tier >= 6 ? "shadow-xl shadow-amber-500/30" : "shadow-sm"
        }`}
      >
        <SkyBackdrop tier={tier} dimming={skyDimming} />
        <Canvas
          shadows="soft"
          dpr={[1, dpr]}
          camera={{
            position: [0, radius * WORLD_CONFIG.camera.heightFactor, radius * WORLD_CONFIG.camera.distanceFactor],
            fov: WORLD_CONFIG.camera.fov,
          }}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: "high-performance",
            // 映画的なトーンマッピングで白飛び/色飽和を抑え、質感の階調を残す
            toneMapping: ACESFilmicToneMapping,
            toneMappingExposure: 1.1,
          }}
          style={{ position: "absolute", inset: 0 }}
        >
          <LightingSystem tier={tier} radius={radius} quality={quality} fogOverride={fog} />
          <EffectSystem tier={tier} radius={radius} />
          <SkySceneLayer tier={tier} radius={radius} cloudBoost={cloudBoost} />
          <TerrainSystem tier={tier} radius={radius} groundTint={groundTint} />
          <RoadSystem tier={tier} radius={radius} />
          <WaterSystem tier={tier} radius={radius} />
          <DecorationSystem tier={tier} radius={radius} treeTint={treeTint} />
          <NPCSystem tier={tier} radius={radius} quality={quality} />
          <WeatherSystem weather={weather} radius={radius} quality={quality} />
          <SeasonSystem season={season} radius={radius} quality={quality} />
          <EventSystem eventTheme={eventTheme} radius={radius} quality={quality} />
          <BuildingSystem
            tier={tier}
            buildings={buildings}
            selectedBuildingId={activeSelectedId ?? undefined}
            onSelectBuilding={handleSelect}
          />
          <CameraSystem tier={tier} radius={radius} />
        </Canvas>
        <UISystem tier={tier} selectedBuilding={selectedBuilding} onCloseDetail={handleClose} />
      </div>
    </section>
  );
}
