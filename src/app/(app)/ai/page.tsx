import { redirect } from "next/navigation";
import Link from "next/link";
import { Bot, Building2, ChevronRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActivitySummary } from "@/lib/game/activity";
import { computeActivityMetrics } from "@/lib/game/metrics";
import { getSettlementInfo } from "@/lib/game/buildings";
import { getQualificationsView } from "@/lib/game/qualifications";
import { getOrCreateTodaysQuest } from "@/lib/game/quest";
import { recalcLevel } from "@/lib/game/exp";
import { getAiEmployeesView } from "@/lib/game/aiEmployees";
import { getActivitySummarySince, getActivityHeatmap } from "@/services/githubService";
import {
  getLearningSuggestion,
  getCertificationSuggestion,
  getWorldAdvice,
  getLevelUpSuggestion,
} from "@/lib/ai/suggestions";
import { getNextProjectSuggestions } from "@/lib/ai/projectIdeas";
import { AiAssistantPanel } from "@/components/ai/AiAssistantPanel";
import { AiEmployeeCard } from "@/components/ai/AiEmployeeCard";
import { GithubAnalysisCard } from "@/components/ai/GithubAnalysisCard";
import { LearningSuggestionCard } from "@/components/ai/LearningSuggestionCard";
import { CertificationSuggestionCard } from "@/components/ai/CertificationSuggestionCard";
import { WorldAdviceCard } from "@/components/ai/WorldAdviceCard";
import { LevelUpSuggestionCard } from "@/components/ai/LevelUpSuggestionCard";
import { NextProjectCard } from "@/components/ai/NextProjectCard";
import { Card, CardContent } from "@/components/ui/card";

export default async function AiPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId = session.user.id;

  const player = await prisma.player.findUniqueOrThrow({ where: { userId } });

  const [
    activity,
    settlement,
    qualifications,
    metrics,
    last30Days,
    heatmap,
    todaysQuest,
    aiEmployees,
  ] = await Promise.all([
    getActivitySummary(userId),
    getSettlementInfo(userId),
    getQualificationsView(userId),
    computeActivityMetrics(userId, player.level),
    getActivitySummarySince(userId, 30),
    getActivityHeatmap(userId, 84),
    getOrCreateTodaysQuest(userId),
    getAiEmployeesView(userId),
  ]);

  const { currentExp, expToNextLevel } = recalcLevel(player.exp);
  const learningSuggestion = getLearningSuggestion(metrics);
  const certificationSuggestion = getCertificationSuggestion(qualifications);
  const worldAdvice = getWorldAdvice(settlement);
  const levelUpSuggestion = getLevelUpSuggestion(
    currentExp,
    expToNextLevel,
    todaysQuest.status === "completed"
  );
  const nextProjectSuggestions = getNextProjectSuggestions(player.level, qualifications);
  const nextProjectSuggestion = nextProjectSuggestions[0]
    ? `${nextProjectSuggestions[0].idea.title} — ${nextProjectSuggestions[0].idea.description}`
    : "現在提案できるプロジェクトがありません。";

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      <div className="space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Bot className="text-primary size-6" />
          AI
        </h1>
        <p className="text-muted-foreground text-sm">
          DevQuest Empire独自のAI機能。現在はMVPとして基本的な分析・提案のみ提供しています。
        </p>
      </div>

      <AiAssistantPanel
        playerName={player.name}
        githubComment={activity.aiComment}
        learningSuggestion={learningSuggestion}
        certificationSuggestion={`${certificationSuggestion.title} — ${certificationSuggestion.description}`}
        worldAdvice={worldAdvice}
        levelUpSuggestion={levelUpSuggestion}
        nextProjectSuggestion={nextProjectSuggestion}
      />

      <GithubAnalysisCard
        activity={activity}
        last30Days={last30Days}
        heatmap={heatmap}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <LearningSuggestionCard suggestion={learningSuggestion} />
        <CertificationSuggestionCard suggestion={certificationSuggestion} />
        <WorldAdviceCard advice={worldAdvice} />
        <LevelUpSuggestionCard suggestion={levelUpSuggestion} />
      </div>

      <NextProjectCard suggestions={nextProjectSuggestions} />

      {/* AI会社経営への入口 */}
      <Link href="/ai-company">
        <Card className="border-emerald-300 bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 transition-transform hover:-translate-y-0.5 dark:border-emerald-800 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-sky-950/30">
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30">
              <Building2 className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="flex items-center gap-1 font-bold">
                AI会社経営
                <span className="rounded-md bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  NEW
                </span>
              </h3>
              <p className="text-muted-foreground text-xs">
                AI社員たちがアプリを企画・開発・リリース。あなたは社長として会社を育てましょう。
              </p>
            </div>
            <ChevronRight className="text-muted-foreground size-5 shrink-0" />
          </CardContent>
        </Card>
      </Link>

      <AiEmployeeCard result={aiEmployees} />

      <p className="text-muted-foreground text-center text-xs">
        学習提案・資格提案・発展提案・レベルアップ提案・次のプロジェクト提案は無料のルールベースロジックで生成しています。
        将来的にOpenAI/Gemini/Claude等の有料APIと連携し、より柔軟な対話・提案に拡張する構想です(未実装・費用発生のため導入は別途判断)。
      </p>
    </main>
  );
}
