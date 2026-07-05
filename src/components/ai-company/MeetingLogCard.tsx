"use client";

import { useState } from "react";
import { Users, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Meeting } from "@/services/aiCompanyTypes";

function MeetingItem({ meeting }: { meeting: Meeting }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border p-2.5">
      <button type="button" onClick={() => setOpen((p) => !p)} className="flex w-full items-center gap-2">
        <Badge variant="secondary" className="shrink-0 text-[10px]">
          {meeting.category}
        </Badge>
        <span className="min-w-0 flex-1 truncate text-left text-xs font-medium">{meeting.topic}</span>
        <span className="text-muted-foreground shrink-0 text-[10px]">{meeting.turn}週</span>
        <ChevronDown className={`text-muted-foreground size-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="mt-2 space-y-1 border-t pt-2">
          {meeting.utterances.map((u, i) => (
            <p key={i} className="text-xs">
              <span className="font-medium">{u.name}</span>
              <span className="text-muted-foreground">「{u.line}」</span>
            </p>
          ))}
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            結論: {meeting.conclusion}
          </p>
        </div>
      )}
    </div>
  );
}

export function MeetingLogCard({ meetings }: { meetings: Meeting[] }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2.5 py-4">
        <h3 className="flex items-center gap-1.5 font-semibold">
          <Users className="text-primary size-4" />
          AI会議ログ
        </h3>
        {meetings.length === 0 ? (
          <p className="text-muted-foreground text-xs">
            まだ会議はありません。6週ごとに社員が自動で会議を開きます。
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {meetings.slice(0, 8).map((meeting) => (
              <MeetingItem key={meeting.id} meeting={meeting} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
