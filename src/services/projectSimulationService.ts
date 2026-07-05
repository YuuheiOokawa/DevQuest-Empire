import { PROJECT_PHASES, type PhaseTemplate } from "@/data/projectPhaseTemplates";
import { TECH_POOL } from "@/data/personaTemplates";
import { buildDoc } from "@/services/designDocService";
import type { CompanyModifiers } from "@/services/techTreeService";
import type {
  AiEmployee,
  AppIdea,
  CodeQuality,
  Project,
  ProjectPhaseState,
  ReleasedApp,
} from "@/services/aiCompanyTypes";

// プロジェクト工程の進行シミュレーション(17工程)。
// 1ターンで担当社員のスキル×速度×集中力×コンディション分だけ進捗が伸び、
// 実装系工程の完了時にはバグと技術負債が発生し、レビュー/CI/テストで改善される。

export function phaseTemplateOf(id: ProjectPhaseState["id"]): PhaseTemplate {
  return PROJECT_PHASES.find((p) => p.id === id)!;
}

export function pickAssignee(phase: PhaseTemplate, employees: AiEmployee[]): AiEmployee | undefined {
  const scored = employees
    .map((e) => {
      const roleBonus = phase.preferredRoles.includes(e.role)
        ? phase.preferredRoles.indexOf(e.role) === 0
          ? 60
          : 35
        : 0;
      return { e, score: roleBonus + e[phase.requiredSkill] };
    })
    .sort((a, b) => b.score - a.score);
  return scored[0]?.e;
}

function initialCodeQuality(): CodeQuality {
  return {
    readability: 50,
    maintainability: 50,
    testCoverage: 10,
    duplication: 20,
    techDebt: 10,
    designQuality: 45,
    bugRate: 15,
  };
}

// コード品質(0.6〜1.4)を売上係数に変換する
export function qualityIndexOf(cq: CodeQuality): number {
  const positive = (cq.readability + cq.maintainability + cq.testCoverage + cq.designQuality) / 4;
  const negative = (cq.duplication + cq.techDebt + cq.bugRate) / 3;
  const raw = 0.6 + (positive / 100) * 0.8 - (negative / 100) * 0.3;
  return Math.round(Math.max(0.6, Math.min(1.4, raw)) * 100) / 100;
}

export function createProject(idea: AppIdea, employees: AiEmployee[], turn: number): Project {
  const difficultyFactor = 0.8 + idea.difficulty * 0.15;
  const phases: ProjectPhaseState[] = PROJECT_PHASES.map((template) => ({
    id: template.id,
    progress: 0,
    required: Math.round(template.baseWork * difficultyFactor),
    assigneeId: pickAssignee(template, employees)?.id ?? null,
    done: false,
  }));
  return {
    id: `proj-${Date.now()}`,
    idea,
    phaseIndex: 0,
    phases,
    quality: 20,
    designScore: 15,
    functionality: 15,
    stability: 20,
    bugs: 0,
    codeQuality: initialCodeQuality(),
    reviewScore: 0,
    sprint: 1,
    docs: [],
    startedTurn: turn,
  };
}

export type PhaseTurnResult = {
  project: Project;
  employees: AiEmployee[];
  logs: { kind: "info" | "success" | "warning" | "review"; message: string }[];
  releasedApp: Omit<
    ReleasedApp,
    "users" | "rating" | "monthlyRevenue" | "totalRevenue" | "status" | "version"
  > | null;
  phaseCompleted: boolean;
  completedTemplate: PhaseTemplate | null;
  newBugs: number;
  fixedBugs: number;
  assignee: AiEmployee | null;
};

export function advanceProject(
  project: Project,
  employees: AiEmployee[],
  turn: number,
  mods: CompanyModifiers
): PhaseTurnResult {
  const logs: PhaseTurnResult["logs"] = [];
  const nextProject: Project = {
    ...project,
    phases: project.phases.map((p) => ({ ...p })),
    codeQuality: { ...project.codeQuality },
    docs: [...project.docs],
  };
  const nextEmployees = employees.map((e) => ({ ...e, skills: [...e.skills] }));
  let newBugs = 0;
  let fixedBugs = 0;

  const phaseState = nextProject.phases[nextProject.phaseIndex];
  if (!phaseState) {
    return {
      project: nextProject, employees: nextEmployees, logs,
      releasedApp: null, phaseCompleted: false, completedTemplate: null,
      newBugs, fixedBugs, assignee: null,
    };
  }
  const template = phaseTemplateOf(phaseState.id);
  const assignee =
    nextEmployees.find((e) => e.id === phaseState.assigneeId) ?? pickAssignee(template, nextEmployees);
  if (!assignee) {
    return {
      project: nextProject, employees: nextEmployees, logs,
      releasedApp: null, phaseCompleted: false, completedTemplate: null,
      newBugs, fixedBugs, assignee: null,
    };
  }
  phaseState.assigneeId = assignee.id;

  // 進捗量 = (スキル+速度+集中力)×コンディション×会社補正×乱数
  const skillValue = assignee[template.requiredSkill];
  const condition =
    (0.5 + assignee.stamina / 200) *
    (0.6 + assignee.motivation / 250) *
    (1 - assignee.stress / 400);
  const tired = assignee.stamina < 25;
  const work =
    (skillValue * 0.4 + assignee.speed * 0.3 + assignee.focus * 0.15) *
    1.8 *
    condition *
    mods.workSpeed *
    (tired ? 0.5 : 1) *
    (0.85 + Math.random() * 0.3);
  phaseState.progress = Math.min(phaseState.required, phaseState.progress + Math.round(work));

  // 体力・ストレスの変動(残業耐性が低いほど消耗が大きい)
  const drain = 4 + Math.floor(Math.random() * 4) + Math.round((100 - assignee.overtimeTolerance) / 40);
  assignee.stamina = Math.max(0, assignee.stamina - drain);
  assignee.stress = Math.min(100, assignee.stress + 2 + Math.floor(Math.random() * 3));
  if (tired && Math.random() < 0.4) {
    logs.push({ kind: "warning", message: `${assignee.name}が疲れ気味です。進捗が落ちています…` });
  }
  // 手すきの社員は回復(福利厚生で回復量が増える)
  for (const e of nextEmployees) {
    if (e.id !== assignee.id) {
      e.stamina = Math.min(100, e.stamina + 8 + mods.staminaRecovery);
      e.stress = Math.max(0, e.stress - 3 - Math.round(mods.staminaRecovery / 2));
      e.motivation = Math.min(100, e.motivation + 1);
    }
  }

  // バグ修正系工程は毎ターン少しずつバグを減らす
  if (template.bugFixPower > 0 && nextProject.bugs > 0 && Math.random() < 0.75) {
    const fixed = Math.min(
      nextProject.bugs,
      Math.max(1, Math.round(template.bugFixPower * (assignee.testing / 80)))
    );
    nextProject.bugs -= fixed;
    fixedBugs += fixed;
    nextProject.codeQuality.bugRate = Math.max(0, nextProject.codeQuality.bugRate - fixed);
    logs.push({ kind: "success", message: `${assignee.name}がバグを${fixed}件修正しました` });
  }

  let releasedApp: PhaseTurnResult["releasedApp"] = null;
  let phaseCompleted = false;

  if (phaseState.progress >= phaseState.required && !phaseState.done) {
    phaseState.done = true;
    phaseCompleted = true;

    const qualityFactor = (0.7 + assignee.quality / 150) * mods.qualityBoost;
    nextProject.quality = Math.min(100, nextProject.quality + Math.round(template.qualityGain * qualityFactor));
    nextProject.designScore = Math.min(100, nextProject.designScore + Math.round(template.designGain * qualityFactor));
    nextProject.functionality = Math.min(100, nextProject.functionality + Math.round(template.functionalityGain * qualityFactor));
    nextProject.stability = Math.min(100, nextProject.stability + Math.round(template.stabilityGain * qualityFactor));

    // コード品質への影響
    const cq = nextProject.codeQuality;
    if (template.ghActivity === "code") {
      cq.readability = Math.min(100, cq.readability + Math.round(3 * qualityFactor));
      cq.maintainability = Math.min(100, cq.maintainability + Math.round(2 * qualityFactor));
      cq.duplication = Math.min(100, cq.duplication + 4);
    }
    if (template.id === "review") {
      cq.readability = Math.min(100, cq.readability + 8);
      cq.maintainability = Math.min(100, cq.maintainability + 8);
      cq.duplication = Math.max(0, cq.duplication - 8);
      cq.designQuality = Math.min(100, cq.designQuality + 6);
      nextProject.reviewScore = Math.min(100, nextProject.reviewScore + 30 + Math.round(assignee.quality / 4));
    }
    if (template.id === "ci" || template.id === "testing") {
      cq.testCoverage = Math.min(100, cq.testCoverage + 20 + Math.round(assignee.testing / 5));
    }
    cq.techDebt = Math.max(0, Math.min(100, cq.techDebt + template.techDebtDelta));
    if (["screenDesign", "erDiagram", "apiDesign", "dbDesign"].includes(template.id)) {
      cq.designQuality = Math.min(100, cq.designQuality + Math.round(5 * qualityFactor));
    }

    // バグ発生(実装系工程・CI/CD研究で低減)
    if (template.bugRate > 0) {
      const bugChance = template.bugRate * (1.2 - assignee.quality / 150) * mods.bugReduction;
      if (Math.random() < bugChance) {
        const bugs = 1 + Math.floor(Math.random() * template.maxBugs);
        nextProject.bugs += bugs;
        newBugs += bugs;
        nextProject.codeQuality.bugRate = Math.min(100, nextProject.codeQuality.bugRate + bugs * 2);
        logs.push({ kind: "warning", message: `${template.label}中にバグが${bugs}件発生しました` });
      }
    }

    // 設計書の自動生成
    for (const docType of template.docs) {
      const doc = buildDoc(docType, nextProject.idea, turn);
      nextProject.docs.push(doc);
      logs.push({ kind: "info", message: `${assignee.name}が「${doc.title}」を作成しました` });
    }

    // スプリント進行(実装系工程の完了ごとに+1)
    if (template.ghActivity === "code") {
      nextProject.sprint += 1;
    }

    if (template.id === "release") {
      releasedApp = {
        id: `app-${Date.now()}`,
        name: nextProject.idea.name,
        genre: nextProject.idea.genre,
        quality: nextProject.quality,
        designScore: nextProject.designScore,
        functionality: nextProject.functionality,
        stability: nextProject.stability,
        qualityIndex: qualityIndexOf(nextProject.codeQuality),
        bugs: nextProject.bugs,
        releasedTurn: turn,
      };
    } else {
      logs.push({ kind: "success", message: `${template.label}が完了しました(担当: ${assignee.name})` });
    }

    // 担当社員の成長(成長速度と教育投資で加速)
    assignee.exp += Math.round(20 * assignee.growthRate * mods.expBoost);
    assignee.motivation = Math.min(100, assignee.motivation + 5);
    assignee.stress = Math.max(0, assignee.stress - 5);
    if (assignee.exp >= assignee.level * 60) {
      assignee.exp = 0;
      assignee.level += 1;
      assignee[template.requiredSkill] = Math.min(100, assignee[template.requiredSkill] + 2);
      assignee.speed = Math.min(100, assignee.speed + 1);
      logs.push({ kind: "success", message: `${assignee.name}がレベル${assignee.level}に成長しました!` });
      // レベルアップ時、60%の確率で新しい技術を習得する
      const learnable = TECH_POOL.filter((t) => !assignee.skills.includes(t) && t !== assignee.dislikes);
      if (learnable.length > 0 && Math.random() < 0.6) {
        const learned = learnable[Math.floor(Math.random() * learnable.length)];
        assignee.skills.push(learned);
        logs.push({ kind: "success", message: `${assignee.name}が新技術「${learned}」を習得しました!` });
      }
    }

    nextProject.phaseIndex += 1;
    const nextPhase = nextProject.phases[nextProject.phaseIndex];
    if (nextPhase) {
      const nextTemplate = phaseTemplateOf(nextPhase.id);
      const nextAssignee = pickAssignee(nextTemplate, nextEmployees);
      nextPhase.assigneeId = nextAssignee?.id ?? null;
      if (nextAssignee) {
        logs.push({ kind: "info", message: `${nextTemplate.label}を開始します(担当: ${nextAssignee.name})` });
      }
    }
  }

  return {
    project: nextProject,
    employees: nextEmployees,
    logs,
    releasedApp,
    phaseCompleted,
    completedTemplate: phaseCompleted ? template : null,
    newBugs,
    fixedBugs,
    assignee,
  };
}
