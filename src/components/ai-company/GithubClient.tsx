"use client";

import dynamic from "next/dynamic";

// セーブデータがlocalStorageにあるため、SSRせずクライアントのみで描画する。
const GithubSimView = dynamic(
  () => import("./GithubSimView").then((m) => m.GithubSimView),
  {
    ssr: false,
    loading: () => (
      <div className="text-muted-foreground py-16 text-center text-sm">読み込み中...</div>
    ),
  }
);

export function GithubClient() {
  return <GithubSimView />;
}
