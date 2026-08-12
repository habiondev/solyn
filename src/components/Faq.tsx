"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS: { q: string; a: string }[] = [
  { q: "Сколько по времени делается заказ?", a: "Стандартный светильник собираем за 2–3 дня. Постер или картину без подсветки — за 1–2 дня. Срочные заказы обсуждаем индивидуально." },
  { q: "Можно ли из своего фото сделать картину?", a: "Да — в разделе «Свой дизайн» загрузите фото, выберите размер и опции. Можно сразу увидеть превью и стоимость." },
  { q: "Как светит подсветка? Можно ли её выключить?", a: "LED-лента по периметру с тёплым или холодным свечением. В комплекте — диммер и пульт, яркость регулируется." },
  { q: "Какие размеры доступны?", a: "S 20×30, M 30×40, L 40×50, XL 50×70. Под заказ можем сделать любой размер до 100×150 см." },
  { q: "Доставка и оплата?", a: "По Баку — курьером за 1 день (бесплатно от 200 ₼). По Азербайджану — почтой или через курьерские службы. Оплата картой, переводом или наличными при получении." },
  { q: "Что если мне не подойдёт?", a: "Если что-то не так — вернём деньги или переделаем. Каждый светильник проходит контроль перед упаковкой." },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
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
