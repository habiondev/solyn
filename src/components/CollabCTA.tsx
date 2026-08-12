"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Handshake, MessageCircle, Send } from "lucide-react";
import { CollabModal } from "./CollabModal";

export function CollabCTA() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mx-auto max-w-[760px] text-center bg-gradient-to-br from-navy-800 to-navy-900 border border-line rounded-[24px] px-7 py-11 relative overflow-hidden transition hover:border-neon/30">
        <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-neon/10 blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[.2em] font-display text-neon-2 mb-3">
            <Handshake className="h-3 w-3" /> Сотрудничество
          </div>
          <h2 className="text-[clamp(24px,3.6vw,34px)] mb-3 font-display">Коллаборация с Solyn</h2>
          <p className="m-0 mb-6 text-muted text-[15px] max-w-[48ch] mx-auto">
            Партнёрство, опт, корпоративные подарки, авторские коллекции. Оставьте заявку или напишите в удобный мессенджер.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button onClick={() => setOpen(true)} className="btn text-[15px] px-7 py-3.5">
              <Send className="h-4 w-4" /> Оставить заявку
            </button>
            <a
              href="https://wa.me/994555508932?text=Здравствуйте!%20Хочу%20обсудить%20сотрудничество"
              target="_blank"
              rel="noreferrer"
              className="btn-ghost text-[15px] px-6 py-3.5"
            >
              <MessageCircle className="h-4 w-4 fill-[#25d366] text-[#25d366]" /> Написать в чат
            </a>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && <CollabModal onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
