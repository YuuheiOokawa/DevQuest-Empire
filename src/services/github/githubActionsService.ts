import type { GithubApiAdapter } from "@/lib/githubStudio/adapter";

// GitHub Actionsの実行状況取得と、Human Approval後のワークフロー起動(Deploy等)。

export type GithubWorkflowRun = {
  id: number;
  name: string;
  status: string; // queued | in_progress | completed
  conclusion: string | null; // success | failure | ...
  branch: string | null;
  event: string;
  createdAt: string;
  htmlUrl: string;
};

export async function listWorkflowRuns(
  adapter: GithubApiAdapter,
  owner: string,
  repo: string
): Promise<GithubWorkflowRun[]> {
  const { data } = await adapter.rest.actions.listWorkflowRunsForRepo({ owner, repo, per_page: 20 });
  return data.workflow_runs.map((r) => ({
    id: r.id,
    name: r.name ?? "workflow",
    status: r.status ?? "unknown",
    conclusion: r.conclusion,
    branch: r.head_branch,
    event: r.event,
    createdAt: r.created_at,
    htmlUrl: r.html_url,
  }));
}

/**
 * workflow_dispatchでワークフローを起動する(Deploy用)。
 * 必ずHuman Approval済みの実行リクエスト経由でのみ呼ぶこと。
 */
export async function dispatchWorkflow(
  adapter: GithubApiAdapter,
  params: { owner: string; repo: string; workflowFile: string; ref: string }
): Promise<{ dispatched: boolean }> {
  await adapter.rest.actions.createWorkflowDispatch({
    owner: params.owner,
    repo: params.repo,
    workflow_id: params.workflowFile,
    ref: params.ref,
  });
  return { dispatched: true };
}
