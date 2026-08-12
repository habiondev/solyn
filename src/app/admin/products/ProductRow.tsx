"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, ChevronDown, ChevronUp, Trash2, Upload, ImageIcon, Ruler, Sparkles, Eye, EyeOff, Tag } from "lucide-react";
import { formatPrice, cn, slugify, hasDiscount, getFinalPrice, getDiscountPercent } from "@/lib/utils";

const CATS: { v: "LAMP" | "POSTER" | "SET"; l: string; hint: string }[] = [
  { v: "LAMP",   l: "Картина-светильник", hint: "С подсветкой" },
  { v: "POSTER", l: "Постер",             hint: "На премиум-бумаге" },
  { v: "SET",    l: "Сет",                hint: "Готовый комплект" },
];

const SIZE_PRESETS = [
  { key: "A4",   label: "A4",   hint: "21×30 см", w: 210, h: 297 },
  { key: "A3",   label: "A3",   hint: "30×42 см", w: 297, h: 420 },
  { key: "mini", label: "мини", hint: "15×20 см", w: 150, h: 200 },
] as const;
type PresetKey = typeof SIZE_PRESETS[number]["key"] | "custom";

function parseSizeLabel(label: string, w: number, h: number): { sizeKey: PresetKey; customW: number; customH: number } {
  const found = SIZE_PRESETS.find((p) => p.key === label);
  if (found) return { sizeKey: found.key, customW: Math.round(w / 10), customH: Math.round(h / 10) };
  return { sizeKey: "custom", customW: Math.round(w / 10) || 30, customH: Math.round(h / 10) || 40 };
}

function buildSize(sizeKey: PresetKey, customW: number, customH: number) {
  if (sizeKey === "custom") {
    return {
      sizeLabel: `${customW}×${customH} см`,
      width: Math.round(customW * 10),
      height: Math.round(customH * 10),
    };
  }
  const p = SIZE_PRESETS.find((s) => s.key === sizeKey)!;
  return { sizeLabel: p.key, width: p.w, height: p.h };
}

export type ProductRowData = {
  id: string;
  title: string;
  slug: string;
  category: "LAMP" | "POSTER" | "PAINTING" | "SET";
  description: string;
  sizeLabel: string;
  width: number;
  height: number;
  basePrice: number;
  discountPrice: number | null;
  hasFrame: boolean;
  hasBacklight: boolean;
  rating: number;
  active: boolean;
  tags: string[];
  imageUrl: string;
  imageCount: number;
};

export function ProductRow({ p }: { p: ProductRowData }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const initialSize = useMemo(() => parseSizeLabel(p.sizeLabel, p.width, p.height), [p.sizeLabel, p.width, p.height]);
  const [sizeKey, setSizeKey] = useState<PresetKey>(initialSize.sizeKey);
  const [customW, setCustomW] = useState<number>(initialSize.customW);
  const [customH, setCustomH] = useState<number>(initialSize.customH);

  const legacyCategory = p.category === "PAINTING";

  const [f, setF] = useState({
    title: p.title,
    category: (legacyCategory ? "LAMP" : p.category) as "LAMP" | "POSTER" | "SET",
    description: p.description,
    basePriceManat: Math.round((p.basePrice || 0) / 100),
    rating: p.rating,
    active: p.active,
    tags: p.tags.join(", "),
  });
  const [imageUrl, setImageUrl] = useState(p.imageUrl);
  // Скидка
  const initialDiscountManat = p.discountPrice ? Math.round(p.discountPrice / 100) : 0;
  const [hasSale, setHasSale] = useState<boolean>(!!p.discountPrice && p.discountPrice > 0 && p.discountPrice < p.basePrice);
  const [discountManat, setDiscountManat] = useState<number>(initialDiscountManat);

  const basePriceKop = Math.round(f.basePriceManat * 100);
  const discountKop = Math.round(discountManat * 100);
  const showDiscount = hasSale && hasDiscount(basePriceKop, discountKop);
  const discountPct = getDiscountPercent(basePriceKop, discountKop);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/upload", { method: "POST", body: fd });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setImageUrl(j.url);
      toast.success("Фото загружено");
    } catch (e: any) { toast.error(e.message || "Ошибка загрузки"); }
    finally { setUploading(false); }
  };

  const save = async () => {
    if (sizeKey === "custom" && (customW < 5 || customH < 5)) {
      return toast.error("Минимальный размер 5×5 см");
    }
    if (hasSale && !hasDiscount(basePriceKop, discountKop)) {
      return toast.error("Цена со скидкой должна быть меньше обычной");
    }
    const { sizeLabel, width, height } = buildSize(sizeKey, customW, customH);
    setBusy(true);
    try {
      const r = await fetch(`/api/admin/products/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: f.title,
          slug: slugify(f.title) || p.slug,
          category: f.category,
          description: f.description,
          sizeLabel,
          width,
          height,
          basePrice: basePriceKop,
          discountPrice: showDiscount ? discountKop : null,
          rating: +f.rating,
          active: f.active,
          tags: f.tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      toast.success("Сохранено");
      router.refresh();
      setOpen(false);
    } catch (e: any) { toast.error(e.message || "Ошибка"); }
    finally { setBusy(false); }
  };

  const remove = async () => {
    if (!confirm(`Удалить «${p.title}»? Это нельзя отменить.`)) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
      if (!r.ok) throw new Error();
      toast.success("Удалено");
      router.refresh();
    } catch { toast.error("Ошибка удаления"); }
    finally { setBusy(false); }
  };

  const toggleActive = async () => {
    setBusy(true);
    try {
      const r = await fetch(`/api/admin/products/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !p.active }),
      });
      if (!r.ok) throw new Error();
      toast.success(p.active ? "Скрыт" : "Опубликован");
      router.refresh();
    } catch { toast.error("Ошибка"); }
    finally { setBusy(false); }
  };

  const onSale = hasDiscount(p.basePrice, p.discountPrice);
  const finalBasePrice = onSale ? formatPrice(p.basePrice) : null;
  const finalPrice = onSale ? formatPrice(getFinalPrice(p.basePrice, p.discountPrice)) : formatPrice(p.basePrice);

  return (
    <div className={cn("transition", !p.active && "opacity-60")}>
      <div className="flex items-center gap-3 p-3 sm:p-4">
        <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl overflow-hidden bg-navy-800 shrink-0 relative">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={p.title} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full grid place-items-center text-muted">
              <ImageIcon className="h-5 w-5" />
            </div>
          )}
          {p.imageCount > 1 && (
            <div className="absolute bottom-0 right-0 px-1.5 py-0.5 rounded-tl-md bg-navy-950/80 text-[10px] font-display">
              +{p.imageCount - 1}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="font-display font-semibold truncate">{p.title}</div>
            <span className="text-[10px] uppercase tracking-[.15em] font-display px-2 py-0.5 rounded-full border border-line text-muted">
              {CATS.find((c) => c.v === p.category)?.l ?? p.category}
            </span>
            {legacyCategory && (
              <span className="text-[10px] uppercase tracking-[.15em] font-display px-2 py-0.5 rounded-full border border-amber-400/40 text-amber-300">
                устаревшая
              </span>
            )}
            {onSale && (
              <span className="text-[10px] uppercase tracking-[.15em] font-display px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-400/40">
                −{getDiscountPercent(p.basePrice, p.discountPrice)}%
              </span>
            )}
            {p.tags.map((t) => (
              <span key={t} className="text-[10px] uppercase tracking-[.15em] font-display px-2 py-0.5 rounded-full bg-card text-muted border border-line">
                {t}
              </span>
            ))}
          </div>
          <div className="text-xs text-muted mt-0.5">
            {p.sizeLabel} · {p.width}×{p.height} мм
            {p.hasBacklight && " · подсветка"}
            {p.hasFrame && " · рама"}
          </div>
        </div>

        <div className="text-right shrink-0 hidden sm:block">
          {onSale ? (
            <>
              <div className="text-[11px] text-muted line-through leading-none">{finalBasePrice}</div>
              <div className="font-display font-bold text-lg leading-tight text-rose-300">{finalPrice}</div>
            </>
          ) : (
            <div className="font-display font-bold text-lg">{finalPrice}</div>
          )}
          <div className="text-[10px] uppercase tracking-[.15em] text-muted font-display">за шт</div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={toggleActive}
            disabled={busy}
            className="h-9 w-9 grid place-items-center rounded-full border border-line text-muted hover:text-white hover:border-neon/60 transition"
            title={p.active ? "Скрыть" : "Опубликовать"}
          >
            {p.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            className={cn(
              "h-9 px-3 inline-flex items-center gap-1.5 rounded-full border text-xs font-display transition",
              open
                ? "border-neon text-neon bg-neon/10"
                : "border-line text-muted hover:text-white hover:border-neon/60"
            )}
          >
            {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{open ? "Закрыть" : "Изменить"}</span>
          </button>
          <button
            onClick={remove}
            disabled={busy}
            className="h-9 w-9 grid place-items-center rounded-full border border-line text-muted hover:text-rose-300 hover:border-rose-400/60 transition"
            title="Удалить"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {open && (
        <div className="px-3 sm:px-4 pb-4">
          <div className="bg-navy-900/50 border border-line rounded-2xl p-4 sm:p-5">
            <div className="grid lg:grid-cols-[1fr_260px] gap-5">
              <div className="grid gap-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-[.15em] text-muted font-display block mb-1">Название</label>
                    <input
                      value={f.title}
                      onChange={(e) => setF({ ...f, title: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-[.15em] text-muted font-display block mb-1">Категория</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {CATS.map((c) => (
                        <button
                          type="button"
                          key={c.v}
                          onClick={() => setF({ ...f, category: c.v })}
                          className={
                            "rounded-lg border px-2 py-2 text-left text-xs transition " +
                            (f.category === c.v ? "border-neon bg-neon/10" : "border-line hover:border-white/30")
                          }
                        >
                          <div className="font-display font-semibold leading-tight">{c.l}</div>
                          <div className="text-[9px] text-muted mt-0.5">{c.hint}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-[.15em] text-muted font-display block mb-1">Описание</label>
                  <textarea
                    value={f.description}
                    onChange={(e) => setF({ ...f, description: e.target.value })}
                    className="input min-h-[72px]"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-[.15em] text-muted font-display mb-1.5 flex items-center gap-1">
                    <Ruler className="h-3 w-3" /> Размер
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {SIZE_PRESETS.map((s) => (
                      <button
                        type="button"
                        key={s.key}
                        onClick={() => setSizeKey(s.key)}
                        className={
                          "rounded-lg border px-2 py-1.5 text-center transition " +
                          (sizeKey === s.key ? "border-neon bg-neon/10" : "border-line hover:border-white/30")
                        }
                      >
                        <div className="text-xs font-display font-bold leading-tight">{s.label}</div>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setSizeKey("custom")}
                      className={
                        "rounded-lg border px-2 py-1.5 text-center transition " +
                        (sizeKey === "custom" ? "border-neon bg-neon/10" : "border-line hover:border-white/30")
                      }
                    >
                      <div className="text-xs font-display font-bold leading-tight">Свой</div>
                    </button>
                  </div>
                  {sizeKey === "custom" && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <label className="text-[10px] text-muted uppercase font-display">Ширина, см</label>
                        <input
                          type="number" min={5} max={200} step={1}
                          value={customW}
                          onChange={(e) => setCustomW(+e.target.value || 0)}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted uppercase font-display">Высота, см</label>
                        <input
                          type="number" min={5} max={200} step={1}
                          value={customH}
                          onChange={(e) => setCustomH(+e.target.value || 0)}
                          className="input"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Цена + скидка */}
                <div className="rounded-2xl border border-line bg-navy-950/40 p-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] uppercase tracking-[.15em] text-muted font-display block mb-1">Цена, ₼</label>
                      <div className="relative">
                        <input
                          type="number" min={1} step={1}
                          value={f.basePriceManat}
                          onChange={(e) => setF({ ...f, basePriceManat: +e.target.value || 0 })}
                          className="input pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-sm pointer-events-none">₼</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-[.15em] text-muted font-display block mb-1 flex items-center gap-1">
                        <Tag className="h-3 w-3" /> Скидка, ₼
                      </label>
                      <div className="relative">
                        <input
                          type="number" min={0} step={1} disabled={!hasSale}
                          value={hasSale ? discountManat : ""}
                          onChange={(e) => setDiscountManat(+e.target.value || 0)}
                          placeholder={hasSale ? "" : "нет"}
                          className="input pr-8 disabled:opacity-50"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-sm pointer-events-none">₼</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2.5 flex-wrap gap-2">
                    <label className="flex items-center gap-2 text-xs select-none cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasSale}
                        onChange={(e) => {
                          setHasSale(e.target.checked);
                          if (!e.target.checked) setDiscountManat(0);
                          else if (discountManat === 0) setDiscountManat(Math.max(1, Math.round(f.basePriceManat * 0.8)));
                        }}
                      />
                      <span>Есть скидка</span>
                    </label>
                    {showDiscount && (
                      <div className="text-[11px] font-display text-rose-300 inline-flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-200 text-[10px] tracking-[.1em]">−{discountPct}%</span>
                        <span className="text-muted">покупатель увидит</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] uppercase tracking-[.15em] text-muted font-display block mb-1">Рейтинг</label>
                    <input
                      type="number" min={0} max={5} step={0.1}
                      value={f.rating}
                      onChange={(e) => setF({ ...f, rating: +e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-[.15em] text-muted font-display block mb-1 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Теги
                    </label>
                    <input
                      value={f.tags}
                      onChange={(e) => setF({ ...f, tags: e.target.value })}
                      placeholder="хит, новинка, неон"
                      className="input"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm pt-1">
                  <input
                    type="checkbox"
                    checked={f.active}
                    onChange={(e) => setF({ ...f, active: e.target.checked })}
                  />
                  {f.active ? <Eye className="h-3.5 w-3.5 text-neon-2" /> : <EyeOff className="h-3.5 w-3.5 text-muted" />}
                  <span>Опубликован (виден в каталоге)</span>
                </label>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button onClick={save} disabled={busy} className="btn">
                    {busy && <Loader2 className="h-4 w-4 animate-spin" />} Сохранить
                  </button>
                  <button onClick={() => setOpen(false)} className="btn-ghost">Отмена</button>
                  <div className="ml-auto text-xs text-muted">
                    Slug: <code className="text-neon-2">{p.slug}</code>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-[.15em] text-muted font-display block mb-1">Главное фото</label>
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-dashed border-line group hover:border-neon/60 transition">
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center text-muted text-xs">Нет фото</div>
                  )}
                  <label className="absolute inset-0 grid place-items-center cursor-pointer bg-navy-950/0 hover:bg-navy-950/60 transition">
                    <div className="opacity-0 group-hover:opacity-100 transition inline-flex items-center gap-2 text-sm font-display bg-neon text-inkDim px-3 py-1.5 rounded-full">
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      Заменить
                    </div>
                    <input
                      type="file" accept="image/*" hidden
                      onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
                    />
                  </label>
                </div>
                <div className="mt-2 text-[11px] text-muted flex items-center gap-1.5">
                  <ImageIcon className="h-3 w-3" />
                  {p.imageCount > 0 ? `Всего фото у товара: ${p.imageCount}` : "Загрузи первое фото"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
