import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { AdminNav } from "./AdminNav";
import { ShoppingBag, Users, Image as ImageIcon, DollarSign, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/?auth=login&next=/admin");
  if ((session.user as any).role !== "ADMIN") {
    return (
      <div className="pt-32 pb-16 container-x text-center">
        <h1 className="h-section mb-3">Нет доступа</h1>
        <p className="text-muted">Эта страница только для администраторов.</p>
      </div>
    );
  }

  const [orderCount, userCount, productCount, revenue, recent] = await Promise.all([
    prisma.order.count(),
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.aggregate({ _sum: { total: true } }),
    prisma.order.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { user: true } }),
  ]);

  return (
    <div className="pt-24 pb-16 container-x">
      <div className="mb-7">
        <div className="eyebrow">Админ-панель</div>
        <h1 className="h-section">Управление магазином</h1>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="Заказы" value={orderCount} icon={<ShoppingBag className="h-4 w-4" />} />
        <Stat label="Товары" value={productCount} icon={<ImageIcon className="h-4 w-4" />} />
        <Stat label="Пользователи" value={userCount} icon={<Users className="h-4 w-4" />} />
        <Stat label="Выручка" value={formatPrice(revenue._sum.total || 0)} icon={<DollarSign className="h-4 w-4" />} />
      </div>
      <AdminNav />
      <div className="mt-5">
        {/* Передаём заказы в children через пропс не получится в layout, поэтому страница сама делает запрос */}
        {/* @ts-ignore */}
        {children}
      </div>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: any; icon: React.ReactNode }) {
  return (
    <div className="bg-card border border-line rounded-2xl p-4">
      <div className="flex items-center gap-2 text-muted text-xs uppercase tracking-[.15em] font-display">
        {icon} {label}
      </div>
      <div className="font-display font-bold text-2xl mt-1.5">{value}</div>
    </div>
  );
}
