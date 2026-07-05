import { Building2, Coins, Star, Users2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { CompanyState } from "@/services/aiCompanyTypes";

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-muted-foreground w-16 shrink-0 text-[11px]">{label}</span>
      <Progress value={Math.min(100, value)} className="h-1.5" />
      <span className="text-muted-foreground w-8 shrink-0 text-right text-[11px]">{value}</span>
    </div>
  );
}

export function CompanyStatusCard({
  company,
  appCount,
  turn,
}: {
  company: CompanyState;
  appCount: number;
  turn: number;
}) {
  const expInLevel = company.exp % 100;
  return (
    <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-sky-50 dark:border-emerald-900 dark:from-emerald-950/30 dark:via-neutral-900 dark:to-sky-950/20">
      <CardContent className="flex flex-col gap-3 py-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex min-w-0 items-center gap-1.5 font-bold">
            <Building2 className="text-primary size-4 shrink-0" />
            <span className="truncate">{company.name}</span>
          </h2>
          <span className="text-muted-foreground shrink-0 text-xs">第{turn}週</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white">
            会社Lv.{company.level}
          </span>
          <div className="min-w-0 flex-1">
            <Progress value={expInLevel} className="h-1.5" />
          </div>
          <span className="text-muted-foreground shrink-0 text-[10px]">{expInLevel}/100</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-white/70 py-2 dark:bg-black/20">
            <div className="text-muted-foreground flex items-center justify-center gap-0.5 text-[10px]">
              <Coins className="size-3 text-amber-500" />
              資金
            </div>
            <div className="text-sm font-bold">{company.funds.toLocaleString()}円</div>
          </div>
          <div className="rounded-xl bg-white/70 py-2 dark:bg-black/20">
            <div className="text-muted-foreground flex items-center justify-center gap-0.5 text-[10px]">
              <Star className="size-3 text-violet-500" />
              評判
            </div>
            <div className="text-sm font-bold">{company.reputation}</div>
          </div>
          <div className="rounded-xl bg-white/70 py-2 dark:bg-black/20">
            <div className="text-muted-foreground flex items-center justify-center gap-0.5 text-[10px]">
              <Users2 className="size-3 text-sky-500" />
              ファン
            </div>
            <div className="text-sm font-bold">{company.fans.toLocaleString()}</div>
          </div>
        </div>

        <div className="space-y-1">
          <MiniStat label="技術力" value={company.tech} />
          <MiniStat label="デザイン力" value={company.designPower} />
          <MiniStat label="企画力" value={company.planningPower} />
          <MiniStat label="マーケ力" value={company.marketing} />
        </div>

        <p className="text-muted-foreground text-[11px]">
          完成アプリ {appCount}本 ・ 累計売上 {company.totalRevenue.toLocaleString()}円
        </p>
      </CardContent>
    </Card>
  );
}
