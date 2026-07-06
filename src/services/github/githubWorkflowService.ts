import type { GithubApiAdapter } from "@/lib/githubStudio/adapter";

// Workflow定義の取得と、スタジオがPushするCI/Deployワークフローのテンプレート。

export type GithubWorkflowSummary = {
  id: number;
  name: string;
  path: string;
  state: string;
  htmlUrl: string;
};

export async function listWorkflows(
  adapter: GithubApiAdapter,
  owner: string,
  repo: string
): Promise<GithubWorkflowSummary[]> {
  const { data } = await adapter.rest.actions.listRepoWorkflows({ owner, repo, per_page: 30 });
  return data.workflows.map((w) => ({
    id: w.id,
    name: w.name,
    path: w.path,
    state: w.state,
    htmlUrl: w.html_url,
  }));
}

export { buildCiWorkflowYaml, buildDeployWorkflowYaml } from "@/services/github/workflowTemplates";
