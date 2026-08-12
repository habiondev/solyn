import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

export default async function AdminDashboard() {
  const recent = await prisma.order.findMany({ take: 6, orderBy: { createdAt: "desc" }, include: { user: true, items: true } });
  const topProducts = await prisma.product.findMany({ where: { active: true }, include: { images: true, orderItems: true }, take: 5 });
  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <div className="bg-card border border-line rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold">Последние заказы</h2>
          <Link href="/admin/orders" className="text-sm text-neon-2">Все →</Link>
        </div>
        {recent.length === 0 ? (
          <div className="text-muted text-sm">Пока заказов нет.</div>
        ) : (
          <div className="grid gap-2">
            {recent.map((o) => (
              <div key={o.id} className="flex items-center justify-between p-3 rounded-xl border border-line">
                <div>
                  <div className="font-display font-semibold text-sm">#{o.id.slice(-6).toUpperCase()} · {o.customerName}</div>
                  <div className="text-xs text-muted">{new Date(o.createdAt).toLocaleString("ru-RU")} · {o.items.length} поз.</div>
                </div>
                <div className="text-right">
                  <div className="font-display font-bold">{formatPrice(o.total)}</div>
                  <div className="text-[10px] uppercase tracking-[.15em] font-display text-neon-2">{o.status}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="bg-card border border-line rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold">Топ товары</h2>
          <Link href="/admin/products" className="text-sm text-neon-2">Все →</Link>
        </div>
        <div className="grid gap-2">
          {topProducts.map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-2 rounded-xl border border-line">
              <div className="h-10 w-10 rounded-lg overflow-hidden bg-navy-800 shrink-0">
                {p.images[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.images[0].url} alt={p.title} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display font-semibold text-sm truncate">{p.title}</div>
                <div className="text-xs text-muted">{formatPrice(p.basePrice)} · {p.orderItems.length} заказов</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
