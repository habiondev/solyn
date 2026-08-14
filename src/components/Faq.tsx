"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export function Faq() {
  const { t } = useTranslation();
  const [open, setOpen] = useState<number | null>(0);

  const ITEMS: { q: string; a: string }[] = [
    { q: t("faq.01.q"), a: t("faq.01.a") },
    { q: t("faq.02.q"), a: t("faq.02.a") },
    { q: t("faq.03.q"), a: t("faq.03.a") },
    { q: t("faq.04.q"), a: t("faq.04.a") },
    { q: t("faq.05.q"), a: t("faq.05.a") },
    { q: t("faq.06.q"), a: t("faq.06.a") },
  ];

  return (
    <div className="max-w-[760px] mx-auto grid gap-3">
      {ITEMS.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className="bg-card border border-line rounded-2xl">
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full text-left px-5 py-4 flex items-center justify-between gap-3 font-display font-semibold text-[15px]"
            >
              {it.q}
              <ChevronDown className={cn("h-4 w-4 text-neon transition-transform", isOpen && "rotate-180")} />
            </button>
            <div
              className={cn(
                "grid transition-all duration-300",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-4 text-muted text-[14px] leading-relaxed m-0">{it.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
