import { prisma } from "@/lib/prisma";
import { getSettlementInfo } from "@/lib/game/buildings";
import { getQualificationsView } from "@/lib/game/qualifications";
import { computeActivityMetrics } from "@/lib/game/metrics";
import {
  getCodeReviewReport,
  getCertificationSuggestion,
  getWorldAdvice,
} from "@/lib/ai/suggestions";

// AI社員は村がTier5(帝国)以上に発展すると「雇用」される、ルールベースの
// 自動アドバイザー。既存のsuggestions.tsのロジックをキャラクター付きの
// レポートとして再構成しているだけで、新たな有料API呼び出しは発生しない。
export const AI_EMPLOYEE_UNLOCK_TIER = 5;

export type AiEmployeeRole = "reviewer" | "coach" | "strategist";

export type AiEmployeeView = {
  id: string;
  name: string;
  role: AiEmployeeRole;
  roleLabel: string;
  report: string;
};

export type AiEmployeesResult = {
  unlocked: boolean;
  currentTier: number;
  employees: AiEmployeeView[];
};

export async function getAiEmployeesView(userId: string): Promise<AiEmployeesResult | null> {
  const settlement = await getSettlementInfo(userId);
  if (!settlement) return null;

  if (settlement.tier < AI_EMPLOYEE_UNLOCK_TIER) {
    return { unlocked: false, currentTier: settlement.tier, employees: [] };
  }

  const player = await prisma.player.findUnique({ where: { userId } });
  if (!player) return null;

  const [metrics, qualifications] = await Promise.all([
    computeActivityMetrics(userId, player.level),
    getQualificationsView(userId),
  ]);

  const certification = getCertificationSuggestion(qualifications);

  const employees: AiEmployeeView[] = [
    {
      id: "reviewer",
      name: "コードレビュアー・アリア",
      role: "reviewer",
      roleLabel: "コードレビュー担当",
      report: getCodeReviewReport(metrics),
    },
    {
      id: "coach",
      name: "学習コーチ・ルナ",
      role: "coach",
      roleLabel: "学習コーチ",
      report: `${certification.title} — ${certification.description}`,
    },
    {
      id: "strategist",
      name: "戦略アドバイザー・ゼノン",
      role: "strategist",
      roleLabel: "村づくり戦略",
      report: getWorldAdvice(settlement),
    },
  ];

  return { unlocked: true, currentTier: settlement.tier, employees };
}
