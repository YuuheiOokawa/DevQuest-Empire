import type { CompanyState, ReleasedApp } from "@/services/aiCompanyTypes";

// 会社ステータスの成長ロジック。経験値はリリースや売上で貯まり、
// 100ごとに会社レベルが1上がる。

export function companyLevelFor(exp: number): number {
  return 1 + Math.floor(exp / 100);
}

export function applyReleaseGrowth(
  company: CompanyState,
  app: ReleasedApp
): { company: CompanyState; messages: string[] } {
  const messages: string[] = [];
  const next = { ...company };

  const repGain = Math.max(1, Math.round(app.rating * 2));
  const expGain = 40 + Math.round(app.quality / 4);
  const fanGain = Math.max(5, Math.round(app.users / 20));

  next.reputation += repGain;
  next.exp += expGain;
  next.fans += fanGain;
  next.tech = Math.min(999, next.tech + 3);
  next.designPower = Math.min(999, next.designPower + 2);
  next.planningPower = Math.min(999, next.planningPower + 2);
  next.marketing = Math.min(999, next.marketing + 2);

  messages.push(`会社の評判が +${repGain} 上がりました`);
  messages.push(`ファンが ${fanGain}人 増えました`);

  const newLevel = companyLevelFor(next.exp);
  if (newLevel > next.level) {
    next.level = newLevel;
    messages.push(`会社レベルが ${newLevel} に上がりました!`);
  }

  return { company: next, messages };
}

export function applyRevenueGrowth(company: CompanyState, income: number): CompanyState {
  if (income <= 0) return company;
  const next = { ...company };
  next.funds += income;
  next.totalRevenue += income;
  // 売上10,000円ごとに経験値+10相当をなだらかに加算
  next.exp += Math.max(0, Math.round(income / 1000));
  next.level = companyLevelFor(next.exp);
  return next;
}
