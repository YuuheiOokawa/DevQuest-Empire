"use client";

import { CheckCircle2, Circle, PlayCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { ActionsStep } from "@/services/aiStudioTypes";

// GitHub Actionsのパイプライン表示(Lint→Type Check→Build→Test→Coverage→Security→Artifact)。
export function StudioActionsCard({ steps }: { steps: ActionsStep[] }) {
  const successCount = steps.filter((s) => s.status === "success").length;
  return (
    <Card>
      <CardContent className="flex flex-col gap-2.5 py-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold">
            <PlayCircle className="text-primary size-4" />
            GitHub Actions(CI/CD)
          </h3>
          <span className="text-muted-foreground text-xs">
            {successCount}/{steps.length} 成功
          </span>
        </div>
        <div className="flex flex-col gap-1">
          {steps.map((s) => (
            <div key={s.id} className="flex items-center gap-2 text-xs">
              {s.status === "success" ? (
                <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" />
              ) : (
                <Circle className="text-muted-foreground/40 size-3.5 shrink-0" />
              )}
              <span className="w-32 shrink-0 font-medium">{s.label}</span>
              <span className="text-muted-foreground truncate">
                {s.status === "success" ? s.detail : "待機中"}
              </span>
            </div>
          ))}
        </div>
        <p className="text-muted-foreground text-[10px]">
          MVPではシミュレーション表示。将来は.github/workflows/ci.ymlの実行結果をGitHub APIで取得します。
        </p>
      </CardContent>
    </Card>
  );
}
