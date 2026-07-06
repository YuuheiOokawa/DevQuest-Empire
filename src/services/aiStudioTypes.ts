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
  | "readme"
  | "requirements"
  | "architecture"
  | "erDiagram"
  | "apiDesign"
  | "folderStructure"
  | "sprintPlan"
  | "releaseNote"
  | "changeLog"
  | "reviewReport"
  | "testReport";

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
  status: "pending" | "success";
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
  completedProjects: { appName: string; repoName: string; deployedDay: number }[];
  approvals: ApprovalRequest[];
  meetings: StudioMeeting[];
  logs: StudioLog[];
  nextLogId: number;
};
