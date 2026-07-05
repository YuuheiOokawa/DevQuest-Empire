import { Rocket, Bug, CheckCircle2, CircleDashed, LoaderCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PROJECT_PHASES } from "@/data/projectPhaseTemplates";
import type { AiEmployee, Project } from "@/services/aiCompanyTypes";

export function ProjectProgressCard({
  project,
  employees,
}: {
  project: Project;
  employees: AiEmployee[];
}) {
  const currentPhase = project.phases[project.phaseIndex];
  const currentTemplate = currentPhase
    ? PROJECT_PHASES.find((p) => p.id === currentPhase.id)
    : null;
  const assignee = currentPhase
    ? employees.find((e) => e.id === currentPhase.assigneeId)
    : null;
  const overallDone = project.phases.filter((p) => p.done).length;
  const overallRate = Math.round((overallDone / project.phases.length) * 100);

  return (
    <Card className="border-sky-200 dark:border-sky-900">
      <CardContent className="flex flex-col gap-3 py-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="flex min-w-0 items-center gap-1.5 font-semibold">
            <Rocket className="text-primary size-4 shrink-0" />
            <span className="truncate">{project.idea.name}</span>
          </h3>
          <Badge variant="secondary" className="shrink-0">
            {project.idea.genre}
          </Badge>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">全体進捗</span>
            <span className="font-medium">{overallRate}%</span>
          </div>
          <Progress value={overallRate} />
        </div>

        {currentPhase && currentTemplate && (
          <div className="bg-muted/50 space-y-1.5 rounded-xl p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1 font-medium">
                <LoaderCircle className="size-3.5 animate-spin text-sky-500" />
                {currentTemplate.label}
              </span>
              <span className="text-muted-foreground text-xs">
                担当: {assignee?.name ?? "-"}
              </span>
            </div>
            <Progress
              value={(currentPhase.progress / currentPhase.required) * 100}
              className="h-1.5 [&_[data-slot=progress-indicator]]:bg-sky-500"
            />
          </div>
        )}

        {/* 工程一覧(完了/進行中/未着手) */}
        <div className="flex flex-wrap gap-1">
          {project.phases.map((phase, i) => {
            const template = PROJECT_PHASES.find((p) => p.id === phase.id)!;
            const state = phase.done ? "done" : i === project.phaseIndex ? "active" : "todo";
            return (
              <span
                key={phase.id}
                className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] ${
                  state === "done"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                    : state === "active"
                      ? "bg-sky-100 font-semibold text-sky-700 dark:bg-sky-950 dark:text-sky-300"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {state === "done" ? (
                  <CheckCircle2 className="size-2.5" />
                ) : (
                  <CircleDashed className="size-2.5" />
                )}
                {template.label}
              </span>
            );
          })}
        </div>

        <div className="text-muted-foreground flex flex-wrap gap-x-3 gap-y-0.5 text-[11px]">
          <span>品質 {project.quality}</span>
          <span>デザイン {project.designScore}</span>
          <span>機能性 {project.functionality}</span>
          <span>安定性 {project.stability}</span>
          <span className="flex items-center gap-0.5 text-rose-600 dark:text-rose-400">
            <Bug className="size-3" />
            バグ {project.bugs}件
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
