"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  MoreVertical,
  GitBranch,
  Bell,
  HelpCircle,
  ShieldCheck,
  FileText,
  LogOut,
  X,
} from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import { Badge } from "@/components/ui/badge";

const MENU_ITEMS = [
  { href: "/settings/github", label: "GitHub連携設定", icon: GitBranch },
  { href: "/help", label: "ヘルプ", icon: HelpCircle },
  { href: "/legal/privacy", label: "プライバシーポリシー", icon: ShieldCheck },
  { href: "/legal/terms", label: "利用規約", icon: FileText },
];

export function MoreMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="その他のメニュー"
        className="hover:bg-muted rounded-full p-2 transition-colors"
      >
        <MoreVertical className="size-5" />
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 sm:items-center"
            onClick={() => setOpen(false)}
          >
            <div
              className="bg-card w-full rounded-t-2xl p-4 shadow-xl sm:w-96 sm:rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3">
                <span className="font-semibold">その他</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="閉じる"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                {MENU_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="hover:bg-muted flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors"
                  >
                    <item.icon className="text-muted-foreground size-4" />
                    {item.label}
                  </Link>
                ))}
                <div className="text-muted-foreground flex items-center justify-between rounded-lg px-3 py-2.5 text-sm">
                  <span className="flex items-center gap-3">
                    <Bell className="size-4" />
                    通知
                  </span>
                  <Badge variant="secondary">準備中</Badge>
                </div>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="text-destructive hover:bg-destructive/10 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors"
                  >
                    <LogOut className="size-4" />
                    ログアウト
                  </button>
                </form>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
