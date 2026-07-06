"use client";

import { TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { MarketInsight } from "@/services/aiStudioTypes";

// 市場調査の知見一覧。MVPは公開情報ベースのダミー生成で、
// スクレイピングや外部サイトへの自動アクセスは行わない(将来実データ連携に差し替え)。
export function StudioMarketCard({ insights }: { insights: MarketInsight[] }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 py-4">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold">
          <TrendingUp className="text-primary size-4" />
          市場調査(GitHub / Product Hunt / ストア / Reddit / HN)
        </h3>
        {insights.length === 0 ? (
          <p className="text-muted-foreground text-xs">
            まだ調査結果がありません。「1日進める」とアナリストが毎日1件の知見を報告します。
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {insights.slice(0, 10).map((mi) => (
              <div key={mi.id} className="rounded-lg border p-2.5 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="bg-muted rounded px-1.5 py-0.5 text-[10px] font-semibold">{mi.source}</span>
                  <span className="text-muted-foreground text-[10px]">Day {mi.day}</span>
                </div>
                <p className="mt-1">{mi.finding}</p>
                <p className="text-emerald-600">→ {mi.opportunity}</p>
              </div>
            ))}
          </div>
        )}
        <p className="text-muted-foreground text-[10px]">
          ※MVPは公開情報ベースのルール生成です。外部サイトへの自動アクセスは行いません。
        </p>
      </CardContent>
    </Card>
  );
}
