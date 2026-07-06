import { STUDIO_EMPLOYEES } from "@/data/studioEmployees";
import {
  ACTIONS_STEPS,
  BUSINESS_MODELS,
  CLAUDE_PROMPTS,
  FEATURE_POOL,
  FILE_PLANS,
  IMPROVEMENT_POOL,
  REVIEW_PANEL,
  TEST_MATRIX,
  PROPOSAL_CATEGORIES,
  QUALITY_TARGETS,
  REPO_NAME_POOL,
  STUDIO_PHASES,
  TECH_STACKS,
} from "@/data/studioTemplates";
import type {
  AppProposal,
  ApprovalRequest,
  ApprovalType,
  StudioDocType,
  StudioEmployee,
  StudioLog,
  StudioPhaseId,
  StudioProject,
  StudioState,
} from "@/services/aiStudioTypes";

// AI開発スタジオの状態管理。1日=1ティックで、市場調査→会議→開発工程が進む。
// GitHub操作(Repo作成/Push/Merge/Deploy)は必ずHuman Approvalを挟み、
// MVPでは承認後も「実行予定内容の表示」のみ行う(実際のAPI呼び出しはしない)。
// 将来の接続ポイント: executePlannedOperationsをGitHub API/CLI呼び出しに差し替える。

const STORAGE_KEY = "devquest-ai-studio-v1";
const STATE_VERSION = 3; // v3: 実開発モード一本化(市場分析/5AIレビュー/QualityScore/デプロイ先選択)
const MAX_LOGS = 150;

// 承認タイプごとのリスクレベル。書き込み範囲が広い操作ほど高リスク。
export const APPROVAL_RISK: Record<ApprovalType, "low" | "medium" | "high"> = {
  repository: "medium",
  branch: "low",
  commit: "low",
  push: "high",
  pullRequest: "medium",
  merge: "high",
  release: "high",
  deploy: "high",
};

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickMany<T>(arr: readonly T[], count: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, count);
}

export function createInitialStudioState(): StudioState {
  return {
    version: STATE_VERSION,
    day: 1,
    employees: STUDIO_EMPLOYEES.map((e) => ({ ...e, expertise: [...e.expertise] })),
    insights: [],
    proposals: [],
    project: null,
    archive: null,
    completedProjects: [],
    approvals: [],
    meetings: [],
    logs: [
      { id: 1, day: 1, kind: "info", message: "AI開発スタジオが始動しました。CEO、企画会議を開いて最初のプロダクトを選んでください。" },
    ],
    nextLogId: 2,
  };
}

export function loadStudioState(): StudioState {
  if (typeof window === "undefined") return createInitialStudioState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialStudioState();
    const parsed = JSON.parse(raw) as StudioState;
    if (parsed.version !== STATE_VERSION) return createInitialStudioState();
    if (parsed.archive === undefined) parsed.archive = null;
    return parsed;
  } catch {
    return createInitialStudioState();
  }
}

export function saveStudioState(state: StudioState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* 保存失敗しても進行は止めない */
  }
}

export function resetStudioState(): StudioState {
  const state = createInitialStudioState();
  saveStudioState(state);
  return state;
}

function pushLog(state: StudioState, kind: StudioLog["kind"], message: string): void {
  state.logs = [{ id: state.nextLogId++, day: state.day, kind, message }, ...state.logs].slice(0, MAX_LOGS);
}

function employeeByRole(state: StudioState, role: string): StudioEmployee | undefined {
  return state.employees.find((e) => e.role === role);
}

// --- 企画生成 ---

export function generateProposal(usedRepos: string[]): AppProposal {
  const cat = pick(PROPOSAL_CATEGORIES);
  const stack = pick(TECH_STACKS);
  const features = pickMany(FEATURE_POOL, 4);
  const repoPool = REPO_NAME_POOL.filter((r) => !usedRepos.includes(r));
  const repoName = repoPool.length > 0 ? pick(repoPool) : `app-${Date.now() % 10000}`;
  const appName = repoName
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  const difficulty = (1 + Math.floor(Math.random() * 4)) as AppProposal["difficulty"];
  const marketSize = (2 + Math.floor(Math.random() * 4)) as AppProposal["marketSize"];

  return {
    id: `prop-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    appName,
    repoName,
    category: cat.category,
    problem: pick(cat.problems),
    targetUser: pick(cat.targets),
    features,
    techStack: stack,
    businessModel: pick(BUSINESS_MODELS),
    roadmap: ["Week1-2: MVP実装", "Week3: β公開とフィードバック収集", "Week4: 正式リリース", "Month2: 機能拡張"],
    difficulty,
    estimatedRevenue: `月${(marketSize * 3 + difficulty).toLocaleString()}万円(12ヶ月後想定)`,
    marketSize,
    priority: marketSize >= 4 ? "高" : marketSize >= 3 ? "中" : "低",
    qualityTarget: pick(QUALITY_TARGETS),
    projectSize: difficulty <= 2 ? "S" : difficulty === 3 ? "M" : "L",
    mvpScope: features.slice(0, 2),
    futureScope: features.slice(2),
    // 市場分析(公開情報ベースのルール生成。将来外部API/実データへ差し替え)
    market: {
      marketScale: cat.marketScale,
      competitors: cat.competitors.map((c) => ({ ...c })),
      differentiation: [...cat.differentiation],
      mvpValue: `${pick(cat.targets)}が「${pick(cat.problems)}」を今日から解決できる状態をMVPで提供する`,
      monetization: [...cat.monetization],
    },
  };
}

export function holdPlanningMeeting(state: StudioState): StudioState {
  const next: StudioState = structuredClone(state);
  const used = [
    ...next.completedProjects.map((p) => p.repoName),
    ...(next.project ? [next.project.proposal.repoName] : []),
  ];
  next.proposals = [generateProposal(used), generateProposal(used), generateProposal(used)];
  const pm = employeeByRole(next, "Product Manager");
  const analyst = employeeByRole(next, "Data Analyst");
  const hikari = employeeByRole(next, "Marketing");

  // 企画会議の議事録(市場分析・競合分析の要約)を残す
  next.meetings = [
    {
      id: `smtg-${Date.now()}`,
      day: next.day,
      agenda: "新規プロダクト企画会議(市場・競合分析)",
      utterances: next.proposals.map((p, i) => ({
        name: [analyst?.name ?? "ミオ", hikari?.name ?? "ヒカリ", pm?.name ?? "ミライ"][i % 3],
        role: (["Data Analyst", "Marketing", "Product Manager"] as const)[i % 3],
        line: `${p.appName}: ${p.market.marketScale}。競合は${p.market.competitors.map((c) => c.name).join("・")}、差別化は${p.market.differentiation[0]}`,
      })),
      decision: "3案をCEOへ提出。市場分析・競合分析付きで承認判断を仰ぐ",
    },
    ...next.meetings,
  ].slice(0, 20);
  pushLog(next, "meeting", `${pm?.name ?? "PM"}が企画会議を開催し、市場・競合分析付きの3案を提出しました(CEOの承認待ち)`);
  saveStudioState(next);
  return next;
}

/** プロジェクト中止: 進行中プロジェクトを破棄し、未処理の承認依頼も取り下げる。 */
export function cancelStudioProject(state: StudioState): StudioState {
  if (!state.project) return state;
  const next: StudioState = structuredClone(state);
  const name = next.project!.proposal.appName;
  next.approvals = next.approvals.map((a) =>
    a.status === "pending" ? { ...a, status: "rejected" as const, resolvedDay: next.day, ceoComment: "プロジェクト中止" } : a
  );
  next.project = null;
  pushLog(next, "warning", `CEOの判断でプロジェクト「${name}」を中止しました`);
  saveStudioState(next);
  return next;
}

/** セーブデータのエクスポート(JSON文字列)。 */
export function exportStudioState(state: StudioState): string {
  return JSON.stringify(state, null, 2);
}

/** セーブデータのインポート。version不一致・破損時はnullを返す。 */
export function importStudioState(json: string): StudioState | null {
  try {
    const parsed = JSON.parse(json) as StudioState;
    if (parsed.version !== STATE_VERSION || !Array.isArray(parsed.employees)) return null;
    if (parsed.archive === undefined) parsed.archive = null;
    saveStudioState(parsed);
    return parsed;
  } catch {
    return null;
  }
}

/** デプロイ先の変更(Deploy承認前ならいつでも変更可)。 */
export function setDeployTarget(state: StudioState, target: StudioProject["deployTarget"]): StudioState {
  if (!state.project) return state;
  const next: StudioState = structuredClone(state);
  next.project!.deployTarget = target;
  pushLog(next, "info", `デプロイ先を${target}に設定しました`);
  saveStudioState(next);
  return next;
}

// --- プロジェクト ---

export function startStudioProject(state: StudioState, proposalId: string): StudioState {
  const proposal = state.proposals.find((p) => p.id === proposalId);
  if (!proposal || state.project) return state;

  const next: StudioState = structuredClone(state);
  const chosen = next.proposals.find((p) => p.id === proposalId)!;
  next.proposals = [];
  const workBranch = `feature/${chosen.repoName}-mvp`;
  next.project = {
    id: `sproj-${Date.now()}`,
    proposal: chosen,
    phases: STUDIO_PHASES.map((p, i) => ({
      id: p.id,
      status: i === 0 ? "active" : "pending",
      assigneeId: p.role ? (employeeByRole(next, p.role)?.id ?? null) : null,
      completedDay: null,
    })),
    phaseIndex: 0,
    docs: [],
    filePlan: [],
    prompts: [],
    actionsSteps: ACTIONS_STEPS.map((s) => ({ ...s, status: "pending" as const })),
    startedDay: next.day,
    branchPlans: [
      { name: workBranch, kind: "feature", purpose: "MVP機能の実装用" },
      { name: `bugfix/${chosen.repoName}-hotfix`, kind: "bugfix", purpose: "リリース後の緊急修正用(予約)" },
      { name: `release/v1.0.0`, kind: "release", purpose: "リリース準備用(予約)" },
    ],
    workBranch,
    commitMessage: `feat: ${chosen.appName} MVPを実装(${chosen.mvpScope.join("・")})`,
    prDraft: {
      title: `feat: ${chosen.appName} v1.0.0 MVP実装`,
      description: `${chosen.problem}を解決する${chosen.category}アプリ「${chosen.appName}」のMVP実装です。`,
      checklist: [
        "TypeScriptエラーゼロ",
        "Lintエラーゼロ",
        "Build成功",
        "単体テスト/E2Eテスト通過",
        "ドキュメント(README/設計書)更新済み",
      ],
      screenshots: "(スクリーンショットはUI実装後に添付)",
      breakingChanges: "なし(初回リリース)",
      reviewPoints: [
        "サービス層とリポジトリ層の責務分割",
        "エラーハンドリングの網羅性",
        `MVPスコープ(${chosen.mvpScope.join(" / ")})の充足`,
      ],
    },
    github: null,
    reviews: [],
    qualityScore: null,
    coverage: null,
    improvements: [],
    deployTarget: "Vercel",
  };
  pushLog(next, "success", `CEOが企画「${chosen.appName}」を承認。プロジェクトを開始します(repo: ${chosen.repoName})`);
  saveStudioState(next);
  return next;
}

// --- 承認 ---

function plannedOperationsFor(type: ApprovalType, project: StudioProject): string[] {
  const repo = project.proposal.repoName;
  const owner = project.github?.owner ?? "(あなたのアカウント)";
  switch (type) {
    case "repository":
      return [
        `POST /user/repos  name=${repo} private=true auto_init=true`,
        `相当CLI: gh repo create ${repo} --private --description "${project.proposal.appName}"`,
      ];
    case "branch":
      return [
        `POST /repos/${owner}/${repo}/git/refs  ref=refs/heads/${project.workBranch}`,
        `相当CLI: git switch -c ${project.workBranch}`,
      ];
    case "commit":
      return [
        `Git Data API: blob作成 ×${Math.max(project.filePlan.length, 1)} → tree → commit`,
        `Commit Message: ${project.commitMessage}`,
      ];
    case "push":
      return [
        `PATCH /repos/${owner}/${repo}/git/refs/heads/${project.workBranch}(ブランチ先頭を進める=Push)`,
        `相当CLI: git push -u origin ${project.workBranch}`,
      ];
    case "pullRequest":
      return [
        `POST /repos/${owner}/${repo}/pulls  head=${project.workBranch} base=main`,
        `Title: ${project.prDraft.title}`,
      ];
    case "merge":
      return [
        `PUT /repos/${owner}/${repo}/pulls/{PR番号}/merge  method=squash`,
        `相当CLI: gh pr merge --squash`,
      ];
    case "release":
      return [
        `POST /repos/${owner}/${repo}/releases  tag=v1.0.0 generate_release_notes=true`,
        `相当CLI: gh release create v1.0.0 --generate-notes`,
      ];
    case "deploy":
      return [
        `POST /repos/${owner}/${repo}/actions/workflows/deploy.yml/dispatches  ref=main`,
        `相当CLI: gh workflow run deploy.yml --ref main(デプロイ先: ${project.deployTarget}、トークン設定後に実デプロイ)`,
      ];
  }
}

function approvalDetailsFor(type: ApprovalType, project: StudioProject): { title: string; summary: string; details: string[] } {
  const p = project.proposal;
  const prNo = project.github?.prNumber ?? 1;
  switch (type) {
    case "repository":
      return {
        title: `Repository作成の承認: ${p.repoName}`,
        summary: `「${p.appName}」のGitHubリポジトリを新規作成します(private)。`,
        details: [
          `Project: ${p.appName}(${p.category})`,
          `Repository Name: ${p.repoName}`,
          `Tech Stack: ${p.techStack.join(" / ")}`,
          `変更予定ファイル: ${project.filePlan.length}件`,
        ],
      };
    case "branch":
      return {
        title: `Branch作成の承認: ${project.workBranch}`,
        summary: "実装用のfeatureブランチを作成します。",
        details: project.branchPlans.map(
          (b) => `${b.kind === "feature" ? "★" : "・"} ${b.name}(${b.purpose})`
        ),
      };
    case "commit":
      return {
        title: `Commitの承認: ${p.repoName}`,
        summary: "実装内容をコミットとしてまとめます(Conventional Commits)。",
        details: [
          `Commit Message: ${project.commitMessage}`,
          `対象ブランチ: ${project.workBranch}`,
          `ファイル数: ${project.filePlan.length}件+ドキュメント${project.docs.length}件+CI設定`,
        ],
      };
    case "push":
      return {
        title: `Pushの承認: ${p.repoName}`,
        summary: `コミットを ${project.workBranch} へPushします。`,
        details: [
          `Commit Message: ${project.commitMessage}`,
          `Push先Branch: ${project.workBranch}`,
          `変更ファイル一覧(${project.filePlan.length}件+docs):`,
          ...project.filePlan.slice(0, 6).map((f) => `  ${f.action === "add" ? "A" : "M"} ${f.path}`),
          `変更行数: 約+${180 + project.filePlan.length * 12} -0(スキャフォールド+設計書)`,
        ],
      };
    case "pullRequest":
      return {
        title: `Pull Request作成の承認: ${p.repoName}`,
        summary: `PR「${project.prDraft.title}」を作成します。`,
        details: [
          `Title: ${project.prDraft.title}`,
          `Description: ${project.prDraft.description}`,
          `Checklist: ${project.prDraft.checklist.join(" / ")}`,
          `Breaking Changes: ${project.prDraft.breakingChanges}`,
          `Review Points: ${project.prDraft.reviewPoints.join(" / ")}`,
        ],
      };
    case "merge":
      return {
        title: `Mergeの承認: ${p.repoName} PR #${prNo}`,
        summary: `PR「${project.prDraft.title}」をmainへマージします(squash)。`,
        details: [
          `PR: #${prNo} ${project.workBranch} → main`,
          `Review: 5観点(品質/セキュリティ/性能/a11y/アーキテクチャ)全員approve`,
          `Quality Score: ${project.qualityScore ?? "-"}/100`,
          `Coverage: ${project.coverage ?? "-"}%(目標80%)`,
          `Changed Files: ${project.filePlan.length}件+docs`,
        ],
      };
    case "release":
      return {
        title: `Releaseの承認: ${p.appName} v1.0.0`,
        summary: "GitHub Releaseを作成し、リリースノートを公開します。",
        details: [
          "Tag: v1.0.0(main先頭)",
          `Release Note: ${p.appName} v1.0.0 — ${p.mvpScope.join(" / ")}`,
          "GitHub Actions: 全ステップ成功済み",
        ],
      };
    case "deploy":
      return {
        title: `Deployの承認: ${p.appName} v1.0.0 → ${project.deployTarget}`,
        summary: `deploy.ymlワークフローを起動し、${project.deployTarget}へデプロイします。`,
        details: [
          "GitHub Actions: 全ステップ成功(Lint/Type Check/Build/Test/Coverage/Security)",
          `Quality Score: ${project.qualityScore ?? "-"}/100 / Coverage: ${project.coverage ?? "-"}%`,
          "Artifact: build-v1.0.0.zip",
          `デプロイ先: ${project.deployTarget}(トークン設定後に実デプロイ有効化)`,
        ],
      };
  }
}

export function approveRequest(state: StudioState, approvalId: string, comment?: string): StudioState {
  const next: StudioState = structuredClone(state);
  const approval = next.approvals.find((a) => a.id === approvalId);
  if (!approval || approval.status !== "pending" || !next.project) return state;
  approval.status = "approved";
  approval.resolvedDay = next.day;
  approval.ceoComment = comment?.trim() ? comment.trim() : null;

  // 承認フェーズを完了して次へ進める
  const phase = next.project.phases[next.project.phaseIndex];
  phase.status = "done";
  phase.completedDay = next.day;
  next.project.phaseIndex += 1;
  const nextPhase = next.project.phases[next.project.phaseIndex];
  if (nextPhase) nextPhase.status = "active";
  pushLog(next, "approval", `CEOが承認しました: ${approval.title}`);
  saveStudioState(next);
  return next;
}

export function rejectRequest(state: StudioState, approvalId: string, comment?: string): StudioState {
  const next: StudioState = structuredClone(state);
  const approval = next.approvals.find((a) => a.id === approvalId);
  if (!approval || approval.status !== "pending" || !next.project) return state;
  approval.status = "rejected";
  approval.resolvedDay = next.day;
  approval.ceoComment = comment?.trim() ? comment.trim() : null;

  // 1つ前の作業フェーズへ差し戻し、AI社員が手直ししてから再申請する
  const project = next.project;
  project.phases[project.phaseIndex].status = "pending";
  if (project.phaseIndex > 0) {
    project.phaseIndex -= 1;
    project.phases[project.phaseIndex].status = "active";
    project.phases[project.phaseIndex].completedDay = null;
  }
  pushLog(next, "warning", `CEOが差し戻しました: ${approval.title}。AI社員が修正して再申請します`);
  saveStudioState(next);
  return next;
}

// 承認済みリクエストの「実行」ボタン(GitHub未接続時: 実行予定内容の確認のみ)
export function executePlannedOperations(approval: ApprovalRequest): string[] {
  return approval.plannedOperations;
}

/**
 * 実GitHub API実行後の結果を状態へ記録する。
 * githubPatchには作成されたリソース(owner/repo/branch/PR番号など)を渡す。
 */
export function markApprovalExecuted(
  state: StudioState,
  approvalId: string,
  resultLines: string[],
  githubPatch?: Partial<NonNullable<StudioProject["github"]>>
): StudioState {
  const next: StudioState = structuredClone(state);
  const approval = next.approvals.find((a) => a.id === approvalId);
  if (!approval || approval.status !== "approved") return state;
  approval.executionResult = resultLines;
  approval.executedDay = next.day;
  if (next.project && githubPatch) {
    next.project.github = {
      owner: "",
      repo: next.project.proposal.repoName,
      htmlUrl: "",
      defaultBranch: "main",
      branch: null,
      issueNumber: null,
      commitSha: null,
      prNumber: null,
      prUrl: null,
      releaseUrl: null,
      ...(next.project.github ?? {}),
      ...githubPatch,
    };
  }
  pushLog(next, "success", `【実行完了】${approval.title}`);
  saveStudioState(next);
  return next;
}

// --- 自動化: 実データ取り込み ---

/** 実CI結果(GitHub Actionsの最新Run)をactionsStepsへ反映する。 */
export function applyRealCiResult(
  state: StudioState,
  run: { name: string; status: string; conclusion: string | null; htmlUrl: string },
  steps: { name: string; status: string; conclusion: string | null }[]
): StudioState {
  if (!state.project) return state;
  const next: StudioState = structuredClone(state);
  const project = next.project!;
  project.actionsSteps = project.actionsSteps.map((s) => {
    const real = steps.find((r) => r.name.toLowerCase().includes(s.label.toLowerCase()));
    if (!real) return s;
    const status =
      real.conclusion === "success"
        ? ("success" as const)
        : real.conclusion === "failure"
          ? ("failure" as const)
          : real.status === "in_progress" || real.status === "queued"
            ? ("running" as const)
            : s.status;
    return { ...s, status, detail: `実CI: ${real.conclusion ?? real.status}` };
  });
  pushLog(
    next,
    run.conclusion === "success" ? "success" : "info",
    `実CI結果を取り込みました: ${run.name} → ${run.conclusion ?? run.status}(${run.htmlUrl})`
  );
  saveStudioState(next);
  return next;
}

/** GitHub Search APIの市場シグナルを企画へ添付する。 */
export function attachMarketSignals(state: StudioState, proposalId: string, signals: string[]): StudioState {
  const next: StudioState = structuredClone(state);
  const proposal = next.proposals.find((p) => p.id === proposalId);
  if (!proposal) return state;
  proposal.market.liveSignals = signals;
  pushLog(next, "market", `GitHub Search APIで「${proposal.category}」の実データを取得しました(${signals.length}件)`);
  saveStudioState(next);
  return next;
}

/** Claude APIによる実レビュー結果を反映する(フォールバック時は呼ばれない)。 */
export function applyAiReviews(
  state: StudioState,
  reviews: { aspect: string; score: number; findings: string[] }[]
): StudioState {
  if (!state.project) return state;
  const next: StudioState = structuredClone(state);
  const project = next.project!;
  project.reviews = reviews.map((r) => {
    const panel = REVIEW_PANEL.find((p) => p.aspect === r.aspect);
    const reviewer = panel ? employeeByRole(next, panel.role) : undefined;
    return {
      reviewer: reviewer ? `${reviewer.name}(Claude API)` : "Claude API",
      aspect: (panel?.aspect ?? "コード品質") as (typeof REVIEW_PANEL)[number]["aspect"],
      score: r.score,
      verdict: r.score >= 70 ? ("approve" as const) : ("request_changes" as const),
      findings: r.findings,
    };
  });
  project.qualityScore = Math.round(project.reviews.reduce((s, r) => s + r.score, 0) / project.reviews.length);
  pushLog(next, "success", `Claude APIによる実レビュー完了: Quality Score ${project.qualityScore}/100`);
  saveStudioState(next);
  return next;
}

/** 改善提案をGitHub Issueとして起票済みにする。 */
export function markImprovementIssued(state: StudioState, improvementId: string, issueNumber: number): StudioState {
  if (!state.project) return state;
  const next: StudioState = structuredClone(state);
  const imp = next.project!.improvements.find((i) => i.id === improvementId);
  if (!imp) return state;
  imp.issueNumber = issueNumber;
  pushLog(next, "success", `改善提案「${imp.title}」をIssue #${issueNumber}として起票しました`);
  saveStudioState(next);
  return next;
}

/**
 * 一括実装パック: 企画・要件・全プロンプト・変更計画・受け入れ基準を
 * 1つのMarkdownへまとめる。`claude -p`へそのまま渡せば実装が始まる。
 */
export function buildImplementationPack(project: StudioProject): string {
  const p = project.proposal;
  return [
    `# ${p.appName} 実装指示書(AI開発スタジオ生成)`,
    "",
    "あなたはこのリポジトリの実装を担当するシニアエンジニアチームです。以下の順で実装してください。",
    "",
    `## プロダクト概要`,
    `- 課題: ${p.problem} / ターゲット: ${p.targetUser}`,
    `- MVPスコープ: ${p.mvpScope.join(" / ")}`,
    `- 技術スタック: ${p.techStack.join(" / ")}`,
    `- 品質目標: ${p.qualityTarget}(TypeScript/Lintゼロエラー、Build成功、Coverage 80%+)`,
    "",
    `## 変更対象ファイル(${project.filePlan.length}件)`,
    ...project.filePlan.map((f) => `- ${f.action === "add" ? "追加" : "変更"}: ${f.path} — ${f.summary}`),
    "",
    "## 工程別の実装指示",
    ...project.prompts.flatMap((pr, i) => [`### ${i + 1}. ${pr.title}(${pr.role})`, "", pr.prompt, ""]),
    "## 完了条件",
    "- 全テスト(Unit/Integration/E2E/A11y/Performance/Regression)がCIで成功",
    "- README通りに第三者が起動できる",
    "- 重要: git push / PR作成 / merge は行わないこと(Human Approvalフローで人間が実行します)",
    "",
    "## Claude Code(headless)での実行例",
    "```bash",
    `claude -p "$(cat docs/implementation-pack.md)"`,
    "```",
  ].join("\n");
}

// --- ドキュメント生成 ---

const DOC_BUILDERS: Partial<Record<StudioPhaseId, { type: StudioDocType; title: string; lines: (p: AppProposal) => string[] }[]>> = {
  idea: [
    { type: "projectCharter", title: "Project Charter", lines: (p) => [
      `## 目的: ${p.problem}を解決し、${p.targetUser}に価値を届ける`,
      `## 市場: ${p.market.marketScale}`,
      `## 競合: ${p.market.competitors.map((c) => `${c.name}(弱点: ${c.weakness})`).join(" / ")}`,
      `## 差別化: ${p.market.differentiation.join(" / ")}`,
      `## MVPの価値: ${p.market.mvpValue}`,
      `## 収益化案: ${p.market.monetization.join(" / ")}`,
      `## 成功指標: ${p.qualityTarget}`,
    ] },
    { type: "sprintPlan", title: "Sprint Plan", lines: (p) => [
      "Sprint 1(Week1): 基盤+認証+主要画面",
      `Sprint 2(Week2): ${p.mvpScope.join(" / ")}`,
      "Sprint 3(Week3): テスト・レビュー・β公開",
    ] },
  ],
  requirements: [
    { type: "requirements", title: "Requirements", lines: (p) => [
      `課題: ${p.problem}`,
      `ターゲット: ${p.targetUser}`,
      ...p.features.map((f, i) => `FR-${i + 1}: ${f}`),
      `NFR-1: ${p.qualityTarget}`,
      "NFR-2: WCAG 2.1 AA準拠 / NFR-3: 初回表示1秒以内",
    ] },
  ],
  architecture: [
    { type: "architecture", title: "Architecture", lines: (p) => [
      `スタック: ${p.techStack.join(" / ")}`,
      "構成: プレゼンテーション層 / サービス層 / リポジトリ層",
      "非機能: 可用性99.9% / 初回表示1秒以内",
    ] },
    { type: "folderStructure", title: "Folder Structure", lines: () => [
      "src/", "  app/", "  components/", "  services/", "  hooks/", "  lib/", "database/", "docs/", ".github/", "tests/",
    ] },
  ],
  database: [
    { type: "erDiagram", title: "ER Diagram", lines: (p) => [
      "users 1-N items(コアエンティティ)",
      "users 1-N settings",
      `${p.category}向けの集計テーブルを別途用意`,
      "全テーブルにcreated_at/updated_at",
    ] },
  ],
  api: [
    { type: "apiDesign", title: "API Design", lines: () => [
      "POST /api/auth/signup", "POST /api/auth/login", "GET /api/items", "POST /api/items", "PATCH /api/items/:id",
      "エラー形式: RFC 9457",
    ] },
  ],
  testing: [
    { type: "testReport", title: "Test Report", lines: () => [
      "Unit: 42 passed / 0 failed",
      "E2E: 12 passed / 0 failed",
      "Coverage: 84%(目標80%達成)",
    ] },
  ],
  review: [
    { type: "reviewReport", title: "Review Report", lines: () => [
      "指摘: 責務分割1件 / 命名1件(いずれも対応済み)",
      "セキュリティ: 重大な問題なし",
      "総評: マージ可能な品質",
    ] },
  ],
  uiDesign: [
    { type: "screenDesign", title: "Screen Design", lines: (p) => [
      "画面一覧: ホーム / メイン機能 / 設定 / オンボーディング",
      `メイン機能画面: ${p.mvpScope.join("と")}を1画面で完結`,
      "遷移: ホーム ↔ メイン(タブ)、設定はモーダル",
      "状態: 各画面にローディング/エラー/空状態を定義",
    ] },
  ],
  documentation: [
    { type: "readme", title: "README", lines: (p) => [
      `# ${p.appName}`,
      p.problem + "を解決するアプリ",
      `## 機能: ${p.features.join(" / ")}`,
      `## スタック: ${p.techStack.join(" / ")}`,
      "## セットアップ: pnpm install && pnpm dev(詳細はdocs参照)",
    ] },
    { type: "roadmap", title: "Roadmap", lines: (p) => [
      `M1(今月): v1.0.0 MVP(${p.mvpScope.join(" / ")})`,
      `M2: ${p.futureScope[0] ?? "機能拡張"}`,
      `M3: ${p.futureScope[1] ?? "モバイル対応"}・収益化(${p.market.monetization[0] ?? "課金"})`,
    ] },
    { type: "changeLog", title: "Change Log", lines: () => ["v1.0.0 初回リリース(全機能実装・テスト完了)"] },
    { type: "releaseNote", title: "Release Note", lines: (p) => [
      `${p.appName} v1.0.0を公開しました`,
      `主な機能: ${p.mvpScope.join(" / ")}`,
      "既知の問題: なし",
    ] },
    { type: "wiki", title: "Wiki(運用手順)", lines: (p) => [
      "## デプロイ手順: mainマージ後、Deploy承認→workflow_dispatch",
      "## 障害対応: Actionsのログ確認→ロールバックはRevert PR",
      `## FAQ: ${p.targetUser}向けのよくある質問を随時追記`,
    ] },
  ],
};

// --- 工程の実行(実開発モード: 1回の実行=1工程) ---

export function advanceStudioDay(state: StudioState): StudioState {
  const next: StudioState = structuredClone(state);
  next.day += 1; // dayは「実行ステップ数」として使う(時間シミュレーションではない)

  const project = next.project;
  if (project) {
    const phase = project.phases[project.phaseIndex];
    const template = STUDIO_PHASES[project.phaseIndex];

    if (phase && template) {
      if (template.approval) {
        // 承認ゲート: 未申請なら承認リクエストを作成して停止
        if (phase.status !== "awaiting_approval") {
          phase.status = "awaiting_approval";
          const info = approvalDetailsFor(template.approval, project);
          // 申請者は承認後の工程を担当するAI社員(いなければPM)
          const executorRole = STUDIO_PHASES[project.phaseIndex + 1]?.role;
          const requester =
            (executorRole ? employeeByRole(next, executorRole) : undefined) ??
            employeeByRole(next, "Project Manager");
          next.approvals = [
            {
              id: `apv-${template.approval}-${project.id}-${next.day}`,
              type: template.approval,
              ...info,
              plannedOperations: plannedOperationsFor(template.approval, project),
              status: "pending" as const,
              day: next.day,
              resolvedDay: null,
              riskLevel: APPROVAL_RISK[template.approval],
              requestedBy: requester ? `${requester.name}(${requester.role})` : "AI社員",
              filesChanged: project.filePlan.length,
              testsSummary: project.coverage
                ? `全${TEST_MATRIX.reduce((s, t) => s + t.count, 0)}ケース passed / Coverage ${project.coverage}%`
                : "テスト工程で確定",
              ceoComment: null,
              executionResult: null,
              executedDay: null,
            },
            ...next.approvals,
          ].slice(0, 40);
          pushLog(next, "approval", `【承認依頼】${info.title}(承認タブから確認してください)`);
        }
      } else {
        // 作業フェーズ: 担当社員が1日で完了させる
        const assignee = next.employees.find((e) => e.id === phase.assigneeId);
        phase.status = "done";
        phase.completedDay = next.day;

        // ドキュメント生成
        for (const builder of DOC_BUILDERS[template.id] ?? []) {
          project.docs.push({
            id: `sdoc-${builder.type}-${next.day}`,
            type: builder.type,
            title: builder.title,
            lines: builder.lines(project.proposal),
            day: next.day,
            author: assignee?.name ?? "AI",
          });
        }
        // 変更予定ファイル
        for (const f of FILE_PLANS[template.id] ?? []) {
          const owner = employeeByRole(next, f.role);
          project.filePlan.push({ path: f.path, action: f.action, summary: f.summary, owner: owner?.name ?? f.role });
        }
        // Claude Codeプロンプト
        const promptTemplate = CLAUDE_PROMPTS[template.id];
        if (promptTemplate) {
          const emp = employeeByRole(next, promptTemplate.role);
          project.prompts.push({
            id: `spr-${template.id}-${next.day}`,
            role: promptTemplate.role,
            employeeName: emp?.name ?? promptTemplate.role,
            title: promptTemplate.title,
            prompt: promptTemplate.prompt
              .replace(/\{app\}/g, project.proposal.appName)
              .replace(/\{category\}/g, project.proposal.category)
              .replace(/\{stack\}/g, project.proposal.techStack.join(" / "))
              .replace(/\{features\}/g, project.proposal.features.join("、")),
            day: next.day,
          });
        }
        // Testing工程: テストマトリクスからカバレッジ確定
        if (template.id === "testing") {
          project.coverage = 82 + Math.floor(Math.random() * 10);
          pushLog(next, "success", `テストスイート完成: ${TEST_MATRIX.reduce((s, t) => s + t.count, 0)}ケース / Coverage ${project.coverage}%`);
        }

        // Review工程: 5つのレビューAI(品質/セキュリティ/性能/a11y/アーキテクチャ)が採点
        if (template.id === "review") {
          project.reviews = REVIEW_PANEL.map((r) => {
            const reviewer = employeeByRole(next, r.role);
            return {
              reviewer: reviewer?.name ?? r.role,
              aspect: r.aspect,
              score: 85 + Math.floor(Math.random() * 13),
              verdict: "approve" as const,
              findings: [...r.findings],
            };
          });
          project.qualityScore = Math.round(
            project.reviews.reduce((s, r) => s + r.score, 0) / project.reviews.length
          );
          pushLog(next, "success", `5観点レビュー完了: Quality Score ${project.qualityScore}/100(全員approve)`);
        }

        // 開発中の自発的な改善提案(UX/性能/品質/負債/SEO/a11y/CI)
        if (["uiDesign", "frontend", "backend", "testing"].includes(template.id)) {
          const used = new Set(project.improvements.map((i) => i.title));
          const candidates = IMPROVEMENT_POOL.filter((i) => !used.has(i.title));
          if (candidates.length > 0) {
            const imp = pick(candidates);
            const proposer = employeeByRole(next, imp.role);
            project.improvements.push({
              id: `imp-${next.day}-${Math.floor(Math.random() * 1000)}`,
              category: imp.category,
              title: imp.title,
              detail: imp.detail,
              proposedBy: proposer ? `${proposer.name}(${proposer.role})` : imp.role,
            });
            pushLog(next, "info", `【改善提案】${imp.category}: ${imp.title}(${proposer?.name ?? imp.role})`);
          }
        }

        // GitHub Actions実行フェーズ
        if (template.id === "actionsRun") {
          project.actionsSteps = project.actionsSteps.map((s) => ({ ...s, status: "success" as const }));
          pushLog(next, "success", "GitHub Actions: 全ステップが成功しました(Lint/Type Check/Build/Test/Coverage/Security/Artifact)");
        }
        if (assignee) {
          assignee.exp += 15;
          pushLog(next, "success", `${assignee.name}(${assignee.role})が「${template.label}」を完了しました`);
        } else {
          pushLog(next, "success", `「${template.label}」が完了しました`);
        }

        // Deploy完了 → プロジェクト完了
        if (template.id === "deploy") {
          next.completedProjects = [
            {
              appName: project.proposal.appName,
              repoName: project.proposal.repoName,
              deployedDay: next.day,
              version: "v1.0.0",
              deployTarget: project.deployTarget,
              htmlUrl: project.github?.htmlUrl ?? null,
              changeLog: [`v1.0.0 初回リリース(${project.proposal.mvpScope.join(" / ")})`],
            },
            ...next.completedProjects,
          ];
          pushLog(next, "success", `🎉「${project.proposal.appName}」がデプロイされました!プロジェクト完了です`);
          next.archive = {
            appName: project.proposal.appName,
            docs: project.docs,
            prompts: project.prompts,
            filePlan: project.filePlan,
          };
          next.project = null;
        } else {
          project.phaseIndex += 1;
          const upcoming = project.phases[project.phaseIndex];
          if (upcoming) upcoming.status = "active";
        }
      }
    }
  }

  saveStudioState(next);
  return next;
}
