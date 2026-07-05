import { Gauge } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { qualityIndexOf } from "@/services/projectSimulationService";
import type { CodeQuality } from "@/services/aiCompanyTypes";

function QualityBar({ label, value, invert }: { label: string; value: number; invert?: boolean }) {
  const good = invert ? value < 30 : value > 60;
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-muted-foreground w-14 shrink-0 text-[10px]">{label}</span>
      <Progress
        value={value}
        className={`h-1.5 ${
          invert
            ? "[&_[data-slot=progress-indicator]]:bg-rose-400"
            : good
              ? "[&_[data-slot=progress-indicator]]:bg-emerald-500"
              : ""
        }`}
      />
      <span className="text-muted-foreground w-7 shrink-0 text-right text-[10px]">{value}</span>
    </div>
  );
}

export function CodeQualityCard({ codeQuality }: { codeQuality: CodeQuality }) {
  const index = qualityIndexOf(codeQuality);
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 py-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 font-semibold">
            <Gauge className="text-primary size-4" />
            コード品質
          </h3>
          <span
            className={`rounded-md px-1.5 py-0.5 text-[11px] font-bold ${
              index >= 1.1
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                : index >= 0.9
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                  : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
            }`}
          >
            売上係数 ×{index.toFixed(2)}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 sm:gap-x-4">
          <QualityBar label="可読性" value={codeQuality.readability} />
          <QualityBar label="保守性" value={codeQuality.maintainability} />
          <QualityBar label="テスト率" value={codeQuality.testCoverage} />
          <QualityBar label="設計品質" value={codeQuality.designQuality} />
          <QualityBar label="重複率" value={codeQuality.duplication} invert />
          <QualityBar label="技術負債" value={codeQuality.techDebt} invert />
          <QualityBar label="バグ率" value={codeQuality.bugRate} invert />
        </div>
        <p className="text-muted-foreground text-[10px]">
          レビュー・CI・テスト工程で品質が上がり、リリース後の売上係数に反映されます。
        </p>
      </CardContent>
    </Card>
  );
}
