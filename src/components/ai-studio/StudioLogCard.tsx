"use client";

import { ScrollText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { StudioLog } from "@/services/aiStudioTypes";

const KIND_STYLE: Record<StudioLog["kind"], string> = {
  info: "text-muted-foreground",
  success: "text-emerald-600",
  warning: "text-amber-600",
  approval: "text-violet-600",
  market: "text-sky-600",
  meeting: "text-pink-600",
};

// スタジオの活動ログ(新しい順)。
export function StudioLogCard({ logs }: { logs: StudioLog[] }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 py-4">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold">
          <ScrollText className="text-primary size-4" />
          活動ログ
        </h3>
        <div className="flex max-h-72 flex-col gap-1 overflow-y-auto">
          {logs.slice(0, 60).map((log) => (
            <p key={log.id} className="text-[11px]">
              <span className="text-muted-foreground/60 mr-1 font-mono">D{log.day}</span>
              <span className={KIND_STYLE[log.kind]}>{log.message}</span>
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
