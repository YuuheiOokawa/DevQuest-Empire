"use client";

import { CheckCircle2, Circle, CircleDashed, ShieldAlert, Workflow, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { STUDIO_PHASES } from "@/data/studioTemplates";
import type { StudioEmployee, StudioProject } from "@/services/aiStudioTypes";

// 開発パイプライン(23工程)。承認ゲートは盾アイコンで強調表示する。
export function StudioPipelineCard({
  project,
  employees,
}: {
  project: StudioProject;
  employees: StudioEmployee[];
}) {
  const doneCount = project.phases.filter((p) => p.status === "done").length;
  const progress = Math.round((doneCount / project.phases.length) * 100);

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 py-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold">
            <Workflow className="text-primary size-4" />
            開発パイプライン: {project.proposal.appName}
          </h3>
          <span className="text-muted-foreground text-xs">{progress}%</span>
        </div>
        <div className="bg-muted h-1.5 overflow-hidden rounded-full">
          <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex flex-col gap-1">
          {project.phases.map((phase, i) => {
            const template = STUDIO_PHASES[i];
            const assignee = employees.find((e) => e.id === phase.assigneeId);
            const isApprovalGate = Boolean(template.approval);
            return (
              <div
                key={phase.id}
                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs ${
                  phase.status === "active" || phase.status === "awaiting_approval"
                    ? "bg-accent font-semibold"
                    : ""
                } ${isApprovalGate ? "border border-dashed border-amber-500/40" : ""}`}
              >
                {phase.status === "done" ? (
                  <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" />
                ) : phase.status === "awaiting_approval" ? (
                  <ShieldAlert className="size-3.5 shrink-0 animate-pulse text-amber-500" />
                ) : phase.status === "active" ? (
                  <Zap className="size-3.5 shrink-0 text-sky-500" />
                ) : isApprovalGate ? (
                  <CircleDashed className="text-muted-foreground size-3.5 shrink-0" />
                ) : (
                  <Circle className="text-muted-foreground/40 size-3.5 shrink-0" />
                )}
                <span className={`flex-1 ${phase.status === "pending" ? "text-muted-foreground" : ""}`}>
                  {template.label}
                </span>
                {phase.status === "awaiting_approval" && (
                  <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] text-amber-600">承認待ち</span>
                )}
                {assignee && phase.status !== "pending" && (
                  <span className="text-muted-foreground text-[10px]">{assignee.name}</span>
                )}
                {phase.completedDay !== null && (
                  <span className="text-muted-foreground/60 text-[10px]">Day{phase.completedDay}</span>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
