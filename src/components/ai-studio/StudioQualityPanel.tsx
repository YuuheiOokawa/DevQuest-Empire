"use client";

import { Gauge, Lightbulb, Rocket, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DEPLOY_TARGETS } from "@/data/studioTemplates";
import type { DeployTarget, StudioProject } from "@/services/aiStudioTypes";

// レビューAIパネル(5観点)の結果とQuality Score。
export function StudioReviewsCard({ project }: { project: StudioProject }) {
  if (project.reviews.length === 0) return null;
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 py-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold">
            <ShieldCheck className="text-primary size-4" />
            AIレビューパネル(5観点)
          </h3>
          {project.qualityScore !== null && (
            <span className="flex items-center gap-1 rounded bg-emerald-500/15 px-2 py-0.5 text-xs font-bold text-emerald-600">
              <Gauge className="size-3.5" />
              Quality Score {project.qualityScore}/100
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          {project.reviews.map((r) => (
            <div key={r.aspect} className="rounded-lg border p-2.5 text-xs">
              <div className="flex items-center justify-between">
                <p className="font-semibold">
                  {r.aspect}
                  <span className="text-muted-foreground ml-1.5 font-normal">{r.reviewer}</span>
                </p>
                <span className={`text-[10px] font-bold ${r.score >= 90 ? "text-emerald-600" : "text-amber-600"}`}>
                  {r.score}点 / {r.verdict === "approve" ? "approve" : "要修正"}
                </span>
              </div>
              {r.findings.map((f, i) => (
                <p key={i} className="text-muted-foreground text-[11px]">
                  ・{f}
                </p>
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// AI社員の自発的な改善提案(UX/性能/品質/負債/SEO/a11y/CI)。
export function StudioImprovementsCard({ project }: { project: StudioProject }) {
  if (project.improvements.length === 0) return null;
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 py-4">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold">
          <Lightbulb className="size-4 text-amber-500" />
          AI社員からの改善提案({project.improvements.length}件)
        </h3>
        <div className="flex flex-col gap-1.5">
          {project.improvements.map((imp) => (
            <div key={imp.id} className="rounded-lg border p-2.5 text-xs">
              <p className="font-semibold">
                <span className="mr-1.5 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] text-amber-600">
                  {imp.category}
                </span>
                {imp.title}
              </p>
              <p className="text-muted-foreground text-[11px]">{imp.detail}</p>
              <p className="text-muted-foreground text-[10px]">提案: {imp.proposedBy}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// デプロイ先の選択(Deploy承認前に変更可能)。
export function StudioDeployTargetCard({
  project,
  onChange,
}: {
  project: StudioProject;
  onChange: (target: DeployTarget) => void;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 py-4">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold">
          <Rocket className="text-primary size-4" />
          デプロイ先
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {DEPLOY_TARGETS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onChange(t)}
              className={`rounded-lg border px-2.5 py-1.5 text-xs transition-colors ${
                project.deployTarget === t ? "bg-foreground text-background font-semibold" : "hover:bg-accent"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <p className="text-muted-foreground text-[10px]">
          DeployはHuman Approval後のみ実行されます。実デプロイには各サービスのトークンをリポジトリSecretsへ設定してください。
        </p>
      </CardContent>
    </Card>
  );
}
