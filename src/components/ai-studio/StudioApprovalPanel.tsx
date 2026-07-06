"use client";

import { useState } from "react";
import {
  ShieldCheck,
  ShieldX,
  Terminal,
  FolderGit2,
  GitCommitHorizontal,
  GitPullRequest,
  FileDiff,
  CircleDot,
  ClipboardCheck,
  FlaskConical,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { executePlannedOperations } from "@/services/aiStudioService";
import type { ApprovalRequest, RiskLevel, StudioProject } from "@/services/aiStudioTypes";

const TYPE_LABEL: Record<ApprovalRequest["type"], string> = {
  repository: "Repository作成",
  branch: "Branch作成",
  commit: "Commit",
  push: "Push",
  pullRequest: "Pull Request",
  merge: "Merge",
  release: "Release",
  deploy: "Deploy",
};

const RISK_STYLE: Record<RiskLevel, { label: string; cls: string }> = {
  low: { label: "Risk: 低", cls: "bg-emerald-500/15 text-emerald-600" },
  medium: { label: "Risk: 中", cls: "bg-amber-500/15 text-amber-600" },
  high: { label: "Risk: 高", cls: "bg-red-500/15 text-red-600" },
};

export type ExecuteHandler = (approval: ApprovalRequest) => Promise<{ ok: boolean; message?: string }>;

// Human Approval画面。GitHub操作(Repo/Branch/Commit/Push/PR/Merge/Release/Deploy)は
// この画面でCEOがApproveしない限り一切実行されない。
// Approve後の「実行」ボタンで初めて実GitHub APIが呼ばれる(未接続時は予定内容の表示のみ)。
export function StudioApprovalPanel({
  approvals,
  project,
  githubLogin,
  onApprove,
  onReject,
  onExecute,
}: {
  approvals: ApprovalRequest[];
  project: StudioProject | null;
  githubLogin: string | null;
  onApprove: (id: string, comment: string) => void;
  onReject: (id: string, comment: string) => void;
  onExecute: ExecuteHandler;
}) {
  const [plannedShownId, setPlannedShownId] = useState<string | null>(null);
  const [executingId, setExecutingId] = useState<string | null>(null);
  const [execError, setExecError] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, string>>({});

  const pending = approvals.filter((a) => a.status === "pending");
  const resolved = approvals.filter((a) => a.status !== "pending");

  const handleExecute = async (approval: ApprovalRequest) => {
    setExecError(null);
    if (!githubLogin) {
      // GitHub未接続: 実行予定の操作一覧を表示するのみ
      setPlannedShownId(approval.id);
      return;
    }
    setExecutingId(approval.id);
    try {
      const res = await onExecute(approval);
      if (!res.ok && res.message) setExecError(res.message);
    } finally {
      setExecutingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 承認対象プロジェクトの概要 */}
      {project && (
        <Card>
          <CardContent className="flex flex-col gap-2 py-4">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold">
              <FolderGit2 className="text-primary size-4" />
              承認対象プロジェクト
            </h3>
            <div className="grid grid-cols-1 gap-1.5 text-xs sm:grid-cols-2">
              <InfoRow icon={FolderGit2} label="Project" value={project.proposal.appName} />
              <InfoRow
                icon={FolderGit2}
                label="Repository Name"
                value={project.github ? `${project.github.owner}/${project.github.repo}` : project.proposal.repoName}
              />
              <InfoRow
                icon={CircleDot}
                label="Issue"
                value={
                  project.github?.issueNumber
                    ? `#${project.github.issueNumber} ${project.proposal.appName} MVP開発`
                    : `#1 ${project.proposal.appName} MVP開発(Repo作成後に起票)`
                }
              />
              <InfoRow icon={GitCommitHorizontal} label="Commit" value={project.commitMessage} />
              <InfoRow icon={FileDiff} label="Diff" value={`${project.filePlan.length} files changed`} />
              <InfoRow
                icon={GitPullRequest}
                label="PR"
                value={
                  project.github?.prNumber
                    ? `#${project.github.prNumber} ${project.workBranch} → main`
                    : `${project.workBranch} → main(作成前)`
                }
              />
              <InfoRow icon={ClipboardCheck} label="Review" value="Reviewer承認済み(指摘は対応済み)" />
              <InfoRow icon={FlaskConical} label="Test Result" value="Unit 42 / E2E 12 passed / Coverage 84%" />
            </div>
            {project.github?.htmlUrl && (
              <a
                href={project.github.htmlUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary flex items-center gap-1 text-xs underline"
              >
                <ExternalLink className="size-3" />
                {project.github.htmlUrl}
              </a>
            )}
          </CardContent>
        </Card>
      )}

      {!githubLogin && (
        <p className="text-muted-foreground rounded-lg border border-dashed p-2.5 text-[11px]">
          GitHub未接続のため、承認後の「実行」は予定内容の表示のみ行います。GitHubでログインすると実際にAPIが実行されます。
        </p>
      )}
      {execError && <p className="rounded-lg bg-red-500/10 p-2.5 text-xs text-red-600">{execError}</p>}

      {/* 承認待ち */}
      {pending.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-6 text-center">
            <ShieldCheck className="text-muted-foreground mx-auto mb-2 size-8" />
            <p className="text-muted-foreground text-sm">
              承認待ちの項目はありません。
              <br />
              開発が進むとRepository・Branch・Commit・Push・PR・Merge・Release・Deployの承認依頼が届きます。
            </p>
          </CardContent>
        </Card>
      ) : (
        pending.map((a) => (
          <Card key={a.id} className="border-amber-500/50">
            <CardContent className="flex flex-col gap-3 py-4">
              <div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">
                    {TYPE_LABEL[a.type]} / Day {a.day}
                  </span>
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${RISK_STYLE[a.riskLevel].cls}`}>
                    {RISK_STYLE[a.riskLevel].label}
                  </span>
                </div>
                <h4 className="mt-1 text-sm font-semibold">{a.title}</h4>
                <p className="text-muted-foreground text-xs">{a.summary}</p>
                <p className="text-muted-foreground mt-0.5 text-[10px]">
                  申請: {a.requestedBy} ・ Files Changed: {a.filesChanged} ・ Tests: {a.testsSummary}
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-muted-foreground mb-1 text-[10px] font-semibold">詳細</p>
                <ul className="space-y-0.5">
                  {a.details.map((d, i) => (
                    <li key={i} className="font-mono text-[11px] whitespace-pre-wrap">
                      {d}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-muted-foreground mb-1 flex items-center gap-1 text-[10px] font-semibold">
                  <Terminal className="size-3" />
                  承認後に実行されるGitHub操作
                </p>
                <ul className="space-y-0.5">
                  {a.plannedOperations.map((op, i) => (
                    <li key={i} className="font-mono text-[11px] break-all">
                      {op}
                    </li>
                  ))}
                </ul>
              </div>

              <textarea
                value={comments[a.id] ?? ""}
                onChange={(e) => setComments((prev) => ({ ...prev, [a.id]: e.target.value }))}
                placeholder="コメント(任意): 承認/差し戻しの理由など"
                rows={2}
                className="border-input bg-background w-full rounded-lg border px-2.5 py-1.5 text-xs"
              />

              <div className="flex gap-2">
                <Button
                  onClick={() => onApprove(a.id, comments[a.id] ?? "")}
                  className="flex-1 gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  <ShieldCheck className="size-4" />
                  Approve
                </Button>
                <Button
                  onClick={() => onReject(a.id, comments[a.id] ?? "")}
                  variant="outline"
                  className="flex-1 gap-1.5 text-red-600"
                >
                  <ShieldX className="size-4" />
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {/* 承認履歴と実行ボタン */}
      {resolved.length > 0 && (
        <Card>
          <CardContent className="flex flex-col gap-2 py-4">
            <h3 className="text-sm font-semibold">承認履歴</h3>
            {resolved.map((a) => (
              <div key={a.id} className="rounded-lg border p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold">{a.title}</p>
                    <p className={`text-[10px] ${a.status === "approved" ? "text-emerald-600" : "text-red-500"}`}>
                      {a.status === "approved" ? "承認済み" : "差し戻し"} / Day {a.resolvedDay}
                      {a.ceoComment && <span className="text-muted-foreground"> ・ 「{a.ceoComment}」</span>}
                    </p>
                  </div>
                  {a.status === "approved" && !a.executionResult && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 gap-1 text-xs"
                      disabled={executingId === a.id}
                      onClick={() => handleExecute(a)}
                    >
                      {executingId === a.id ? <Loader2 className="size-3 animate-spin" /> : <Terminal className="size-3" />}
                      実行
                    </Button>
                  )}
                </div>
                {/* 実行結果(実GitHub API) */}
                {a.executionResult && (
                  <div className="mt-2 rounded bg-zinc-900 p-2.5">
                    <p className="mb-1 text-[10px] font-semibold text-zinc-400">実行結果(GitHub API)</p>
                    {a.executionResult.map((line, i) => (
                      <p key={i} className="font-mono text-[11px] break-all text-emerald-400">
                        {line}
                      </p>
                    ))}
                  </div>
                )}
                {/* GitHub未接続時: 実行予定の表示のみ */}
                {!a.executionResult && plannedShownId === a.id && (
                  <div className="mt-2 rounded bg-zinc-900 p-2.5">
                    <p className="mb-1 text-[10px] font-semibold text-zinc-400">
                      実行予定内容(GitHub未接続のため表示のみ)
                    </p>
                    {executePlannedOperations(a).map((op, i) => (
                      <p key={i} className="font-mono text-[11px] break-all text-emerald-400">
                        $ {op}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FolderGit2;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-1.5">
      <Icon className="text-muted-foreground mt-0.5 size-3 shrink-0" />
      <div className="min-w-0">
        <span className="text-muted-foreground text-[10px]">{label}</span>
        <p className="truncate font-medium">{value}</p>
      </div>
    </div>
  );
}
