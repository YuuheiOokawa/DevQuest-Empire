import { ArrowDownRight, ArrowUpRight, Minus, NotebookPen, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { WeeklyReview } from "@/lib/game/weeklyReview";

function DiffBadge({ now, prev }: { now: number; prev: number }) {
  if (now > prev)
    return (
      <span className="flex items-center gap-0.5 text-[11px] font-semibold text-emerald-600">
        <ArrowUpRight className="size-3" />+{now - prev}
      </span>
    );
  if (now < prev)
    return (
      <span className="flex items-center gap-0.5 text-[11px] font-semibold text-red-500">
        <ArrowDownRight className="size-3" />-{prev - now}
      </span>
    );
  return (
    <span className="text-muted-foreground flex items-center gap-0.5 text-[11px]">
      <Minus className="size-3" />±0
    </span>
  );
}

// 週間ふりかえり: 直近7日の活動を前週比つきで表示する。
export function WeeklyReviewCard({ review }: { review: WeeklyReview }) {
  const rows = [
    { label: "クエスト達成", ...review.quests },
    { label: "コミット", ...review.commits },
    { label: "Issueクローズ", ...review.issues },
  ];
  return (
    <Card>
      <CardContent className="flex flex-col gap-2.5 py-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 font-semibold">
            <NotebookPen className="text-primary size-4" />
            週間ふりかえり
          </h3>
          <span className="flex items-center gap-1 rounded bg-amber-500/15 px-2 py-0.5 text-xs font-bold text-amber-600">
            <Sparkles className="size-3" />
            今週 +{review.expGained.toLocaleString()}EXP
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{r.label}</span>
              <span className="flex items-center gap-2">
                <span className="font-semibold">{r.thisWeek}</span>
                <DiffBadge now={r.thisWeek} prev={r.lastWeek} />
              </span>
            </div>
          ))}
        </div>
        <p className="text-muted-foreground border-t pt-2 text-xs">{review.comment}</p>
      </CardContent>
    </Card>
  );
}
