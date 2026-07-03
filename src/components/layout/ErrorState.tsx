"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export function ErrorState({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-4 px-4 py-10 text-center">
      <p className="font-semibold">問題が発生しました</p>
      <p className="text-muted-foreground text-sm">
        時間をおいて再度お試しください。改善しない場合は同期設定をご確認ください。
      </p>
      <Button onClick={reset} variant="outline" size="sm">
        再試行
      </Button>
    </main>
  );
}
