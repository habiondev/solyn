import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { LogoutButton } from "./LogoutButton";
import Link from "next/link";
import { Sparkles, ShoppingBag, Image as ImageIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/?auth=login&next=/account");
  const userId = (session.user as any).id as string;

  const [orders, designs] = await Promise.all([
    prisma.order.findMany({ where: { userId }, include: { items: true }, orderBy: { createdAt: "desc" } }),
    prisma.customDesign.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="pt-24 pb-16 container-x">
      <div className="flex items-center justify-between mb-7 flex-wrap gap-3">
        <div>
          <div className="eyebrow">Кабинет</div>
          <h1 className="h-section">{session.user.name || session.user.email}</h1>
        </div>
        <LogoutButton />
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Stat label="Заказы" value={orders.length} icon={<ShoppingBag className="h-4 w-4" />} />
        <Stat label="Своих проектов" value={designs.length} icon={<Sparkles className="h-4 w-4" />} />
        <Stat label="Сумма" value={formatPrice(orders.reduce((s, o) => s + o.total, 0))} icon={<ImageIcon className="h-4 w-4" />} />
      </div>

      <h2 className="font-display font-semibold text-xl mb-3">Мои заказы</h2>
      {orders.length === 0 ? (
        <div className="text-center text-muted py-10 border border-dashed border-line rounded-2xl">
          Пока нет заказов. <Link href="/#products" className="text-neon-2">В каталог →</Link>
        </div>
      ) : (
        <div className="grid gap-3 mb-10">
          {orders.map((o) => (
            <div key={o.id} className="bg-card border border-line rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="text-xs text-muted">Заказ #{o.id.slice(-6).toUpperCase()}</div>
                <div className="font-display font-semibold mt-0.5">{new Date(o.createdAt).toLocaleString("ru-RU")}</div>
                <div className="text-xs text-muted mt-1">{o.items.length} поз. · {o.customerName} · {o.phone}</div>
              </div>
              <div className="text-right">
                <div className="font-display font-bold text-lg">{formatPrice(o.total)}</div>
                <span className="text-[11px] uppercase tracking-[.15em] font-display text-neon-2">{o.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="font-display font-semibold text-xl mb-3">Сохранённые проекты</h2>
      {designs.length === 0 ? (
        <div className="text-center text-muted py-10 border border-dashed border-line rounded-2xl">
          Пока нет проектов. <Link href="/custom" className="text-neon-2">Создать →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {designs.map((d) => (
            <div key={d.id} className="bg-card border border-line rounded-2xl overflow-hidden">
              <div className="aspect-[3/4] relative bg-navy-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={d.imageUrl} alt={d.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-3">
                <div className="font-display font-semibold truncate">{d.title}</div>
                <div className="text-xs text-muted">{d.width}×{d.height} мм · {formatPrice(d.totalPrice)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: any; icon: React.ReactNode }) {
  return (
    <div className="bg-card border border-line rounded-2xl p-5">
      <div className="flex items-center gap-2 text-muted text-xs uppercase tracking-[.15em] font-display">
        {icon} {label}
      </div>
      <div className="font-display font-bold text-2xl mt-1.5">{value}</div>
    </div>
  );
}
