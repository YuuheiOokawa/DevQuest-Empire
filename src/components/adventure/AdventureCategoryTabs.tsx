"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type AdventureCategory = {
  id: string;
  label: ReactNode;
  content: ReactNode;
};

export function AdventureCategoryTabs({
  categories,
}: {
  categories: AdventureCategory[];
}) {
  const [activeId, setActiveId] = useState(categories[0]?.id);

  return (
    <div className="flex flex-col gap-4">
      <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4">
        {categories.map((category) => {
          const active = category.id === activeId;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveId(category.id)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-500/30"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {category.label}
            </button>
          );
        })}
      </div>
      {categories.map((category) => (
        <div
          key={category.id}
          className={category.id === activeId ? "block" : "hidden"}
        >
          {category.content}
        </div>
      ))}
    </div>
  );
}
