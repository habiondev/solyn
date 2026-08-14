export const formatPrice = (cents: number, currency = "₼") =>
  new Intl.NumberFormat("ru-RU", { style: "decimal", minimumFractionDigits: 0 }).format(cents / 100) + " " + currency;

/** Есть ли валидная скидка: задана и меньше базовой цены. */
export function hasDiscount(base?: number | null, discount?: number | null): boolean {
  return typeof base === "number" && base > 0
    && typeof discount === "number" && discount > 0
    && discount < base;
}

/** Финальная цена: со скидкой, если она есть, иначе базовая. */
export function getFinalPrice(base?: number | null, discount?: number | null): number {
  if (hasDiscount(base, discount)) return discount as number;
  return base ?? 0;
}

/** Процент скидки, целое число (без знаков после запятой). */
export function getDiscountPercent(base?: number | null, discount?: number | null): number {
  if (!hasDiscount(base, discount)) return 0;
  return Math.round((1 - (discount as number) / (base as number)) * 100);
}

export const cn = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(" ");

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");

// Базовый множитель: светильники с подсветкой дороже
const BACKLIGHT_FACTOR = 1.6;
const FRAME_FACTOR = 1.15;
const CANVAS_FACTOR = 1.25;

export type Finish = "matte" | "glossy" | "canvas";

/** Расчёт стоимости по размерам (мм) и опциям. */
export function calculatePrice(
  width: number,
  height: number,
  opts: { hasFrame?: boolean; hasBacklight?: boolean; finish?: Finish; basePerM2?: number } = {}
) {
  const areaM2 = (width / 1000) * (height / 1000);
  const basePerM2 = opts.basePerM2 ?? 3500; // ₼ за м²
  let price = Math.max(areaM2 * basePerM2, 49); // минимум
  if (opts.hasBacklight) price *= BACKLIGHT_FACTOR;
  if (opts.hasFrame) price *= FRAME_FACTOR;
  if (opts.finish === "canvas") price *= CANVAS_FACTOR;
  return Math.round(price) * 100; // в копейках
}

export const SIZES = [
  { label: "S", w: 200, h: 300, hint: "Настольный" },
  { label: "M", w: 300, h: 400, hint: "Универсальный" },
  { label: "L", w: 400, h: 500, hint: "Акцент на стену" },
  { label: "XL", w: 500, h: 700, hint: "Большая стена" },
];

export const POSTER_SIZES = [
  { label: "21×30", w: 210, h: 300 },
  { label: "30×40", w: 300, h: 400 },
  { label: "50×70", w: 500, h: 700 },
];

/** Категории формата для каталога: мини, A4, A3, большой. */
export type SizeCat = "mini" | "a4" | "a3" | "large";

export const SIZE_CATS: { key: SizeCat; label: string; w: number; h: number; hint: string; tag: string }[] = [
  { key: "mini", label: "МИНИ", w: 60, h: 90, hint: "Компактный", tag: "6×9 см" },
  { key: "a4",   label: "A4",   w: 210, h: 297, hint: "Стандарт",  tag: "21×30 см" },
  { key: "a3",   label: "A3",   w: 297, h: 420, hint: "Акцент",    tag: "30×40 см" },
];

/** Определяем категорию формата по ширине/высоте в мм. */
export function getSizeCat(width: number, height: number): SizeCat {
  const w = Math.min(width, height);
  if (w <= 120) return "mini";
  if (w <= 220) return "a4";
  if (w <= 320) return "a3";
  return "large";
}

export function sizeCatLabel(c: SizeCat) {
  return SIZE_CATS.find((s) => s.key === c)?.label ?? c.toUpperCase();
}
