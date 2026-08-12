"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, ImagePlus, Ruler, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";

/**
 * Плавающая кнопка «Своё фото / свой размер» с автопопапом 3D-превью,
 * когда пользователь доскролливает до каталога.
 * Клик открывает конструктор inline в каталоге (а не новую страницу).
 */
export function FloatingConstructor() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const openConstructor = () => {
    setDismissed(true);
    setOpen(false);
    if (pathname === "/") {
      // Уже на главной — диспатчим событие + скроллим
      window.dispatchEvent(new CustomEvent("solyn:open-constructor"));
    } else {
      // На другой странице — идём на главную с флагом
      router.push("/?constructor=1#products");
    }
  };

  // Автопоказ попапа, когда каталог в зоне видимости
  useEffect(() => {
    if (typeof window === "undefined") return;
    const target = document.querySelector("#products, [data-catalog]");
    if (!target) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            if (!dismissed) {
              setTimeout(() => setOpen(true), 600);
            }
            break;
          } else {
            setOpen(false);
          }
        }
      },
      { threshold: 0.25 }
    );
    io.observe(target);
    return () => io.disconnect();
  }, [dismissed]);

  // Параллакс 3D-карточки по движению мыши
  const onMouseMove = (e: React.MouseEvent) => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: py * -10, y: px * 14 });
  };
  const onMouseLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <div className="fixed right-4 bottom-20 sm:bottom-24 z-[60] flex flex-col items-end gap-3">
      {/* Попап с 3D-карточкой */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ type: "spring", damping: 22, stiffness: 260 }}
            className="relative w-[300px] sm:w-[340px]"
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
          >
            <div className="relative rounded-3xl border border-line bg-navy-900/95 backdrop-blur-xl shadow-[0_24px_60px_rgba(0,0,0,.6)] overflow-hidden transition hover:border-neon/40">
              <div className="absolute -top-16 -right-16 h-44 w-44 rounded-full bg-neon/30 blur-3xl pointer-events-none" />

              <div className="relative flex items-start justify-between gap-2 p-4 pb-2">
                <div>
               
                  <h3 className="font-display font-bold text-lg leading-tight mt-1">
                    Создай сам
                  </h3>
                  <p className="text-[12px] text-muted mt-1 leading-snug">
                    Своё изображение и свой размер — за 2 минуты.
                  </p>
                </div>
                <button
                  onClick={() => { setOpen(false); setDismissed(true); }}
                  className="h-7 w-7 grid place-items-center rounded-full border border-line text-muted hover:text-white shrink-0"
                  aria-label="Закрыть"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* 3D card preview */}
             

              <div className="grid grid-cols-3 gap-1.5 px-4 mb-3 text-center">
                <Mini icon={<ImagePlus className="h-3.5 w-3.5" />} label="фото" />
                <Mini icon={<Ruler className="h-3.5 w-3.5" />} label="свой мм" />
                <Mini icon={<Sparkles className="h-3.5 w-3.5" />} label="свет" />
              </div>

              <div className="p-3 pt-0">
                <button
                  onClick={openConstructor}
                  className="btn w-full"
                >
                  Открыть конструктор <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Сама плавающая кнопка */}
      <button
        onClick={openConstructor}
        className="group relative h-14 sm:h-16 pl-4 pr-5 sm:pl-5 sm:pr-6 rounded-full bg-gradient-to-b from-neon-2 to-neon text-inkDim font-display font-bold text-sm shadow-[0_14px_34px_rgba(51,224,125,.45)] hover:-translate-y-0.5 transition flex items-center gap-2.5"
        aria-label="Открыть конструктор"
      >
        <span className="relative">
          <span className="absolute inset-0 rounded-full bg-inkDim/30 animate-ping" />
          <Sparkles className="h-5 w-5 relative" />
        </span>
        <span className="hidden sm:inline">Конструктор</span>
        <span className="sm:hidden">Дизайн</span>
      </button>
    </div>
  );
}

function Mini({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 py-1.5 rounded-lg bg-card/60 border border-line">
      <span className="text-neon">{icon}</span>
      <span className="text-[10px] text-muted uppercase tracking-[.1em]">{label}</span>
    </div>
  );
}
