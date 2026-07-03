import { Home, Store, Building2, Landmark, Crown, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const TIER_ICONS: Record<number, LucideIcon> = {
  1: Home,
  2: Store,
  3: Building2,
  4: Landmark,
  5: Crown,
  6: Sparkles,
};

// tierが上がるほど豪華な配色にする。6(国)は金の光彩+リング付きで最も華やか。
export const TIER_BADGE_STYLES: Record<number, string> = {
  1: "bg-gradient-to-br from-emerald-400 to-green-600 text-white",
  2: "bg-gradient-to-br from-sky-400 to-blue-600 text-white",
  3: "bg-gradient-to-br from-indigo-400 to-violet-600 text-white",
  4: "bg-gradient-to-br from-fuchsia-400 to-pink-600 text-white",
  5: "bg-gradient-to-br from-amber-400 to-yellow-600 text-white ring-2 ring-amber-300",
  6: "bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 text-white ring-4 ring-yellow-300 shadow-lg shadow-amber-500/30",
};

export const TIER_PAGE_BACKGROUND: Record<number, string> = {
  1: "bg-gradient-to-b from-emerald-50/60 to-transparent dark:from-emerald-950/20",
  2: "bg-gradient-to-b from-sky-50/60 to-transparent dark:from-sky-950/20",
  3: "bg-gradient-to-b from-violet-50/60 to-transparent dark:from-violet-950/20",
  4: "bg-gradient-to-b from-fuchsia-50/60 to-transparent dark:from-fuchsia-950/20",
  5: "bg-gradient-to-b from-amber-50/70 to-transparent dark:from-amber-950/20",
  6: "bg-gradient-to-b from-yellow-100/80 via-amber-50/50 to-transparent dark:from-yellow-950/30",
};

export function SettlementBadge({
  tier,
  size = "md",
}: {
  tier: number;
  size?: "md" | "lg";
}) {
  const Icon = TIER_ICONS[tier] ?? Home;
  const sizeClass = size === "lg" ? "size-16" : "size-14";
  const iconSize = size === "lg" ? "size-8" : "size-6";

  return (
    <div
      className={`flex ${sizeClass} shrink-0 items-center justify-center rounded-full ${TIER_BADGE_STYLES[tier] ?? TIER_BADGE_STYLES[1]}`}
    >
      <Icon className={iconSize} />
    </div>
  );
}
