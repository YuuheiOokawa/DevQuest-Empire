"use client";

import { useState } from "react";
import { CheckCircle2, Circle, Loader2, PlayCircle, RefreshCw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ActionsStep } from "@/services/aiStudioTypes";

// GitHub Actionsのパイプライン表示。実リポジトリ作成後は
// 「実CI結果を取得」でGitHub APIから実際のRun結果を自動取り込みできる。
export function StudioActionsCard({
  steps,
  onFetchReal,
}: {
  steps: ActionsStep[];
  onFetchReal?: () => Promise<string | null>;
}) {
  const [fetching, setFetching] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const successCount = steps.filter((s) => s.status === "success").length;

  const handleFetch = async () => {
    if (!onFetchReal) return;
    setFetching(true);
    try {
      setMessage(await onFetchReal());
    } finally {
      setFetching(false);
    }
  };

  return (
    <Card>
      <CardContent className="flex flex-col gap-2.5 py-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold">
            <PlayCircle className="text-primary size-4" />
            GitHub Actions(CI/CD)
          </h3>
          <span className="text-muted-foreground text-xs">
            {successCount}/{steps.length} 成功
          </span>
        </div>
        <div className="flex flex-col gap-1">
          {steps.map((s) => (
            <div key={s.id} className="flex items-center gap-2 text-xs">
              {s.status === "success" ? (
                <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" />
              ) : s.status === "failure" ? (
                <XCircle className="size-3.5 shrink-0 text-red-500" />
              ) : s.status === "running" ? (
                <Loader2 className="size-3.5 shrink-0 animate-spin text-sky-500" />
              ) : (
                <Circle className="text-muted-foreground/40 size-3.5 shrink-0" />
              )}
              <span className="w-32 shrink-0 font-medium">{s.label}</span>
              <span className="text-muted-foreground truncate">
                {s.status === "pending" ? "待機中" : s.detail}
              </span>
            </div>
          ))}
        </div>
        {onFetchReal && (
          <Button size="sm" variant="outline" onClick={handleFetch} disabled={fetching} className="gap-1 text-xs">
            {fetching ? <Loader2 className="size-3 animate-spin" /> : <RefreshCw className="size-3" />}
            実CI結果を取得(GitHub API)
          </Button>
        )}
        {message && <p className="text-muted-foreground text-[10px]">{message}</p>}
      </CardContent>
    </Card>
  );
}
