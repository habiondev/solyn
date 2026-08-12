"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

export type CartItem = {
  id: string;
  type: "product" | "custom";
  title: string;
  imageUrl?: string;
  width: number;
  height: number;
  hasFrame: boolean;
  hasBacklight: boolean;
  price: number; // в копейках
  quantity: number;
};

type CartCtx = {
  items: CartItem[];
  count: number;
  total: number;
  add: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  remove: (id: string) => void;
  setQuantity: (id: string, q: number) => void;
  clear: () => void;
  open: boolean;
  setOpen: (b: boolean) => void;
};

const Ctx = createContext<CartCtx | null>(null);

const STORAGE_KEY = "solyn.cart.v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  // объединяем по id+options
  const add: CartCtx["add"] = useCallback((item) => {
    setItems((prev) => {
      const q = item.quantity ?? 1;
      const idx = prev.findIndex(
        (p) => p.id === item.id && p.type === item.type && p.width === item.width && p.height === item.height
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + q };
        return next;
      }
      return [...prev, { ...item, quantity: q }];
    });
    setOpen(true);
  }, []);

  const remove: CartCtx["remove"] = (id) => setItems((p) => p.filter((i) => i.id !== id));
  const setQuantity: CartCtx["setQuantity"] = (id, q) =>
    setItems((p) => p.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, q) } : i)));
  const clear = () => setItems([]);

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <Ctx.Provider value={{ items, count, total, add, remove, setQuantity, clear, open, setOpen }}>
      {children}
      {/* простой ремоунт при логине — не критично */}
      <span hidden>{status}</span>
    </Ctx.Provider>
  );
}

export const useCart = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCart must be used within CartProvider");
  return v;
};
