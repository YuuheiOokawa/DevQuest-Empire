import { getTierWorldConfig } from "../config/tierWorldConfig";
import { BuildingDetailPopup } from "@/components/village/BuildingDetailPopup";
import type { UserBuilding } from "../types/worldTypes";

// Canvasの外側(DOM)に重ねるUI一式。ティアバッジ/説明テキストと、
// 建物選択時の詳細ポップアップ(既存のBuildingDetailPopupを流用)をまとめる。
export function UISystem({
  tier,
  selectedBuilding,
  onCloseDetail,
}: {
  tier: number;
  selectedBuilding: UserBuilding | null;
  onCloseDetail: () => void;
}) {
  const world = getTierWorldConfig(tier);
  return (
    <>
      <div className="pointer-events-none absolute bottom-3 left-3 rounded-xl bg-black/35 px-3 py-2 text-xs text-white backdrop-blur">
        <div className="font-semibold">
          Tier {tier}: {world.name}
        </div>
        <div className="opacity-85">{world.description}</div>
      </div>
      {selectedBuilding && <BuildingDetailPopup building={selectedBuilding} onClose={onCloseDetail} />}
    </>
  );
}
