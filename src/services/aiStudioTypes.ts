// AI開発スタジオ(実開発パイプライン)の型定義。
// ゲームではなく「AI開発組織」のワークフローを表す。
// MVPでは全てルールベース+localStorageで動き、GitHub操作は
// Human Approval後の「実行ボタン」で実行予定内容を表示するのみ。
// 将来GitHub API / GitHub CLI / Claude Codeへ接続する前提の構造にしている。

export type StudioRole =
  | "CEO Assistant"
  | "Product Manager"
  | "Project Manager"
  | "Architect"
  | "Frontend Engineer"
  | "Backend Engineer"
  | "Mobile Engineer"
  | "AI Engineer"
  | "Database Engineer"
  | "DevOps Engineer"
  | "QA Engineer"
  | "Security Engineer"
  | "UI Designer"
  | "UX Designer"
  | "Reviewer"
  | "Technical Writer"
  | "Marketing"
  | "Sales"
  | "Customer Support"
  | "Data Analyst";

export type StudioEmployee = {
  id: string;
  name: string;
  role: StudioRole;
  duty: string; // 責務
  expertise: string[]; // 専門技術
  exp: number;
  personality: string;
  thinking: string; // 思考スタイル
  favLanguage: string;
  weakLanguage: string;
  quality: number; // 0-100
  speed: number; // 0-100
};

export type MarketSource =
  | "GitHub"
  | "Product Hunt"
  | "Google Play"
  | "App Store"
  | "Reddit"
  | "Hacker News"
  | "トレンド";

export type MarketInsight = {
  id: string;
  day: number;
  source: MarketSource;
  finding: string; // 観測された事実
  opportunity: string; // そこから導いた機会
};

// 市場分析(公開情報ベースのルール生成。スクレイピング不使用・将来API差し替え可能)
export type MarketAnalysis = {
  marketScale: string; // 市場規模の概観
  competitors: { name: string; weakness: string }[]; // 競合と弱点
  differentiation: string[]; // 差別化ポイント
  mvpValue: string; // MVPで実現する価値
  monetization: string[]; // 将来の収益化案
  liveSignals?: string[]; // GitHub Search API等の実データシグナル(取得時のみ)
};

export type AppProposal = {
  id: string;
  appName: string;
  repoName: string;
  category: string;
  problem: string;
  targetUser: string;
  features: string[];
  techStack: string[];
  businessModel: string;
  roadmap: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  estimatedRevenue: string;
  marketSize: 1 | 2 | 3 | 4 | 5;
  priority: "高" | "中" | "低";
  qualityTarget: string;
  projectSize: "S" | "M" | "L";
  mvpScope: string[];
  futureScope: string[];
  market: MarketAnalysis;
};

export type StudioPhaseId =
  | "idea"
  | "requirements"
  | "architecture"
  | "database"
  | "api"
  | "uiDesign"
  | "frontend"
  | "backend"
  | "testing"
  | "review"
  | "documentation"
  | "releaseCandidate"
  | "approvalRepo" // Human Approval: Repository作成
  | "repoCreate"
  | "approvalBranch" // Human Approval: Branch作成
  | "branchCreate"
  | "approvalCommit" // Human Approval: Commit
  | "commit"
  | "approvalPush" // Human Approval: Push
  | "push"
  | "approvalPr" // Human Approval: Pull Request作成
  | "pullRequest"
  | "approvalMerge" // Human Approval: Merge
  | "merge"
  | "actionsRun"
  | "approvalRelease" // Human Approval: Release
  | "release"
  | "approvalDeploy" // Human Approval: Deploy
  | "deploy";

export type StudioPhaseStatus = "pending" | "active" | "awaiting_approval" | "done";

export type StudioPhase = {
  id: StudioPhaseId;
  status: StudioPhaseStatus;
  assigneeId: string | null;
  completedDay: number | null;
};

export type StudioDocType =
  | "projectCharter"
  | "readme"
  | "requirements"
  | "architecture"
  | "erDiagram"
  | "apiDesign"
  | "screenDesign"
  | "folderStructure"
  | "sprintPlan"
  | "roadmap"
  | "releaseNote"
  | "changeLog"
  | "reviewReport"
  | "testReport"
  | "wiki";

export type StudioDoc = {
  id: string;
  type: StudioDocType;
  title: string;
  lines: string[];
  day: number;
  author: string;
};

export type FileChange = {
  path: string;
  action: "add" | "modify";
  summary: string;
  owner: string; // 担当社員名
};

export type ClaudePrompt = {
  id: string;
  role: StudioRole;
  employeeName: string;
  title: string;
  prompt: string;
  day: number;
};

export type ApprovalType =
  | "repository"
  | "branch"
  | "commit"
  | "push"
  | "pullRequest"
  | "merge"
  | "release"
  | "deploy";

export type RiskLevel = "low" | "medium" | "high";

export type ApprovalRequest = {
  id: string;
  type: ApprovalType;
  title: string;
  summary: string;
  details: string[]; // 承認画面に出す詳細(Diff概要・PR内容・テスト結果など)
  plannedOperations: string[]; // 承認後に実行されるGitHub操作(表示用)
  status: "pending" | "approved" | "rejected";
  day: number;
  resolvedDay: number | null;
  riskLevel: RiskLevel;
  requestedBy: string; // 申請したAI社員名
  filesChanged: number;
  testsSummary: string;
  ceoComment: string | null; // Approve/Reject時のCEOコメント
  executionResult: string[] | null; // 実GitHub API実行の結果(未実行はnull)
  executedDay: number | null;
};

export type ActionsStepId =
  | "lint"
  | "typecheck"
  | "build"
  | "unitTest"
  | "integrationTest"
  | "coverage"
  | "securityScan"
  | "artifact";

export type ActionsStep = {
  id: ActionsStepId;
  label: string;
  status: "pending" | "running" | "success" | "failure";
  detail: string;
};

export type StudioMeeting = {
  id: string;
  day: number;
  agenda: string; // 議題
  utterances: { name: string; role: StudioRole; line: string }[];
  decision: string;
};

export type BranchPlan = {
  name: string;
  kind: "feature" | "bugfix" | "release";
  purpose: string;
};

export type PrDraft = {
  title: string;
  description: string;
  checklist: string[];
  screenshots: string; // MVPではプレースホルダ文言
  breakingChanges: string;
  reviewPoints: string[];
};

// 実GitHubへ作成されたリソースへのリンク(実行するたびに埋まっていく)
export type StudioGithubLink = {
  owner: string;
  repo: string;
  htmlUrl: string;
  defaultBranch: string;
  branch: string | null;
  issueNumber: number | null;
  commitSha: string | null;
  prNumber: number | null;
  prUrl: string | null;
  releaseUrl: string | null;
};

// 5つのレビューAI(Reviewer/Security/Performance/Accessibility/Architect)の所見
export type AiReview = {
  reviewer: string; // 社員名
  aspect: "コード品質" | "セキュリティ" | "パフォーマンス" | "アクセシビリティ" | "アーキテクチャ";
  score: number; // 0-100
  verdict: "approve" | "request_changes";
  findings: string[]; // 指摘(対応済み前提)
};

// 開発中にAI社員が自発的に出す改善提案
export type ImprovementProposal = {
  id: string;
  category: "UX" | "パフォーマンス" | "コード品質" | "技術負債" | "SEO" | "アクセシビリティ" | "CI";
  title: string;
  detail: string;
  proposedBy: string;
  issueNumber?: number | null; // Issue化済みならそのIssue番号
};

export type DeployTarget =
  | "Vercel"
  | "Cloudflare Pages"
  | "Netlify"
  | "Firebase Hosting"
  | "GitHub Pages"
  | "Render"
  | "Railway";

export type StudioProject = {
  id: string;
  proposal: AppProposal;
  phases: StudioPhase[];
  phaseIndex: number;
  docs: StudioDoc[];
  filePlan: FileChange[];
  prompts: ClaudePrompt[];
  actionsSteps: ActionsStep[];
  startedDay: number;
  branchPlans: BranchPlan[];
  workBranch: string; // 実装に使うブランチ(branchPlansから選択)
  commitMessage: string;
  prDraft: PrDraft;
  github: StudioGithubLink | null; // 実GitHub接続時のみ埋まる
  reviews: AiReview[]; // Review工程で5つのレビューAIが記入
  qualityScore: number | null; // レビュー平均(0-100)
  coverage: number | null; // Testing工程で確定
  improvements: ImprovementProposal[];
  deployTarget: DeployTarget;
};

export type StudioLog = {
  id: number;
  day: number;
  kind: "info" | "success" | "warning" | "approval" | "market" | "meeting";
  message: string;
};

// 完了したプロジェクトの成果物アーカイブ(直近1件)
export type StudioArchive = {
  appName: string;
  docs: StudioDoc[];
  prompts: ClaudePrompt[];
  filePlan: FileChange[];
};

export type StudioState = {
  version: number;
  day: number;
  employees: StudioEmployee[];
  insights: MarketInsight[];
  proposals: AppProposal[]; // 企画会議で出た承認待ちの企画案
  project: StudioProject | null;
  archive: StudioArchive | null;
  completedProjects: {
    appName: string;
    repoName: string;
    deployedDay: number;
    version: string;
    deployTarget: string;
    htmlUrl: string | null; // 実GitHub URL(接続時のみ)
    changeLog: string[];
  }[];
  approvals: ApprovalRequest[];
  meetings: StudioMeeting[];
  logs: StudioLog[];
  nextLogId: number;
};
