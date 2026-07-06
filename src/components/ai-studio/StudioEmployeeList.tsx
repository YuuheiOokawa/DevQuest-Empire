"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { StudioEmployee } from "@/services/aiStudioTypes";

// AI社員20人の一覧。役割・責務・専門技術・性格・思考・得意/苦手言語・品質・速度を表示。
export function StudioEmployeeList({ employees }: { employees: StudioEmployee[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <Card>
      <CardContent className="flex flex-col gap-2 py-4">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold">
          <Users className="text-primary size-4" />
          AI社員({employees.length}人)
        </h3>
        <div className="flex flex-col gap-1.5">
          {employees.map((e) => {
            const open = openId === e.id;
            return (
              <div key={e.id} className="rounded-lg border">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-2.5 py-2 text-left"
                  onClick={() => setOpenId(open ? null : e.id)}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold">
                      {e.name}
                      <span className="text-muted-foreground ml-1.5 font-normal">{e.role}</span>
                    </p>
                    <p className="text-muted-foreground truncate text-[10px]">{e.duty}</p>
                  </div>
                  <span className="text-muted-foreground shrink-0 text-[10px]">EXP {e.exp}</span>
                  {open ? (
                    <ChevronUp className="text-muted-foreground size-3.5 shrink-0" />
                  ) : (
                    <ChevronDown className="text-muted-foreground size-3.5 shrink-0" />
                  )}
                </button>
                {open && (
                  <div className="flex flex-col gap-1.5 border-t px-2.5 py-2 text-[11px]">
                    <p>
                      <span className="text-muted-foreground">専門技術:</span> {e.expertise.join(" / ")}
                    </p>
                    <p>
                      <span className="text-muted-foreground">性格:</span> {e.personality}
                      <span className="text-muted-foreground ml-2">思考:</span> {e.thinking}
                    </p>
                    <p>
                      <span className="text-muted-foreground">得意言語:</span> {e.favLanguage}
                      <span className="text-muted-foreground ml-2">苦手言語:</span> {e.weakLanguage}
                    </p>
                    <div className="flex gap-3">
                      <Meter label="品質" value={e.quality} color="bg-emerald-500" />
                      <Meter label="速度" value={e.speed} color="bg-sky-500" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function Meter({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-1 items-center gap-1.5">
      <span className="text-muted-foreground w-6 shrink-0 text-[10px]">{label}</span>
      <div className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="w-6 text-right text-[10px]">{value}</span>
    </div>
  );
}
