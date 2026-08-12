"use client";

import { useState } from "react";
import { useCart } from "@/components/CartContext";
import { useSession } from "next-auth/react";
import { formatPrice } from "@/lib/utils";
import { Loader2, Check, MessageCircle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

function buildWhatsAppText(items: ReturnType<typeof useCart>["items"], total: number, name: string, phone: string, address: string): string {
  const lines = items.map((it) => {
    const size = it.width && it.height ? `${it.width / 10}×${it.height / 10} см` : "";
    const opts = [it.hasBacklight ? "💡 LED" : null, it.hasFrame ? "🖼 рамка" : null].filter(Boolean).join(" · ");
    return `• ${it.title}${size ? ` (${size})` : ""}${opts ? ` — ${opts}` : ""} ×${it.quantity} — ${formatPrice(it.price * it.quantity)}`;
  });

  return [
    `🛒 ЗАКАЗ SOLYN`,
    ``,
    `👤 ${name}`,
    `📞 ${phone}`,
    address ? `📍 ${address}` : null,
    ``,
    `--- Заказ ---`,
    ...lines,
    ``,
    `💰 ИТОГО: ${formatPrice(total)}`,
  ]
    .filter(Boolean)
    .join("%0A");
}

export function CheckoutForm() {
  const { items, total, clear } = useCart();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customerName: session?.user?.name || "",
    phone: "",
    email: "",
    address: "",
    comment: "",
  });
  const [done, setDone] = useState<{ id: string; total: number } | null>(null);

  if (items.length === 0 && !done) {
    return (
      <div className="pt-32 pb-16 container-x text-center">
        <h1 className="h-section mb-3">Корзина пустая</h1>
        <p className="text-muted mb-5">Добавьте товары из каталога.</p>
        <Link href="/#products" className="btn">В каталог</Link>
      </div>
    );
  }

  /** Отправка через WhatsApp — без записи в БД, просто формируем сообщение и открываем чат. */
  const submitWhatsApp = () => {
    if (!form.customerName || !form.phone) {
      return toast.error("Сначала заполните имя и телефон");
    }
    const text = buildWhatsAppText(items, total, form.customerName, form.phone, form.address);
    const url = `https://wa.me/994555508932?text=${text}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  /** Стандартное оформление — сохраняем заказ в БД. */
  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName || !form.phone) {
      return toast.error("Заполните имя и телефон");
    }
    setLoading(true);
    try {
      const r = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, items }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Ошибка");
      setDone({ id: j.id, total: j.total });
      clear();
    } catch (err: unknown) {
      toast.error((err as Error).message || "Не удалось оформить заказ");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="pt-32 pb-16 container-x max-w-[560px] text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-b from-neon-2 to-neon grid place-items-center mb-5">
          <Check className="h-7 w-7 text-inkDim" />
        </div>
        <h1 className="h-section mb-2">Заказ оформлен!</h1>
        <p className="text-muted mb-1">
          Номер заказа: <b className="text-white">#{done.id.slice(-6).toUpperCase()}</b>
        </p>
        <p className="text-muted mb-5">
          Сумма: <b className="text-neon-2">{formatPrice(done.total)}</b>.
          Мы свяжемся с вами в ближайшее время.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/#products" className="btn-ghost">Продолжить покупки</Link>
          <a
            href={`https://wa.me/994555508932?text=Здравствуйте!%20У%20меня%20номер%20заказа%20%23${done.id.slice(-6).toUpperCase()}`}
            target="_blank"
            rel="noreferrer"
            className="btn text-sm"
          >
            💬 Написать в WhatsApp
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 container-x">
      <h1 className="h-section text-center mb-7">Оформление заказа</h1>
      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        {/* Форма */}
        <form onSubmit={submitForm} className="bg-card border border-line rounded-2xl p-5 grid gap-3">
          <h2 className="font-display font-semibold mb-1">Ваши данные</h2>

          <div className="grid sm:grid-cols-2 gap-3">
            <input
              required
              placeholder="Ваше имя *"
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              className="input"
            />
            <input
              required
              placeholder="Телефон (WhatsApp) *"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input"
            />
          </div>

          <input
            type="email"
            placeholder="Email (необязательно)"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="input"
          />
          <input
            placeholder="Адрес / город (необязательно)"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="input"
          />
          <textarea
            placeholder="Комментарий к заказу"
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
            rows={3}
            className="input"
          />

          <div className="grid sm:grid-cols-2 gap-2.5 mt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Подтвердить заказ
            </button>
            <button
              type="button"
              onClick={submitWhatsApp}
              className="btn-ghost border-[#25d366]/40 text-[#25d366] hover:bg-[#25d366]/10"
            >
              <MessageCircle className="h-4 w-4 fill-[#25d366]" />
              Написать в WhatsApp
            </button>
          </div>
          <div className="text-xs text-muted">При оформлении заказа — мы свяжемся с вами для подтверждения.</div>
        </form>

        {/* Сводка заказа */}
        <div className="bg-card border border-line rounded-2xl p-5 h-fit lg:sticky lg:top-24">
          <h2 className="font-display font-semibold mb-3">Ваш заказ</h2>
          <div className="grid gap-2 max-h-64 overflow-auto pr-1">
            {items.map((it) => (
              <div key={it.id} className="flex items-center gap-2.5 text-sm">
                <div className="h-12 w-12 rounded-lg overflow-hidden bg-navy-800 shrink-0">
                  {it.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.imageUrl} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate">{it.title}</div>
                  <div className="text-xs text-muted">
                    {it.width && it.height ? `${it.width / 10}×${it.height / 10} см` : "стандарт"} · ×{it.quantity}
                    {it.hasBacklight ? " · 💡 LED" : ""}
                    {it.hasFrame ? " · 🖼 рамка" : ""}
                  </div>
                </div>
                <div className="font-display font-semibold">{formatPrice(it.price * it.quantity)}</div>
              </div>
            ))}
          </div>
          <div className="border-t border-line mt-4 pt-4 flex items-center justify-between">
            <span className="text-muted">Итого</span>
            <span className="font-display font-bold text-2xl">{formatPrice(total)}</span>
          </div>
          <div className="text-xs text-muted mt-1">Доставка по Баку бесплатно от 200 ₼</div>
        </div>
      </div>
    </div>
  );
}
