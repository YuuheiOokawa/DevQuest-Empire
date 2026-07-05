import type { AiEmployee, CompanyState, ReleasedApp } from "@/services/aiCompanyTypes";
import { APP_IDEA_TEMPLATES } from "@/data/appIdeaTemplates";

// 完成アプリの売上・ユーザー数・評価のシミュレーション。
// 1ターン=1週間。monthlyRevenueは現在の月商レート、毎ターンその1/4が入金される。

function marketFactorOf(genre: string): number {
  const template = APP_IDEA_TEMPLATES.find((t) => t.genre === genre);
  const size = template?.marketSize ?? 3;
  return 0.7 + size * 0.15; // 市場規模1: 0.85 〜 5: 1.45
}

export function computeRating(app: Pick<ReleasedApp, "quality" | "designScore" | "stability" | "bugs">): number {
  const raw =
    1.6 +
    app.quality / 45 +
    app.designScore / 60 +
    app.stability / 70 -
    app.bugs * 0.12;
  return Math.round(Math.min(5, Math.max(1, raw)) * 10) / 10;
}

export function computeMonthlyRevenue(app: ReleasedApp): number {
  const base = app.quality * 60 + app.functionality * 45 + app.users * 6;
  const ratingFactor = 0.5 + app.rating / 5;
  const bugPenalty = Math.max(0.5, 1 - app.bugs * 0.05);
  const revenue = base * marketFactorOf(app.genre) * ratingFactor * bugPenalty;
  return Math.max(0, Math.round(revenue / 100) * 100);
}

export function initialUsers(company: CompanyState, marketing: number): number {
  return 80 + Math.round(marketing * 2.5 + company.reputation * 4 + company.fans * 0.5);
}

// 毎ターンの運用シミュレーション。ユーザー増減・売上・たまのバグ修正を行う。
export function simulateAppTurn(
  app: ReleasedApp,
  company: CompanyState,
  marketer: AiEmployee | undefined
): { app: ReleasedApp; income: number; events: string[] } {
  const events: string[] = [];
  const next = { ...app };

  // ユーザー成長: マーケターの企画力・会社の評判・アプリ評価で伸びる
  const marketerPower = marketer ? (marketer.planning + marketer.speed) / 2 : 20;
  const growthRate = 0.01 + marketerPower / 4000 + Math.max(0, next.rating - 3) * 0.01;
  const churn = next.bugs > 5 ? 0.015 : 0;
  const delta = Math.round(next.users * (growthRate - churn) + next.rating * 2);
  next.users = Math.max(10, next.users + delta);

  // まれに運用でバグが直る/小さな改善が入る
  if (next.bugs > 0 && Math.random() < 0.3) {
    next.bugs -= 1;
    events.push(`「${next.name}」の不具合が1件修正されました`);
  }
  if (Math.random() < 0.12) {
    next.quality = Math.min(100, next.quality + 1);
    events.push(`「${next.name}」に小さな改善が入りました(品質 +1)`);
  }

  next.rating = computeRating(next);
  next.monthlyRevenue = computeMonthlyRevenue(next);
  const income = Math.round(next.monthlyRevenue / 4 / 10) * 10;
  next.totalRevenue += income;

  // 運用状態の表示ラベル
  next.status = delta > next.users * 0.02 ? "成長中" : next.bugs <= 2 ? "安定運用" : "運用中";

  return { app: next, income, events };
}
