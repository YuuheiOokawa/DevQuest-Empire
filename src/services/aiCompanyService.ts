import { INITIAL_EMPLOYEES } from "@/data/aiEmployees";
import { TECH_TREE, INVESTMENT_DEFS } from "@/data/techTree";
import type {
  AppIdea,
  GameState,
  InvestmentKind,
  LogEntry,
  LogKind,
  ReleasedApp,
} from "@/services/aiCompanyTypes";
import { advanceProject, createProject, phaseTemplateOf } from "@/services/projectSimulationService";
import { applyReleaseGrowth, applyRevenueGrowth } from "@/services/companyGrowthService";
import {
  computeMonthlyRevenue,
  computeRating,
  initialUsers,
  simulateAppTurn,
} from "@/services/appRevenueService";
import {
  addRelease,
  closeBugIssues,
  createGithubSim,
  openBugIssues,
  simulateGithubTurn,
} from "@/services/githubSimService";
import { generateConversation, holdMeeting } from "@/services/personaService";
import { GACHA_COST, MAX_EMPLOYEES, rollNewEmployee } from "@/services/recruitmentService";
import {
  createInitialInvestments,
  getCompanyModifiers,
  investmentUpgradeCost,
} from "@/services/techTreeService";

// AI Software Company(AI開発会社シミュレーター)の状態管理。
// 状態はlocalStorageに保存する(ブラウザ単位のセーブデータ)。

const STORAGE_KEY = "devquest-ai-company-v1";
const STATE_VERSION = 2;
const MAX_LOGS = 150;
const PROJECT_START_COST = 10000;
const MEETING_INTERVAL = 6;

export function createInitialState(): GameState {
  return {
    version: STATE_VERSION,
    turn: 1,
    company: {
      name: "AI Software Company",
      level: 1,
      exp: 0,
      funds: 150000,
      reputation: 10,
      tech: 20,
      designPower: 18,
      planningPower: 20,
      marketing: 15,
      fans: 0,
      totalRevenue: 0,
    },
    employees: INITIAL_EMPLOYEES.map((e) => ({ ...e, skills: [...e.skills] })),
    project: null,
    apps: [],
    logs: [
      {
        id: 1,
        turn: 1,
        kind: "info",
        message: "AI Software Companyが設立されました。社長、最初のプロジェクトを始めましょう!",
      },
    ],
    nextLogId: 2,
    github: createGithubSim(),
    meetings: [],
    investments: createInitialInvestments(),
    research: { completed: [], current: null },
    docsArchive: null,
    gachaCount: 0,
  };
}

export function loadState(): GameState {
  if (typeof window === "undefined") return createInitialState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as GameState;
    // v1セーブはv2へ引き継がずリセットする(構造が大きく変わったため)
    if (parsed.version !== STATE_VERSION) return createInitialState();
    return parsed;
  } catch {
    return createInitialState();
  }
}

export function saveState(state: GameState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 保存失敗はゲーム進行を止めない
  }
}

export function resetState(): GameState {
  const state = createInitialState();
  saveState(state);
  return state;
}

function pushLog(state: GameState, kind: LogKind, message: string): void {
  const entry: LogEntry = { id: state.nextLogId, turn: state.turn, kind, message };
  state.nextLogId += 1;
  state.logs = [entry, ...state.logs].slice(0, MAX_LOGS);
}

// --- プレイヤー(社長)のアクション ---

export function canStartProject(state: GameState): { ok: boolean; reason?: string } {
  if (state.project) return { ok: false, reason: "進行中のプロジェクトがあります" };
  if (state.company.funds < PROJECT_START_COST) {
    return { ok: false, reason: `資金が足りません(必要: ${PROJECT_START_COST.toLocaleString()}円)` };
  }
  return { ok: true };
}

export function startProject(state: GameState, idea: AppIdea): GameState {
  const check = canStartProject(state);
  if (!check.ok) return state;

  const next: GameState = structuredClone(state);
  next.company.funds -= PROJECT_START_COST;
  next.project = createProject(idea, next.employees, next.turn);

  const pm = next.employees.find((e) => e.role === "プロダクトマネージャー");
  pushLog(next, "info", `AI社員「${pm?.name ?? "ミライ"}」が${idea.genre}「${idea.name}」の企画を作成しました`);
  pushLog(next, "money", `プロジェクト立ち上げ費用 ${PROJECT_START_COST.toLocaleString()}円 を支払いました`);
  saveState(next);
  return next;
}

export function recruitEmployee(state: GameState): GameState {
  if (state.company.funds < GACHA_COST || state.employees.length >= MAX_EMPLOYEES) return state;
  const next: GameState = structuredClone(state);
  next.company.funds -= GACHA_COST;
  next.gachaCount += 1;
  const employee = rollNewEmployee(next.employees, next.gachaCount);
  next.employees.push(employee);
  pushLog(
    next,
    "success",
    `【採用】${employee.rarity}社員「${employee.name}」(${employee.role})が入社しました!`
  );
  saveState(next);
  return next;
}

export function startResearch(state: GameState, nodeId: string): GameState {
  const node = TECH_TREE.find((n) => n.id === nodeId);
  if (!node || state.research.current || state.research.completed.includes(nodeId)) return state;
  if (node.requires && !state.research.completed.includes(node.requires)) return state;
  if (state.company.funds < node.cost) return state;

  const next: GameState = structuredClone(state);
  next.company.funds -= node.cost;
  next.research.current = { nodeId, remaining: node.turns };
  pushLog(next, "info", `技術研究「${node.name}」を開始しました(${node.turns}ターン)`);
  saveState(next);
  return next;
}

export function upgradeInvestment(state: GameState, kind: InvestmentKind): GameState {
  const def = INVESTMENT_DEFS.find((d) => d.kind === kind);
  if (!def) return state;
  const current = state.investments[kind];
  if (current >= def.maxLevel) return state;
  const cost = investmentUpgradeCost(kind, current);
  if (state.company.funds < cost) return state;

  const next: GameState = structuredClone(state);
  next.company.funds -= cost;
  next.investments[kind] = current + 1;
  pushLog(next, "money", `${def.name}をLv.${current + 1}に強化しました(-${cost.toLocaleString()}円)`);
  saveState(next);
  return next;
}

// --- 1ターン(=1週間)進める ---

export function advanceTurn(state: GameState): GameState {
  const next: GameState = structuredClone(state);
  next.turn += 1;
  const mods = getCompanyModifiers(next);

  // --- 技術研究の進行 ---
  if (next.research.current) {
    next.research.current.remaining -= 1;
    if (next.research.current.remaining <= 0) {
      const node = TECH_TREE.find((n) => n.id === next.research.current!.nodeId);
      next.research.completed.push(next.research.current.nodeId);
      next.research.current = null;
      if (node) pushLog(next, "success", `技術研究「${node.name}」が完了しました!効果が有効になります`);
    }
  }

  // --- プロジェクト進行 ---
  if (next.project) {
    const currentPhaseId = next.project.phases[next.project.phaseIndex]?.id ?? null;
    const result = advanceProject(next.project, next.employees, next.turn, mods);
    next.project = result.project;
    next.employees = result.employees;
    for (const log of result.logs) pushLog(next, log.kind, log.message);

    // GitHubシミュレーション(現工程の活動を反映)
    if (result.assignee && currentPhaseId) {
      const runningTemplate = result.completedTemplate ?? phaseTemplateOf(currentPhaseId);
      const ghEvents = simulateGithubTurn(
        next.github,
        next.project ?? result.project,
        runningTemplate,
        result.assignee,
        next.employees,
        next.turn,
        result.phaseCompleted
      );
      for (const log of ghEvents.logs) pushLog(next, log.kind, log.message);
    }

    // バグ⇔Issueの同期
    if (result.newBugs > 0) {
      const qa = next.employees.find((e) => e.role === "QAエンジニア") ?? next.employees[0];
      openBugIssues(next.github, result.newBugs, qa, next.turn);
    }
    if (result.fixedBugs > 0) {
      closeBugIssues(next.github, result.fixedBugs);
    }

    // β版リリースタグ
    if (result.completedTemplate?.id === "beta" && next.project) {
      addRelease(next.github, "v0.9.0-beta", `${next.project.idea.name} β版`, "先行ユーザー向けβ公開", next.turn);
      pushLog(next, "release", `「${next.project.idea.name}」β版を公開しました`);
    }

    // 正式リリース
    if (result.releasedApp) {
      const marketer = next.employees.find((e) => e.role === "マーケター");
      const users = initialUsers(next.company, marketer ? marketer.planning : 20);
      const app: ReleasedApp = {
        ...result.releasedApp,
        version: "v1.0.0",
        users,
        rating: 0,
        monthlyRevenue: 0,
        totalRevenue: 0,
        status: "運用中",
      };
      app.rating = computeRating(app);
      app.monthlyRevenue = computeMonthlyRevenue(app, mods);
      next.apps = [app, ...next.apps];

      addRelease(next.github, "v1.0.0", `${app.name} 正式版`, "初回リリース", next.turn);
      pushLog(next, "release", `アプリ「${app.name}」がリリースされました! 初期ユーザー ${users}人`);
      pushLog(next, "money", `初月売上見込み ${app.monthlyRevenue.toLocaleString()}円`);

      const growth = applyReleaseGrowth(next.company, app);
      next.company = growth.company;
      for (const message of growth.messages) pushLog(next, "success", message);
    }

    // アップデート工程完了 → 既存アプリをバージョンアップ
    if (result.completedTemplate?.id === "update" && next.project) {
      const target = next.apps.find((a) => a.name === next.project!.idea.name);
      if (target) {
        const minor = Number(target.version.split(".")[1] ?? 0) + 1;
        target.version = `v1.${minor}.0`;
        target.quality = Math.min(100, target.quality + 3);
        target.functionality = Math.min(100, target.functionality + 2);
        addRelease(next.github, target.version, `${target.name} アップデート`, "機能改善と不具合修正", next.turn);
        pushLog(next, "release", `「${target.name}」${target.version}を配信しました`);
      }
    }

    // 全工程完了 → プロジェクト終了・設計書をアーカイブ
    if (next.project && next.project.phaseIndex >= next.project.phases.length) {
      next.docsArchive = { appName: next.project.idea.name, docs: next.project.docs };
      pushLog(next, "success", `プロジェクト「${next.project.idea.name}」が完了しました。お疲れさまでした!`);
      next.project = null;
      next.employees = next.employees.map((e) => ({
        ...e,
        stamina: Math.min(100, e.stamina + 30),
        stress: Math.max(0, e.stress - 20),
        motivation: Math.min(100, e.motivation + 10),
      }));
    }
  }

  // --- 社員同士の会話 ---
  const phaseId = next.project?.phases[next.project.phaseIndex]?.id ?? null;
  const conversation = generateConversation(phaseId, next.employees);
  for (const line of conversation) pushLog(next, "talk", line);

  // --- AI会議(定期開催) ---
  if (next.turn % MEETING_INTERVAL === 0 && next.employees.length >= 3) {
    const meeting = holdMeeting(next.employees, next.turn);
    next.meetings = [meeting, ...next.meetings].slice(0, 20);
    pushLog(next, "meeting", `【${meeting.category}会議】${meeting.topic} → ${meeting.conclusion}`);
    // 会議の効果: 全員のモチベーションが少し上がる
    next.employees = next.employees.map((e) => ({ ...e, motivation: Math.min(100, e.motivation + 2) }));
  }

  // --- リリース済みアプリの運用 ---
  const marketer = next.employees.find((e) => e.role === "マーケター");
  let totalIncome = 0;
  next.apps = next.apps.map((app) => {
    const result = simulateAppTurn(app, next.company, marketer, mods);
    totalIncome += result.income;
    for (const event of result.events) pushLog(next, "info", event);
    return result.app;
  });
  // 営業による受託収入
  if (mods.salesIncome > 0) {
    totalIncome += mods.salesIncome;
    if (next.turn % 4 === 0) {
      pushLog(next, "money", `営業チームが受託案件で ${mods.salesIncome.toLocaleString()}円/週 を獲得中`);
    }
  }
  if (totalIncome > 0) {
    next.company = applyRevenueGrowth(next.company, totalIncome);
    pushLog(next, "money", `売上 +${totalIncome.toLocaleString()}円`);
  }

  // --- 給与支払い(週給) ---
  const payroll = next.employees.reduce((sum, e) => sum + e.salary, 0);
  if (payroll > 0) {
    next.company.funds = Math.max(0, next.company.funds - payroll);
    if (next.turn % 4 === 0) {
      pushLog(next, "money", `今週の給与 ${payroll.toLocaleString()}円 を支払いました`);
    }
  }

  saveState(next);
  return next;
}
