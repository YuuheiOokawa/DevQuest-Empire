import { Smartphone, Star, Users2, Bug } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ReleasedApp } from "@/services/aiCompanyTypes";

// ストアカード風の完成アプリ表示。
export function ReleasedAppCard({ app }: { app: ReleasedApp }) {
  return (
    <div className="rounded-2xl border p-3">
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 text-white shadow-sm">
          <Smartphone className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-semibold">{app.name}</span>
            <Badge
              variant={app.status === "成長中" ? "default" : "secondary"}
              className="shrink-0 text-[10px]"
            >
              {app.status}
            </Badge>
          </div>
          <p className="text-muted-foreground text-[11px]">{app.genre}</p>
          <div className="mt-1 flex items-center gap-2 text-xs">
            <span className="flex items-center gap-0.5 font-medium text-amber-600 dark:text-amber-400">
              <Star className="size-3 fill-current" />
              {app.rating.toFixed(1)}
            </span>
            <span className="text-muted-foreground flex items-center gap-0.5">
              <Users2 className="size-3" />
              {app.users.toLocaleString()}人
            </span>
            {app.bugs > 0 && (
              <span className="flex items-center gap-0.5 text-rose-600 dark:text-rose-400">
                <Bug className="size-3" />
                {app.bugs}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="text-muted-foreground mt-2 flex flex-wrap justify-between gap-x-3 gap-y-0.5 border-t pt-2 text-[11px]">
        <span>
          月間売上 <span className="text-foreground font-semibold">{app.monthlyRevenue.toLocaleString()}円</span>
        </span>
        <span>
          累計 <span className="text-foreground font-semibold">{app.totalRevenue.toLocaleString()}円</span>
        </span>
        <span>第{app.releasedTurn}週リリース</span>
      </div>
    </div>
  );
}
