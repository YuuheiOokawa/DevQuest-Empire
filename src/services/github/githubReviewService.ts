import type { GithubApiAdapter } from "@/lib/githubStudio/adapter";

// PRレビューの取得と、CEO承認時のレビューコメント投稿。

export type GithubReviewSummary = {
  id: number;
  prNumber: number;
  author: string;
  state: string; // APPROVED | CHANGES_REQUESTED | COMMENTED
  body: string;
  submittedAt: string | null;
};

export async function listReviewsForPull(
  adapter: GithubApiAdapter,
  owner: string,
  repo: string,
  prNumber: number
): Promise<GithubReviewSummary[]> {
  const { data } = await adapter.rest.pulls.listReviews({ owner, repo, pull_number: prNumber, per_page: 30 });
  return data.map((r) => ({
    id: r.id,
    prNumber,
    author: r.user?.login ?? "unknown",
    state: r.state,
    body: r.body ?? "",
    submittedAt: r.submitted_at ?? null,
  }));
}

/**
 * CEOのApprove/コメントをPRレビューとして残す。
 * (自分が作者のPRはAPPROVEできないため、その場合はCOMMENTとして投稿する)
 */
export async function submitReview(
  adapter: GithubApiAdapter,
  params: { owner: string; repo: string; number: number; body: string }
): Promise<{ submitted: boolean }> {
  await adapter.rest.pulls.createReview({
    owner: params.owner,
    repo: params.repo,
    pull_number: params.number,
    event: "COMMENT",
    body: params.body,
  });
  return { submitted: true };
}
