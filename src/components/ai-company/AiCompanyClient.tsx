"use client";

import dynamic from "next/dynamic";

// セーブデータがlocalStorageにあるため、ダッシュボードはSSRせず
// クライアントのみで描画する(サーバーHTMLとの不一致を避ける)。
const AiCompanyDashboard = dynamic(
  () => import("./AiCompanyDashboard").then((m) => m.AiCompanyDashboard),
  {
    ssr: false,
    loading: () => (
      <div className="text-muted-foreground py-16 text-center text-sm">
        会社データを読み込み中...
      </div>
    ),
  }
);

export function AiCompanyClient() {
  return <AiCompanyDashboard />;
}
