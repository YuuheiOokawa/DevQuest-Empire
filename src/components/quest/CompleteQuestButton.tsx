"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function CompleteQuestButton({ questId }: { questId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleComplete() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/quest/${questId}/complete`, {
        method: "POST",
      });
      if (!res.ok) {
        setError("クエストの完了に失敗しました。");
        return;
      }
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={handleComplete} disabled={pending}>
        {pending ? "処理中..." : "完了にする"}
      </Button>
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}
