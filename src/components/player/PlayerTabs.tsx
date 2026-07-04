"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type PlayerTab = {
  id: string;
  label: ReactNode;
  content: ReactNode;
};

export function PlayerTabs({ tabs }: { tabs: PlayerTab[] }) {
  const [activeId, setActiveId] = useState(tabs[0]?.id);

  return (
    <div className="flex flex-col gap-4">
      <div className="scrollbar-none -mx-4 flex gap-1 overflow-x-auto px-4">
        {tabs.map((tab) => {
          const active = tab.id === activeId;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveId(tab.id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {tabs.map((tab) => (
        <div key={tab.id} className={tab.id === activeId ? "block" : "hidden"}>
          {tab.content}
        </div>
      ))}
    </div>
  );
}
