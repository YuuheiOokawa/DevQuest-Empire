import { Lock } from "lucide-react";
import type { VillageBuildingView } from "@/lib/game/buildings";
import { BuildingIcon } from "@/components/village/BuildingIcon";

type TownSceneTheme = {
  sky: string;
  ground: string;
  outerRing: string;
  decorations: React.ReactNode;
};

// ティアが上がるほど空・地面が「素朴な村」から「輝く国」へ変化していく。
// 外部素材は使えないため、CSSグラデーション+簡易図形のみで発展感を演出する。
const TOWN_SCENE_THEMES: Record<number, TownSceneTheme> = {
  1: {
    sky: "bg-gradient-to-b from-sky-300 via-sky-100 to-sky-50",
    ground: "bg-gradient-to-b from-green-500 to-green-700",
    outerRing: "",
    decorations: (
      <>
        <div className="bg-primary/10 absolute top-1 right-6 size-10 rounded-full opacity-70" />
        <div className="animate-drift absolute top-4 left-[10%] h-4 w-14 rounded-full bg-white/80 blur-[1px]" />
        <div className="animate-drift-slow absolute top-9 left-[45%] h-3 w-10 rounded-full bg-white/70 blur-[1px]" />
        <div className="absolute right-[-5%] bottom-[28%] h-10 w-40 rounded-t-full bg-green-400/50" />
        <div className="absolute bottom-[28%] left-[-5%] h-8 w-32 rounded-t-full bg-green-400/40" />
      </>
    ),
  },
  2: {
    sky: "bg-gradient-to-b from-sky-400 via-sky-200 to-blue-50",
    ground: "bg-gradient-to-b from-stone-400 to-stone-600",
    outerRing: "",
    decorations: (
      <>
        <div className="bg-primary/10 absolute top-1 right-6 size-10 rounded-full opacity-70" />
        <div className="animate-drift absolute top-3 left-[15%] h-4 w-16 rounded-full bg-white/80 blur-[1px]" />
        <div className="animate-drift-slow absolute top-8 left-[55%] h-4 w-12 rounded-full bg-white/70 blur-[1px]" />
        <div className="absolute right-[-5%] bottom-[28%] h-10 w-40 rounded-t-full bg-stone-300/50" />
      </>
    ),
  },
  3: {
    sky: "bg-gradient-to-b from-violet-400 via-indigo-200 to-indigo-50",
    ground: "bg-gradient-to-b from-slate-400 to-slate-600",
    outerRing: "",
    decorations: (
      <>
        <div className="absolute top-2 right-8 size-9 rounded-full bg-indigo-100/60" />
        {[12, 28, 44, 62, 78, 90].map((left, i) => (
          <div
            key={left}
            className="animate-twinkle absolute size-1 rounded-full bg-white"
            style={{
              left: `${left}%`,
              top: `${8 + (i % 3) * 8}%`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
        <div className="animate-drift absolute top-4 left-[20%] h-3 w-12 rounded-full bg-white/60 blur-[1px]" />
      </>
    ),
  },
  4: {
    sky: "bg-gradient-to-b from-fuchsia-400 via-pink-200 to-rose-50",
    ground: "bg-gradient-to-b from-rose-400 to-rose-600",
    outerRing: "",
    decorations: (
      <>
        <div className="absolute top-1 right-8 size-11 rounded-full bg-amber-100/70 shadow-[0_0_30px_10px_rgba(251,191,36,0.3)]" />
        {[10, 30, 50, 70, 90].map((left, i) => (
          <div
            key={left}
            className="absolute bottom-[26%] flex flex-col items-center"
            style={{ left: `${left}%` }}
          >
            <div
              className={`h-4 w-3 ${i % 2 === 0 ? "bg-fuchsia-500" : "bg-amber-400"} rounded-b-sm opacity-80`}
            />
            <div className="bg-foreground/30 h-6 w-px" />
          </div>
        ))}
      </>
    ),
  },
  5: {
    sky: "bg-gradient-to-b from-amber-300 via-yellow-100 to-amber-50",
    ground: "bg-gradient-to-b from-amber-500 to-yellow-600",
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
    ground: "bg-gradient-to-b from-yellow-400 via-amber-500 to-yellow-600",
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
            style={{
              left: `${left}%`,
              top: `${6 + (i % 4) * 6}%`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </>
    ),
  },
};

function buildingScale(level: number) {
  return Math.min(1.35, 0.82 + level * 0.08);
}

export function TownScene({
  tier,
  buildings,
}: {
  tier: number;
  buildings: VillageBuildingView[];
}) {
  const theme = TOWN_SCENE_THEMES[tier] ?? TOWN_SCENE_THEMES[1];
  const sorted = [...buildings].sort((a, b) => {
    if (a.requiredTier !== b.requiredTier) return a.requiredTier - b.requiredTier;
    return b.level - a.level;
  });

  return (
    <div
      className={`relative h-56 w-full overflow-hidden rounded-2xl sm:h-64 ${theme.outerRing}`}
    >
      <div className={`absolute inset-0 ${theme.sky}`}>{theme.decorations}</div>
      <div className={`absolute inset-x-0 bottom-0 h-[46%] ${theme.ground}`} />

      <div className="absolute inset-x-0 bottom-2 flex flex-wrap items-end justify-center gap-x-1 gap-y-2 px-3">
        {sorted.map((building) => (
          <div
            key={building.type}
            className="animate-rise flex flex-col items-center"
            style={{
              transform: building.unlocked
                ? `scale(${buildingScale(building.level)})`
                : undefined,
            }}
          >
            <div className="relative">
              {building.unlocked ? (
                <BuildingIcon type={building.type} unlocked />
              ) : (
                <div className="border-foreground/30 bg-background/30 text-muted-foreground flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-dashed backdrop-blur-sm">
                  <Lock className="size-5" />
                </div>
              )}
            </div>
            <div className="bg-black/25 mt-0.5 h-1.5 w-8 rounded-full blur-[1px]" />
          </div>
        ))}
      </div>
    </div>
  );
}
