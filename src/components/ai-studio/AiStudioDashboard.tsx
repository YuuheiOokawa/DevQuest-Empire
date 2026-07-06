"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarPlus,
  ChevronRight,
  FolderGit2,
  Lightbulb,
  Package,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StudioApprovalPanel } from "@/components/ai-studio/StudioApprovalPanel";
import { StudioActionsCard } from "@/components/ai-studio/StudioActionsCard";
import { StudioDocsCard } from "@/components/ai-studio/StudioDocsCard";
import { StudioEmployeeList } from "@/components/ai-studio/StudioEmployeeList";
import { StudioFilePlanCard } from "@/components/ai-studio/StudioFilePlanCard";
import { StudioLogCard } from "@/components/ai-studio/StudioLogCard";
import { StudioMeetingCard } from "@/components/ai-studio/StudioMeetingCard";
import {
  StudioDeployTargetCard,
  StudioImprovementsCard,
  StudioReviewsCard,
} from "@/components/ai-studio/StudioQualityPanel";
import { StudioPipelineCard } from "@/components/ai-studio/StudioPipelineCard";
import { StudioPromptsCard } from "@/components/ai-studio/StudioPromptsCard";
import { StudioProposalPicker } from "@/components/ai-studio/StudioProposalPicker";
import {
  advanceStudioDay,
  approveRequest,
  holdPlanningMeeting,
  loadStudioState,
  markApprovalExecuted,
  rejectRequest,
  resetStudioState,
  setDeployTarget,
  startStudioProject,
} from "@/services/aiStudioService";
import type { ApprovalRequest, StudioState } from "@/services/aiStudioTypes";
import {
  buildExecutionPayload,
  executeApprovedAction,
  fetchGithubOverview,
  GithubClientError,
} from "@/services/githubStudioClient";

type StudioTab = "dev" | "approval" | "output" | "org";

const TABS: { id: StudioTab; label: string; icon: typeof Workflow }[] = [
  { id: "dev", label: "開発", icon: Workflow },
  { id: "approval", label: "承認", icon: ShieldCheck },
  { id: "output", label: "成果物", icon: Package },
  { id: "org", label: "組織", icon: Users },
];

// AI開発スタジオのメイン画面。CEO(人間)の仕事は企画承認とGitHub操作の承認のみで、
// 開発工程はAI社員がルールベースで進める。GitHub操作は必ずHuman Approvalを挟む。
export function AiStudioDashboard() {
  const [state, setState] = useState<StudioState>(() => loadStudioState());
  const [tab, setTab] = useState<StudioTab>("dev");
  const [githubLogin, setGithubLogin] = useState<string | null>(null);

  // GitHub接続確認(OAuthログイン済みならトークンでプロフィールが取れる)。
  // 60秒キャッシュ付きなのでRate Limitはほぼ消費しない。
  useEffect(() => {
    let cancelled = false;
    fetchGithubOverview()
      .then((o) => {
        if (!cancelled) setGithubLogin(o.profile.login);
      })
      .catch(() => {
        if (!cancelled) setGithubLogin(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const pendingApprovals = state.approvals.filter((a) => a.status === "pending").length;

  const handleReset = () => {
    if (window.confirm("スタジオのデータをリセットして最初からやり直しますか?")) {
      setState(resetStudioState());
    }
  };

  // 承認済みリクエストの実行(実GitHub API)。CEOが実行ボタンを押したときのみ呼ばれる。
  const handleExecute = async (approval: ApprovalRequest): Promise<{ ok: boolean; message?: string }> => {
    if (!githubLogin) return { ok: false, message: "GitHub未接続です" };
    const payload = buildExecutionPayload(approval, state, githubLogin);
    if (!payload) {
      // Commit承認はWeb APIではPushと一体のため、ここでは記録のみ
      if (approval.type === "commit") {
        setState((prev) =>
          markApprovalExecuted(prev, approval.id, [
            "Commit内容を確定しました(Web APIではCommitとPushが一体のため、Push承認の実行時に反映されます)",
          ])
        );
        return { ok: true };
      }
      return { ok: false, message: "実行に必要な情報が不足しています(前工程の実行が未完了の可能性)" };
    }
    try {
      const outcome = await executeApprovedAction(payload);
      setState((prev) => markApprovalExecuted(prev, approval.id, outcome.resultLines, outcome.githubPatch));
      return { ok: true };
    } catch (e) {
      const message = e instanceof GithubClientError ? e.message : "GitHub APIの実行に失敗しました";
      return { ok: false, message };
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* ステータスヘッダー */}
      <Card>
        <CardContent className="flex items-center justify-between py-3.5">
          <div className="flex items-center gap-3 text-xs">
            <span className="font-semibold">Step {state.day}</span>
            <span className="text-muted-foreground flex items-center gap-1">
              <FolderGit2 className="size-3.5" />
              完成 {state.completedProjects.length} repo
            </span>
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                githubLogin ? "bg-emerald-500/15 text-emerald-600" : "bg-zinc-500/15 text-zinc-500"
              }`}
            >
              {githubLogin ? `GitHub: @${githubLogin}` : "GitHub未接続"}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground gap-1 text-xs">
            <RotateCcw className="size-3" />
            リセット
          </Button>
        </CardContent>
      </Card>

      {/* タブ */}
      <div className="flex gap-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-xs transition-colors ${
              tab === t.id ? "bg-foreground text-background font-semibold" : "hover:bg-accent"
            }`}
          >
            <t.icon className="size-3.5" />
            {t.label}
            {t.id === "approval" && pendingApprovals > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                {pendingApprovals}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "dev" && (
        <>
          {/* GitHubコンソールへの入口 */}
          <Link href="/ai-studio/github">
            <Card className="border-indigo-500/40 transition-colors hover:bg-accent">
              <CardContent className="flex items-center gap-3 py-3">
                <FolderGit2 className="size-5 shrink-0 text-indigo-500" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">GitHubコンソール</p>
                  <p className="text-muted-foreground text-[11px]">
                    Repositories / Issues / PRs / Actions / Releases / Approval Queue
                  </p>
                </div>
                <ChevronRight className="text-muted-foreground size-4 shrink-0" />
              </CardContent>
            </Card>
          </Link>

          {state.project ? (
            <>
              <StudioPipelineCard project={state.project} employees={state.employees} />
              <StudioReviewsCard project={state.project} />
              <StudioImprovementsCard project={state.project} />
              <StudioDeployTargetCard
                project={state.project}
                onChange={(t) => setState((prev) => setDeployTarget(prev, t))}
              />
              <StudioActionsCard steps={state.project.actionsSteps} />
            </>
          ) : state.proposals.length > 0 ? (
            <StudioProposalPicker proposals={state.proposals} onSelect={(id) => setState((prev) => startStudioProject(prev, id))} />
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
                <Lightbulb className="text-muted-foreground size-8" />
                <p className="text-muted-foreground text-sm">
                  進行中のプロジェクトはありません。
                  <br />
                  企画会議を開いて、AI社員にアプリ案を出させましょう。
                </p>
                <Button
                  onClick={() => setState((prev) => holdPlanningMeeting(prev))}
                  className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  <Sparkles className="size-4" />
                  企画会議を開く
                </Button>
              </CardContent>
            </Card>
          )}

          {state.completedProjects.length > 0 && (
            <Card>
              <CardContent className="flex flex-col gap-2 py-4">
                <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                  <FolderGit2 className="text-primary size-4" />
                  完成アプリ一覧({state.completedProjects.length}本)
                </h3>
                {state.completedProjects.map((p) => (
                  <div key={p.repoName} className="rounded-lg border px-2.5 py-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">{p.appName}</span>
                      <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600">
                        {p.version}
                      </span>
                    </div>
                    <p className="text-muted-foreground font-mono text-[11px]">{p.repoName}</p>
                    <p className="text-muted-foreground text-[10px]">
                      Deploy先: {p.deployTarget} ・ Step {p.deployedDay}
                    </p>
                    {p.changeLog.map((c, i) => (
                      <p key={i} className="text-muted-foreground text-[10px]">
                        ・{c}
                      </p>
                    ))}
                    {p.htmlUrl && (
                      <a href={p.htmlUrl} target="_blank" rel="noreferrer" className="text-primary text-[11px] underline">
                        {p.htmlUrl}
                      </a>
                    )}
                    <p className="text-muted-foreground text-[10px]">
                      README・更新履歴・Roadmap・Wikiは「成果物」タブ、Issue/PRはGitHubコンソールで確認できます
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <StudioLogCard logs={state.logs} />
        </>
      )}

      {tab === "approval" && (
        <StudioApprovalPanel
          approvals={state.approvals}
          project={state.project}
          githubLogin={githubLogin}
          onApprove={(id, comment) => setState((prev) => approveRequest(prev, id, comment))}
          onReject={(id, comment) => setState((prev) => rejectRequest(prev, id, comment))}
          onExecute={handleExecute}
        />
      )}

      {tab === "output" && (
        <>
          {!state.project && state.archive && (
            <p className="text-muted-foreground text-center text-xs">
              完了プロジェクト「{state.archive.appName}」の成果物を表示しています。
            </p>
          )}
          <StudioFilePlanCard filePlan={state.project?.filePlan ?? state.archive?.filePlan ?? []} />
          <StudioPromptsCard prompts={state.project?.prompts ?? state.archive?.prompts ?? []} />
          <StudioDocsCard docs={state.project?.docs ?? state.archive?.docs ?? []} />
        </>
      )}

      {tab === "org" && (
        <>
          <StudioMeetingCard meetings={state.meetings} />
          <StudioEmployeeList employees={state.employees} />
        </>
      )}

      {/* 工程実行ボタン(固定)。実開発モード: 1回の実行で現在の工程を完了させる */}
      {state.project && (
        <div className="fixed inset-x-0 bottom-20 z-40 mx-auto w-full max-w-2xl px-4">
          <Button
            onClick={() => setState((prev) => advanceStudioDay(prev))}
            className="w-full gap-2 bg-indigo-600 py-5 text-sm font-bold text-white shadow-lg hover:bg-indigo-700"
          >
            <CalendarPlus className="size-4" />
            次の工程を実行する
          </Button>
        </div>
      )}
    </div>
  );
}
