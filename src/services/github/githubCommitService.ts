import type { GithubApiAdapter } from "@/lib/githubStudio/adapter";

// Commit一覧の取得と、Human Approval後にのみ呼ばれるコミット作成(=Push)。
// Web側からのPushはGit Data API(blob→tree→commit→ref更新)で行う。

export type GithubCommitSummary = {
  sha: string;
  message: string;
  author: string;
  date: string | null;
  htmlUrl: string;
};

export type CommitFileInput = {
  path: string;
  content: string; // UTF-8テキスト
};

export async function listCommits(
  adapter: GithubApiAdapter,
  owner: string,
  repo: string
): Promise<GithubCommitSummary[]> {
  try {
    const { data } = await adapter.rest.repos.listCommits({ owner, repo, per_page: 30 });
    return data.map((c) => ({
      sha: c.sha,
      message: c.commit.message.split("\n")[0].slice(0, 200),
      author: c.author?.login ?? c.commit.author?.name ?? "unknown",
      date: c.commit.author?.date ?? null,
      htmlUrl: c.html_url,
    }));
  } catch (err) {
    // 空リポジトリは409を返す(コミット0件として扱う)
    if ((err as { status?: number } | null)?.status === 409) return [];
    throw err;
  }
}

/**
 * 複数ファイルを1コミットとしてブランチへPushする。
 * 必ずHuman Approval済みの実行リクエスト経由でのみ呼ぶこと。
 */
export async function commitAndPushFiles(
  adapter: GithubApiAdapter,
  params: {
    owner: string;
    repo: string;
    branch: string;
    message: string;
    files: CommitFileInput[];
  }
): Promise<{ sha: string; filesCount: number; htmlUrl: string }> {
  const { owner, repo, branch, message, files } = params;
  const rest = adapter.rest;

  // 1. ブランチの現在の先頭コミットとそのtreeを取得
  const { data: ref } = await rest.git.getRef({ owner, repo, ref: `heads/${branch}` });
  const parentSha = ref.object.sha;
  const { data: parentCommit } = await rest.git.getCommit({ owner, repo, commit_sha: parentSha });

  // 2. 各ファイルをblob化
  const blobs = await Promise.all(
    files.map(async (f) => {
      const { data } = await rest.git.createBlob({
        owner,
        repo,
        content: Buffer.from(f.content, "utf8").toString("base64"),
        encoding: "base64",
      });
      return { path: f.path, sha: data.sha };
    })
  );

  // 3. 親treeを基点に新しいtreeを作成
  const { data: tree } = await rest.git.createTree({
    owner,
    repo,
    base_tree: parentCommit.tree.sha,
    tree: blobs.map((b) => ({ path: b.path, mode: "100644" as const, type: "blob" as const, sha: b.sha })),
  });

  // 4. コミット作成 → 5. ブランチrefを進める(=Push)
  const { data: commit } = await rest.git.createCommit({
    owner,
    repo,
    message,
    tree: tree.sha,
    parents: [parentSha],
  });
  await rest.git.updateRef({ owner, repo, ref: `heads/${branch}`, sha: commit.sha });

  return {
    sha: commit.sha,
    filesCount: files.length,
    htmlUrl: `https://github.com/${owner}/${repo}/commit/${commit.sha}`,
  };
}
