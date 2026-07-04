import type { LucideIcon } from "lucide-react";
import { Lock } from "lucide-react";
import { RARITY_ICON_CLASS, type Rarity } from "@/lib/game/rarity";
import { cn } from "@/lib/utils";

export function RewardIcon({
  icon: Icon,
  rarity,
  unlocked,
  size = "md",
}: {
  icon: LucideIcon;
  rarity: Rarity;
  unlocked: boolean;
  size?: "md" | "lg";
}) {
  const sizeClass = size === "lg" ? "size-14" : "size-11";
  const iconSizeClass = size === "lg" ? "size-6" : "size-5";

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full",
        sizeClass,
        unlocked ? RARITY_ICON_CLASS[rarity] : "bg-muted text-muted-foreground"
      )}
    >
      {unlocked ? (
        <Icon className={iconSizeClass} />
      ) : (
        <Lock className={iconSizeClass} />
      )}
    </div>
  );
}
