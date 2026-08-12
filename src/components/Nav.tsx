"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, ShoppingBag, User as UserIcon, LogOut, LayoutDashboard, Instagram, Wand2 } from "lucide-react";
import { ThreadsIcon } from "@/components/icons/ThreadsIcon";
import { useCart } from "./CartContext";
import { useAuth } from "./auth/AuthContext";
import { cn } from "@/lib/utils";

const links = [
  { href: "/#products", label: "Каталог" },
  { href: "/#how", label: "Процесс" },
  { href: "/#posters", label: "Постеры" },
  { href: "/#reviews", label: "Отзывы" },
  { href: "/#faq", label: "FAQ" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [menu, setMenu] = useState(false);
  const { data: session } = useSession();
  const { count, setOpen } = useCart();
  const { open: openAuth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Кнопка «Свой дизайн» в навбаре: открывает inline-конструктор в каталоге.
  // Если мы не на главной — переходим на главную с флагом, который откроет конструктор автоматически.
  const openCustom = () => {
    setMobile(false);
    if (pathname === "/") {
      window.dispatchEvent(new CustomEvent("solyn:open-constructor"));
    } else {
      router.push("/?constructor=1#products");
    }
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all",
        scrolled
          ? "backdrop-blur-md bg-[rgba(6,6,28,.72)] border-b border-line"
          : "bg-transparent"
      )}
    >
      <div className="container-x h-[64px] flex items-center justify-between">
        <Link href="/" className="font-display font-bold text-[20px] tracking-wide">
          <span className="text-neon">SOLYN</span> <span className="text-white">STUDIO</span>
        </Link>

        <div className="hidden lg:flex items-center gap-7 text-sm text-muted">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-white transition">
              {l.label}
            </Link>
          ))}
       
        </div>

        <div className="flex items-center gap-2">
          {/* Соцсети: Instagram + Threads */}
          <a
            href="https://instagram.com/solyn.az"
            target="_blank"
            rel="noreferrer"
            className="h-10 w-10 hidden sm:grid place-items-center rounded-full border border-line hover:border-neon hover:text-neon transition"
            aria-label="Instagram"
            title="Instagram"
          >
            <Instagram className="h-4 w-4" />
          </a>
          <a
            href="https://www.threads.com/@solyn.az"
            target="_blank"
            rel="noreferrer"
            className="h-10 w-10 hidden sm:grid place-items-center rounded-full border border-line hover:border-neon hover:text-neon transition"
            aria-label="Threads"
            title="Threads"
          >
            <ThreadsIcon className="h-4 w-4 text-white" />
          </a>

          <button
            onClick={() => setOpen(true)}
            className="relative h-10 w-10 grid place-items-center rounded-full border border-line hover:border-neon transition"
            aria-label="Корзина"
          >
            <ShoppingBag className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-neon text-inkDim text-[10px] font-bold grid place-items-center">
                {count}
              </span>
            )}
          </button>

          {session?.user ? (
            <div className="relative">
              <button
                onClick={() => setMenu((v) => !v)}
                className="h-10 w-10 grid place-items-center rounded-full bg-gradient-to-b from-neon-2 to-neon text-inkDim font-display font-bold"
                aria-label="Аккаунт"
              >
                {session.user.name?.[0] || session.user.email?.[0]?.toUpperCase()}
              </button>
              {menu && (
                <div
                  onMouseLeave={() => setMenu(false)}
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-navy-900 border border-line shadow-xl overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-line">
                    <div className="text-sm font-display font-semibold">{session.user.name || "Профиль"}</div>
                    <div className="text-xs text-muted truncate">{session.user.email}</div>
                  </div>
                  <Link href="/account" className="flex items-center gap-2 px-4 py-2.5 hover:bg-card text-sm">
                    <UserIcon className="h-4 w-4" /> Личный кабинет
                  </Link>
                  {(session.user as any).role === "ADMIN" && (
                    <Link href="/admin" className="flex items-center gap-2 px-4 py-2.5 hover:bg-card text-sm">
                      <LayoutDashboard className="h-4 w-4" /> Админ-панель
                    </Link>
                  )}
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full text-left flex items-center gap-2 px-4 py-2.5 hover:bg-card text-sm text-rose-300"
                  >
                    <LogOut className="h-4 w-4" /> Выйти
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openAuth("login")}
              className="hidden sm:inline-flex btn-ghost"
            >
              <UserIcon className="h-4 w-4" /> Войти
            </button>
          )}

          <button
            onClick={() => setMobile(true)}
            className="lg:hidden h-10 w-10 grid place-items-center rounded-full border border-line"
            aria-label="Меню"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mobile sheet */}
      {mobile && (
        <div className="lg:hidden fixed inset-0 z-50 bg-navy-950/95 backdrop-blur">
          <div className="container-x h-[64px] flex items-center justify-between">
            <span className="font-display font-bold text-[20px]">
              <span className="text-neon">SOLYN</span> STUDIO
            </span>
            <button onClick={() => setMobile(false)} className="h-10 w-10 grid place-items-center rounded-full border border-line">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="container-x mt-6 grid gap-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobile(false)}
                className="px-4 py-3 rounded-xl border border-line bg-card text-white"
              >
                {l.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={openCustom}
              className="px-4 py-3 rounded-xl bg-neon/10 text-neon-2 border border-neon/30 font-display font-semibold text-left flex items-center gap-2"
            >
              <Wand2 className="h-4 w-4" /> Своё фото · свой размер
            </button>
            {!session?.user && (
              <button
                type="button"
                onClick={() => { setMobile(false); openAuth("login"); }}
                className="px-4 py-3 rounded-xl bg-gradient-to-b from-neon-2 to-neon text-inkDim font-display font-semibold text-center"
              >
                Войти
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
