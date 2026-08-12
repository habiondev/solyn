import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { OrderStatusSelect } from "./OrderStatusSelect";

export default async function AdminOrders() {
  const orders = await prisma.order.findMany({
    include: { user: true, items: true },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div className="bg-card border border-line rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-navy-800 text-muted text-xs uppercase tracking-[.15em] font-display">
            <tr>
              <th className="text-left px-4 py-3">№</th>
              <th className="text-left px-4 py-3">Клиент</th>
              <th className="text-left px-4 py-3">Телефон</th>
              <th className="text-left px-4 py-3">Позиции</th>
              <th className="text-left px-4 py-3">Сумма</th>
              <th className="text-left px-4 py-3">Дата</th>
              <th className="text-left px-4 py-3">Статус</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr><td colSpan={7} className="text-center text-muted py-8">Пока заказов нет</td></tr>
            )}
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-line">
                <td className="px-4 py-3 font-display font-semibold">#{o.id.slice(-6).toUpperCase()}</td>
                <td className="px-4 py-3">{o.customerName}</td>
                <td className="px-4 py-3 text-muted">{o.phone}</td>
                <td className="px-4 py-3 text-muted">{o.items.length} шт</td>
                <td className="px-4 py-3 font-display font-bold">{formatPrice(o.total)}</td>
                <td className="px-4 py-3 text-muted text-xs">{new Date(o.createdAt).toLocaleDateString("ru-RU")}</td>
                <td className="px-4 py-3"><OrderStatusSelect id={o.id} status={o.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
