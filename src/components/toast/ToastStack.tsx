"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Sparkles, Trophy, Award, Building2, Castle } from "lucide-react";

export type ToastKind = "exp" | "achievement" | "title" | "building" | "tier";

export type ToastItem = {
  id: number;
  kind: ToastKind;
  message: string;
};

const TOAST_ICON: Record<ToastKind, typeof Sparkles> = {
  exp: Sparkles,
  achievement: Trophy,
  title: Award,
  building: Building2,
  tier: Castle,
};

const TOAST_STYLE: Record<ToastKind, string> = {
  exp: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300",
  achievement:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-300",
  title:
    "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950/60 dark:text-violet-300",
  building:
    "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/60 dark:text-sky-300",
  tier: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700 dark:border-fuchsia-900 dark:bg-fuchsia-950/60 dark:text-fuchsia-300",
};

const TOAST_DURATION_MS = 3500;

function Toast({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: number) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const Icon = TOAST_ICON[toast.kind];

  return (
    <div
      role="status"
      className={`animate-in fade-in slide-in-from-top-3 flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium shadow-lg duration-300 ${TOAST_STYLE[toast.kind]}`}
    >
      <Icon className="size-4 shrink-0" />
      <span>{toast.message}</span>
    </div>
  );
}

export function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}) {
  if (toasts.length === 0) return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 top-16 z-[60] flex flex-col items-center gap-2 px-4">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto w-full max-w-sm">
          <Toast toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>,
    document.body
  );
}
