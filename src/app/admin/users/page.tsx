import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export default async function AdminUsers() {
  const users = await prisma.user.findMany({
    include: { orders: true, _count: { select: { orders: true, customDesigns: true } } },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div className="bg-card border border-line rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-navy-800 text-muted text-xs uppercase tracking-[.15em] font-display">
            <tr>
              <th className="text-left px-4 py-3">Имя / Email</th>
              <th className="text-left px-4 py-3">Роль</th>
              <th className="text-left px-4 py-3">Заказы</th>
              <th className="text-left px-4 py-3">Проекты</th>
              <th className="text-left px-4 py-3">Сумма</th>
              <th className="text-left px-4 py-3">Регистрация</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr><td colSpan={6} className="text-center text-muted py-8">Пока нет пользователей</td></tr>
            )}
            {users.map((u) => {
              const sum = u.orders.reduce((s, o) => s + o.total, 0);
              return (
                <tr key={u.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <div className="font-display font-semibold">{u.name || "—"}</div>
                    <div className="text-xs text-muted">{u.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={u.role === "ADMIN" ? "text-neon-2" : "text-muted"}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3 text-muted">{u._count.orders}</td>
                  <td className="px-4 py-3 text-muted">{u._count.customDesigns}</td>
                  <td className="px-4 py-3 font-display font-bold">{formatPrice(sum)}</td>
                  <td className="px-4 py-3 text-muted text-xs">{new Date(u.createdAt).toLocaleDateString("ru-RU")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
