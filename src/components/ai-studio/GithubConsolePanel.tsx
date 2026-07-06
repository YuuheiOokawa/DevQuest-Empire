"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CircleDot,
  ExternalLink,
  FolderGit2,
  GitBranch,
  GitCommitHorizontal,
  GitMerge,
  GitPullRequest,
  LayoutDashboard,
  Loader2,
  Package,
  PlayCircle,
  RefreshCw,
  Rocket,
  ShieldCheck,
  ShieldX,
  Terminal,
  Workflow as WorkflowIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  approveRequest,
  loadStudioState,
  markApprovalExecuted,
  rejectRequest,
} from "@/services/aiStudioService";
import type { ApprovalRequest, RiskLevel, StudioState } from "@/services/aiStudioTypes";
import {
  buildExecutionPayload,
  executeApprovedAction,
  fetchGithubOverview,
  fetchRepoDetail,
  GithubClientError,
  type GithubOverview,
  type GithubRepoDetail,
} from "@/services/githubStudioClient";

type ConsoleTab =
  | "dashboard"
  | "repositories"
  | "projects"
  | "issues"
  | "pulls"
  | "commits"
  | "branches"
  | "actions"
  | "releases"
  | "reviews"
  | "workflow"
  | "approvals";

const TABS: { id: ConsoleTab; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "approvals", label: "Approval Queue" },
  { id: "repositories", label: "Repositories" },
  { id: "projects", label: "Projects" },
  { id: "issues", label: "Issues" },
  { id: "pulls", label: "Pull Requests" },
  { id: "commits", label: "Commits" },
  { id: "branches", label: "Branches" },
  { id: "actions", label: "Actions" },
  { id: "releases", label: "Releases" },
  { id: "reviews", label: "Reviews" },
  { id: "workflow", label: "Workflow" },
];

const RISK_STYLE: Record<RiskLevel, string> = {
  low: "bg-emerald-500/15 text-emerald-600",
  medium: "bg-amber-500/15 text-amber-600",
  high: "bg-red-500/15 text-red-600",
};

const TYPE_LABEL: Record<ApprovalRequest["type"], string> = {
  repository: "Repository作成",
  branch: "Branch作成",
  commit: "Commit",
  push: "Push",
  pullRequest: "Pull Request",
  merge: "Merge",
  release: "Release",
  deploy: "Deploy",
};

// GitHubコンソール。実GitHubの状態(Repos/Issues/PRs/Actions...)を読み取り専用で表示し、
// Approval QueueでCEOが承認・実行する。書き込みは承認済み操作の実行のみ。
export function GithubConsolePanel() {
  const [studio, setStudio] = useState<StudioState>(() => loadStudioState());
  const [tab, setTab] = useState<ConsoleTab>("dashboard");
  const [overview, setOverview] = useState<GithubOverview | null>(null);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null); // "owner/repo"
  const [detailState, setDetailState] = useState<{ key: string; detail: GithubRepoDetail | null } | null>(null);
  const [executingId, setExecutingId] = useState<string | null>(null);
  const [execError, setExecError] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, string>>({});

  const loadOverview = useCallback((force: boolean) => {
    fetchGithubOverview(force)
      .then((o) => {
        setOverview(o);
        setOverviewError(null);
        setSelectedRepo((prev) => prev ?? (o.repos[0] ? o.repos[0].fullName : null));
      })
      .catch((e) => {
        setOverviewError(e instanceof GithubClientError ? e.message : "GitHubへ接続できませんでした");
      });
  }, []);

  useEffect(() => {
    loadOverview(false);
  }, [loadOverview]);

  useEffect(() => {
    if (!selectedRepo) return;
    let cancelled = false;
    const key = selectedRepo;
    const [owner, repo] = key.split("/");
    fetchRepoDetail(owner, repo)
      .then((d) => {
        if (!cancelled) setDetailState({ key, detail: d });
      })
      .catch(() => {
        if (!cancelled) setDetailState({ key, detail: null });
      });
    return () => {
      cancelled = true;
    };
  }, [selectedRepo]);

  const detail = detailState?.key === selectedRepo ? detailState.detail : null;
  const detailLoading = Boolean(selectedRepo) && detailState?.key !== selectedRepo;

  const pendingApprovals = studio.approvals.filter((a) => a.status === "pending");
  const login = overview?.profile.login ?? null;

  const handleExecute = async (approval: ApprovalRequest) => {
    setExecError(null);
    if (!login) {
      setExecError("GitHub未接続のため実行できません");
      return;
    }
    const payload = buildExecutionPayload(approval, studio, login);
    if (!payload) {
      if (approval.type === "commit") {
        setStudio((prev) =>
          markApprovalExecuted(prev, approval.id, [
            "Commit内容を確定しました(Push承認の実行時にまとめて反映されます)",
          ])
        );
        return;
      }
      setExecError("実行に必要な情報が不足しています(前工程の実行が未完了の可能性)");
      return;
    }
    setExecutingId(approval.id);
    try {
      const outcome = await executeApprovedAction(payload);
      setStudio((prev) => markApprovalExecuted(prev, approval.id, outcome.resultLines, outcome.githubPatch));
    } catch (e) {
      setExecError(e instanceof GithubClientError ? e.message : "GitHub APIの実行に失敗しました");
    } finally {
      setExecutingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-10">
      {/* 接続状態ヘッダー */}
      <Card>
        <CardContent className="flex items-center gap-3 py-3.5">
          <Link href="/ai-studio" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" />
          </Link>
          {overview ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={overview.profile.avatarUrl} alt="" className="size-8 rounded-full" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">
                  {overview.profile.name ?? overview.profile.login}
                  <span className="text-muted-foreground ml-1.5 font-normal">@{overview.profile.login}</span>
                </p>
                <p className="text-muted-foreground truncate text-[11px]">
                  {overview.profile.email ?? "email非公開"} ・ Repo {overview.repos.length} ・ Org{" "}
                  {overview.orgs.length > 0 ? overview.orgs.map((o) => o.login).join(", ") : "なし"}
                </p>
              </div>
              <Button size="sm" variant="ghost" className="gap-1 text-xs" onClick={() => loadOverview(true)}>
                <RefreshCw className="size-3" />
                更新
              </Button>
            </>
          ) : (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">GitHub接続を確認中...</p>
              {overviewError && <p className="text-xs text-red-500">{overviewError}</p>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* タブ(横スクロール) */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`relative shrink-0 rounded-lg border px-2.5 py-1.5 text-xs whitespace-nowrap transition-colors ${
              tab === t.id ? "bg-foreground text-background font-semibold" : "hover:bg-accent"
            }`}
          >
            {t.label}
            {t.id === "approvals" && pendingApprovals.length > 0 && (
              <span className="absolute -top-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
                {pendingApprovals.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* リポジトリ選択(リポジトリ依存タブのみ) */}
      {overview && ["issues", "pulls", "commits", "branches", "actions", "releases", "reviews", "workflow"].includes(tab) && (
        <select
          value={selectedRepo ?? ""}
          onChange={(e) => setSelectedRepo(e.target.value)}
          className="border-input bg-background w-full rounded-lg border px-2.5 py-2 text-xs"
        >
          {overview.repos.map((r) => (
            <option key={r.fullName} value={r.fullName}>
              {r.fullName}
            </option>
          ))}
        </select>
      )}

      {tab === "dashboard" && (
        <DashboardTab overview={overview} studio={studio} pendingCount={pendingApprovals.length} />
      )}

      {tab === "repositories" && (
        <Card>
          <CardContent className="flex flex-col gap-1.5 py-4">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold">
              <FolderGit2 className="text-primary size-4" />
              Repositories({overview?.repos.length ?? 0})
            </h3>
            {(overview?.repos ?? []).map((r) => (
              <a
                key={r.fullName}
                href={r.htmlUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:bg-accent flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs"
              >
                <span className="min-w-0 flex-1 truncate font-mono font-semibold">{r.fullName}</span>
                {r.isPrivate && <span className="bg-muted rounded px-1.5 py-0.5 text-[10px]">private</span>}
                {r.language && <span className="text-muted-foreground text-[10px]">{r.language}</span>}
                <ExternalLink className="text-muted-foreground size-3 shrink-0" />
              </a>
            ))}
          </CardContent>
        </Card>
      )}

      {tab === "projects" && <ProjectsTab studio={studio} />}

      {tab === "issues" && (
        <ListCard
          icon={CircleDot}
          title={`Issues(${detail?.issues.length ?? 0})`}
          loading={detailLoading}
          empty="Issueはありません"
          items={(detail?.issues ?? []).map((i) => ({
            key: `i-${i.number}`,
            main: `#${i.number} ${i.title}`,
            sub: `${i.state} ・ ${i.author} ・ ${i.createdAt.slice(0, 10)}`,
            href: i.htmlUrl,
          }))}
        />
      )}

      {tab === "pulls" && (
        <ListCard
          icon={GitPullRequest}
          title={`Pull Requests(${detail?.pulls.length ?? 0})`}
          loading={detailLoading}
          empty="PRはありません"
          items={(detail?.pulls ?? []).map((p) => ({
            key: `p-${p.number}`,
            main: `#${p.number} ${p.title}`,
            sub: `${p.merged ? "merged" : p.state} ・ ${p.head} → ${p.base} ・ ${p.author}`,
            href: p.htmlUrl,
          }))}
        />
      )}

      {tab === "commits" && (
        <ListCard
          icon={GitCommitHorizontal}
          title={`Commits(${detail?.commits.length ?? 0})`}
          loading={detailLoading}
          empty="コミットはありません"
          items={(detail?.commits ?? []).map((c) => ({
            key: c.sha,
            main: c.message,
            sub: `${c.sha.slice(0, 7)} ・ ${c.author} ・ ${c.date?.slice(0, 10) ?? ""}`,
            href: c.htmlUrl,
          }))}
        />
      )}

      {tab === "branches" && (
        <ListCard
          icon={GitBranch}
          title={`Branches(${detail?.branches.length ?? 0})`}
          loading={detailLoading}
          empty="ブランチはありません"
          items={(detail?.branches ?? []).map((b) => ({
            key: b.name,
            main: b.name,
            sub: `${b.sha.slice(0, 7)}${b.isProtected ? " ・ protected" : ""}`,
          }))}
        />
      )}

      {tab === "actions" && (
        <ListCard
          icon={PlayCircle}
          title={`Actions Runs(${detail?.runs.length ?? 0})`}
          loading={detailLoading}
          empty="ワークフロー実行はありません"
          items={(detail?.runs ?? []).map((r) => ({
            key: `r-${r.id}`,
            main: `${r.name}(${r.branch ?? "-"})`,
            sub: `${r.status}${r.conclusion ? ` / ${r.conclusion}` : ""} ・ ${r.event} ・ ${r.createdAt.slice(0, 10)}`,
            href: r.htmlUrl,
            tone: r.conclusion === "success" ? "success" : r.conclusion === "failure" ? "danger" : undefined,
          }))}
        />
      )}

      {tab === "releases" && (
        <ListCard
          icon={Rocket}
          title={`Releases(${detail?.releases.length ?? 0})`}
          loading={detailLoading}
          empty="リリースはありません"
          items={(detail?.releases ?? []).map((r) => ({
            key: `rel-${r.id}`,
            main: `${r.tagName} ${r.name ?? ""}`,
            sub: `${r.draft ? "draft" : r.prerelease ? "prerelease" : "published"} ・ ${r.createdAt.slice(0, 10)}`,
            href: r.htmlUrl,
          }))}
        />
      )}

      {tab === "reviews" && (
        <ListCard
          icon={GitMerge}
          title={`Reviews(${detail?.reviews.length ?? 0})`}
          loading={detailLoading}
          empty="レビューはありません(直近3PR分を表示)"
          items={(detail?.reviews ?? []).map((r) => ({
            key: `rev-${r.id}`,
            main: `PR #${r.prNumber} ${r.state}`,
            sub: `${r.author} ・ ${r.body.slice(0, 60) || "(本文なし)"}`,
          }))}
        />
      )}

      {tab === "workflow" && (
        <ListCard
          icon={WorkflowIcon}
          title={`Workflows(${detail?.workflows.length ?? 0})`}
          loading={detailLoading}
          empty="ワークフロー定義はありません"
          items={(detail?.workflows ?? []).map((w) => ({
            key: `w-${w.id}`,
            main: w.name,
            sub: `${w.path} ・ ${w.state}`,
            href: w.htmlUrl,
          }))}
        />
      )}

      {tab === "approvals" && (
        <div className="flex flex-col gap-3">
          {execError && <p className="rounded-lg bg-red-500/10 p-2.5 text-xs text-red-600">{execError}</p>}
          {studio.approvals.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-6 text-center">
                <ShieldCheck className="text-muted-foreground mx-auto mb-2 size-8" />
                <p className="text-muted-foreground text-sm">
                  承認キューは空です。AI開発スタジオで開発を進めると承認依頼が届きます。
                </p>
              </CardContent>
            </Card>
          ) : (
            studio.approvals.map((a) => (
              <Card key={a.id} className={a.status === "pending" ? "border-amber-500/50" : ""}>
                <CardContent className="flex flex-col gap-2 py-3.5">
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                    <span className="rounded bg-amber-500/15 px-1.5 py-0.5 font-semibold text-amber-600">
                      {TYPE_LABEL[a.type]}
                    </span>
                    <span className={`rounded px-1.5 py-0.5 font-semibold ${RISK_STYLE[a.riskLevel]}`}>
                      Risk: {a.riskLevel === "low" ? "低" : a.riskLevel === "medium" ? "中" : "高"}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 font-semibold ${
                        a.status === "pending"
                          ? "bg-sky-500/15 text-sky-600"
                          : a.status === "approved"
                            ? "bg-emerald-500/15 text-emerald-600"
                            : "bg-red-500/15 text-red-500"
                      }`}
                    >
                      {a.status === "pending" ? "承認待ち" : a.status === "approved" ? "承認済み" : "差し戻し"}
                    </span>
                  </div>
                  <p className="text-xs font-semibold">{a.title}</p>
                  <div className="text-muted-foreground grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px]">
                    <span>Project: {studio.project?.proposal.appName ?? "-"}</span>
                    <span>
                      Repository:{" "}
                      {studio.project?.github
                        ? `${studio.project.github.owner}/${studio.project.github.repo}`
                        : (studio.project?.proposal.repoName ?? "-")}
                    </span>
                    <span>Branch: {studio.project?.workBranch ?? "-"}</span>
                    <span>Requested By: {a.requestedBy}</span>
                    <span>Files Changed: {a.filesChanged}</span>
                    <span>Tests: {a.testsSummary}</span>
                  </div>

                  {a.status === "pending" && (
                    <>
                      <textarea
                        value={comments[a.id] ?? ""}
                        onChange={(e) => setComments((prev) => ({ ...prev, [a.id]: e.target.value }))}
                        placeholder="Comment(任意)"
                        rows={1}
                        className="border-input bg-background w-full rounded-lg border px-2.5 py-1.5 text-xs"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setStudio((prev) => approveRequest(prev, a.id, comments[a.id] ?? ""))}
                          className="flex-1 gap-1 bg-emerald-600 text-xs text-white hover:bg-emerald-700"
                        >
                          <ShieldCheck className="size-3.5" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setStudio((prev) => rejectRequest(prev, a.id, comments[a.id] ?? ""))}
                          className="flex-1 gap-1 text-xs text-red-600"
                        >
                          <ShieldX className="size-3.5" />
                          Reject
                        </Button>
                      </div>
                    </>
                  )}

                  {a.status === "approved" && !a.executionResult && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={executingId === a.id}
                      onClick={() => handleExecute(a)}
                      className="gap-1 text-xs"
                    >
                      {executingId === a.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Terminal className="size-3.5" />
                      )}
                      実行(GitHub API)
                    </Button>
                  )}
                  {a.executionResult && (
                    <div className="rounded bg-zinc-900 p-2.5">
                      {a.executionResult.map((line, i) => (
                        <p key={i} className="font-mono text-[11px] break-all text-emerald-400">
                          {line}
                        </p>
                      ))}
                    </div>
                  )}
                  {a.ceoComment && (
                    <p className="text-muted-foreground text-[10px]">CEOコメント: 「{a.ceoComment}」</p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function DashboardTab({
  overview,
  studio,
  pendingCount,
}: {
  overview: GithubOverview | null;
  studio: StudioState;
  pendingCount: number;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <StatCard icon={FolderGit2} label="Repositories" value={overview ? String(overview.repos.length) : "-"} />
        <StatCard icon={ShieldCheck} label="Approval待ち" value={String(pendingCount)} />
        <StatCard icon={Package} label="完成プロジェクト" value={String(studio.completedProjects.length)} />
        <StatCard icon={LayoutDashboard} label="スタジオDay" value={String(studio.day)} />
      </div>
      <Card>
        <CardContent className="flex flex-col gap-1.5 py-4">
          <h3 className="text-sm font-semibold">開発中プロジェクト</h3>
          {studio.project ? (
            <div className="text-xs">
              <p className="font-semibold">{studio.project.proposal.appName}</p>
              <p className="text-muted-foreground">
                repo: {studio.project.proposal.repoName} ・ branch: {studio.project.workBranch}
              </p>
              {studio.project.github?.htmlUrl ? (
                <a
                  href={studio.project.github.htmlUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary flex items-center gap-1 underline"
                >
                  <ExternalLink className="size-3" />
                  {studio.project.github.htmlUrl}
                </a>
              ) : (
                <p className="text-muted-foreground text-[10px]">(GitHub上のRepositoryはまだ作成されていません)</p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-xs">開発中のプロジェクトはありません。</p>
          )}
        </CardContent>
      </Card>
      <p className="text-muted-foreground text-[10px]">
        すべての書き込み操作(Repository作成/Branch/Push/PR/Merge/Release/Deploy)はApproval QueueでのCEO承認後にのみ実行されます。
      </p>
    </div>
  );
}

function ProjectsTab({ studio }: { studio: StudioState }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 py-4">
        <h3 className="text-sm font-semibold">Projects</h3>
        {studio.project && (
          <div className="rounded-lg border p-2.5 text-xs">
            <p className="font-semibold">{studio.project.proposal.appName}(開発中)</p>
            <p className="text-muted-foreground">
              {studio.project.proposal.category} ・ repo: {studio.project.proposal.repoName} ・ Day{" "}
              {studio.project.startedDay}開始
            </p>
          </div>
        )}
        {studio.completedProjects.map((p) => (
          <div key={p.repoName} className="rounded-lg border p-2.5 text-xs">
            <p className="font-semibold">{p.appName}(完了)</p>
            <p className="text-muted-foreground">
              repo: {p.repoName} ・ Day {p.deployedDay}デプロイ
            </p>
          </div>
        ))}
        {!studio.project && studio.completedProjects.length === 0 && (
          <p className="text-muted-foreground text-xs">プロジェクトはまだありません。</p>
        )}
      </CardContent>
    </Card>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof FolderGit2; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-2.5 py-3">
        <Icon className="text-primary size-4 shrink-0" />
        <div>
          <p className="text-muted-foreground text-[10px]">{label}</p>
          <p className="text-sm font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ListCard({
  icon: Icon,
  title,
  loading,
  empty,
  items,
}: {
  icon: typeof FolderGit2;
  title: string;
  loading: boolean;
  empty: string;
  items: { key: string; main: string; sub: string; href?: string; tone?: "success" | "danger" }[];
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1.5 py-4">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold">
          <Icon className="text-primary size-4" />
          {title}
        </h3>
        {loading ? (
          <p className="text-muted-foreground flex items-center gap-1.5 py-4 text-xs">
            <Loader2 className="size-3.5 animate-spin" />
            読み込み中...
          </p>
        ) : items.length === 0 ? (
          <p className="text-muted-foreground text-xs">{empty}</p>
        ) : (
          items.map((item) => {
            const inner = (
              <>
                <span
                  className={`min-w-0 flex-1 truncate ${
                    item.tone === "success" ? "text-emerald-600" : item.tone === "danger" ? "text-red-500" : ""
                  }`}
                >
                  {item.main}
                </span>
                <span className="text-muted-foreground shrink-0 text-[10px]">{item.sub}</span>
                {item.href && <ExternalLink className="text-muted-foreground size-3 shrink-0" />}
              </>
            );
            return item.href ? (
              <a
                key={item.key}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="hover:bg-accent flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs"
              >
                {inner}
              </a>
            ) : (
              <div key={item.key} className="flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs">
                {inner}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
