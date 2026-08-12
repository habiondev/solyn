"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SIZE_CATS } from "@/lib/utils";

export function AdminFilters({ total }: { total: number }) {
  const router = useRouter();
  const sp = useSearchParams();
  const cat = sp.get("cat") || "";
  const size = sp.get("size") || "";
  const q = sp.get("q") || "";

  const buildHref = (next: Record<string, string | undefined>) => {
    const params = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    const qs = params.toString();
    return `/admin/products${qs ? `?${qs}` : ""}`;
  };

  return (
    <form method="get" action="/admin/products" className="flex flex-wrap items-center gap-2">
      {cat && <input type="hidden" name="cat" value={cat} />}
      <select
        name="size"
        defaultValue={size}
        className="input h-9 text-sm w-auto"
        onChange={(e) => router.replace(buildHref({ size: e.target.value || undefined }))}
      >
        <option value="">Все размеры</option>
        {SIZE_CATS.map((s) => (
          <option key={s.key} value={s.key}>
            {s.label} · {s.tag}
          </option>
        ))}
      </select>
      <div className="relative flex-1 min-w-[180px]">
        <input name="q" defaultValue={q} placeholder="Поиск по названию…" className="input h-9 text-sm pl-3 w-full" />
      </div>
      <button className="btn h-9 px-3 text-sm">Найти</button>
      {(cat || size || q) && (
        <a href="/admin/products" className="btn-ghost h-9 px-3 text-sm">
          Сбросить
        </a>
      )}
      <div className="ml-auto text-xs text-muted">
        Найдено: <b className="text-white">{total}</b>
      </div>
    </form>
  );
}
