import {
  Home,
  Building2,
  Hammer,
  Users,
  Beer,
  Code2,
  Castle,
  type LucideIcon,
} from "lucide-react";

const BUILDING_ICONS: Record<string, LucideIcon> = {
  house_small: Home,
  house_large: Building2,
  blacksmith: Hammer,
  guild: Users,
  tavern: Beer,
  dev_base: Code2,
  castle: Castle,
};

// 建物ごとの色味(unlocked時のアイコン背景)。テーマに関わらず視認性を保つため
// bg/text色を固定のTailwindユーティリティで指定する。
const BUILDING_COLORS: Record<string, string> = {
  house_small: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  house_large: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
  blacksmith: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  guild: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  tavern: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
  dev_base: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  castle: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
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
