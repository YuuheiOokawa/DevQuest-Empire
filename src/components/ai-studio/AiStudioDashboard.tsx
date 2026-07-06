"use client";

import { useState } from "react";
import {
  CalendarPlus,
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
import { StudioMarketCard } from "@/components/ai-studio/StudioMarketCard";
import { StudioMeetingCard } from "@/components/ai-studio/StudioMeetingCard";
import { StudioPipelineCard } from "@/components/ai-studio/StudioPipelineCard";
import { StudioPromptsCard } from "@/components/ai-studio/StudioPromptsCard";
import { StudioProposalPicker } from "@/components/ai-studio/StudioProposalPicker";
import {
  advanceStudioDay,
  approveRequest,
  holdPlanningMeeting,
  loadStudioState,
  rejectRequest,
  resetStudioState,
  startStudioProject,
} from "@/services/aiStudioService";
import type { StudioState } from "@/services/aiStudioTypes";

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

  const pendingApprovals = state.approvals.filter((a) => a.status === "pending").length;

  const handleReset = () => {
    if (window.confirm("スタジオのデータをリセットして最初からやり直しますか?")) {
      setState(resetStudioState());
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* ステータスヘッダー */}
      <Card>
        <CardContent className="flex items-center justify-between py-3.5">
          <div className="flex items-center gap-4 text-xs">
            <span className="font-semibold">Day {state.day}</span>
            <span className="text-muted-foreground flex items-center gap-1">
              <FolderGit2 className="size-3.5" />
              完成 {state.completedProjects.length} repo
            </span>
            {state.project && (
              <span className="text-muted-foreground truncate">開発中: {state.project.proposal.appName}</span>
            )}
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
          {state.project ? (
            <>
              <StudioPipelineCard project={state.project} employees={state.employees} />
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
                  完成したRepository
                </h3>
                {state.completedProjects.map((p) => (
                  <div key={p.repoName} className="flex items-center justify-between rounded-lg border px-2.5 py-2 text-xs">
                    <span className="font-semibold">{p.appName}</span>
                    <span className="text-muted-foreground font-mono">{p.repoName}</span>
                    <span className="text-muted-foreground text-[10px]">Day {p.deployedDay} デプロイ</span>
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
          onApprove={(id) => setState((prev) => approveRequest(prev, id))}
          onReject={(id) => setState((prev) => rejectRequest(prev, id))}
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
          <StudioMarketCard insights={state.insights} />
          <StudioMeetingCard meetings={state.meetings} />
          <StudioEmployeeList employees={state.employees} />
        </>
      )}

      {/* 1日進めるボタン(固定) */}
      <div className="fixed inset-x-0 bottom-20 z-40 mx-auto w-full max-w-2xl px-4">
        <Button
          onClick={() => setState((prev) => advanceStudioDay(prev))}
          className="w-full gap-2 bg-indigo-600 py-5 text-sm font-bold text-white shadow-lg hover:bg-indigo-700"
        >
          <CalendarPlus className="size-4" />
          1日進める(Day {state.day} → {state.day + 1})
        </Button>
      </div>
    </div>
  );
}
