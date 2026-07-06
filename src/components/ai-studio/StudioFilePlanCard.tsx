"use client";

import { FileCode2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { FileChange } from "@/services/aiStudioTypes";

// 変更予定ファイル一覧。AI社員がどのファイルをどう変えるつもりかを可視化する。
export function StudioFilePlanCard({ filePlan }: { filePlan: FileChange[] }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 py-4">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold">
          <FileCode2 className="text-primary size-4" />
          変更予定ファイル({filePlan.length}件)
        </h3>
        {filePlan.length === 0 ? (
          <p className="text-muted-foreground text-xs">設計工程が進むと変更予定のファイル一覧がここに並びます。</p>
        ) : (
          <div className="flex flex-col gap-1">
            {filePlan.map((f, i) => (
              <div key={`${f.path}-${i}`} className="flex items-center gap-2 text-[11px]">
                <span
                  className={`w-4 shrink-0 text-center font-mono font-bold ${
                    f.action === "add" ? "text-emerald-500" : "text-amber-500"
                  }`}
                >
                  {f.action === "add" ? "A" : "M"}
                </span>
                <span className="min-w-0 flex-1 truncate font-mono">{f.path}</span>
                <span className="text-muted-foreground hidden truncate sm:inline">{f.summary}</span>
                <span className="text-muted-foreground shrink-0 text-[10px]">{f.owner}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
