import { Lightbulb, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AppIdea } from "@/services/aiCompanyTypes";

const DIFFICULTY_STARS = ["★", "★★", "★★★", "★★★★", "★★★★★"];

export function AppIdeaCard({
  idea,
  selected,
  onSelect,
}: {
  idea: AppIdea;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-2xl border p-3 text-left transition-colors ${
        selected
          ? "border-emerald-400 bg-emerald-50/70 ring-2 ring-emerald-300 dark:border-emerald-700 dark:bg-emerald-950/30 dark:ring-emerald-800"
          : "hover:bg-accent"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1.5 text-sm font-semibold">
          <Lightbulb className="size-4 shrink-0 text-amber-500" />
          <span className="truncate">{idea.name}</span>
        </span>
        <Badge variant="secondary" className="shrink-0 text-[10px]">
          {idea.genre}
        </Badge>
      </div>
      <p className="text-muted-foreground mt-1 text-[11px]">
        ターゲット: {idea.target}
      </p>
      <p className="mt-1 text-xs">{idea.solution}</p>
      <div className="mt-1.5 flex flex-wrap gap-1">
        {idea.features.map((feature) => (
          <span key={feature} className="bg-muted rounded-full px-1.5 py-0.5 text-[10px]">
            {feature}
          </span>
        ))}
      </div>
      <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px]">
        <span>難易度 {DIFFICULTY_STARS[idea.difficulty - 1]}</span>
        <span>市場 {DIFFICULTY_STARS[idea.marketSize - 1]}</span>
        <span>想定 {idea.estWeeks}週</span>
        <span className="flex items-center gap-0.5 font-medium text-emerald-600 dark:text-emerald-400">
          <TrendingUp className="size-3" />
          成功率 {idea.successRate}%
        </span>
      </div>
      <p className="text-muted-foreground mt-1 text-[10px]">収益化: {idea.monetization}</p>
    </button>
  );
}
