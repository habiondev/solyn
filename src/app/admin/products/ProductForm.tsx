"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, Upload, Ruler, Sparkles, Eye, EyeOff, Tag } from "lucide-react";
import { slugify, hasDiscount, getDiscountPercent } from "@/lib/utils";

const CATS = [
  { v: "LAMP",   l: "Картина-светильник", hint: "С подсветкой" },
  { v: "POSTER", l: "Постер",             hint: "На премиум-бумаге" },
  { v: "SET",    l: "Сет",                hint: "Готовый комплект" },
] as const;

type Cat = typeof CATS[number]["v"];

const SIZE_PRESETS = [
  { key: "A4",   label: "A4",   hint: "21×30 см",   w: 210, h: 297 },
  { key: "A3",   label: "A3",   hint: "30×42 см",   w: 297, h: 420 },
  { key: "mini", label: "мини", hint: "15×20 см",   w: 150, h: 200 },
] as const;
type PresetKey = typeof SIZE_PRESETS[number]["key"] | "custom";

export function ProductForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sizeKey, setSizeKey] = useState<PresetKey>("A4");
  const [f, setF] = useState({
    title: "",
    category: "LAMP" as Cat,
    description: "",
    basePriceManat: 149,
    tags: "новинка",
    active: true,
  });
  const [customW, setCustomW] = useState(30);
  const [customH, setCustomH] = useState(40);
  const [imageUrl, setImageUrl] = useState("");
  // Скидка
  const [hasSale, setHasSale] = useState(false);
  const [discountManat, setDiscountManat] = useState(0);

  const basePriceKop = Math.round(f.basePriceManat * 100);
  const discountKop = Math.round(discountManat * 100);
  const showDiscount = hasSale && hasDiscount(basePriceKop, discountKop);
  const discountPct = getDiscountPercent(basePriceKop, discountKop);

  const upload = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const r = await fetch("/api/upload", { method: "POST", body: fd });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setImageUrl(j.url);
      toast.success("Загружено");
    } catch (e: any) { toast.error(e.message || "Ошибка загрузки"); }
    finally { setUploading(false); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) return toast.error("Загрузите изображение");
    if (f.basePriceManat < 1) return toast.error("Укажи цену");
    if (sizeKey === "custom" && (customW < 5 || customH < 5)) {
      return toast.error("Минимальный размер 5×5 см");
    }
    if (hasSale && (!hasDiscount(basePriceKop, discountKop))) {
      return toast.error("Цена со скидкой должна быть меньше обычной");
    }

    let width: number, height: number, sizeLabel: string;
    if (sizeKey === "custom") {
      width = Math.round(customW * 10);
      height = Math.round(customH * 10);
      sizeLabel = `${customW}×${customH} см`;
    } else {
      const p = SIZE_PRESETS.find((s) => s.key === sizeKey)!;
      width = p.w;
      height = p.h;
      sizeLabel = p.key;
    }

    setBusy(true);
    try {
      const r = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: f.title.trim(),
          slug: slugify(f.title || `p-${Date.now()}`),
          category: f.category,
          description: f.description.trim(),
          sizeLabel,
          width,
          height,
          basePrice: basePriceKop,
          discountPrice: showDiscount ? discountKop : null,
          active: f.active,
          tags: f.tags.split(",").map((t) => t.trim()).filter(Boolean),
          imageUrl,
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      toast.success("Товар создан");
      setF({ ...f, title: "", description: "" });
      setImageUrl("");
      setHasSale(false);
      setDiscountManat(0);
      router.refresh();
    } catch (e: any) { toast.error(e.message || "Ошибка"); }
    finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="bg-card border border-line rounded-2xl p-5 h-fit">
      <h2 className="font-display font-semibold mb-1">Новый товар</h2>
      <p className="text-muted text-xs mb-4">Заполни карточку, загрузи фото — товар появится в каталоге.</p>

      <div className="grid gap-3">
        <div>
          <label className="text-[10px] uppercase tracking-[.15em] text-muted font-display block mb-1">Название</label>
          <input
            required placeholder="например, Aurora"
            value={f.title}
            onChange={(e) => setF({ ...f, title: e.target.value })}
            className="input"
          />
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-[.15em] text-muted font-display block mb-1">Описание</label>
          <textarea
            required placeholder="Что изображено, какая атмосфера"
            value={f.description}
            onChange={(e) => setF({ ...f, description: e.target.value })}
            className="input min-h-[72px]"
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
                  "rounded-xl border px-2.5 py-2 text-left transition " +
                  (f.category === c.v ? "border-neon bg-neon/10" : "border-line hover:border-white/30")
                }
              >
                <div className="text-sm font-display font-semibold leading-tight">{c.l}</div>
                <div className="text-[10px] text-muted mt-0.5">{c.hint}</div>
              </button>
            ))}
          </div>
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
                  "rounded-xl border px-2 py-2.5 text-center transition " +
                  (sizeKey === s.key ? "border-neon bg-neon/10" : "border-line hover:border-white/30")
                }
              >
                <div className="text-sm font-display font-bold leading-tight">{s.label}</div>
                <div className="text-[10px] text-muted mt-0.5">{s.hint}</div>
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSizeKey("custom")}
              className={
                "rounded-xl border px-2 py-2.5 text-center transition " +
                (sizeKey === "custom" ? "border-neon bg-neon/10" : "border-line hover:border-white/30")
              }
            >
              <div className="text-sm font-display font-bold leading-tight">Свой</div>
              <div className="text-[10px] text-muted mt-0.5">любой</div>
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

        {/* Цена + скидка в одном блоке */}
        <div className="rounded-2xl border border-line bg-navy-900/40 p-3">
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
              <div className="text-[11px] font-display text-neon-2 inline-flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-neon text-inkDim text-[10px] tracking-[.1em]">−{discountPct}%</span>
                <span className="text-muted">итого для покупателя</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-[.15em] text-muted font-display block mb-1 flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> Теги
          </label>
          <input
            placeholder="новинка, хит, неон"
            value={f.tags}
            onChange={(e) => setF({ ...f, tags: e.target.value })}
            className="input"
          />
          <div className="text-[10px] text-muted mt-1">Через запятую. Отображаются бейджиком на карточке.</div>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-[.15em] text-muted font-display block mb-1">Фото</label>
          <label className="flex items-center justify-center h-32 border-2 border-dashed border-line rounded-xl cursor-pointer hover:border-neon transition relative overflow-hidden">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <span className="text-muted text-sm flex items-center gap-2">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? "Загружаем…" : "Загрузить фото"}
              </span>
            )}
            <input
              type="file" accept="image/*" hidden
              onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
            />
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={f.active}
            onChange={(e) => setF({ ...f, active: e.target.checked })}
          />
          {f.active ? <Eye className="h-3.5 w-3.5 text-neon-2" /> : <EyeOff className="h-3.5 w-3.5 text-muted" />}
          <span>Опубликован (виден в каталоге)</span>
        </label>

        <button disabled={busy || uploading} className="btn mt-1">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Создать
        </button>
      </div>
    </form>
  );
}
