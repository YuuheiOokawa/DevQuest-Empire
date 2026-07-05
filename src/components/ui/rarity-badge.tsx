import { Badge } from "@/components/ui/badge";
import { RARITY_BADGE_CLASS, RARITY_LABELS, type Rarity } from "@/lib/game/rarity";
import { cn } from "@/lib/utils";

export function RarityBadge({
  rarity,
  className,
}: {
  rarity: Rarity;
  className?: string;
}) {
  return (
    <Badge className={cn(RARITY_BADGE_CLASS[rarity], className)}>
      {RARITY_LABELS[rarity]}
    </Badge>
  );
}
