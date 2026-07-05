import { ScrollText, Info, CheckCircle2, TriangleAlert, Rocket, Coins } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { LogEntry, LogKind } from "@/services/aiCompanyTypes";

const LOG_ICON: Record<LogKind, typeof Info> = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  release: Rocket,
  money: Coins,
};

const LOG_COLOR: Record<LogKind, string> = {
  info: "text-sky-500",
  success: "text-emerald-500",
  warning: "text-amber-500",
  release: "text-violet-500",
  money: "text-yellow-600 dark:text-yellow-400",
};

export function DevelopmentLog({ logs }: { logs: LogEntry[] }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 py-4">
        <h3 className="flex items-center gap-1.5 font-semibold">
          <ScrollText className="text-primary size-4" />
          開発ログ
        </h3>
        <div className="flex max-h-64 flex-col gap-1 overflow-y-auto">
          {logs.length === 0 && (
            <p className="text-muted-foreground text-xs">まだログがありません。</p>
          )}
          {logs.map((log) => {
            const Icon = LOG_ICON[log.kind];
            return (
              <div key={log.id} className="flex items-start gap-1.5 text-xs">
                <span className="text-muted-foreground w-10 shrink-0 pt-px text-[10px]">
                  {log.turn}週
                </span>
                <Icon className={`mt-0.5 size-3 shrink-0 ${LOG_COLOR[log.kind]}`} />
                <span className="min-w-0">{log.message}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
