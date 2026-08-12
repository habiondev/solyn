"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

export type AuthTab = "login" | "register";

type AuthCtx = {
  isOpen: boolean;
  tab: AuthTab;
  /** Куда отправить пользователя после успешного входа (если задан через `?next=` или middleware) */
  next: string | null;
  open: (tab?: AuthTab, next?: string | null) => void;
  close: () => void;
  setTab: (tab: AuthTab) => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<AuthTab>("login");
  const [next, setNext] = useState<string | null>(null);

  const open = useCallback((t: AuthTab = "login", n: string | null = null) => {
    setTab(t);
    setNext(n);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Глобальный эвент `solyn:open-auth` — открывает попап из любого места (включая middleware-редиректы)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      open(detail.tab || "login", detail.next || null);
    };
    window.addEventListener("solyn:open-auth", handler as EventListener);
    return () => window.removeEventListener("solyn:open-auth", handler as EventListener);
  }, [open]);

  // Авто-открытие по ?auth=login|register в URL
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const auth = url.searchParams.get("auth");
    const nxt = url.searchParams.get("next");
    if (auth === "login" || auth === "register") {
      open(auth, nxt);
      url.searchParams.delete("auth");
      url.searchParams.delete("next");
      window.history.replaceState({}, "", url.toString());
    }
  }, [open]);

  return <Ctx.Provider value={{ isOpen, tab, next, open, close, setTab }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth() must be used inside <AuthProvider>");
  return v;
}
