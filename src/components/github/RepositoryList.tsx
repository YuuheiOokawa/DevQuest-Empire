"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export type RepositoryItem = {
  id: string;
  fullName: string;
  isPrivate: boolean;
  syncEnabled: boolean;
  privateConsent: boolean;
  lastSyncedAt: string | null;
};

export function RepositoryList({
  initialRepositories,
}: {
  initialRepositories: RepositoryItem[];
}) {
  const [repositories, setRepositories] = useState(initialRepositories);
  const [pendingConsentId, setPendingConsentId] = useState<string | null>(
    null
  );
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function updateSync(
    repo: RepositoryItem,
    syncEnabled: boolean,
    privateConsent?: boolean
  ) {
    setUpdatingId(repo.id);
    try {
      const res = await fetch(
        `/api/github/repositories/${repo.id}/sync-enable`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ syncEnabled, privateConsent }),
        }
      );
      if (!res.ok) return;
      const updated = await res.json();
      setRepositories((prev) =>
        prev.map((r) =>
          r.id === repo.id
            ? {
                ...r,
                syncEnabled: updated.syncEnabled,
                privateConsent: updated.privateConsent,
              }
            : r
        )
      );
      setPendingConsentId(null);
    } finally {
      setUpdatingId(null);
    }
  }

  function handleToggle(repo: RepositoryItem, next: boolean) {
    if (repo.isPrivate && next && !repo.privateConsent) {
      setPendingConsentId(repo.id);
      return;
    }
    updateSync(repo, next);
  }

  if (repositories.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        GitHub上にリポジトリが見つかりませんでした。
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {repositories.map((repo) => (
        <Card key={repo.id}>
          <CardContent className="flex flex-col gap-3 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-medium">{repo.fullName}</span>
                {repo.isPrivate && (
                  <Badge variant="secondary">Private</Badge>
                )}
              </div>
              <Switch
                checked={repo.syncEnabled}
                disabled={updatingId === repo.id}
                onCheckedChange={(checked) => handleToggle(repo, checked)}
              />
            </div>

            {pendingConsentId === repo.id && (
              <div className="bg-muted flex flex-col gap-3 rounded-md p-3 text-sm">
                <p>
                  このリポジトリはPrivateです。同期を有効にすると、コミット・Issue・Pull
                  Requestのメタデータ(コード本文は含みません)をこのアプリが読み取ります。
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => updateSync(repo, true, true)}
                  >
                    同意して有効にする
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPendingConsentId(null)}
                  >
                    キャンセル
                  </Button>
                </div>
              </div>
            )}

            {repo.lastSyncedAt && (
              <p className="text-muted-foreground text-xs">
                最終同期: {new Date(repo.lastSyncedAt).toLocaleString("ja-JP")}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
