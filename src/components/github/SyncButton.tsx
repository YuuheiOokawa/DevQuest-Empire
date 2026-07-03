"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SyncButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSync() {
    setPending(true);
    setMessage(null);
    try {
      const res = await fetch("/api/github/sync", { method: "POST" });
      if (!res.ok) {
        setMessage("同期に失敗しました。");
        return;
      }
      const result = await res.json();
      setMessage(
        `Commit+${result.newCommits} Issue+${result.newIssues} PR+${result.newPullRequests} (獲得EXP: ${result.expGained})`
      );
      router.refresh();
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
      {message && <p className="text-muted-foreground text-xs">{message}</p>}
    </div>
  );
}
