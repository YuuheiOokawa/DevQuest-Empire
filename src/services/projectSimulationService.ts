import { PROJECT_PHASES, type PhaseTemplate } from "@/data/projectPhaseTemplates";
import type {
  AiEmployee,
  AppIdea,
  Project,
  ProjectPhaseState,
  ReleasedApp,
} from "@/services/aiCompanyTypes";

// プロジェクト工程の進行シミュレーション。
// 1ターンで担当社員のスキル×速度×体力/モチベーション分だけ進捗が伸び、
// 実装系工程の完了時にはバグが発生し、テスト/バグ修正工程で減っていく。

export function phaseTemplateOf(id: ProjectPhaseState["id"]): PhaseTemplate {
  return PROJECT_PHASES.find((p) => p.id === id)!;
}

// 工程に最適な担当社員を選ぶ(職種一致を優先し、次に必要スキルが高い順)
export function pickAssignee(
  phase: PhaseTemplate,
  employees: AiEmployee[]
): AiEmployee | undefined {
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

export function createProject(idea: AppIdea, employees: AiEmployee[], turn: number): Project {
  // 難易度が高いほど各工程の必要作業量が増える
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
    startedTurn: turn,
  };
}

export type PhaseTurnResult = {
  project: Project;
  employees: AiEmployee[];
  logs: { kind: "info" | "success" | "warning"; message: string }[];
  releasedApp: Omit<ReleasedApp, "users" | "rating" | "monthlyRevenue" | "totalRevenue" | "status"> | null;
  phaseCompleted: boolean;
};

// 1ターン分プロジェクトを進める。リリース工程が完了したらreleasedAppを返す。
export function advanceProject(
  project: Project,
  employees: AiEmployee[],
  turn: number
): PhaseTurnResult {
  const logs: PhaseTurnResult["logs"] = [];
  const nextProject: Project = {
    ...project,
    phases: project.phases.map((p) => ({ ...p })),
  };
  const nextEmployees = employees.map((e) => ({ ...e }));

  const phaseState = nextProject.phases[nextProject.phaseIndex];
  if (!phaseState) {
    return { project: nextProject, employees: nextEmployees, logs, releasedApp: null, phaseCompleted: false };
  }
  const template = phaseTemplateOf(phaseState.id);

  const assignee =
    nextEmployees.find((e) => e.id === phaseState.assigneeId) ??
    pickAssignee(template, nextEmployees);
  if (!assignee) {
    return { project: nextProject, employees: nextEmployees, logs, releasedApp: null, phaseCompleted: false };
  }
  phaseState.assigneeId = assignee.id;

  // 進捗量 = スキル×速度×コンディション×乱数
  // 1プロジェクトが15〜20週程度で完了するペースに調整している
  const skillValue = assignee[template.requiredSkill];
  const condition = (0.5 + assignee.stamina / 200) * (0.6 + assignee.motivation / 250);
  const tired = assignee.stamina < 25;
  const work =
    (skillValue * 0.45 + assignee.speed * 0.35) *
    1.8 *
    condition *
    (tired ? 0.5 : 1) *
    (0.85 + Math.random() * 0.3);
  phaseState.progress = Math.min(phaseState.required, phaseState.progress + Math.round(work));

  // 体力・モチベーションの変動
  assignee.stamina = Math.max(0, assignee.stamina - (4 + Math.floor(Math.random() * 4)));
  if (tired && Math.random() < 0.4) {
    logs.push({ kind: "warning", message: `${assignee.name}が疲れ気味です。進捗が落ちています…` });
  }
  // 手すきの社員は休憩して回復
  for (const e of nextEmployees) {
    if (e.id !== assignee.id) {
      e.stamina = Math.min(100, e.stamina + 8);
      e.motivation = Math.min(100, e.motivation + 1);
    }
  }

  // バグ修正系工程は毎ターン少しずつバグを減らす
  if (template.bugFixPower > 0 && nextProject.bugs > 0) {
    const fixed = Math.min(
      nextProject.bugs,
      Math.max(1, Math.round(template.bugFixPower * (assignee.testing / 80)))
    );
    if (Math.random() < 0.75) {
      nextProject.bugs -= fixed;
      logs.push({ kind: "success", message: `${assignee.name}がバグを${fixed}件修正しました` });
    }
  }

  let releasedApp: PhaseTurnResult["releasedApp"] = null;
  let phaseCompleted = false;

  if (phaseState.progress >= phaseState.required && !phaseState.done) {
    phaseState.done = true;
    phaseCompleted = true;

    // 品質系ステータスの上昇(担当者の品質値でブレる)
    const qualityFactor = 0.7 + assignee.quality / 150;
    nextProject.quality = Math.min(100, nextProject.quality + Math.round(template.qualityGain * qualityFactor));
    nextProject.designScore = Math.min(100, nextProject.designScore + Math.round(template.designGain * qualityFactor));
    nextProject.functionality = Math.min(100, nextProject.functionality + Math.round(template.functionalityGain * qualityFactor));
    nextProject.stability = Math.min(100, nextProject.stability + Math.round(template.stabilityGain * qualityFactor));

    // バグ発生(実装系工程)。品質の高い社員はバグを出しにくい
    if (template.bugRate > 0) {
      const bugChance = template.bugRate * (1.2 - assignee.quality / 150);
      if (Math.random() < bugChance) {
        const bugs = 1 + Math.floor(Math.random() * template.maxBugs);
        nextProject.bugs += bugs;
        logs.push({ kind: "warning", message: `${template.label}中にバグが${bugs}件発生しました` });
      }
    }

    if (template.designGain >= 8) {
      logs.push({
        kind: "success",
        message: `${template.label}が完了しました。デザイン評価 +${Math.round(template.designGain * qualityFactor)}`,
      });
    } else if (template.id === "release") {
      releasedApp = {
        id: `app-${Date.now()}`,
        name: nextProject.idea.name,
        genre: nextProject.idea.genre,
        quality: nextProject.quality,
        designScore: nextProject.designScore,
        functionality: nextProject.functionality,
        stability: nextProject.stability,
        bugs: nextProject.bugs,
        releasedTurn: turn,
      };
      logs.push({ kind: "success", message: `${assignee.name}がリリース準備を完了しました` });
    } else {
      logs.push({ kind: "success", message: `${template.label}が完了しました(担当: ${assignee.name})` });
    }

    // 担当社員の成長
    assignee.exp += 20;
    assignee.motivation = Math.min(100, assignee.motivation + 5);
    if (assignee.exp >= assignee.level * 60) {
      assignee.exp = 0;
      assignee.level += 1;
      assignee[template.requiredSkill] = Math.min(100, assignee[template.requiredSkill] + 2);
      assignee.speed = Math.min(100, assignee.speed + 1);
      logs.push({ kind: "success", message: `${assignee.name}がレベル${assignee.level}に成長しました!` });
    }

    // 次の工程へ(リリース後は運用改善に進み、その完了でプロジェクト終了)
    nextProject.phaseIndex += 1;
    const nextPhase = nextProject.phases[nextProject.phaseIndex];
    if (nextPhase) {
      const nextTemplate = phaseTemplateOf(nextPhase.id);
      const nextAssignee = pickAssignee(nextTemplate, nextEmployees);
      nextPhase.assigneeId = nextAssignee?.id ?? null;
      if (nextAssignee) {
        logs.push({
          kind: "info",
          message: `${nextTemplate.label}を開始します(担当: ${nextAssignee.name})`,
        });
      }
    }
  }

  return { project: nextProject, employees: nextEmployees, logs, releasedApp, phaseCompleted };
}
