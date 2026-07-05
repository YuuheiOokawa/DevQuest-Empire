import { APP_IDEA_TEMPLATES } from "@/data/appIdeaTemplates";
import type { AppIdea } from "@/services/aiCompanyTypes";

// MVP: ルールベースのアプリ企画自動生成。テンプレートからランダムに
// 組み合わせて企画書を作る。将来AI APIに置き換える場合はこの関数の
// 中身だけ差し替えれば良い構成にしている。

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickMany<T>(arr: readonly T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function generateAppIdea(): AppIdea {
  const template = pick(APP_IDEA_TEMPLATES);
  const name = `${pick(template.namePrefixes)} ${pick(template.nameSuffixes)}`;
  const difficulty = Math.min(
    5,
    Math.max(1, template.baseDifficulty + (Math.random() > 0.7 ? 1 : 0))
  ) as AppIdea["difficulty"];
  const estWeeks = 8 + difficulty * 2 + Math.floor(Math.random() * 3);
  // 成功率: 市場が大きいほど高く、難易度が高いほど低い
  const successRate = Math.min(
    95,
    Math.max(30, 45 + template.marketSize * 10 - difficulty * 6 + Math.floor(Math.random() * 10))
  );

  return {
    id: `idea-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    name,
    genre: template.genre,
    target: pick(template.targets),
    problem: pick(template.problems),
    solution: pick(template.solutions),
    features: pickMany(template.featurePool, 3 + Math.floor(Math.random() * 2)),
    monetization: pick(template.monetizations),
    estWeeks,
    difficulty,
    marketSize: template.marketSize,
    successRate,
  };
}

export function generateIdeaCandidates(count = 3): AppIdea[] {
  const ideas: AppIdea[] = [];
  const usedGenres = new Set<string>();
  let guard = 0;
  while (ideas.length < count && guard < 30) {
    guard++;
    const idea = generateAppIdea();
    if (usedGenres.has(idea.genre)) continue;
    usedGenres.add(idea.genre);
    ideas.push(idea);
  }
  return ideas;
}
