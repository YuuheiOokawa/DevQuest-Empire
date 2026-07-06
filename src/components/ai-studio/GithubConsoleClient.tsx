"use client";

import dynamic from "next/dynamic";

// スタジオ状態・GitHubキャッシュがlocalStorageにあるため、クライアントのみで描画する。
const GithubConsolePanel = dynamic(
  () => import("./GithubConsolePanel").then((m) => m.GithubConsolePanel),
  {
    ssr: false,
    loading: () => (
      <div className="text-muted-foreground py-16 text-center text-sm">
        GitHubコンソールを読み込み中...
      </div>
    ),
  }
);

export function GithubConsoleClient() {
  return <GithubConsolePanel />;
}
