"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X, ChevronLeft, Wand2, Ruler, Construction, Sparkles } from "lucide-react";
import { ProductCard, type ProductCardData } from "./ProductCard";
import { type SizeCat, cn, getSizeCat } from "@/lib/utils";
import toast from "react-hot-toast";
import { useTranslation } from "@/lib/i18n";

const CATS = (t: any): { key: string; label: string }[] => [
  { key: "LAMP",   label: t("catalog.lamps") },
  { key: "POSTER", label: t("catalog.posters") },
  { key: "SET",    label: t("catalog.sets") },
];

const SORTS = (t: any): { key: string; label: string }[] => [
  { key: "popular", label: t("catalog.sort_popular") || "По популярности" },
  { key: "new", label: t("catalog.sort_new") || "Новинки" },
  { key: "price-asc", label: t("catalog.sort_price_asc") || "Цена ↑" },
  { key: "price-desc", label: t("catalog.sort_price_desc") || "Цена ↓" },
];

// 5 карточек в одном ряду: A4 → A3 → мини → Свой (фильтр) → Своё фото (конструктор)
type PresetKey2 = SizeCat | "custom" | "photo";
const SIZE_PRESETS = (t: any): { key: PresetKey2; label: string; tag: string; w?: number; h?: number }[] => [
  { key: "a4",     label: "A4",        tag: "21×30 см",   w: 210, h: 297 },
  { key: "a3",     label: "A3",        tag: "30×42 см",   w: 297, h: 420 },
  { key: "mini",   label: "МИНИ",      tag: "6×9 см",     w: 60, h: 90 },
  { key: "custom", label: t("catalog.custom_size") || "ДРУГОЙ",      tag: t("product.size"),                            },
  { key: "photo",  label: t("catalog.photo") || "СВОЁ ФОТО", tag: t("catalog.photo_desc") || "конструктор",                      },
];

// «Свой размер» = всё, что не a4, не a3, не mini.
function isCustomProduct(p: ProductCardData): boolean {
  if (p.sizeLabel === "A4" || p.sizeLabel === "A3" || p.sizeLabel === "МИНИ") return false;
  return getSizeCat(p.width || 300, p.height || 400) === "large";
}

/** Обновляем URL в строке адреса БЕЗ перезагрузки и БЕЗ скролла. */
function pushUrl(params: URLSearchParams) {
  const q = params.toString();
  const hash = window.location.hash || "";
  const url = `${window.location.pathname}${q ? "?" + q : ""}${hash}`;
  window.history.replaceState({}, "", url);
}

export function CatalogClient({
  products, sizePreviews = {}, compact = false, eyebrow = "", title = "", subtitle = "",
}: {
  products: ProductCardData[];
  /** URL превью для каждого размера. Если для какого-то ключа нет — будет fallback на picsum. */
  sizePreviews?: Record<string, string>;
  compact?: boolean;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}) {
  const { t } = useTranslation();
  const sp = useSearchParams();

  const currentCats = CATS(t);
  const currentPresets = SIZE_PRESETS(t);

  // Инициализируем state из URL один раз, дальше — независимо.
  const [cat, setCat] = useState<string | undefined>(sp?.get("cat") || undefined);
  const [sort, setSort] = useState<string>(sp?.get("sort") || "popular");
  const [search, setSearch] = useState<string>(sp?.get("q") || "");
  const [size, setSize] = useState<SizeCat | "custom" | "all">((sp?.get("size") as any) || "all");
  const [customW, setCustomW] = useState<number>(+(sp?.get("w") || 30));
  const [customH, setCustomH] = useState<number>(+(sp?.get("h") || 40));
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"browse" | "custom">("browse");
  const [visibleCount, setVisibleCount] = useState(12);

  // Сброс счетчика при смене фильтров
  useEffect(() => {
    setVisibleCount(12);
  }, [cat, size, search, sort]);

  // Синхронизация state → URL (без скролла, без навигации)
  useEffect(() => {
    const params = new URLSearchParams();
    if (cat) params.set("cat", cat);
    if (sort && sort !== "popular") params.set("sort", sort);
    if (search) params.set("q", search);
    if (size && size !== "all") params.set("size", size);
    if (size === "custom") {
      params.set("w", String(customW));
      params.set("h", String(customH));
    }
    pushUrl(params);
    // не реагируем на sp — мы сами им управляем
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cat, sort, size, customW, customH]);

  // Debounce для поиска
  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams();
      if (cat) params.set("cat", cat);
      if (sort && sort !== "popular") params.set("sort", sort);
      if (search) params.set("q", search);
      if (size && size !== "all") params.set("size", size);
      if (size === "custom") {
        params.set("w", String(customW));
        params.set("h", String(customH));
      }
      pushUrl(params);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  // Приём внешнего события «открыть конструктор» (например, с плавающей кнопки или из Nav)
  useEffect(() => {
    let cancelled = false;
    const open = () => {
      setMode("custom");
      // Скроллим к каталогу в следующий кадр анимации — даём React отрисовать
      requestAnimationFrame(() => {
        if (cancelled) return;
        document.querySelector("[data-catalog]")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    };
    window.addEventListener("solyn:open-constructor", open);
    if (sp?.get("constructor") === "1") {
      // Чуть дольше: дождаться анимаций появления (reveal, framer)
      setTimeout(open, 120);
    }
    return () => {
      cancelled = true;
      window.removeEventListener("solyn:open-constructor", open);
    };
  }, [sp]);

  // Фильтрация + сортировка — целиком на клиенте
  const items = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = products.filter((p) => {
      if (cat && p.category !== cat) return false;
      if (q) {
        const hay = (p.title + " " + (p.tags?.join(" ") || "")).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (size === "all") return true;
      if (size === "custom") return isCustomProduct(p);
      return getSizeCat(p.width || 300, p.height || 400) === size;
    });

    if (sort === "new") {
      // порядок уже из БД (createdAt desc), оставляем
    } else if (sort === "price-asc") {
      list = [...list].sort((a, b) => a.basePrice - b.basePrice);
    } else if (sort === "price-desc") {
      list = [...list].sort((a, b) => b.basePrice - a.basePrice);
    }
    return list;
  }, [products, cat, search, size, sort]);

  const onCat = useCallback((c?: string) => setCat(c), []);
  const onSort = useCallback((s: string) => { setSort(s); setOpen(false); }, []);

  return (
    <div data-catalog className={cn(compact ? "pb-2" : "pt-24 pb-16 container-x")}>
      {!compact && (
        <div className="text-center mb-7">
          <div className="eyebrow">{eyebrow || t("catalog.eyebrow")}</div>
          <h1 className="h-section">{title || t("catalog.title")}</h1>
          <p className="text-muted mt-3 max-w-[44ch] mx-auto">{subtitle || t("catalog.subtitle")}</p>
        </div>
      )}

      {/* Promo line */}
      <div className="mb-6 flex justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon/10 border border-neon/20 text-neon text-sm font-display font-bold uppercase tracking-wider animate-pulse text-center">
          <Sparkles className="h-4 w-4 shrink-0" />
          {t("catalog.promo")}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {mode === "browse" ? (
          <motion.div
            key="browse"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {/* Верх: фильтры категорий + поиск/сортировка */}
            <div className="flex flex-col gap-4 mb-6">
              {/* Row 1: Categories */}
              <div className="flex flex-wrap gap-2">
                <button onClick={() => onCat(undefined)} className={cn("chip", !cat && "chip-on")}>{t("catalog.all")}</button>
                {currentCats.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => onCat(c.key)}
                    className={cn("chip", cat === c.key && "chip-on")}
                  >
                    {c.label}
                  </button>
                ))}
                {size !== "all" && (
                  <button onClick={() => setSize("all")} className="chip text-rose-300 border-rose-400/40">
                    {t("catalog.reset_size")}
                  </button>
                )}
              </div>

              {/* Row 2: Search + Sort */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t("catalog.search")}
                    className="input pl-9 h-10 w-full"
                  />
                </div>
                <button 
                  onClick={() => setOpen(true)} 
                  className="h-10 px-3 inline-flex items-center gap-2 rounded-full border border-line hover:border-neon text-sm bg-card shrink-0"
                >
                  <SlidersHorizontal className="h-4 w-4" /> 
                  <span className="hidden sm:inline">{t("catalog.sort")}</span>
                </button>
              </div>

              {/* Row 3: Size presets (Mobile only / Row style) */}
              <div className="flex sm:hidden overflow-x-auto pb-2 -mx-4 px-4 gap-2 scrollbar-hide">
                {currentPresets.filter(s => s.key !== "photo").map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setSize((cur) => (cur === s.key ? "all" : s.key as SizeCat | "custom"))}
                    className={cn(
                      "flex flex-col items-center justify-center min-w-[80px] h-[70px] rounded-xl border transition-all",
                      size === s.key 
                        ? "border-neon bg-neon/10 text-neon shadow-[0_0_12px_rgba(51,224,125,.2)]" 
                        : "border-line bg-card text-muted"
                    )}
                  >
                    <span className="font-display font-bold text-xs uppercase">{s.label}</span>
                    <span className="text-[9px] opacity-60 mt-0.5">{s.tag}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop Size Presets Grid */}
            <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
              {currentPresets.map((s) => {
                const isPhoto: boolean = s.key === "photo";
                // В этой ветке mode всегда "browse", поэтому photoActive всегда false.
                // Используем приведение к string, чтобы избежать ошибки типизации "no overlap".
                const photoActive: boolean = isPhoto && (mode as string) === "custom";
                const active: boolean = isPhoto ? photoActive : size === s.key;
                const maxH = 110;
                const maxW = 90;
                const ratio = s.w && s.h ? s.w / s.h : 3 / 4;
                let rW = maxW, rH = maxW / ratio;
                if (rH > maxH) { rH = maxH; rW = maxH * ratio; }
                return (
                  <button
                    key={s.key}
                    onClick={() => {
                      if (isPhoto) {
                        setMode("custom");
                        return;
                      }
                      setSize((cur) => (cur === s.key ? "all" : s.key as SizeCat | "custom"));
                    }}
                    className={cn(
                      "group relative rounded-2xl border bg-card overflow-hidden text-left transition-all h-[170px]",
                      active
                        ? "border-neon shadow-[0_0_24px_rgba(51,224,125,.28)]"
                        : "border-line hover:border-neon/60"
                    )}
                  >
                    <div className={cn("absolute inset-0 transition-opacity pointer-events-none", active ? "opacity-100" : "opacity-0 group-hover:opacity-50")}>
                      <div className="absolute -top-10 -right-10 h-20 w-22 rounded-full blur-2xl bg-neon/20" />
                    </div>
                    <div className="relative h-full flex flex-col items-center justify-center gap-2 p-3">
                      <div className="flex-1 w-full grid place-items-center">
                        {isPhoto ? (
                          <div
                            className={cn(
                              "h-14 w-14 rounded-full grid place-items-center border transition",
                              active
                                ? "border-neon bg-neon/20 text-neon shadow-[0_0_18px_rgba(51,224,125,.45)]"
                                : "border-line bg-neon/10 text-neon-2 group-hover:border-neon group-hover:text-neon"
                            )}
                          >
                            <Wand2 className="h-6 w-6" />
                          </div>
                        ) : s.key === "custom" ? (
                          <div
                            className={cn(
                              "h-14 w-14 rounded-full grid place-items-center border transition",
                              active
                                ? "border-neon bg-neon/20 text-neon shadow-[0_0_18px_rgba(51,224,125,.45)]"
                                : "border-line bg-neon/10 text-neon-2 group-hover:border-neon group-hover:text-neon"
                            )}
                          >
                            <Ruler className="h-6 w-6" />
                          </div>
                        ) : (
                          <div
                            className={cn(
                              "relative rounded-md overflow-hidden transition-all ring-1 ring-inset",
                              active ? "ring-neon shadow-[0_0_18px_rgba(51,224,125,.45)]" : "ring-white/5"
                            )}
                            style={{ width: rW, height: rH }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={getSizePreview(s.key as SizeCat, cat, sizePreviews)}
                              alt={s.label}
                              loading="lazy"
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div
                              className={cn(
                                "absolute inset-0 transition-opacity",
                                active ? "opacity-30 bg-neon/30" : "opacity-40 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent"
                              )}
                            />
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        <div className={cn("font-display font-bold text-[15px] leading-none", active ? "text-neon" : "text-white")}>
                          {s.label}
                        </div>
                        <div className="text-[11px] text-muted mt-1 uppercase tracking-[.15em] font-display">
                          {s.tag}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Mobile Constructor Promo Banner */}
            <div className="sm:hidden mb-6">
              <button 
                onClick={() => setMode("custom")}
                className="w-full relative rounded-2xl border border-neon/30 bg-card overflow-hidden p-4 flex items-center gap-4 group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-neon/10 to-transparent pointer-events-none" />
                <div className="h-12 w-12 rounded-full bg-neon/20 grid place-items-center shrink-0 border border-neon/40">
                  <Wand2 className="h-6 w-6 text-neon animate-pulse" />
                </div>
                <div className="text-left">
                  <div className="font-display font-bold text-sm text-white uppercase tracking-wider">{t("catalog.custom_design")}</div>
                  <div className="text-[11px] text-muted">{t("catalog.custom_desc")}</div>
                </div>
                <ChevronLeft className="h-5 w-5 text-neon ml-auto rotate-180 opacity-60 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="text-center text-muted py-16 border border-dashed border-line rounded-2xl">
                {t("catalog.empty")}
              </div>
            ) : (
              <>
                <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {items.slice(0, visibleCount).map((p) => (
                    <motion.div key={p.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <ProductCard p={p} />
                    </motion.div>
                  ))}
                </motion.div>

                {visibleCount < items.length && (
                  <div className="mt-12 text-center">
                    <button
                      onClick={() => setVisibleCount((prev) => prev + 4)}
                      className="btn-ghost min-w-[200px]"
                    >
                      {t("catalog.show_more") || "Показать ещё"}
                    </button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="custom"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <button onClick={() => setMode("browse")} className="btn-ghost text-sm">
                <ChevronLeft className="h-4 w-4" /> {t("catalog.back")}
              </button>
            </div>
            {/* Плашка «Конструктор в разработке» */}
            <div className="rounded-2xl border border-dashed border-neon/40 bg-neon/5 p-12 text-center">
              <div className="inline-flex h-16 w-16 rounded-full bg-neon/15 grid place-items-center mb-4">
                <Construction className="h-8 w-8 text-neon" />
              </div>
              <h3 className="font-display font-bold text-2xl text-white mb-2">{t("catalog.dev_title")}</h3>
              <p className="text-muted max-w-[360px] mx-auto leading-relaxed">
                {t("catalog.dev_desc")}
              </p>
              <div className="mt-6 flex flex-wrap gap-3 justify-center">
                <button onClick={() => setMode("browse")} className="btn text-sm">
                  <ChevronLeft className="h-4 w-4" /> {t("catalog.to_catalog")}
                </button>
                <a
                  href="https://wa.me/994555508932?text=Здравствуйте!%20Хочу%20узнать%20о%20своём%20дизайне"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ghost text-sm"
                >
                  💬 WhatsApp
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {open && (
        <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-0 h-full w-full sm:w-[380px] bg-navy-900 border-l border-line p-5"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-semibold text-lg">{t("catalog.sort")}</h3>
              <button onClick={() => setOpen(false)} className="h-9 w-9 grid place-items-center rounded-full border border-line">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-2">
              {SORTS(t).map((s) => (
                <button
                  key={s.key}
                  onClick={() => onSort(s.key)}
                  className={cn(
                    "px-4 py-3 rounded-xl border text-left transition",
                    sort === s.key ? "border-neon text-white bg-card" : "border-line text-muted hover:text-white"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Превью-фото для каждого пресета размера. Использует sizePreviews из props, fallback — picsum. */
function getSizePreview(key: SizeCat, cat?: string, sizePreviews: Record<string, string> = {}): string {
  const specificKey = cat ? `${cat}:${key}` : key;
  const fallback: Record<SizeCat, string> = {
    mini:  "https://picsum.photos/seed/solyn-mini/420/594",
    a4:    "https://picsum.photos/seed/solyn-a4/420/594",
    a3:    "https://picsum.photos/seed/solyn-a3/420/594",
    large: "https://picsum.photos/seed/solyn-large/420/594",
  };
  return sizePreviews[specificKey] || sizePreviews[key] || fallback[key];
}
