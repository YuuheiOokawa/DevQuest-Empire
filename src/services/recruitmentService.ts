import {
  GACHA_RATES,
  LANGUAGE_POOL,
  NAME_POOL,
  PERSONALITY_POOL,
  SPECIALTY_BY_ROLE,
  TECH_POOL,
} from "@/data/personaTemplates";
import type { AiEmployee, EmployeeRole, Rarity } from "@/services/aiCompanyTypes";

// AI社員の採用ガチャ。レアリティ抽選→人格と能力値をランダム生成する。

export const GACHA_COST = 20000;
export const MAX_EMPLOYEES = 12;

const ROLES: EmployeeRole[] = [
  "プロダクトマネージャー",
  "UI/UXデザイナー",
  "フロントエンドエンジニア",
  "バックエンドエンジニア",
  "AIエンジニア",
  "QAエンジニア",
  "マーケター",
];

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rollRarity(): Rarity {
  const total = GACHA_RATES.reduce((sum, r) => sum + r.rate, 0);
  let roll = Math.random() * total;
  for (const entry of GACHA_RATES) {
    roll -= entry.rate;
    if (roll <= 0) return entry.rarity;
  }
  return "N";
}

function statIn(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function rollNewEmployee(existing: AiEmployee[], count: number): AiEmployee {
  const rarity = rollRarity();
  const band = GACHA_RATES.find((r) => r.rarity === rarity)!;
  const usedNames = new Set(existing.map((e) => e.name));
  const namePool = NAME_POOL.filter((n) => !usedNames.has(n));
  const name = namePool.length > 0 ? pick(namePool) : `${pick(NAME_POOL)}${count + 1}号`;
  const role = pick(ROLES);
  const likes = pick(TECH_POOL);
  let dislikes = pick(TECH_POOL);
  if (dislikes === likes) dislikes = "レガシーコード";
  const favLanguage = pick(LANGUAGE_POOL);
  let weakLanguage = pick(LANGUAGE_POOL);
  if (weakLanguage === favLanguage) weakLanguage = "COBOL";

  // 職種に対応するメインスキルは高め、その他は低めに出す
  const main = () => statIn(band.statMin + 10, Math.min(100, band.statMax + 5));
  const sub = () => statIn(Math.max(10, band.statMin - 15), band.statMax - 10);

  const byRole: Record<EmployeeRole, Partial<Pick<AiEmployee, "planning" | "design" | "coding" | "testing">>> = {
    "プロダクトマネージャー": { planning: main() },
    "UI/UXデザイナー": { design: main() },
    "フロントエンドエンジニア": { coding: main(), design: statIn(band.statMin, band.statMax) },
    "バックエンドエンジニア": { coding: main() },
    "AIエンジニア": { coding: main() },
    "QAエンジニア": { testing: main() },
    "マーケター": { planning: main() },
  };

  return {
    id: `emp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name,
    role,
    level: 1,
    exp: 0,
    specialty: pick(SPECIALTY_BY_ROLE[role]),
    rarity,
    personality: pick(PERSONALITY_POOL),
    likes,
    dislikes,
    favLanguage,
    weakLanguage,
    speed: statIn(band.statMin, band.statMax),
    quality: statIn(band.statMin, band.statMax),
    planning: sub(),
    design: sub(),
    coding: sub(),
    testing: sub(),
    ...byRole[role],
    focus: statIn(band.statMin, band.statMax),
    overtimeTolerance: statIn(30, 90),
    growthRate: Math.round((0.9 + Math.random() * 0.4 + (band.statMin - 30) / 200) * 100) / 100,
    stamina: 100,
    motivation: statIn(75, 95),
    stress: statIn(5, 20),
    skills: [likes],
    salary: band.salaryBase + statIn(0, 200),
  };
}
