import {
  Home,
  Building2,
  Hammer,
  Users,
  Beer,
  Code2,
  Castle,
  LibraryBig,
  GraduationCap,
  Landmark,
  Store,
  School,
  Wrench,
  Tent,
  Church,
  Swords,
  Anchor,
  Telescope,
  Building,
  Ship,
  Crown,
  Handshake,
  Sparkles,
  ScrollText,
  type LucideIcon,
} from "lucide-react";

const BUILDING_ICONS: Record<string, LucideIcon> = {
  // Tier1: 村
  house_small: Home,
  house_large: Building2,
  blacksmith: Hammer,
  guild: Users,
  tavern: Beer,
  dev_base: Code2,
  castle: Castle,
  library: LibraryBig,
  academy: GraduationCap,
  monument: Landmark,
  // Tier2: 町
  market: Store,
  school: School,
  workshop: Wrench,
  watchtower: Tent,
  // Tier3: 都市
  cathedral: Church,
  arena: Swords,
  harbor: Anchor,
  observatory: Telescope,
  // Tier4: 王国
  grand_library: LibraryBig,
  colosseum: Building,
  senate: Landmark,
  shipyard: Ship,
  // Tier5: 帝国
  royal_palace: Crown,
  great_academy: GraduationCap,
  trade_hub: Handshake,
  monastery: Church,
  // Tier6: 天空帝国
  imperial_capital: Crown,
  world_tree: Sparkles,
  grand_colosseum: Building,
  throne_room: ScrollText,
};

// 建物ごとの色味(unlocked時のアイコン背景)。テーマに関わらず視認性を保つため
// bg/text色を固定のTailwindユーティリティで指定する。tierが上がるほど
// 金・紫系の「豪華な」色味に寄せている。
const BUILDING_COLORS: Record<string, string> = {
  // Tier1: 村(素朴な色)
  house_small: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  house_large: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
  blacksmith: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  guild: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  tavern: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
  dev_base: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  castle: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
  library: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400",
  academy: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400",
  monument: "bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
  // Tier2: 町(少し落ち着いた色)
  market: "bg-lime-100 text-lime-700 dark:bg-lime-950 dark:text-lime-400",
  school: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400",
  workshop: "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  watchtower: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400",
  // Tier3: 都市(紫寄り)
  cathedral: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
  arena: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  harbor: "bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  observatory: "bg-indigo-200 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
  // Tier4: 王国(華やかな色)
  grand_library: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950 dark:text-fuchsia-400",
  colosseum: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400",
  senate: "bg-purple-200 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  shipyard: "bg-cyan-200 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
  // Tier5: 帝国(金色寄り)
  royal_palace: "bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  great_academy: "bg-teal-200 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
  trade_hub: "bg-orange-200 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  monastery: "bg-violet-200 text-violet-800 dark:bg-violet-900 dark:text-violet-300",
  // Tier6: 天空帝国(最も豪華な金色)
  imperial_capital: "bg-gradient-to-br from-amber-300 to-yellow-500 text-white",
  world_tree: "bg-gradient-to-br from-emerald-300 to-teal-500 text-white",
  grand_colosseum: "bg-gradient-to-br from-rose-300 to-red-500 text-white",
  throne_room: "bg-gradient-to-br from-yellow-300 to-amber-600 text-white",
};

export function BuildingIcon({
  type,
  unlocked,
}: {
  type: string;
  unlocked: boolean;
}) {
  const Icon = BUILDING_ICONS[type] ?? Home;
  const colorClass = unlocked
    ? (BUILDING_COLORS[type] ?? "bg-muted text-muted-foreground")
    : "bg-muted text-muted-foreground";

  return (
    <div
      className={`flex size-12 shrink-0 items-center justify-center rounded-full ${colorClass}`}
    >
      <Icon className="size-6" />
    </div>
  );
}
