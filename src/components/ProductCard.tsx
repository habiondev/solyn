"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "./CartContext";
import { formatPrice, cn, hasDiscount, getFinalPrice, getDiscountPercent } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export type ProductCardData = {
  id: string;
  title: string;
  slug: string;
  sizeLabel: string;
  width?: number;
  height?: number;
  basePrice: number;
  discountPrice?: number | null;
  hasBacklight: boolean;
  hasFrame: boolean;
  category: string;
  imageUrl?: string;
  rating?: number;
  tags?: string[];
};

export function ProductCard({ p, onOrder }: { p: ProductCardData; onOrder?: () => void }) {
  const { t } = useTranslation();
  const { add } = useCart();
  const onSale = hasDiscount(p.basePrice, p.discountPrice);
  const finalPrice = getFinalPrice(p.basePrice, p.discountPrice);
  const discountPct = getDiscountPercent(p.basePrice, p.discountPrice);

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "LAMP": return t("product.lamp");
      case "POSTER": return t("product.poster");
      case "SET": return t("product.set");
      default: return t("product.painting");
    }
  };

  return (
    <div className="card-surface group flex flex-col">
      <Link href={`/product/${p.slug}`} className="block relative">
        <div className="aspect-[3/4] bg-gradient-to-br from-[#1a1a63] to-navy-800 relative overflow-hidden">
          {p.imageUrl ? (
            <Image
              src={p.imageUrl}
              alt={p.title}
              fill
              sizes="(max-width:820px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-muted text-[11px] tracking-[.2em] uppercase">
              фото
            </div>
          )}
          {p.hasBacklight && (
            <div className="absolute inset-0 pointer-events-none mix-blend-screen" aria-hidden>
              <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_50%,rgba(51,224,125,.25),transparent_60%)]" />
            </div>
          )}
          {p.tags?.[0] && (
            <span className="absolute top-2.5 left-2.5 text-[10px] uppercase tracking-[.15em] font-display bg-neon text-inkDim px-2.5 py-1 rounded-full z-10">
              {p.tags[0]}
            </span>
          )}
          {onSale && (
            <span 
              className={cn(
                "absolute text-[10px] uppercase tracking-[.15em] font-display bg-rose-500 text-white px-2.5 py-1 rounded-full shadow-[0_0_18px_rgba(244,63,94,.55)] z-10",
                p.tags?.[0] ? "top-[38px] left-2.5" : "top-2.5 right-2.5"
              )}
            >
              −{discountPct}%
            </span>
          )}
        </div>
      </Link>
      <div className="p-4 flex flex-col gap-1.5 flex-1">
        <div className="label-tiny">{p.sizeLabel} · {getCategoryLabel(p.category)}</div>
        <div className="min-h-[2.5rem] flex items-center">
          <h3 className="font-display font-semibold text-[15px] sm:text-[16px] leading-tight line-clamp-2">{p.title}</h3>
        </div>
        <div className="flex items-center justify-between mt-auto pt-2 gap-2">
          <div className="flex items-baseline gap-2 min-w-0">
            {onSale ? (
              <>
                <span className="font-display font-bold text-[20px] text-rose-300 whitespace-nowrap">{formatPrice(finalPrice)}</span>
                <span className="text-[12px] text-muted line-through whitespace-nowrap">{formatPrice(p.basePrice)}</span>
              </>
            ) : (
              <span className="font-display font-bold text-[20px] whitespace-nowrap">
                {formatPrice(p.basePrice)} <small className="text-xs text-muted font-normal">{t("product.per_pc")}</small>
              </span>
            )}
            {onSale && (
              <small className="text-[10px] text-rose-300/80 font-display uppercase tracking-[.1em] whitespace-nowrap">{t("product.per_pc")}</small>
            )}
          </div>
          <button
            onClick={() =>
              add({
                id: p.id,
                type: "product",
                title: p.title,
                imageUrl: p.imageUrl,
                width: 0,
                height: 0,
                hasFrame: p.hasFrame,
                hasBacklight: p.hasBacklight,
                price: finalPrice,
              })
            }
            className="h-9 w-9 grid place-items-center rounded-full bg-gradient-to-b from-neon-2 to-neon text-inkDim hover:scale-105 transition shrink-0"
            aria-label={t("product.add_to_cart")}
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="card-surface">
      <div className="aspect-[3/4] bg-card animate-pulse" />
      <div className="p-4">
        <div className="h-3 w-16 bg-card animate-pulse rounded mb-2" />
        <div className="h-4 w-3/4 bg-card animate-pulse rounded" />
        <div className="h-5 w-1/2 bg-card animate-pulse rounded mt-3" />
      </div>
    </div>
  );
}
