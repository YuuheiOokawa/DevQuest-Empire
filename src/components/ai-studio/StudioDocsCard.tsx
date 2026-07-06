"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { StudioDoc } from "@/services/aiStudioTypes";

// AI社員が生成した設計書・報告書の一覧(README/要件/設計/ER図/API/テスト/レビュー等)。
export function StudioDocsCard({ docs }: { docs: StudioDoc[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <Card>
      <CardContent className="flex flex-col gap-2 py-4">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold">
          <FileText className="text-primary size-4" />
          ドキュメント({docs.length}件)
        </h3>
        {docs.length === 0 ? (
          <p className="text-muted-foreground text-xs">
            工程が進むとRequirements・Architecture・ER図・API設計・テスト報告などが生成されます。
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {[...docs].reverse().map((d) => {
              const open = openId === d.id;
              return (
                <div key={d.id} className="rounded-lg border">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-2.5 py-2 text-left"
                    onClick={() => setOpenId(open ? null : d.id)}
                  >
                    <span className="flex-1 text-xs font-semibold">{d.title}</span>
                    <span className="text-muted-foreground text-[10px]">
                      {d.author} / Day {d.day}
                    </span>
                    {open ? (
                      <ChevronUp className="text-muted-foreground size-3.5" />
                    ) : (
                      <ChevronDown className="text-muted-foreground size-3.5" />
                    )}
                  </button>
                  {open && (
                    <div className="border-t px-2.5 py-2">
                      {d.lines.map((line, i) => (
                        <p key={i} className="font-mono text-[11px] whitespace-pre-wrap">
                          {line}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
