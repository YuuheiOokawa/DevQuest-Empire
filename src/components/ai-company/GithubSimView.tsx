"use client";

import { useState } from "react";
import {
  GitCommitHorizontal,
  GitPullRequest,
  CircleDot,
  Eye,
  GitBranch,
  Tag,
  CheckCircle2,
  GitMerge,
} from "lucide-react";
import { loadState } from "@/services/aiCompanyService";
import type { GithubSim } from "@/services/aiCompanyTypes";

// GitHub風の開発活動ビューア。AI社員が生成したCommit/PR/Issue/Review/
// Branch/Releaseを閲覧する(読み取り専用・進行は/ai-company側で行う)。

type Tab = "commits" | "prs" | "issues" | "reviews" | "branches" | "releases";

const TABS: { id: Tab; label: string; icon: typeof GitCommitHorizontal }[] = [
  { id: "commits", label: "Commits", icon: GitCommitHorizontal },
  { id: "prs", label: "PRs", icon: GitPullRequest },
  { id: "issues", label: "Issues", icon: CircleDot },
  { id: "reviews", label: "Reviews", icon: Eye },
  { id: "branches", label: "Branches", icon: GitBranch },
  { id: "releases", label: "Releases", icon: Tag },
];

function Empty({ label }: { label: string }) {
  return <p className="text-muted-foreground py-8 text-center text-xs">{label}はまだありません</p>;
}

function DiffStat({ adds, dels }: { adds: number; dels: number }) {
  return (
    <span className="shrink-0 font-mono text-[11px]">
      <span className="text-emerald-600 dark:text-emerald-400">+{adds}</span>{" "}
      <span className="text-rose-600 dark:text-rose-400">-{dels}</span>
    </span>
  );
}

function TabContent({ tab, gh }: { tab: Tab; gh: GithubSim }) {
  if (tab === "commits") {
    if (gh.commits.length === 0) return <Empty label="Commit" />;
    return (
      <div className="flex flex-col gap-1.5">
        {gh.commits.map((c) => (
          <div key={c.id} className="rounded-lg border p-2.5">
            <div className="flex items-center gap-2">
              <GitCommitHorizontal className="text-muted-foreground size-3.5 shrink-0" />
              <span className="min-w-0 flex-1 truncate text-xs font-medium">{c.message}</span>
              <code className="text-muted-foreground shrink-0 font-mono text-[10px]">{c.sha}</code>
            </div>
            <p className="text-muted-foreground mt-0.5 text-[10px]">
              {c.author} ・ {c.branch} ・ 第{c.turn}週
            </p>
            <div className="mt-1 flex flex-col gap-0.5">
              {c.files.map((f) => (
                <div key={f.name} className="flex items-center justify-between gap-2">
                  <code className="text-muted-foreground min-w-0 truncate font-mono text-[10px]">{f.name}</code>
                  <DiffStat adds={f.adds} dels={f.dels} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (tab === "prs") {
    if (gh.pullRequests.length === 0) return <Empty label="Pull Request" />;
    return (
      <div className="flex flex-col gap-1.5">
        {gh.pullRequests.map((pr) => (
          <div key={pr.number} className="rounded-lg border p-2.5">
            <div className="flex items-center gap-2">
              {pr.status === "merged" ? (
                <GitMerge className="size-3.5 shrink-0 text-violet-500" />
              ) : (
                <GitPullRequest className="size-3.5 shrink-0 text-emerald-500" />
              )}
              <span className="min-w-0 flex-1 truncate text-xs font-medium">
                #{pr.number} {pr.title}
              </span>
              <span
                className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${
                  pr.status === "merged"
                    ? "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400"
                    : pr.status === "changes_requested"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                }`}
              >
                {pr.status === "merged" ? "Merged" : pr.status === "changes_requested" ? "Changes" : "Open"}
              </span>
            </div>
            <div className="mt-0.5 flex items-center justify-between gap-2">
              <p className="text-muted-foreground min-w-0 truncate text-[10px]">
                {pr.author} → {pr.reviewer ?? "-"} ・ {pr.branch} ・ 第{pr.turn}週
              </p>
              <DiffStat adds={pr.adds} dels={pr.dels} />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (tab === "issues") {
    if (gh.issues.length === 0) return <Empty label="Issue" />;
    return (
      <div className="flex flex-col gap-1.5">
        {gh.issues.map((issue) => (
          <div key={issue.number} className="flex items-center gap-2 rounded-lg border p-2.5">
            {issue.status === "open" ? (
              <CircleDot className="size-3.5 shrink-0 text-emerald-500" />
            ) : (
              <CheckCircle2 className="size-3.5 shrink-0 text-violet-500" />
            )}
            <div className="min-w-0 flex-1">
              <span className="block truncate text-xs font-medium">
                #{issue.number} {issue.title}
              </span>
              <span className="text-muted-foreground text-[10px]">
                {issue.author} ・ 第{issue.turn}週
              </span>
            </div>
            <span
              className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] ${
                issue.label === "bug"
                  ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                  : "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400"
              }`}
            >
              {issue.label}
            </span>
          </div>
        ))}
      </div>
    );
  }
  if (tab === "reviews") {
    if (gh.reviews.length === 0) return <Empty label="Review" />;
    return (
      <div className="flex flex-col gap-1.5">
        {gh.reviews.map((review) => (
          <div key={review.id} className="rounded-lg border p-2.5">
            <div className="flex items-center gap-2">
              <Eye className="text-muted-foreground size-3.5 shrink-0" />
              <span className="min-w-0 flex-1 truncate text-xs font-medium">
                {review.reviewer} → PR #{review.prNumber}
              </span>
              <span
                className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${
                  review.verdict === "approve"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                }`}
              >
                {review.verdict === "approve" ? "Approve" : "Request changes"}
              </span>
            </div>
            <p className="text-muted-foreground mt-1 text-[11px]">「{review.comment}」</p>
          </div>
        ))}
      </div>
    );
  }
  if (tab === "branches") {
    return (
      <div className="flex flex-col gap-1.5">
        {gh.branches.map((b) => (
          <div key={b.name} className="flex items-center gap-2 rounded-lg border p-2.5">
            <GitBranch className="text-muted-foreground size-3.5 shrink-0" />
            <code className="min-w-0 flex-1 truncate font-mono text-xs">{b.name}</code>
            <span className="text-muted-foreground shrink-0 text-[10px]">{b.author}</span>
            <span
              className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] ${
                b.active
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {b.active ? "active" : "merged"}
            </span>
          </div>
        ))}
      </div>
    );
  }
  if (gh.releases.length === 0) return <Empty label="Release" />;
  return (
    <div className="flex flex-col gap-1.5">
      {gh.releases.map((r) => (
        <div key={`${r.tag}-${r.turn}`} className="rounded-lg border p-2.5">
          <div className="flex items-center gap-2">
            <Tag className="size-3.5 shrink-0 text-amber-500" />
            <code className="shrink-0 font-mono text-xs font-bold">{r.tag}</code>
            <span className="min-w-0 flex-1 truncate text-xs">{r.name}</span>
            <span className="text-muted-foreground shrink-0 text-[10px]">第{r.turn}週</span>
          </div>
          <p className="text-muted-foreground mt-0.5 text-[10px]">{r.notes}</p>
        </div>
      ))}
    </div>
  );
}

export function GithubSimView() {
  const [state] = useState(() => loadState());
  const [tab, setTab] = useState<Tab>("commits");
  const gh = state.github;

  const counts: Record<Tab, number> = {
    commits: gh.commits.length,
    prs: gh.pullRequests.length,
    issues: gh.issues.length,
    reviews: gh.reviews.length,
    branches: gh.branches.length,
    releases: gh.releases.length,
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="scrollbar-none -mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1.5 text-xs transition-colors ${
              tab === t.id ? "bg-foreground text-background font-semibold" : "hover:bg-accent"
            }`}
          >
            <t.icon className="size-3.5" />
            {t.label}
            <span className={`text-[9px] ${tab === t.id ? "opacity-70" : "text-muted-foreground"}`}>
              {counts[t.id]}
            </span>
          </button>
        ))}
      </div>
      <TabContent tab={tab} gh={gh} />
    </div>
  );
}
