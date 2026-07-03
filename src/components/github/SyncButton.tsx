"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SyncButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  async function handleSync() {
    setPending(true);
    setMessage(null);
    setIsError(false);
    try {
      const res = await fetch("/api/github/sync", { method: "POST" });
      const result = await res.json();
      if (!res.ok) {
        setIsError(true);
        setMessage(result.message ?? "同期に失敗しました。");
        return;
      }
      setMessage(
        `Commit+${result.newCommits} Issue+${result.newIssues} PR+${result.newPullRequests} (獲得EXP: ${result.expGained})`
      );
      router.refresh();
    } catch {
      setIsError(true);
      setMessage("通信エラーが発生しました。ネットワーク環境をご確認ください。");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button onClick={handleSync} disabled={pending} size="sm" variant="outline">
        <RefreshCw className={pending ? "size-4 animate-spin" : "size-4"} />
        {pending ? "同期中..." : "GitHub同期"}
      </Button>
      {message && (
        <p
          className={
            isError
              ? "text-destructive text-xs"
              : "text-muted-foreground text-xs"
          }
        >
          {message}
        </p>
      )}
    </div>
  );
}
