"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, MessagesSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { StudioMeeting } from "@/services/aiStudioTypes";

// AI会議の議事録。毎日開催され、議題・発言・決定事項を記録する。
export function StudioMeetingCard({ meetings }: { meetings: StudioMeeting[] }) {
  const [openId, setOpenId] = useState<string | null>(meetings[0]?.id ?? null);

  return (
    <Card>
      <CardContent className="flex flex-col gap-2 py-4">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold">
          <MessagesSquare className="text-primary size-4" />
          AI会議ログ({meetings.length}件)
        </h3>
        {meetings.length === 0 ? (
          <p className="text-muted-foreground text-xs">「1日進める」と毎日AI社員たちが会議を開き、議事録が残ります。</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {meetings.map((m) => {
              const open = openId === m.id;
              return (
                <div key={m.id} className="rounded-lg border">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-2.5 py-2 text-left"
                    onClick={() => setOpenId(open ? null : m.id)}
                  >
                    <span className="flex-1 text-xs font-semibold">{m.agenda}</span>
                    <span className="text-muted-foreground text-[10px]">Day {m.day}</span>
                    {open ? (
                      <ChevronUp className="text-muted-foreground size-3.5" />
                    ) : (
                      <ChevronDown className="text-muted-foreground size-3.5" />
                    )}
                  </button>
                  {open && (
                    <div className="flex flex-col gap-1 border-t px-2.5 py-2 text-[11px]">
                      {m.utterances.map((u, i) => (
                        <p key={i}>
                          <span className="font-semibold">{u.name}</span>
                          <span className="text-muted-foreground">({u.role})</span>: {u.line}
                        </p>
                      ))}
                      <p className="mt-1 rounded bg-emerald-500/10 px-2 py-1 text-emerald-700 dark:text-emerald-400">
                        決定: {m.decision}
                      </p>
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
