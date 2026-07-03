import type { VillageRank } from "@/lib/game/buildings";

const RANK_STYLES: Record<VillageRank, string> = {
  S: "bg-gradient-to-br from-amber-400 to-yellow-600 text-white",
  A: "bg-gradient-to-br from-purple-400 to-purple-600 text-white",
  B: "bg-gradient-to-br from-blue-400 to-blue-600 text-white",
  C: "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white",
  D: "bg-gradient-to-br from-slate-400 to-slate-500 text-white",
  E: "bg-muted text-muted-foreground",
};

export function RankBadge({ rank }: { rank: VillageRank }) {
  return (
    <div
      className={`flex size-14 shrink-0 items-center justify-center rounded-full text-xl font-bold shadow-sm ${RANK_STYLES[rank]}`}
    >
      {rank}
    </div>
  );
}
