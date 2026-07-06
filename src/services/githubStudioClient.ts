"use client";

import { buildCiWorkflowYaml, buildDeployWorkflowYaml } from "@/services/github/workflowTemplates";
import type { ApprovalRequest, StudioProject, StudioState } from "@/services/aiStudioTypes";

// AI開発スタジオ ←→ GitHub APIルートの橋渡し(クライアント側)。
// - 読み取り(overview/repo詳細)はlocalStorageへキャッシュしRate Limitを抑える
// - 書き込みは必ず「Human Approval済みのApprovalRequest」から
//   buildExecutionPayloadで組み立てて /api/ai-studio/github/execute へ送る
// - トークンはサーバー側にのみ存在し、クライアントは一切保持しない

const CACHE_KEY = "devquest-github-cache-v1";
const OVERVIEW_TTL_MS = 60_000; // 連打によるRate Limit消費を防ぐ

export type GithubOverview = {
  profile: { login: string; name: string | null; avatarUrl: string; email: string | null; htmlUrl: string };
  orgs: { login: string; avatarUrl: string; description: string | null }[];
  repos: {
    fullName: string;
    name: string;
    owner: string;
    isPrivate: boolean;
    description: string | null;
    defaultBranch: string;
    htmlUrl: string;
    updatedAt: string | null;
    language: string | null;
    stargazers: number;
  }[];
};

export type GithubRepoDetail = {
  branches: { name: string; sha: string; isProtected: boolean }[];
  commits: { sha: string; message: string; author: string; date: string | null; htmlUrl: string }[];
  issues: { number: number; title: string; state: string; author: string; createdAt: string; htmlUrl: string }[];
  pulls: {
    number: number;
    title: string;
    state: string;
    merged: boolean;
    author: string;
    head: string;
    base: string;
    createdAt: string;
    htmlUrl: string;
  }[];
  runs: {
    id: number;
    name: string;
    status: string;
    conclusion: string | null;
    branch: string | null;
    event: string;
    createdAt: string;
    htmlUrl: string;
  }[];
  workflows: { id: number; name: string; path: string; state: string; htmlUrl: string }[];
  releases: { id: number; tagName: string; name: string | null; draft: boolean; prerelease: boolean; createdAt: string; htmlUrl: string }[];
  reviews: { id: number; prNumber: number; author: string; state: string; body: string; submittedAt: string | null }[];
};

type GithubCache = {
  overview: GithubOverview | null;
  overviewAt: number;
  repoDetails: Record<string, { detail: GithubRepoDetail; at: number }>;
};

function loadCache(): GithubCache {
  if (typeof window === "undefined") return { overview: null, overviewAt: 0, repoDetails: {} };
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return { overview: null, overviewAt: 0, repoDetails: {} };
    return JSON.parse(raw) as GithubCache;
  } catch {
    return { overview: null, overviewAt: 0, repoDetails: {} };
  }
}

function saveCache(cache: GithubCache): void {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    /* 容量超過などは無視(キャッシュなので) */
  }
}

export class GithubClientError extends Error {}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const json = (await res.json().catch(() => ({}))) as { error?: string } & T;
  if (!res.ok) {
    throw new GithubClientError(json.error ?? `GitHub APIエラー(${res.status})`);
  }
  return json;
}

/** プロフィール・Org・リポジトリ一覧。force=falseなら60秒キャッシュを使う。 */
export async function fetchGithubOverview(force = false): Promise<GithubOverview> {
  const cache = loadCache();
  if (!force && cache.overview && Date.now() - cache.overviewAt < OVERVIEW_TTL_MS) {
    return cache.overview;
  }
  const data = await getJson<GithubOverview>("/api/ai-studio/github/overview");
  saveCache({ ...cache, overview: data, overviewAt: Date.now() });
  return data;
}

export async function fetchRepoDetail(owner: string, repo: string, force = false): Promise<GithubRepoDetail> {
  const key = `${owner}/${repo}`;
  const cache = loadCache();
  const hit = cache.repoDetails[key];
  if (!force && hit && Date.now() - hit.at < OVERVIEW_TTL_MS) {
    return hit.detail;
  }
  const data = await getJson<GithubRepoDetail>(
    `/api/ai-studio/github/repo?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`
  );
  saveCache({
    ...cache,
    repoDetails: { ...cache.repoDetails, [key]: { detail: data, at: Date.now() } },
  });
  return data;
}

export function getCachedOverview(): GithubOverview | null {
  return loadCache().overview;
}

// --- Human Approval済み操作の実行 ---

export type ExecutePayload = Record<string, unknown> & { action: string };

export type ExecuteOutcome = {
  resultLines: string[];
  githubPatch?: Partial<NonNullable<StudioProject["github"]>>;
};

/** 承認済みリクエストから実行ペイロードを組み立てる。実行できない場合はnull。 */
export function buildExecutionPayload(
  approval: ApprovalRequest,
  state: StudioState,
  login: string
): ExecutePayload | null {
  const project = state.project;
  if (!project) return null;
  const repo = project.github?.repo ?? project.proposal.repoName;
  const owner = project.github?.owner ?? login;

  switch (approval.type) {
    case "repository":
      return {
        action: "createRepository",
        name: project.proposal.repoName,
        description: `${project.proposal.appName} — ${project.proposal.problem}を解決する${project.proposal.category}アプリ(DevQuest Empire AI Studio生成)`,
        isPrivate: true,
      };
    case "branch":
      return {
        action: "createBranch",
        owner,
        repo,
        branch: project.workBranch,
        baseBranch: project.github?.defaultBranch ?? "main",
      };
    case "commit":
    case "push":
      // CommitとPushはWeb APIでは一体(Git Data APIでコミット作成+ref更新)。
      // commit承認時は準備のみ(実行なし)、push承認時に実際にPushする。
      if (approval.type === "commit") return null;
      return {
        action: "pushFiles",
        owner,
        repo,
        branch: project.workBranch,
        message: project.commitMessage,
        files: buildScaffoldFiles(project),
      };
    case "pullRequest":
      return {
        action: "createPullRequest",
        owner,
        repo,
        title: project.prDraft.title,
        body: buildPrBody(project),
        head: project.workBranch,
        base: project.github?.defaultBranch ?? "main",
      };
    case "merge":
      if (!project.github?.prNumber) return null;
      return { action: "mergePullRequest", owner, repo, number: project.github.prNumber };
    case "release":
      return {
        action: "createRelease",
        owner,
        repo,
        tagName: "v1.0.0",
        name: `${project.proposal.appName} v1.0.0`,
        body: `初回リリース。主な機能: ${project.proposal.mvpScope.join(" / ")}`,
      };
    case "deploy":
      return {
        action: "dispatchWorkflow",
        owner,
        repo,
        workflowFile: "deploy.yml",
        ref: project.github?.defaultBranch ?? "main",
      };
  }
}

/** executeエンドポイントを呼び、スタジオ状態へ反映しやすい形に整える。 */
export async function executeApprovedAction(payload: ExecutePayload): Promise<ExecuteOutcome> {
  const res = await fetch("/api/ai-studio/github/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    error?: string;
    result?: Record<string, unknown>;
  };
  if (!res.ok || !json.ok) {
    throw new GithubClientError(json.error ?? `実行に失敗しました(${res.status})`);
  }
  const r = json.result ?? {};

  switch (payload.action) {
    case "createRepository":
      return {
        resultLines: [`Repository作成: ${String(r.fullName)}`, `URL: ${String(r.htmlUrl)}`],
        githubPatch: {
          owner: String(r.owner),
          repo: String(r.name),
          htmlUrl: String(r.htmlUrl),
          defaultBranch: String(r.defaultBranch ?? "main"),
        },
      };
    case "createBranch":
      return {
        resultLines: [`Branch作成: ${String(r.branch)}(sha: ${String(r.sha).slice(0, 7)})`],
        githubPatch: { branch: String(r.branch) },
      };
    case "pushFiles":
      return {
        resultLines: [
          `Push完了: ${String(r.filesCount)}ファイルを1コミットで反映`,
          `Commit: ${String(r.sha).slice(0, 7)}`,
          `URL: ${String(r.htmlUrl)}`,
        ],
        githubPatch: { commitSha: String(r.sha) },
      };
    case "createPullRequest":
      return {
        resultLines: [`PR作成: #${Number(r.number)}`, `URL: ${String(r.htmlUrl)}`],
        githubPatch: { prNumber: Number(r.number), prUrl: String(r.htmlUrl) },
      };
    case "mergePullRequest":
      return {
        resultLines: [`Merge完了(squash): ${String(r.sha).slice(0, 7)}`],
      };
    case "createRelease":
      return {
        resultLines: [`Release作成: ${String(r.tagName)}`, `URL: ${String(r.htmlUrl)}`],
        githubPatch: { releaseUrl: String(r.htmlUrl) },
      };
    case "dispatchWorkflow":
      return { resultLines: ["deploy.ymlワークフローを起動しました(ActionsタブでRun状況を確認できます)"] };
    case "createIssue":
      return {
        resultLines: [`Issue作成: #${Number(r.number)}`, `URL: ${String(r.htmlUrl)}`],
        githubPatch: { issueNumber: Number(r.number) },
      };
    default:
      return { resultLines: ["実行が完了しました"] };
  }
}

// --- Pushするファイル内容の生成 ---

/** AI社員の設計(docs/filePlan)からPushするスキャフォールドファイル一式を組み立てる。 */
export function buildScaffoldFiles(project: StudioProject): { path: string; content: string }[] {
  const files: { path: string; content: string }[] = [];
  const p = project.proposal;

  // ドキュメント(README + docs/)
  for (const doc of project.docs) {
    const path = doc.type === "readme" ? "README.md" : `docs/${doc.type}.md`;
    if (files.some((f) => f.path === path)) continue;
    files.push({
      path,
      content: `# ${doc.title}\n\n> ${p.appName} / 作成: ${doc.author}(AI社員)\n\n${doc.lines.map((l) => `- ${l}`).join("\n")}\n`,
    });
  }

  // AI社員の変更予定ファイル → 実装指示コメント入りスキャフォールド
  for (const f of project.filePlan) {
    if (f.path.startsWith(".github/")) continue; // ワークフローは下で実体を入れる
    if (files.some((x) => x.path === f.path)) continue;
    const prompt = project.prompts.find((pr) => pr.title && f.summary.includes(pr.title)) ?? null;
    const header =
      f.path.endsWith(".sql")
        ? `-- ${f.summary}\n-- TODO: Claude Codeで実装してください\n`
        : f.path.endsWith(".md")
          ? `# ${f.summary}\n\nTODO: Claude Codeで実装してください\n`
          : `// ${f.summary}(担当: ${f.owner})\n// TODO: Claude Codeで実装してください${prompt ? `\n// プロンプト: ${prompt.prompt.slice(0, 120)}...` : ""}\nexport {};\n`;
    files.push({ path: f.path, content: header });
  }

  // CI / Deploy ワークフロー(実際に動く)
  files.push({ path: ".github/workflows/ci.yml", content: buildCiWorkflowYaml(p.appName) });
  files.push({ path: ".github/workflows/deploy.yml", content: buildDeployWorkflowYaml(p.appName) });

  return files;
}

function buildPrBody(project: StudioProject): string {
  const d = project.prDraft;
  return [
    "## 概要",
    d.description,
    "",
    "## Checklist",
    ...d.checklist.map((c) => `- [x] ${c}`),
    "",
    "## Screenshots",
    d.screenshots,
    "",
    "## Breaking Changes",
    d.breakingChanges,
    "",
    "## Review Points",
    ...d.reviewPoints.map((r) => `- ${r}`),
    "",
    "🤖 DevQuest Empire AI Studio(Human Approval済み)",
  ].join("\n");
}
