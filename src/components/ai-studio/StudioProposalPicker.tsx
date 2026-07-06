"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Lightbulb, Rocket, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { AppProposal } from "@/services/aiStudioTypes";

const PRIORITY_STYLE: Record<AppProposal["priority"], string> = {
  高: "bg-red-500/15 text-red-600",
  中: "bg-amber-500/15 text-amber-600",
  低: "bg-zinc-500/15 text-zinc-500",
};

// 企画会議で出たアプリ案の一覧。CEOが1つ選んで承認するとプロジェクトが始まる。
export function StudioProposalPicker({
  proposals,
  onSelect,
}: {
  proposals: AppProposal[];
  onSelect: (id: string) => void;
}) {
  const [openId, setOpenId] = useState<string | null>(proposals[0]?.id ?? null);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted-foreground text-xs">
        AI社員が市場調査を元に3案を提出しました。CEOとして1つ承認してください。
      </p>
      {proposals.map((p) => {
        const open = openId === p.id;
        return (
          <Card key={p.id}>
            <CardContent className="flex flex-col gap-2 py-4">
              <button
                type="button"
                className="flex w-full items-start justify-between gap-2 text-left"
                onClick={() => setOpenId(open ? null : p.id)}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Lightbulb className="size-4 shrink-0 text-amber-500" />
                    <h4 className="text-sm font-semibold">{p.appName}</h4>
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${PRIORITY_STYLE[p.priority]}`}>
                      優先度{p.priority}
                    </span>
                    <span className="bg-muted rounded px-1.5 py-0.5 text-[10px]">{p.projectSize}規模</span>
                  </div>
                  <p className="text-muted-foreground mt-0.5 font-mono text-[11px]">repo: {p.repoName}</p>
                  <p className="text-muted-foreground text-xs">
                    {p.category} / {p.problem}
                  </p>
                </div>
                {open ? (
                  <ChevronUp className="text-muted-foreground size-4 shrink-0" />
                ) : (
                  <ChevronDown className="text-muted-foreground size-4 shrink-0" />
                )}
              </button>

              {open && (
                <div className="flex flex-col gap-2 text-xs">
                  <div className="rounded-lg bg-sky-500/10 p-2.5">
                    <p className="mb-1 text-[10px] font-semibold text-sky-600">市場・競合分析(AI社員による)</p>
                    <DetailRow label="市場規模" value={p.market.marketScale} />
                    <DetailRow
                      label="競合と弱点"
                      value={p.market.competitors.map((c) => `${c.name}(${c.weakness})`).join(" / ")}
                    />
                    <DetailRow label="差別化ポイント" value={p.market.differentiation.join(" / ")} />
                    <DetailRow label="MVPで実現する価値" value={p.market.mvpValue} />
                    <DetailRow label="収益化案" value={p.market.monetization.join(" / ")} />
                  </div>
                  <DetailRow label="Target User" value={p.targetUser} />
                  <DetailRow label="Features" value={p.features.join(" / ")} />
                  <DetailRow label="Tech Stack" value={p.techStack.join(" / ")} />
                  <DetailRow label="Business Model" value={p.businessModel} />
                  <DetailRow label="Roadmap" value={p.roadmap.join(" → ")} />
                  <DetailRow label="MVP Scope" value={p.mvpScope.join(" / ")} />
                  <DetailRow label="Future Scope" value={p.futureScope.join(" / ")} />
                  <DetailRow label="Quality Target" value={p.qualityTarget} />
                  <div className="flex flex-wrap gap-3">
                    <span className="flex items-center gap-1">
                      難易度 <Stars n={p.difficulty} />
                    </span>
                    <span className="flex items-center gap-1">
                      市場規模 <Stars n={p.marketSize} />
                    </span>
                    <span className="text-muted-foreground">想定収益: {p.estimatedRevenue}</span>
                  </div>
                  <Button onClick={() => onSelect(p.id)} className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700">
                    <Rocket className="size-4" />
                    この企画を承認して開発開始
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-muted-foreground text-[10px] font-semibold">{label}</span>
      <p>{value}</p>
    </div>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <span className="flex">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={`size-3 ${i < n ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
      ))}
    </span>
  );
}
