"use client";

import { MessageCircle } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export function FloatingContact() {
  const { t } = useTranslation();
  return (
    <a
      href="https://wa.me/994555508932"
      target="_blank"
      rel="noreferrer"
      className="fixed right-4 bottom-4 z-30 flex items-center gap-2 bg-[#25d366] text-[#06331a] font-display font-bold text-sm px-4 py-3 rounded-full shadow-fab hover:-translate-y-0.5 transition"
    >
      <MessageCircle className="h-5 w-5 fill-[#06331a]" />
      <span className="hidden xs:inline">{t("contact.whatsapp")}</span>
    </a>
  );
}
