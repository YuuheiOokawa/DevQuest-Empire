"use client";

import { useState } from "react";
import { ChevronDown, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AiEmployeeCard } from "@/components/ai-company/AiEmployeeCard";
import type { AiEmployee, Project } from "@/services/aiCompanyTypes";

export function AiEmployeeList({
  employees,
  project,
}: {
  employees: AiEmployee[];
  project: Project | null;
}) {
  const [open, setOpen] = useState(false);
  const busyId = project?.phases[project.phaseIndex]?.assigneeId ?? null;

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 py-4">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex w-full items-center justify-between"
        >
          <h3 className="flex items-center gap-1.5 font-semibold">
            <Users className="text-primary size-4" />
            AI社員({employees.length}人)
          </h3>
          <ChevronDown className={`text-muted-foreground size-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {open ? (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {employees.map((employee) => (
              <AiEmployeeCard key={employee.id} employee={employee} busy={employee.id === busyId} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-xs">
            タップで社員カードを表示 ・ 作業中:{" "}
            {busyId ? (employees.find((e) => e.id === busyId)?.name ?? "-") : "なし"}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
