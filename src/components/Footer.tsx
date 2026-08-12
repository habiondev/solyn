import Link from "next/link";
import { Instagram, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-line mt-20 py-10">
      <div className="container-x grid gap-8 md:grid-cols-4">
        <div>
          <div className="font-display font-bold text-[20px] mb-2">
            <span className="text-neon">SOLYN</span> STUDIO
          </div>
          <p className="text-muted text-sm leading-relaxed">
            Светильники, постеры и картины ручной работы. Делаем арт по вашему фото. Баку · доставка по Азербайджану.
          </p>
        </div>
        <div>
          <div className="font-display font-semibold mb-2">Каталог</div>
          <ul className="grid gap-1.5 text-sm text-muted">
            <li><Link href="/#products" className="hover:text-white">Светильники</Link></li>
            <li><Link href="/#products" className="hover:text-white">Картины</Link></li>
            <li><Link href="/#products" className="hover:text-white">Постеры</Link></li>
            <li><Link href="/#products" className="hover:text-white">Сеты</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-display font-semibold mb-2">Сервис</div>
          <ul className="grid gap-1.5 text-sm text-muted">
            <li><Link href="/custom" className="hover:text-white">Свой дизайн</Link></li>
            <li><Link href="/#how" className="hover:text-white">Как заказать</Link></li>
            <li><Link href="/#delivery" className="hover:text-white">Доставка и оплата</Link></li>
            <li><Link href="/account" className="hover:text-white">Личный кабинет</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-display font-semibold mb-2">Контакты</div>
          <div className="flex gap-2 mb-3">
            <a
              href="https://instagram.com/solyn.az"
              target="_blank"
              rel="noreferrer"
              className="h-10 w-10 grid place-items-center rounded-full border border-line hover:border-neon"
              aria-label="Instagram"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="https://wa.me/994555508932"
              target="_blank"
              rel="noreferrer"
              className="h-10 w-10 grid place-items-center rounded-full border border-line hover:border-neon"
              aria-label="WhatsApp"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
          </div>
          <div className="text-sm text-muted">+994 55 550 89 32</div>
          <div className="text-sm text-muted">info@solyn.az</div>
        </div>
      </div>
      <div className="container-x mt-10 pt-6 border-t border-line text-center text-xs text-muted">
        © {new Date().getFullYear()} Solyn Studio. Все права защищены.
      </div>
    </footer>
  );
}
