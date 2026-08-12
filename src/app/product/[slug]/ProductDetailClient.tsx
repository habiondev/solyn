"use client";

import { useState } from "react";
import { ShoppingBag, ChevronLeft, Truck, Shield, RefreshCcw } from "lucide-react";
import { useCart } from "@/components/CartContext";
import { formatPrice, hasDiscount, getFinalPrice, getDiscountPercent } from "@/lib/utils";
import Link from "next/link";
import { ReviewCard } from "@/components/ReviewCard";

type Product = {
  id: string; title: string; slug: string; description: string; sizeLabel: string;
  width: number; height: number; basePrice: number; discountPrice: number | null;
  hasBacklight: boolean; hasFrame: boolean;
  category: string; rating: number; images: { url: string; alt: string; primary: boolean }[]; tags?: string[];
};

export function ProductDetailClient({ product }: { product: Product }) {
  const [active, setActive] = useState(product.images.find((i) => i.primary)?.url || product.images[0]?.url);
  const { add } = useCart();

  const onSale = hasDiscount(product.basePrice, product.discountPrice);
  const finalPrice = getFinalPrice(product.basePrice, product.discountPrice);
  const discountPct = getDiscountPercent(product.basePrice, product.discountPrice);

  return (
    <div className="pt-24 pb-16 container-x">
      <Link href="/#products" className="inline-flex items-center gap-1 text-muted hover:text-white text-sm mb-5">
        <ChevronLeft className="h-4 w-4" /> Назад в каталог
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-line relative bg-card">
            {active && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={active} alt={product.title} className="w-full h-full object-cover" />
            )}
            {product.hasBacklight && (
              <div className="absolute inset-0 mix-blend-screen pointer-events-none" aria-hidden>
                <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_50%,rgba(51,224,125,.18),transparent_60%)]" />
              </div>
            )}
            {onSale && (
              <span className="absolute top-3 right-3 text-[11px] uppercase tracking-[.15em] font-display bg-rose-500 text-white px-3 py-1 rounded-full shadow-[0_0_22px_rgba(244,63,94,.55)]">
                −{discountPct}%
              </span>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 mt-3">
              {product.images.map((img) => (
                <button
                  key={img.url}
                  onClick={() => setActive(img.url)}
                  className={`h-16 w-16 rounded-xl overflow-hidden border ${active === img.url ? "border-neon" : "border-line"}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.alt} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="label-tiny mb-2">{product.sizeLabel} · {product.width}×{product.height} мм</div>
          <h1 className="font-display font-bold text-3xl md:text-4xl mb-3">{product.title}</h1>
          <div className="flex items-center gap-2 text-neon mb-5">
            {"★".repeat(Math.round(product.rating))}
            <span className="text-muted text-sm">{product.rating.toFixed(1)}</span>
          </div>
          <p className="text-muted leading-relaxed mb-6">{product.description}</p>

          <div className="bg-card border border-line rounded-2xl p-5 mb-5">
            <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
              <div>
                <div className="text-xs text-muted uppercase tracking-[.15em] font-display">Цена</div>
                {onSale ? (
                  <div className="flex items-baseline gap-2.5 mt-1 flex-wrap">
                    <span className="font-display font-bold text-3xl text-rose-300">{formatPrice(finalPrice)}</span>
                    <span className="text-base text-muted line-through">{formatPrice(product.basePrice)}</span>
                    <span className="text-[11px] uppercase tracking-[.15em] font-display text-rose-300 px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-400/40">
                      Экономия {formatPrice(product.basePrice - finalPrice)}
                    </span>
                  </div>
                ) : (
                  <div className="font-display font-bold text-3xl mt-1">{formatPrice(product.basePrice)}</div>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 justify-end">
                {product.tags?.map((t) => (
                  <span key={t} className="text-[10px] uppercase tracking-[.15em] font-display bg-neon/10 text-neon-2 px-2 py-1 rounded-full">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={() =>
                add({
                  id: product.id, type: "product", title: product.title,
                  imageUrl: active, width: product.width, height: product.height,
                  hasFrame: product.hasFrame, hasBacklight: product.hasBacklight, price: finalPrice,
                })
              }
              className="btn w-full"
            >
              <ShoppingBag className="h-4 w-4" /> В корзину
            </button>
          </div>

          <ul className="grid gap-3 text-sm">
            <li className="flex items-center gap-3"><Truck className="h-4 w-4 text-neon" /> Доставка по Баку за 1 день</li>
            <li className="flex items-center gap-3"><Shield className="h-4 w-4 text-neon" /> Гарантия 12 месяцев</li>
            <li className="flex items-center gap-3"><RefreshCcw className="h-4 w-4 text-neon" /> Возврат в течение 14 дней</li>
          </ul>
        </div>
      </div>

      <section className="mt-16">
        <h2 className="h-section text-center mb-7">Отзывы покупателей</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { id: "1", author: "Айдан М.", rating: 5, text: "Светильник волшебный. Доставили за 2 дня в Баку." },
            { id: "2", author: "Эльвин Г.", rating: 5, text: "Качество печати огонь, цвета как на экране." },
            { id: "3", author: "Лала А.", rating: 4, text: "Сделали картину из нашего свадебного фото. Душевно." },
          ].map((r) => <ReviewCard key={r.id} r={r} />)}
        </div>
      </section>
    </div>
  );
}
