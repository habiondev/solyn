"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Handshake } from "lucide-react";
import { CollabModal } from "./CollabModal";

const LETTERS = ["S", "O", "L", "Y", "N"];

export function Hero() {
  const [collabOpen, setCollabOpen] = useState(false);

  return (
    <section className="relative min-h-[100vh] flex flex-col items-center justify-center overflow-hidden pt-16">
      <div className="flex gap-[clamp(6px,2.4vw,26px)] items-start mt-[-4vh] relative z-10">
        {LETTERS.map((l, i) => (
          <motion.span
            key={l}
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.13, duration: 1, ease: [0.2, 0.85, 0.25, 1] }}
            className="font-display font-bold text-neon"
            style={{ fontSize: "clamp(46px,13vw,132px)" }}
          >
            {l}
          </motion.span>
        ))}
      </div>

      {/* Кнопки: появляются вместе с буквами SOLYN, без задержки. */}
      <div className="mt-7 flex flex-wrap gap-3 justify-center z-10">
        <Link href="/#products" className="btn">Смотреть каталог</Link>
        <Link href="/custom" className="btn-ghost">Создать свой дизайн →</Link>
        <button onClick={() => setCollabOpen(true)} className="btn-ghost">
          <Handshake className="h-4 w-4" /> Сотрудничество
        </button>
      </div>

      {/* «О нас» — тоже без задержки, появляется сразу вместе с SOLYN и кнопками. */}
      <div className="relative z-10 mt-12 sm:mt-16 max-w-[640px] mx-auto px-5 text-center">
        <div className="eyebrow">Кто мы</div>
   
        <p className="text-muted text-[15px] sm:text-[16px] leading-relaxed mt-4">
          Мы — ребята из Баку, влюблённые в свет и в детали. Делаем светильники ручной работы, которые оживляют любимый кадр: любой арт, любое фото, любой размер.
          Каждый — собран вручную и светится именно так, как ты представляешь.
        </p>
        <p className="mt-4 text-neon-2 italic text-[15px] sm:text-[16px]">
          Готовим твой светильник за 2–3 дня.
        </p>
      </div>

      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 text-muted text-[11px] tracking-[.25em] uppercase z-10 opacity-0 animate-fade" style={{ animationDelay: "2.4s" }}>
        листай вниз
        <span className="block mx-auto mt-2 w-[18px] h-[28px] border-[1.5px] border-muted rounded-xl relative">
          <span className="absolute left-1/2 top-1.5 -translate-x-1/2 w-[3px] h-[6px] rounded-sm bg-neon" />
        </span>
      </div>

      {collabOpen && <CollabModal onClose={() => setCollabOpen(false)} />}
    </section>
  );
}
