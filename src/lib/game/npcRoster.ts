import type { NPCKind } from "@/components/world/parts/NPC3D";
import { getTierWorldConfig } from "@/components/world/config/tierWorldConfig";

export type NpcRosterEntry = {
  kind: NPCKind;
  count: number;
};

/**
 * NPCSystem(3D描画)が使っているpickKindの分布ルールを流用し、
 * 現在のtierに出現するNPCの内訳を集計する(2D一覧表示用)。
 */
function pickKind(index: number, tier: number): NPCKind {
  const roll = index % 6;
  if (tier >= 5 && roll === 5) return "aiWorker";
  if (tier >= 4 && roll === 4) return "soldier";
  if (roll === 3) return "adventurer";
  if (roll === 2) return "merchant";
  if (roll === 1 && index % 4 === 1) return "animal";
  return "resident";
}

export function getNpcRoster(tier: number): NpcRosterEntry[] {
  const { npcCount } = getTierWorldConfig(tier);
  const counts = new Map<NPCKind, number>();

  for (let i = 0; i < npcCount; i++) {
    const kind = pickKind(i, tier);
    counts.set(kind, (counts.get(kind) ?? 0) + 1);
  }

  return Array.from(counts.entries()).map(([kind, count]) => ({ kind, count }));
}
