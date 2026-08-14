"use client";

import { useCart } from "./CartContext";
import { formatPrice, cn } from "@/lib/utils";
import { X, Trash2, ShoppingBag, ArrowRight, ImageIcon, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";

export function CartDrawer() {
  const { t } = useTranslation();
  const { items, open, setOpen, remove, setQuantity, total, count } = useCart();
  return (
    <div
      className={cn(
        "fixed inset-0 z-[80] transition",
        open ? "pointer-events-auto" : "pointer-events-none"
      )}
    >
      <div
        onClick={() => setOpen(false)}
        className={cn(
          "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity",
          open ? "opacity-100" : "opacity-0"
        )}
      />
      <aside
        className={cn(
          "absolute right-0 top-0 h-full w-full sm:w-[420px] bg-navy-900 border-l border-line shadow-2xl flex flex-col transition-transform",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <header className="px-5 h-[64px] flex items-center justify-between border-b border-line">
          <div className="font-display font-semibold flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-neon" /> {t("cart.title")} <span className="text-muted text-sm">· {count}</span>
          </div>
          <button onClick={() => setOpen(false)} className="h-9 w-9 grid place-items-center rounded-full border border-line">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5 grid gap-3">
          {items.length === 0 ? (
            <div className="text-center text-muted py-16">
              <div className="mx-auto h-14 w-14 rounded-full bg-card grid place-items-center mb-3">
                <ShoppingBag className="h-5 w-5" />
              </div>
              {t("cart.empty_msg")}
            </div>
          ) : (
            items.map((it) => (
              <div key={it.id} className="rounded-2xl bg-card border border-line p-3 flex gap-3">
                <div className="h-20 w-20 rounded-xl overflow-hidden bg-navy-800 relative shrink-0">
                  {it.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.imageUrl} alt={it.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full grid place-items-center text-muted">
                      <ImageIcon className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-semibold truncate">{it.title}</div>
                  <div className="text-[12px] text-muted">
                    {it.width && it.height ? `${it.width}×${it.height} мм` : t("cart.item.standard")} · {it.hasBacklight ? t("cart.item.glow") : t("cart.item.no_glow")} · {it.hasFrame ? t("cart.item.frame") : t("cart.item.no_frame")}
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setQuantity(it.id, it.quantity - 1)} className="h-7 w-7 grid place-items-center rounded-full border border-line text-sm">−</button>
                      <span className="w-6 text-center text-sm">{it.quantity}</span>
                      <button onClick={() => setQuantity(it.id, it.quantity + 1)} className="h-7 w-7 grid place-items-center rounded-full border border-line text-sm">+</button>
                    </div>
                    <div className="font-display font-bold">{formatPrice(it.price * it.quantity)}</div>
                  </div>
                </div>
                <button
                  onClick={() => remove(it.id)}
                  className="h-8 w-8 grid place-items-center rounded-full border border-line text-muted hover:text-rose-300"
                  aria-label={t("catalog.back")}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        <footer className="border-t border-line p-5 grid gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-muted text-sm">{t("cart.total")}</span>
            <span className="font-display font-bold text-xl">{formatPrice(total)}</span>
          </div>
          <Link
            href="/checkout"
            onClick={() => setOpen(false)}
            className={cn("btn", items.length === 0 && "pointer-events-none opacity-50")}
          >
            {t("cart.checkout_msg")} <ArrowRight className="h-4 w-4" />
          </Link>
          {items.length > 0 && (
            <a
              href={`https://wa.me/994555508932?text=${encodeURIComponent(
                "🛒 Здравствуйте! Хочу заказать с сайта SOLYN:\n\n" +
                items.map(it => {
                  const size = it.width && it.height ? `${it.width / 10}×${it.height / 10} см` : "";
                  const opts = [it.hasBacklight ? "💡 LED" : null, it.hasFrame ? "🖼 рамка" : null].filter(Boolean).join(" · ");
                  return `• ${it.title}${size ? ` (${size})` : ""}${opts ? ` — ${opts}` : ""} ×${it.quantity}`;
                }).join("\n") +
                `\n\n💰 ИТОГО: ${formatPrice(total)}`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost border-[#25d366]/40 text-[#25d366] hover:bg-[#25d366]/10"
            >
              <MessageCircle className="h-4 w-4 fill-[#25d366]" />
              {t("cart.whatsapp_msg")}
            </a>
          )}
        </footer>
      </aside>
    </div>
  );
}
