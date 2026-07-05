import { Users, Code2, GraduationCap, Compass, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AiEmployeesResult, AiEmployeeRole } from "@/lib/game/aiEmployees";

const ROLE_ICON: Record<AiEmployeeRole, typeof Code2> = {
  reviewer: Code2,
  coach: GraduationCap,
  strategist: Compass,
};

const ROLE_COLOR: Record<AiEmployeeRole, string> = {
  reviewer: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400",
  coach: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  strategist: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
};

export function AiEmployeeCard({ result }: { result: AiEmployeesResult | null }) {
  if (!result) {
    return (
      <p className="text-destructive text-sm">AI社員情報を取得できませんでした。</p>
    );
  }

  if (!result.unlocked) {
    return (
      <Card>
        <CardContent className="flex flex-col gap-3 py-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-1.5 font-semibold">
              <Users className="text-primary size-4" />
              AI社員
            </h3>
            <Badge variant="secondary" className="gap-1">
              <Lock className="size-3" />
              未解放(Tier{result.currentTier})
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            村が「帝国」以上に発展すると、AI社員が雇用されコードレビュー・学習・村づくりの
            レポートを毎回届けてくれるようになります。
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 py-4">
        <h3 className="flex items-center gap-1.5 font-semibold">
          <Users className="text-primary size-4" />
          AI社員
        </h3>
        <div className="flex flex-col gap-2.5">
          {result.employees.map((employee) => {
            const Icon = ROLE_ICON[employee.role];
            return (
              <div
                key={employee.id}
                className="flex items-start gap-3 rounded-xl border p-3"
              >
                <div
                  className={`flex size-9 shrink-0 items-center justify-center rounded-full ${ROLE_COLOR[employee.role]}`}
                >
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-sm font-medium">{employee.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {employee.roleLabel}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">{employee.report}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
