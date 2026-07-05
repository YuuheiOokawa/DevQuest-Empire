import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { RecommendedAction } from "@/lib/game/recommendation";

export function RecommendedActionCard({ action }: { action: RecommendedAction }) {
  return (
    <Link href={action.href}>
      <Card className="rounded-3xl border-emerald-300 bg-gradient-to-r from-emerald-50 via-emerald-50/60 to-transparent shadow-sm transition-transform hover:-translate-y-0.5 dark:border-emerald-800 dark:from-emerald-950/40">
        <CardContent className="flex items-center gap-3 py-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-sm shadow-emerald-500/30">
            <action.icon className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold tracking-wide text-emerald-700 dark:text-emerald-400">
              今日のおすすめアクション
            </p>
            <p className="truncate font-medium">{action.title}</p>
            <p className="text-muted-foreground truncate text-sm">
              {action.description}
            </p>
          </div>
          <ArrowRight className="text-muted-foreground size-4 shrink-0" />
        </CardContent>
      </Card>
    </Link>
  );
}
