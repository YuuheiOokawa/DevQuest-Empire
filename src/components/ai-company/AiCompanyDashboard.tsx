"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, Plus, Smartphone, RotateCcw, Hammer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CompanyStatusCard } from "@/components/ai-company/CompanyStatusCard";
import { AiEmployeeList } from "@/components/ai-company/AiEmployeeList";
import { ProjectProgressCard } from "@/components/ai-company/ProjectProgressCard";
import { ReleasedAppCard } from "@/components/ai-company/ReleasedAppCard";
import { DevelopmentLog } from "@/components/ai-company/DevelopmentLog";
import { NewProjectModal } from "@/components/ai-company/NewProjectModal";
import { TurnActionButton } from "@/components/ai-company/TurnActionButton";
import {
  advanceTurn,
  canStartProject,
  loadState,
  resetState,
  startProject,
} from "@/services/aiCompanyService";
import type { AppIdea, GameState } from "@/services/aiCompanyTypes";

const AUTO_INTERVAL_MS = 1800;

// AI会社経営のメイン画面。状態はlocalStorageに保存されるため、
// サーバー側のDBは使わない(MVP: ブラウザ単位のセーブデータ)。
export function AiCompanyDashboard() {
  // このコンポーネントはssr:falseで読み込まれるため、初期化時に
  // localStorageから直接ロードできる(AiCompanyClient参照)。
  const [state, setState] = useState<GameState>(() => loadState());
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

  return (
    <div className="flex flex-col gap-4 pb-24">
      <CompanyStatusCard company={state.company} appCount={state.apps.length} turn={state.turn} />

      {/* 進行中プロジェクト or 新規開始 */}
      {state.project ? (
        <ProjectProgressCard project={state.project} employees={state.employees} />
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

      <AiEmployeeList employees={state.employees} project={state.project} />

      {/* 完成アプリ一覧 */}
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
