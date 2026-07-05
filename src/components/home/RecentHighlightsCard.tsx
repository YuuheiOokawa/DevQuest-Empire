import { Trophy, Award, GraduationCap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { RecentHighlight } from "@/lib/game/highlights";

const ICON = {
  achievement: Trophy,
  title: Award,
  qualification: GraduationCap,
};

const COLOR = {
  achievement: "text-amber-500",
  title: "text-violet-500",
  qualification: "text-teal-500",
};

export function RecentHighlightsCard({
  highlights,
}: {
  highlights: RecentHighlight[];
}) {
  if (highlights.length === 0) return null;

  return (
    <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-transparent dark:border-amber-900 dark:from-amber-950/30">
      <CardContent className="flex flex-col gap-2 py-4">
        <h2 className="flex items-center gap-1.5 font-semibold">
          <Trophy className="size-4 text-amber-500" />
          最近の達成
        </h2>
        <div className="flex flex-col gap-1.5">
          {highlights.map((highlight) => {
            const Icon = ICON[highlight.kind];
            return (
              <div key={highlight.id} className="flex items-center gap-2 text-sm">
                <Icon className={`size-4 shrink-0 ${COLOR[highlight.kind]}`} />
                <span className="min-w-0 truncate">{highlight.label}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
