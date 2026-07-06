"use client";

import { useState } from "react";
import { Bot, Check, Copy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { ClaudePrompt } from "@/services/aiStudioTypes";

// AI社員がClaude Codeへ送るためのプロンプト一覧。コピーして実際に使える。
// packを渡すと全工程まとめた「一括実装パック」もコピーできる(claude -p 用)。
export function StudioPromptsCard({ prompts, pack }: { prompts: ClaudePrompt[]; pack?: string }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyText = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      /* クリップボード非対応環境では何もしない */
    }
  };

  const handleCopy = (p: ClaudePrompt) => copyText(p.id, p.prompt);

  return (
    <Card>
      <CardContent className="flex flex-col gap-2 py-4">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold">
          <Bot className="text-primary size-4" />
          Claude Codeプロンプト({prompts.length}件)
        </h3>
        {pack && prompts.length > 0 && (
          <button
            type="button"
            onClick={() => copyText("__pack__", pack)}
            className="flex items-center gap-1.5 rounded-lg border border-indigo-500/40 px-2.5 py-2 text-xs font-semibold text-indigo-500 hover:bg-indigo-500/10"
          >
            {copiedId === "__pack__" ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
            一括実装パックをコピー(全工程まとめて claude -p へ)
          </button>
        )}
        {prompts.length === 0 ? (
          <p className="text-muted-foreground text-xs">
            開発工程が進むと、AI社員がClaude Codeへ送る実装指示プロンプトがここに溜まります。
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {[...prompts].reverse().map((p) => (
              <div key={p.id} className="rounded-lg border p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold">
                    {p.title}
                    <span className="text-muted-foreground ml-1.5 font-normal">
                      {p.employeeName}({p.role})/ Day {p.day}
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCopy(p)}
                    className="text-muted-foreground hover:text-foreground flex shrink-0 items-center gap-1 text-[10px]"
                  >
                    {copiedId === p.id ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                    {copiedId === p.id ? "コピー済み" : "コピー"}
                  </button>
                </div>
                <p className="bg-muted/50 mt-1.5 rounded p-2 font-mono text-[11px] whitespace-pre-wrap">{p.prompt}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
