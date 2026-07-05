import {
  COMMIT_TARGETS,
  COMMIT_VERBS,
  FILES_BY_ROLE,
  REVIEW_APPROVES,
  REVIEW_COMMENTS,
} from "@/data/personaTemplates";
import type { PhaseTemplate } from "@/data/projectPhaseTemplates";
import type { AiEmployee, GithubSim, Project } from "@/services/aiCompanyTypes";

// GitHub開発シミュレーション。AI社員が毎ターンCommit/PR/Issue/Reviewを
// 生成する(実コードは生成せず、ファイル名と差分行数のみ)。

const CAPS = { commits: 80, pullRequests: 40, issues: 40, reviews: 40, branches: 12, releases: 12 };

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function sha(): string {
  return Math.random().toString(16).slice(2, 9);
}

export function createGithubSim(): GithubSim {
  return {
    commits: [],
    pullRequests: [],
    issues: [],
    reviews: [],
    branches: [
      { name: "main", author: "system", active: true, turn: 1 },
      { name: "develop", author: "system", active: true, turn: 1 },
    ],
    releases: [],
    nextPr: 1,
    nextIssue: 1,
  };
}

function cap(gh: GithubSim): void {
  gh.commits = gh.commits.slice(0, CAPS.commits);
  gh.pullRequests = gh.pullRequests.slice(0, CAPS.pullRequests);
  gh.issues = gh.issues.slice(0, CAPS.issues);
  gh.reviews = gh.reviews.slice(0, CAPS.reviews);
  gh.branches = gh.branches.slice(0, CAPS.branches);
  gh.releases = gh.releases.slice(0, CAPS.releases);
}

function branchNameFor(phaseId: string, project: Project): string {
  const slug = project.idea.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 12);
  return `feature/${slug}-${phaseId}`;
}

function filesFor(author: AiEmployee, count: number): { name: string; adds: number; dels: number }[] {
  const pool = FILES_BY_ROLE[author.role] ?? ["util.ts", "index.ts"];
  const files: { name: string; adds: number; dels: number }[] = [];
  const used = new Set<string>();
  for (let i = 0; i < count; i++) {
    const name = pick(pool);
    if (used.has(name)) continue;
    used.add(name);
    files.push({
      name,
      adds: 20 + Math.floor(Math.random() * 320),
      dels: Math.floor(Math.random() * 60),
    });
  }
  return files;
}

export type GhTurnEvents = { logs: { kind: "info" | "review" | "warning" | "success"; message: string }[] };

// 毎ターンの活動生成。工程の種類(ghActivity)に応じて生成物を変える。
export function simulateGithubTurn(
  gh: GithubSim,
  project: Project,
  template: PhaseTemplate,
  assignee: AiEmployee,
  reviewerPool: AiEmployee[],
  turn: number,
  phaseCompleted: boolean
): GhTurnEvents {
  const logs: GhTurnEvents["logs"] = [];
  const kind = template.ghActivity;

  // ブランチ(実装系工程の開始時に作成)
  const branch = kind === "code" || kind === "test" ? branchNameFor(template.id, project) : "develop";
  if ((kind === "code" || kind === "test") && !gh.branches.some((b) => b.name === branch)) {
    gh.branches = [{ name: branch, author: assignee.name, active: true, turn }, ...gh.branches];
  }

  // コミット(docs/design/code/testで毎ターン1〜3件)
  if (kind !== "release" && kind !== "ops") {
    const commitCount = kind === "code" ? 1 + Math.floor(Math.random() * 3) : 1;
    for (let i = 0; i < commitCount; i++) {
      const verb = pick(COMMIT_VERBS);
      const target = pick(COMMIT_TARGETS);
      gh.commits = [
        {
          id: `c-${turn}-${i}-${sha()}`,
          sha: sha(),
          message: `${verb}: ${target}`,
          author: assignee.name,
          branch,
          files: filesFor(assignee, kind === "code" ? 1 + Math.floor(Math.random() * 3) : 1),
          turn,
        },
        ...gh.commits,
      ];
    }
  }

  // 工程完了時: PR作成→レビュー→マージ
  if (phaseCompleted && (kind === "code" || kind === "test" || kind === "design")) {
    const prNumber = gh.nextPr++;
    const reviewer = pick(reviewerPool.filter((e) => e.id !== assignee.id)) ?? assignee;
    const requestChanges = Math.random() < 0.3;
    const adds = 120 + Math.floor(Math.random() * 500);
    const dels = 10 + Math.floor(Math.random() * 120);

    gh.pullRequests = [
      {
        number: prNumber,
        title: `${template.label}: ${project.idea.name}`,
        author: assignee.name,
        reviewer: reviewer.name,
        branch,
        status: requestChanges ? "changes_requested" : "merged",
        adds,
        dels,
        turn,
      },
      ...gh.pullRequests,
    ];

    const comment = requestChanges ? pick(REVIEW_COMMENTS) : pick(REVIEW_APPROVES);
    gh.reviews = [
      {
        id: `rv-${prNumber}-${sha()}`,
        prNumber,
        reviewer: reviewer.name,
        comment,
        verdict: requestChanges ? "request_changes" : "approve",
        turn,
      },
      ...gh.reviews,
    ];
    logs.push({
      kind: "review",
      message: `${reviewer.name}がPR #${prNumber}をレビュー:「${comment}」`,
    });

    if (requestChanges) {
      // 修正コミット後にマージされる(同ターン内で解決)
      gh.commits = [
        {
          id: `c-fix-${prNumber}-${sha()}`,
          sha: sha(),
          message: `fix: レビュー指摘対応 (#${prNumber})`,
          author: assignee.name,
          branch,
          files: filesFor(assignee, 1),
          turn,
        },
        ...gh.commits,
      ];
      gh.pullRequests = gh.pullRequests.map((pr) =>
        pr.number === prNumber ? { ...pr, status: "merged" as const } : pr
      );
      logs.push({ kind: "success", message: `${assignee.name}が指摘を修正し、PR #${prNumber}がマージされました` });
    }

    // ブランチを閉じる
    gh.branches = gh.branches.map((b) => (b.name === branch ? { ...b, active: false } : b));
  }

  cap(gh);
  return { logs };
}

// バグ発生をIssue化する
export function openBugIssues(gh: GithubSim, count: number, author: AiEmployee, turn: number): void {
  for (let i = 0; i < count; i++) {
    gh.issues = [
      {
        number: gh.nextIssue++,
        title: `[bug] ${pick(COMMIT_TARGETS)}で${pick(["表示崩れ", "クラッシュ", "値が保存されない", "無限ローディング"])}`,
        author: author.name,
        status: "open" as const,
        label: "bug" as const,
        turn,
      },
      ...gh.issues,
    ].slice(0, 40);
  }
}

// バグ修正でopenなbug Issueを閉じる
export function closeBugIssues(gh: GithubSim, count: number): number {
  let closed = 0;
  gh.issues = gh.issues.map((issue) => {
    if (closed < count && issue.status === "open" && issue.label === "bug") {
      closed++;
      return { ...issue, status: "closed" as const };
    }
    return issue;
  });
  return closed;
}

export function addRelease(gh: GithubSim, tag: string, name: string, notes: string, turn: number): void {
  gh.releases = [{ tag, name, notes, turn }, ...gh.releases].slice(0, 12);
}
