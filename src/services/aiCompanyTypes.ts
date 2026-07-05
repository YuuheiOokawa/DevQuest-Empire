// AI Software Company(AI開発会社シミュレーター)の型定義。
// v2: 人格・会議・設計書・GitHubシミュレーション・技術ツリー・採用・経営を追加。
// 実際のAI APIは使わず、ルールベース+localStorage保存で完結する。

export type EmployeeRole =
  | "プロダクトマネージャー"
  | "UI/UXデザイナー"
  | "フロントエンドエンジニア"
  | "バックエンドエンジニア"
  | "AIエンジニア"
  | "QAエンジニア"
  | "マーケター";

export type Rarity = "N" | "R" | "SR" | "SSR" | "UR" | "LR" | "神話" | "伝説";

export type Mood = "絶好調" | "好調" | "普通" | "お疲れ" | "ピリピリ";

export type AiEmployee = {
  id: string;
  name: string;
  role: EmployeeRole;
  level: number;
  exp: number;
  specialty: string;
  rarity: Rarity;
  // 人格
  personality: string;
  likes: string; // 好きな技術
  dislikes: string; // 嫌いな技術
  favLanguage: string;
  weakLanguage: string;
  // 能力値(0〜100)
  speed: number;
  quality: number;
  planning: number;
  design: number;
  coding: number;
  testing: number;
  focus: number; // 集中力
  overtimeTolerance: number; // 残業耐性
  growthRate: number; // 成長速度(1.0前後)
  // 状態(0〜100)
  stamina: number;
  motivation: number;
  stress: number;
  // 習得技術
  skills: string[];
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
  successRate: number;
};

// 細分化された開発工程(17工程)
export type PhaseId =
  | "planning"
  | "requirements"
  | "screenDesign"
  | "erDiagram"
  | "apiDesign"
  | "authDesign"
  | "dbDesign"
  | "uiImpl"
  | "apiImpl"
  | "review"
  | "ci"
  | "testing"
  | "bugfix"
  | "beta"
  | "release"
  | "operation"
  | "update";

export type ProjectPhaseState = {
  id: PhaseId;
  progress: number;
  required: number;
  assigneeId: string | null;
  done: boolean;
};

// 設計書(AI社員がダミー生成する開発ドキュメント)
export type DesignDocType =
  | "charter"
  | "requirements"
  | "screenDesign"
  | "dbDesign"
  | "apiDesign"
  | "folderStructure"
  | "techStack"
  | "implPlan"
  | "releasePlan"
  | "mvpScope"
  | "risk"
  | "backlog"
  | "sprint"
  | "review";

export type DesignDoc = {
  id: string;
  type: DesignDocType;
  title: string;
  lines: string[];
  turn: number;
};

// コード品質(売上へ影響する)
export type CodeQuality = {
  readability: number; // 可読性
  maintainability: number; // 保守性
  testCoverage: number; // テスト率
  duplication: number; // 重複率(低いほど良い)
  techDebt: number; // 技術負債(低いほど良い)
  designQuality: number; // 設計品質
  bugRate: number; // バグ率(低いほど良い)
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
  codeQuality: CodeQuality;
  reviewScore: number;
  sprint: number;
  docs: DesignDoc[];
  startedTurn: number;
};

export type ReleasedApp = {
  id: string;
  name: string;
  genre: string;
  version: string;
  quality: number;
  designScore: number;
  functionality: number;
  stability: number;
  qualityIndex: number; // コード品質から算出した売上係数(0.6〜1.4)
  bugs: number;
  users: number;
  rating: number;
  monthlyRevenue: number;
  totalRevenue: number;
  releasedTurn: number;
  status: "運用中" | "成長中" | "安定運用";
};

// --- GitHubシミュレーション ---
export type GhCommit = {
  id: string;
  sha: string;
  message: string;
  author: string;
  branch: string;
  files: { name: string; adds: number; dels: number }[];
  turn: number;
};

export type GhPullRequest = {
  number: number;
  title: string;
  author: string;
  reviewer: string | null;
  branch: string;
  status: "open" | "merged" | "changes_requested";
  adds: number;
  dels: number;
  turn: number;
};

export type GhIssue = {
  number: number;
  title: string;
  author: string;
  status: "open" | "closed";
  label: "bug" | "enhancement" | "task";
  turn: number;
};

export type GhReview = {
  id: string;
  prNumber: number;
  reviewer: string;
  comment: string;
  verdict: "approve" | "request_changes";
  turn: number;
};

export type GhBranch = { name: string; author: string; active: boolean; turn: number };

export type GhRelease = { tag: string; name: string; notes: string; turn: number };

export type GithubSim = {
  commits: GhCommit[];
  pullRequests: GhPullRequest[];
  issues: GhIssue[];
  reviews: GhReview[];
  branches: GhBranch[];
  releases: GhRelease[];
  nextPr: number;
  nextIssue: number;
};

// --- AI会議 ---
export type MeetingCategory = "企画" | "設計" | "レビュー" | "改善" | "売上分析";

export type Meeting = {
  id: string;
  turn: number;
  category: MeetingCategory;
  topic: string;
  utterances: { name: string; line: string }[];
  conclusion: string;
};

// --- 経営(投資) ---
export type InvestmentKind =
  | "facility" // 設備
  | "welfare" // 福利厚生
  | "education" // 教育
  | "advertising" // 広告
  | "server" // サーバー/クラウド
  | "marketing" // マーケティング
  | "sales"; // 営業

export type Investments = Record<InvestmentKind, number>;

// --- 技術ツリー ---
export type ResearchState = {
  completed: string[];
  current: { nodeId: string; remaining: number } | null;
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

export type LogKind =
  | "info"
  | "success"
  | "warning"
  | "release"
  | "money"
  | "talk"
  | "meeting"
  | "review";

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
  github: GithubSim;
  meetings: Meeting[];
  investments: Investments;
  research: ResearchState;
  docsArchive: { appName: string; docs: DesignDoc[] } | null;
  gachaCount: number;
};

export function moodOf(e: Pick<AiEmployee, "stamina" | "stress" | "motivation">): Mood {
  if (e.stress > 70) return "ピリピリ";
  if (e.stamina < 30) return "お疲れ";
  if (e.motivation > 85 && e.stamina > 70) return "絶好調";
  if (e.motivation > 65) return "好調";
  return "普通";
}
