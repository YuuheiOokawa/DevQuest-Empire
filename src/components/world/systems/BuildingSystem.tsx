import { Building3D } from "../parts/Building3D";
import { useBuildingLayout } from "../hooks/useBuildingLayout";
import type { UserBuilding } from "../types/worldTypes";

// 建物の配置計算(useBuildingLayout)〜描画(Building3D)〜選択状態の解決までを担うSystem。
export function BuildingSystem({
  tier,
  buildings,
  selectedBuildingId,
  onSelectBuilding,
}: {
  tier: number;
  buildings: UserBuilding[];
  selectedBuildingId?: string;
  onSelectBuilding?: (buildingId: string) => void;
}) {
  const placed = useBuildingLayout(buildings, tier);

  return (
    <>
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
          selected={b.type === selectedBuildingId}
          onSelect={onSelectBuilding}
        />
      ))}
    </>
  );
}
