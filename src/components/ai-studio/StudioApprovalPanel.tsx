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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { executePlannedOperations } from "@/services/aiStudioService";
import type { ApprovalRequest, StudioProject } from "@/services/aiStudioTypes";

const TYPE_LABEL: Record<ApprovalRequest["type"], string> = {
  repository: "Repository作成",
  push: "Push",
  merge: "Merge",
  deploy: "Deploy",
};

// Human Approval画面。GitHub操作(Repo作成/Push/Merge/Deploy)は
// この画面でCEOがApproveしない限り一切実行されない。
// MVPでは承認後の「実行」ボタンも実行予定内容の表示のみ行う。
export function StudioApprovalPanel({
  approvals,
  project,
  onApprove,
  onReject,
}: {
  approvals: ApprovalRequest[];
  project: StudioProject | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const [executedId, setExecutedId] = useState<string | null>(null);
  const [executedOps, setExecutedOps] = useState<string[]>([]);

  const pending = approvals.filter((a) => a.status === "pending");
  const resolved = approvals.filter((a) => a.status !== "pending");

  const handleExecute = (approval: ApprovalRequest) => {
    // MVP: GitHub APIは呼ばず、実行予定の操作一覧を表示するのみ。
    setExecutedId(approval.id);
    setExecutedOps(executePlannedOperations(approval));
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
              <InfoRow icon={FolderGit2} label="Repository Name" value={project.proposal.repoName} />
              <InfoRow icon={CircleDot} label="Issue" value={`#1 ${project.proposal.appName} MVP開発`} />
              <InfoRow
                icon={GitCommitHorizontal}
                label="Commit"
                value={`feat: initial implementation of ${project.proposal.appName}`}
              />
              <InfoRow icon={FileDiff} label="Diff" value={`${project.filePlan.length} files changed`} />
              <InfoRow icon={GitPullRequest} label="PR" value="#1 feature/initial-implementation → main" />
              <InfoRow icon={ClipboardCheck} label="Review" value="Reviewer承認済み(指摘は対応済み)" />
              <InfoRow icon={FlaskConical} label="Test Result" value="Unit 42 / E2E 12 passed / Coverage 84%" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* 承認待ち */}
      {pending.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-6 text-center">
            <ShieldCheck className="text-muted-foreground mx-auto mb-2 size-8" />
            <p className="text-muted-foreground text-sm">
              承認待ちの項目はありません。
              <br />
              開発が進むとRepository作成・Push・Merge・Deployの承認依頼がここに届きます。
            </p>
          </CardContent>
        </Card>
      ) : (
        pending.map((a) => (
          <Card key={a.id} className="border-amber-500/50">
            <CardContent className="flex flex-col gap-3 py-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">
                    {TYPE_LABEL[a.type]} / Day {a.day}
                  </span>
                  <h4 className="mt-1 text-sm font-semibold">{a.title}</h4>
                  <p className="text-muted-foreground text-xs">{a.summary}</p>
                </div>
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
                  承認後に実行予定のGitHub操作
                </p>
                <ul className="space-y-0.5">
                  {a.plannedOperations.map((op, i) => (
                    <li key={i} className="font-mono text-[11px] break-all">
                      {op}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => onApprove(a.id)}
                  className="flex-1 gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  <ShieldCheck className="size-4" />
                  Approve
                </Button>
                <Button onClick={() => onReject(a.id)} variant="outline" className="flex-1 gap-1.5 text-red-600">
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
                    <p
                      className={`text-[10px] ${a.status === "approved" ? "text-emerald-600" : "text-red-500"}`}
                    >
                      {a.status === "approved" ? "承認済み" : "差し戻し"} / Day {a.resolvedDay}
                    </p>
                  </div>
                  {a.status === "approved" && (
                    <Button size="sm" variant="outline" className="shrink-0 gap-1 text-xs" onClick={() => handleExecute(a)}>
                      <Terminal className="size-3" />
                      実行
                    </Button>
                  )}
                </div>
                {executedId === a.id && (
                  <div className="mt-2 rounded bg-zinc-900 p-2.5">
                    <p className="mb-1 text-[10px] font-semibold text-zinc-400">
                      実行予定内容(MVPでは表示のみ・将来GitHub API/CLIへ接続)
                    </p>
                    {executedOps.map((op, i) => (
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
