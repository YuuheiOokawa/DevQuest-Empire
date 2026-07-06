"use client";

import dynamic from "next/dynamic";

// スタジオの状態はlocalStorageにあるため、SSRせずクライアントのみで描画する。
const AiStudioDashboard = dynamic(
  () => import("./AiStudioDashboard").then((m) => m.AiStudioDashboard),
  {
    ssr: false,
    loading: () => (
      <div className="text-muted-foreground py-16 text-center text-sm">
        スタジオデータを読み込み中...
      </div>
    ),
  }
);

export function AiStudioClient() {
  return <AiStudioDashboard />;
}
