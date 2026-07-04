"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, Castle, Swords, Bot } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const TABS: { href: string; label: string; icon: LucideIcon; match: (path: string) => boolean }[] = [
  { href: "/", label: "ホーム", icon: Home, match: (p) => p === "/" || p === "/dashboard" },
  { href: "/player", label: "プレイヤー", icon: User, match: (p) => p.startsWith("/player") },
  { href: "/world", label: "ワールド", icon: Castle, match: (p) => p.startsWith("/world") },
  { href: "/adventure", label: "冒険", icon: Swords, match: (p) => p.startsWith("/adventure") },
  { href: "/ai", label: "AI", icon: Bot, match: (p) => p.startsWith("/ai") },
];

export function FooterNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-gradient-to-t from-black via-neutral-950 to-neutral-900/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.35)]"
      aria-label="メインナビゲーション"
    >
      <div className="mx-auto flex w-full max-w-2xl items-stretch justify-between px-1">
        {TABS.map((tab) => {
          const active = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 transition-colors"
            >
              <span
                className={
                  active
                    ? "flex items-center justify-center rounded-full bg-emerald-400/15 px-3 py-1 text-emerald-400"
                    : "flex items-center justify-center px-3 py-1 text-neutral-400"
                }
              >
                <tab.icon className="size-5" />
              </span>
              <span
                className={
                  active
                    ? "text-[11px] font-semibold text-emerald-400"
                    : "text-[11px] text-neutral-500"
                }
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
