"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { ToastStack, type ToastItem, type ToastKind } from "@/components/toast/ToastStack";

let toastIdCounter = 0;

type ToastContextValue = {
  pushToast: (toast: { kind: ToastKind; message: string }) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const pushToast = useCallback((toast: { kind: ToastKind; message: string }) => {
    toastIdCounter += 1;
    setToasts((prev) => [...prev, { ...toast, id: toastIdCounter }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ pushToast }}>
      {children}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

/** Provider外で呼ばれた場合はno-opにする(安全側に倒す)。 */
export function useToast(): (toast: { kind: ToastKind; message: string }) => void {
  const ctx = useContext(ToastContext);
  return ctx?.pushToast ?? (() => {});
}
