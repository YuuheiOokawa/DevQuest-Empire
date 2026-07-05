import { INITIAL_EMPLOYEES } from "@/data/aiEmployees";
import type {
  AiEmployee,
  AppIdea,
  GameState,
  LogEntry,
  LogKind,
  ReleasedApp,
} from "@/services/aiCompanyTypes";
import { advanceProject, createProject } from "@/services/projectSimulationService";
import {
  applyReleaseGrowth,
  applyRevenueGrowth,
} from "@/services/companyGrowthService";
import {
  computeMonthlyRevenue,
  computeRating,
  initialUsers,
  simulateAppTurn,
} from "@/services/appRevenueService";

// AI会社経営シミュレーションの状態管理(オーケストレーション)。
// 状態はlocalStorageに保存する(MVP: ブラウザ単位のセーブデータ)。

const STORAGE_KEY = "devquest-ai-company-v1";
const STATE_VERSION = 1;
const MAX_LOGS = 120;
const PROJECT_START_COST = 10000;

export function createInitialState(): GameState {
  return {
    version: STATE_VERSION,
    turn: 1,
    company: {
      name: "DevQuest Empire Studio",
      level: 1,
      exp: 0,
      funds: 100000,
      reputation: 10,
      tech: 20,
      designPower: 18,
      planningPower: 20,
      marketing: 15,
      fans: 0,
      totalRevenue: 0,
    },
    employees: INITIAL_EMPLOYEES.map((e) => ({ ...e })),
    project: null,
    apps: [],
    logs: [
      {
        id: 1,
        turn: 1,
        kind: "info",
        message: "DevQuest Empire Studioが設立されました。社長、最初のプロジェクトを始めましょう!",
      },
    ],
    nextLogId: 2,
  };
}

export function loadState(): GameState {
  if (typeof window === "undefined") return createInitialState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as GameState;
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
    // 保存失敗(容量超過等)はゲーム進行を止めない
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
  pushLog(
    next,
    "info",
    `AI社員「${pm?.name ?? "ミライ"}」が${idea.genre}「${idea.name}」の企画を作成しました`
  );
  pushLog(next, "money", `プロジェクト立ち上げ費用 ${PROJECT_START_COST.toLocaleString()}円 を支払いました`);
  saveState(next);
  return next;
}

// 1ターン(=1週間)進める。プロジェクト進行・給与支払い・リリース済み
// アプリの売上/ユーザー成長をまとめて処理する。
export function advanceTurn(state: GameState): GameState {
  const next: GameState = structuredClone(state);
  next.turn += 1;

  // --- プロジェクト進行 ---
  if (next.project) {
    const result = advanceProject(next.project, next.employees, next.turn);
    next.project = result.project;
    next.employees = result.employees;
    for (const log of result.logs) pushLog(next, log.kind, log.message);

    if (result.releasedApp) {
      // リリース! アプリを完成アプリ一覧に追加
      const marketer = next.employees.find((e) => e.role === "マーケター");
      const users = initialUsers(next.company, marketer ? marketer.planning : 20);
      const app: ReleasedApp = {
        ...result.releasedApp,
        users,
        rating: 0,
        monthlyRevenue: 0,
        totalRevenue: 0,
        status: "運用中",
      };
      app.rating = computeRating(app);
      app.monthlyRevenue = computeMonthlyRevenue(app);
      next.apps = [app, ...next.apps];

      pushLog(next, "release", `アプリ「${app.name}」がリリースされました! 初期ユーザー ${users}人`);
      pushLog(next, "money", `初月売上見込み ${app.monthlyRevenue.toLocaleString()}円`);

      const growth = applyReleaseGrowth(next.company, app);
      next.company = growth.company;
      for (const message of growth.messages) pushLog(next, "success", message);
    }

    // 運用改善フェーズまで完了したらプロジェクト終了
    if (next.project && next.project.phaseIndex >= next.project.phases.length) {
      pushLog(next, "success", `プロジェクト「${next.project.idea.name}」が完了しました。お疲れさまでした!`);
      next.project = null;
      // プロジェクト完了で全員が一息つく
      next.employees = next.employees.map((e) => ({
        ...e,
        stamina: Math.min(100, e.stamina + 30),
        motivation: Math.min(100, e.motivation + 10),
      }));
    }
  }

  // --- リリース済みアプリの運用 ---
  const marketer = next.employees.find((e) => e.role === "マーケター");
  let totalIncome = 0;
  next.apps = next.apps.map((app) => {
    const result = simulateAppTurn(app, next.company, marketer);
    totalIncome += result.income;
    for (const event of result.events) pushLog(next, "info", event);
    return result.app;
  });
  if (totalIncome > 0) {
    next.company = applyRevenueGrowth(next.company, totalIncome);
    pushLog(next, "money", `アプリ売上 +${totalIncome.toLocaleString()}円`);
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

export function bestEmployeeFor(
  employees: AiEmployee[],
  skill: "planning" | "design" | "coding" | "testing"
): AiEmployee | undefined {
  return [...employees].sort((a, b) => b[skill] - a[skill])[0];
}
