"use client";

import { useState } from "react";
import { Bot, CircleDot, Gauge, Lightbulb, Loader2, Rocket, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DEPLOY_TARGETS } from "@/data/studioTemplates";
import type { DeployTarget, ImprovementProposal, StudioProject } from "@/services/aiStudioTypes";

// レビューAIパネル(5観点)の結果とQuality Score。
// onAiReviewを渡すとClaude APIによる実レビューへ差し替えできる(キー未設定時はフォールバック)。
export function StudioReviewsCard({
  project,
  onAiReview,
}: {
  project: StudioProject;
  onAiReview?: () => Promise<string | null>;
}) {
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  if (project.reviews.length === 0) return null;

  const handleAiReview = async () => {
    if (!onAiReview) return;
    setRunning(true);
    try {
      setMessage(await onAiReview());
    } finally {
      setRunning(false);
    }
  };

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
        {onAiReview && (
          <Button size="sm" variant="outline" onClick={handleAiReview} disabled={running} className="gap-1 text-xs">
            {running ? <Loader2 className="size-3 animate-spin" /> : <Bot className="size-3" />}
            実AIレビューを実行(Claude API)
          </Button>
        )}
        {message && <p className="text-muted-foreground text-[10px]">{message}</p>}
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
// onCreateIssueを渡すと、実リポジトリへGitHub Issueとして自動起票できる。
export function StudioImprovementsCard({
  project,
  onCreateIssue,
}: {
  project: StudioProject;
  onCreateIssue?: (imp: ImprovementProposal) => Promise<void>;
}) {
  const [issuingId, setIssuingId] = useState<string | null>(null);
  if (project.improvements.length === 0) return null;

  const handleIssue = async (imp: ImprovementProposal) => {
    if (!onCreateIssue) return;
    setIssuingId(imp.id);
    try {
      await onCreateIssue(imp);
    } finally {
      setIssuingId(null);
    }
  };

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
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold">
                  <span className="mr-1.5 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] text-amber-600">
                    {imp.category}
                  </span>
                  {imp.title}
                </p>
                {imp.issueNumber ? (
                  <span className="flex shrink-0 items-center gap-1 text-[10px] text-emerald-600">
                    <CircleDot className="size-3" />
                    Issue #{imp.issueNumber}
                  </span>
                ) : (
                  onCreateIssue &&
                  project.github && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={issuingId === imp.id}
                      onClick={() => handleIssue(imp)}
                      className="h-6 shrink-0 gap-1 px-2 text-[10px]"
                    >
                      {issuingId === imp.id ? <Loader2 className="size-3 animate-spin" /> : <CircleDot className="size-3" />}
                      Issue化
                    </Button>
                  )
                )}
              </div>
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
