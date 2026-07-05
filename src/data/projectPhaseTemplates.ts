import type { DesignDocType, EmployeeRole, PhaseId } from "@/services/aiCompanyTypes";

// 細分化された開発工程(17工程)。requiredSkillは進捗が伸びる能力値、
// preferredRolesは担当としてアサインされやすい職種。
// docsは工程完了時にAI社員が自動生成する設計書の種類。
export type PhaseTemplate = {
  id: PhaseId;
  label: string;
  requiredSkill: "planning" | "design" | "coding" | "testing";
  preferredRoles: EmployeeRole[];
  baseWork: number;
  bugRate: number; // 工程完了時のバグ発生確率(0-1)
  maxBugs: number;
  qualityGain: number;
  designGain: number;
  functionalityGain: number;
  stabilityGain: number;
  bugFixPower: number;
  techDebtDelta: number; // 正で負債が増える、負で返済
  docs: DesignDocType[];
  ghActivity: "docs" | "design" | "code" | "test" | "release" | "ops"; // GitHubシミュの挙動
};

export const PROJECT_PHASES: PhaseTemplate[] = [
  {
    id: "planning", label: "企画", requiredSkill: "planning",
    preferredRoles: ["プロダクトマネージャー", "マーケター"],
    baseWork: 60, bugRate: 0, maxBugs: 0,
    qualityGain: 3, designGain: 0, functionalityGain: 2, stabilityGain: 0,
    bugFixPower: 0, techDebtDelta: 0,
    docs: ["charter", "mvpScope"], ghActivity: "docs",
  },
  {
    id: "requirements", label: "要件定義", requiredSkill: "planning",
    preferredRoles: ["プロダクトマネージャー"],
    baseWork: 70, bugRate: 0, maxBugs: 0,
    qualityGain: 4, designGain: 0, functionalityGain: 3, stabilityGain: 1,
    bugFixPower: 0, techDebtDelta: 0,
    docs: ["requirements", "risk", "backlog"], ghActivity: "docs",
  },
  {
    id: "screenDesign", label: "画面設計", requiredSkill: "design",
    preferredRoles: ["UI/UXデザイナー"],
    baseWork: 70, bugRate: 0, maxBugs: 0,
    qualityGain: 2, designGain: 8, functionalityGain: 1, stabilityGain: 0,
    bugFixPower: 0, techDebtDelta: 0,
    docs: ["screenDesign"], ghActivity: "design",
  },
  {
    id: "erDiagram", label: "ER図", requiredSkill: "coding",
    preferredRoles: ["バックエンドエンジニア"],
    baseWork: 55, bugRate: 0, maxBugs: 0,
    qualityGain: 3, designGain: 0, functionalityGain: 1, stabilityGain: 3,
    bugFixPower: 0, techDebtDelta: -2,
    docs: ["dbDesign"], ghActivity: "docs",
  },
  {
    id: "apiDesign", label: "API設計", requiredSkill: "coding",
    preferredRoles: ["バックエンドエンジニア", "AIエンジニア"],
    baseWork: 60, bugRate: 0.15, maxBugs: 1,
    qualityGain: 3, designGain: 0, functionalityGain: 3, stabilityGain: 2,
    bugFixPower: 0, techDebtDelta: 0,
    docs: ["apiDesign"], ghActivity: "docs",
  },
  {
    id: "authDesign", label: "認証設計", requiredSkill: "coding",
    preferredRoles: ["バックエンドエンジニア"],
    baseWork: 50, bugRate: 0.2, maxBugs: 1,
    qualityGain: 2, designGain: 0, functionalityGain: 2, stabilityGain: 4,
    bugFixPower: 0, techDebtDelta: 0,
    docs: ["techStack"], ghActivity: "docs",
  },
  {
    id: "dbDesign", label: "DB設計", requiredSkill: "coding",
    preferredRoles: ["バックエンドエンジニア"],
    baseWork: 55, bugRate: 0.15, maxBugs: 1,
    qualityGain: 3, designGain: 0, functionalityGain: 2, stabilityGain: 4,
    bugFixPower: 0, techDebtDelta: -2,
    docs: ["folderStructure", "implPlan", "sprint"], ghActivity: "docs",
  },
  {
    id: "uiImpl", label: "UI実装", requiredSkill: "coding",
    preferredRoles: ["フロントエンドエンジニア"],
    baseWork: 110, bugRate: 0.7, maxBugs: 3,
    qualityGain: 4, designGain: 4, functionalityGain: 6, stabilityGain: 0,
    bugFixPower: 0, techDebtDelta: 5,
    docs: [], ghActivity: "code",
  },
  {
    id: "apiImpl", label: "API実装", requiredSkill: "coding",
    preferredRoles: ["バックエンドエンジニア", "AIエンジニア"],
    baseWork: 110, bugRate: 0.7, maxBugs: 3,
    qualityGain: 4, designGain: 0, functionalityGain: 7, stabilityGain: 2,
    bugFixPower: 0, techDebtDelta: 5,
    docs: [], ghActivity: "code",
  },
  {
    id: "review", label: "レビュー", requiredSkill: "coding",
    preferredRoles: ["AIエンジニア", "バックエンドエンジニア"],
    baseWork: 60, bugRate: 0, maxBugs: 0,
    qualityGain: 5, designGain: 1, functionalityGain: 0, stabilityGain: 2,
    bugFixPower: 1, techDebtDelta: -6,
    docs: ["review"], ghActivity: "code",
  },
  {
    id: "ci", label: "CI構築", requiredSkill: "testing",
    preferredRoles: ["QAエンジニア", "バックエンドエンジニア"],
    baseWork: 45, bugRate: 0, maxBugs: 0,
    qualityGain: 2, designGain: 0, functionalityGain: 0, stabilityGain: 4,
    bugFixPower: 0, techDebtDelta: -3,
    docs: [], ghActivity: "test",
  },
  {
    id: "testing", label: "テスト", requiredSkill: "testing",
    preferredRoles: ["QAエンジニア"],
    baseWork: 80, bugRate: 0, maxBugs: 0,
    qualityGain: 4, designGain: 0, functionalityGain: 0, stabilityGain: 6,
    bugFixPower: 2, techDebtDelta: -2,
    docs: [], ghActivity: "test",
  },
  {
    id: "bugfix", label: "不具合修正", requiredSkill: "testing",
    preferredRoles: ["QAエンジニア", "フロントエンドエンジニア", "バックエンドエンジニア"],
    baseWork: 65, bugRate: 0, maxBugs: 0,
    qualityGain: 2, designGain: 0, functionalityGain: 0, stabilityGain: 5,
    bugFixPower: 4, techDebtDelta: -3,
    docs: [], ghActivity: "test",
  },
  {
    id: "beta", label: "β版公開", requiredSkill: "planning",
    preferredRoles: ["マーケター", "プロダクトマネージャー"],
    baseWork: 40, bugRate: 0.3, maxBugs: 2,
    qualityGain: 2, designGain: 0, functionalityGain: 1, stabilityGain: 2,
    bugFixPower: 1, techDebtDelta: 0,
    docs: ["releasePlan"], ghActivity: "release",
  },
  {
    id: "release", label: "正式リリース", requiredSkill: "planning",
    preferredRoles: ["マーケター", "プロダクトマネージャー"],
    baseWork: 40, bugRate: 0, maxBugs: 0,
    qualityGain: 0, designGain: 0, functionalityGain: 0, stabilityGain: 0,
    bugFixPower: 0, techDebtDelta: 0,
    docs: [], ghActivity: "release",
  },
  {
    id: "operation", label: "運営", requiredSkill: "planning",
    preferredRoles: ["マーケター", "プロダクトマネージャー"],
    baseWork: 50, bugRate: 0, maxBugs: 0,
    qualityGain: 2, designGain: 1, functionalityGain: 1, stabilityGain: 1,
    bugFixPower: 1, techDebtDelta: -1,
    docs: [], ghActivity: "ops",
  },
  {
    id: "update", label: "アップデート", requiredSkill: "coding",
    preferredRoles: ["フロントエンドエンジニア", "バックエンドエンジニア"],
    baseWork: 60, bugRate: 0.3, maxBugs: 1,
    qualityGain: 3, designGain: 1, functionalityGain: 2, stabilityGain: 1,
    bugFixPower: 1, techDebtDelta: 2,
    docs: [], ghActivity: "code",
  },
];
