"use client";

import { useState } from "react";
import { FileText, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { DesignDoc } from "@/services/aiCompanyTypes";

function DocItem({ doc }: { doc: DesignDoc }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border p-2.5">
      <button type="button" onClick={() => setOpen((p) => !p)} className="flex w-full items-center gap-2">
        <FileText className="text-primary size-3.5 shrink-0" />
        <span className="min-w-0 flex-1 truncate text-left text-xs font-medium">{doc.title}</span>
        <span className="text-muted-foreground shrink-0 text-[10px]">{doc.turn}週</span>
        <ChevronDown className={`text-muted-foreground size-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="bg-muted/40 mt-2 space-y-0.5 rounded-lg p-2 font-mono text-[11px]">
          {doc.lines.map((line, i) => (
            <p key={i} className="whitespace-pre-wrap">{line}</p>
          ))}
        </div>
      )}
    </div>
  );
}

export function DesignDocsCard({
  docs,
  appName,
}: {
  docs: DesignDoc[];
  appName: string | null;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2.5 py-4">
        <h3 className="flex items-center gap-1.5 font-semibold">
          <FileText className="text-primary size-4" />
          設計資料{appName ? `(${appName})` : ""}
        </h3>
        {docs.length === 0 ? (
          <p className="text-muted-foreground text-xs">
            まだ設計資料がありません。プロジェクトが進むとAI社員が自動で作成します。
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {docs.map((doc) => (
              <DocItem key={doc.id} doc={doc} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
