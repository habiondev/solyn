"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ShoppingBag, Image as ImageIcon, Users, LayoutDashboard, Palette } from "lucide-react";

const items = [
  { href: "/admin", label: "Дашборд", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Заказы", icon: ShoppingBag },
  { href: "/admin/products", label: "Товары", icon: ImageIcon },
  { href: "/admin/content", label: "Контент сайта", icon: Palette },
  { href: "/admin/users", label: "Пользователи", icon: Users },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <div className="flex flex-wrap gap-2 border-b border-line pb-3">
      {items.map((it) => {
        const Icon = it.icon;
        const on = path === it.href;
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-display transition",
              on ? "bg-neon text-inkDim" : "bg-card border border-line text-muted hover:text-white hover:border-neon"
            )}
          >
            <Icon className="h-4 w-4" /> {it.label}
          </Link>
        );
      })}
    </div>
  );
}
