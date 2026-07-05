// AI会社経営シミュレーションの型定義。
// MVP: 実際のAI APIは使わず、ルールベース+localStorage保存で完結する。

export type EmployeeRole =
  | "プロダクトマネージャー"
  | "UI/UXデザイナー"
  | "フロントエンドエンジニア"
  | "バックエンドエンジニア"
  | "AIエンジニア"
  | "QAエンジニア"
  | "マーケター";

export type Rarity = "N" | "R" | "SR" | "SSR" | "UR";

export type AiEmployee = {
  id: string;
  name: string;
  role: EmployeeRole;
  level: number;
  exp: number;
  specialty: string;
  rarity: Rarity;
  // 能力値(0〜100)
  speed: number;
  quality: number;
  planning: number;
  design: number;
  coding: number;
  testing: number;
  // 状態(0〜100)
  stamina: number;
  motivation: number;
  // 週給(円)
  salary: number;
};

export type AppIdea = {
  id: string;
  name: string;
  genre: string;
  target: string;
  problem: string;
  solution: string;
  features: string[];
  monetization: string;
  estWeeks: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  marketSize: 1 | 2 | 3 | 4 | 5;
  successRate: number; // 0-100
};

export type PhaseId =
  | "planning"
  | "requirements"
  | "uiDesign"
  | "dbDesign"
  | "apiDesign"
  | "frontend"
  | "backend"
  | "testing"
  | "bugfix"
  | "release"
  | "operation";

export type ProjectPhaseState = {
  id: PhaseId;
  progress: number;
  required: number;
  assigneeId: string | null;
  done: boolean;
};

export type Project = {
  id: string;
  idea: AppIdea;
  phaseIndex: number;
  phases: ProjectPhaseState[];
  quality: number;
  designScore: number;
  functionality: number;
  stability: number;
  bugs: number;
  startedTurn: number;
};

export type ReleasedApp = {
  id: string;
  name: string;
  genre: string;
  quality: number;
  designScore: number;
  functionality: number;
  stability: number;
  bugs: number;
  users: number;
  rating: number; // 1.0-5.0
  monthlyRevenue: number;
  totalRevenue: number;
  releasedTurn: number;
  status: "運用中" | "成長中" | "安定運用";
};

export type CompanyState = {
  name: string;
  level: number;
  exp: number;
  funds: number;
  reputation: number;
  tech: number;
  designPower: number;
  planningPower: number;
  marketing: number;
  fans: number;
  totalRevenue: number;
};

export type LogKind = "info" | "success" | "warning" | "release" | "money";

export type LogEntry = {
  id: number;
  turn: number;
  kind: LogKind;
  message: string;
};

export type GameState = {
  version: number;
  turn: number;
  company: CompanyState;
  employees: AiEmployee[];
  project: Project | null;
  apps: ReleasedApp[];
  logs: LogEntry[];
  nextLogId: number;
};
