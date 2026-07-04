import { redirect } from "next/navigation";
import { Bot } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActivitySummary } from "@/lib/game/activity";
import { computeActivityMetrics } from "@/lib/game/metrics";
import { getSettlementInfo } from "@/lib/game/buildings";
import { getQualificationsView } from "@/lib/game/qualifications";
import {
  getLearningSuggestion,
  getCertificationSuggestion,
  getWorldAdvice,
} from "@/lib/ai/suggestions";
import { AppShell } from "@/components/layout/AppShell";
import { AiAssistantCard } from "@/components/ai/AiAssistantCard";
import { AiEmployeeCard } from "@/components/ai/AiEmployeeCard";
import { GithubAnalysisCard } from "@/components/ai/GithubAnalysisCard";
import { LearningSuggestionCard } from "@/components/ai/LearningSuggestionCard";
import { CertificationSuggestionCard } from "@/components/ai/CertificationSuggestionCard";
import { WorldAdviceCard } from "@/components/ai/WorldAdviceCard";

export default async function AiPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId = session.user.id;

  const player = await prisma.player.findUniqueOrThrow({ where: { userId } });

  const [activity, settlement, qualifications, metrics] = await Promise.all([
    getActivitySummary(userId),
    getSettlementInfo(userId),
    getQualificationsView(userId),
    computeActivityMetrics(userId, player.level),
  ]);

  const learningSuggestion = getLearningSuggestion(metrics);
  const certificationSuggestion = getCertificationSuggestion(qualifications);
  const worldAdvice = getWorldAdvice(settlement);

  return (
    <AppShell>
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

        <AiAssistantCard />
        <AiEmployeeCard />
        <GithubAnalysisCard activity={activity} />
        <LearningSuggestionCard suggestion={learningSuggestion} />
        <CertificationSuggestionCard suggestion={certificationSuggestion} />
        <WorldAdviceCard advice={worldAdvice} />
      </main>
    </AppShell>
  );
}
