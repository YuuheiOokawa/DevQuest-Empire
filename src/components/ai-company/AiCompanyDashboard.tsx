"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Plus,
  Smartphone,
  RotateCcw,
  Hammer,
  FolderGit2,
  ChevronRight,
  LayoutDashboard,
  Users,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CompanyStatusCard } from "@/components/ai-company/CompanyStatusCard";
import { AiEmployeeList } from "@/components/ai-company/AiEmployeeList";
import { ProjectProgressCard } from "@/components/ai-company/ProjectProgressCard";
import { ReleasedAppCard } from "@/components/ai-company/ReleasedAppCard";
import { DevelopmentLog } from "@/components/ai-company/DevelopmentLog";
import { NewProjectModal } from "@/components/ai-company/NewProjectModal";
import { TurnActionButton } from "@/components/ai-company/TurnActionButton";
import { RecruitGachaCard } from "@/components/ai-company/RecruitGachaCard";
import { InvestmentPanel } from "@/components/ai-company/InvestmentPanel";
import { TechTreePanel } from "@/components/ai-company/TechTreePanel";
import { MeetingLogCard } from "@/components/ai-company/MeetingLogCard";
import { DesignDocsCard } from "@/components/ai-company/DesignDocsCard";
import { CodeQualityCard } from "@/components/ai-company/CodeQualityCard";
import {
  advanceTurn,
  canStartProject,
  loadState,
  recruitEmployee,
  resetState,
  startProject,
  startResearch,
  upgradeInvestment,
} from "@/services/aiCompanyService";
import type { AppIdea, GameState, InvestmentKind } from "@/services/aiCompanyTypes";

const AUTO_INTERVAL_MS = 1800;

type DashboardTab = "office" | "members" | "docs";

const DASHBOARD_TABS: { id: DashboardTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "office", label: "経営", icon: LayoutDashboard },
  { id: "members", label: "社員・採用", icon: Users },
  { id: "docs", label: "会議・資料", icon: FileText },
];

// AI Software Companyのメイン画面。状態はlocalStorageに保存され、
// シミュレーションは全てルールベースでクライアント側で動く。
export function AiCompanyDashboard() {
  const [state, setState] = useState<GameState>(() => loadState());
  const [tab, setTab] = useState<DashboardTab>("office");
  const [modalOpen, setModalOpen] = useState(false);
  const [autoRunning, setAutoRunning] = useState(false);
  const autoTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!autoRunning) {
      if (autoTimer.current) clearInterval(autoTimer.current);
      autoTimer.current = null;
      return;
    }
    autoTimer.current = setInterval(() => {
      setState((prev) => advanceTurn(prev));
    }, AUTO_INTERVAL_MS);
    return () => {
      if (autoTimer.current) clearInterval(autoTimer.current);
      autoTimer.current = null;
    };
  }, [autoRunning]);

  const startCheck = canStartProject(state);

  const handleStart = (idea: AppIdea) => {
    setState((prev) => startProject(prev, idea));
    setModalOpen(false);
  };

  const handleReset = () => {
    if (window.confirm("会社データをリセットして最初からやり直しますか?")) {
      setAutoRunning(false);
      setState(resetState());
    }
  };

  const docsToShow = state.project
    ? { appName: state.project.idea.name, docs: state.project.docs }
    : state.docsArchive;

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* タブ切り替え */}
      <div className="flex gap-1">
        {DASHBOARD_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-xs transition-colors ${
              tab === t.id ? "bg-foreground text-background font-semibold" : "hover:bg-accent"
            }`}
          >
            <t.icon className="size-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "office" && (
        <>
          <CompanyStatusCard company={state.company} appCount={state.apps.length} turn={state.turn} />

          {state.project ? (
            <>
              <ProjectProgressCard project={state.project} employees={state.employees} />
              <CodeQualityCard codeQuality={state.project.codeQuality} />
            </>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
                <Hammer className="text-muted-foreground size-8" />
                <p className="text-muted-foreground text-sm">
                  進行中のプロジェクトはありません。
                  <br />
                  AI社員に新しいアプリの企画を出させましょう。
                </p>
                <Button
                  onClick={() => setModalOpen(true)}
                  disabled={!startCheck.ok}
                  className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  <Plus className="size-4" />
                  新規プロジェクト開始
                </Button>
                {!startCheck.ok && startCheck.reason && (
                  <p className="text-destructive text-xs">{startCheck.reason}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* 社内GitHubへの入口 */}
          <Link href="/ai-company/github">
            <Card className="transition-colors hover:bg-accent">
              <CardContent className="flex items-center gap-3 py-3.5">
                <FolderGit2 className="size-5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">社内GitHub</p>
                  <p className="text-muted-foreground text-[11px]">
                    Commit {state.github.commits.length} ・ PR {state.github.pullRequests.length} ・ Issue{" "}
                    {state.github.issues.filter((i) => i.status === "open").length} open
                  </p>
                </div>
                <ChevronRight className="text-muted-foreground size-4 shrink-0" />
              </CardContent>
            </Card>
          </Link>

          <InvestmentPanel
            investments={state.investments}
            funds={state.company.funds}
            onUpgrade={(kind: InvestmentKind) => setState((prev) => upgradeInvestment(prev, kind))}
          />

          <TechTreePanel state={state} onResearch={(id) => setState((prev) => startResearch(prev, id))} />

          <Card>
            <CardContent className="flex flex-col gap-2.5 py-4">
              <h3 className="flex items-center gap-1.5 font-semibold">
                <Smartphone className="text-primary size-4" />
                完成アプリ({state.apps.length}本)
              </h3>
              {state.apps.length === 0 ? (
                <p className="text-muted-foreground text-xs">
                  まだリリースしたアプリはありません。最初のアプリを世に送り出しましょう!
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {state.apps.map((app) => (
                    <ReleasedAppCard key={app.id} app={app} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <DevelopmentLog logs={state.logs} />
        </>
      )}

      {tab === "members" && (
        <>
          <RecruitGachaCard
            funds={state.company.funds}
            employeeCount={state.employees.length}
            onRecruit={() => setState((prev) => recruitEmployee(prev))}
          />
          <AiEmployeeList employees={state.employees} project={state.project} />
        </>
      )}

      {tab === "docs" && (
        <>
          <MeetingLogCard meetings={state.meetings} />
          <DesignDocsCard docs={docsToShow?.docs ?? []} appName={docsToShow?.appName ?? null} />
        </>
      )}

      <div className="flex items-center justify-between">
        <p className="text-muted-foreground flex items-center gap-1 text-[11px]">
          <Building2 className="size-3" />
          セーブデータはこの端末のブラウザに保存されます
        </p>
        <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground gap-1 text-xs">
          <RotateCcw className="size-3" />
          リセット
        </Button>
      </div>

      <TurnActionButton
        onAdvance={() => setState((prev) => advanceTurn(prev))}
        autoRunning={autoRunning}
        onToggleAuto={() => setAutoRunning((prev) => !prev)}
      />

      {modalOpen && <NewProjectModal onStart={handleStart} onClose={() => setModalOpen(false)} />}
    </div>
  );
}
