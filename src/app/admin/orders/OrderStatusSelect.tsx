"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const S = [
  { v: "PENDING", l: "Новый" },
  { v: "IN_PROGRESS", l: "В работе" },
  { v: "SHIPPED", l: "Отправлен" },
  { v: "DELIVERED", l: "Доставлен" },
  { v: "CANCELLED", l: "Отменён" },
];

const COLOR: Record<string, string> = {
  PENDING: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  IN_PROGRESS: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  SHIPPED: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  DELIVERED: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  CANCELLED: "bg-rose-500/20 text-rose-300 border-rose-500/30",
};

export function OrderStatusSelect({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [val, setVal] = useState(status);
  const [busy, setBusy] = useState(false);
  const update = async (s: string) => {
    setVal(s);
    setBusy(true);
    try {
      const r = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: s }),
      });
      if (!r.ok) throw new Error();
      toast.success("Статус обновлён");
      router.refresh();
    } catch { toast.error("Ошибка"); setVal(status); }
    finally { setBusy(false); }
  };
  return (
    <select
      disabled={busy}
      value={val}
      onChange={(e) => update(e.target.value)}
      className={cn("px-2.5 py-1.5 rounded-full text-[11px] uppercase tracking-[.15em] font-display border appearance-none cursor-pointer", COLOR[val] || COLOR.PENDING)}
    >
      {S.map((s) => <option key={s.v} value={s.v} className="bg-navy-900 text-white">{s.l}</option>)}
    </select>
  );
}
