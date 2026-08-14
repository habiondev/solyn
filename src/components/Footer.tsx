"use client";

import Link from "next/link";
import { Instagram, MessageCircle } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-line mt-20 py-10">
      <div className="container-x grid gap-8 md:grid-cols-4">
        <div>
          <div className="font-display font-bold text-[20px] mb-2">
            <span className="text-neon">SOLYN</span> STUDIO
          </div>
          <p className="text-muted text-sm leading-relaxed">
            {t("footer.desc")}
          </p>
        </div>
        <div>
          <div className="font-display font-semibold mb-2">{t("nav.catalog")}</div>
          <ul className="grid gap-1.5 text-sm text-muted">
            <li><Link href="/#products" className="hover:text-white">{t("catalog.lamps")}</Link></li>
            <li><Link href="/#products" className="hover:text-white">{t("product.painting")}</Link></li>
            <li><Link href="/#products" className="hover:text-white">{t("catalog.posters")}</Link></li>
            <li><Link href="/#products" className="hover:text-white">{t("catalog.sets")}</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-display font-semibold mb-2">{t("nav.custom")}</div>
          <ul className="grid gap-1.5 text-sm text-muted">
            <li><Link href="/custom" className="hover:text-white">{t("nav.custom")}</Link></li>
            <li><Link href="/#how" className="hover:text-white">{t("nav.process")}</Link></li>
            <li><Link href="/account" className="hover:text-white">{t("nav.account")}</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-display font-semibold mb-2">{t("footer.contacts")}</div>
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
        © {new Date().getFullYear()} Solyn Studio. {t("footer.rights")}.
      </div>
    </footer>
  );
}
