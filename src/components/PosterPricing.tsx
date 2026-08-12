"use client";

import Image from "next/image";
import { formatPrice, POSTER_SIZES } from "@/lib/utils";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function PosterPricing() {
  const [active, setActive] = useState(1);
  return (
    <div className="grid sm:grid-cols-3 gap-4 max-w-[760px] mx-auto">
      {POSTER_SIZES.map((p, i) => {
        const price = i === 1 ? 3900 : i === 0 ? 2900 : 5900;
        return (
          <button
            key={p.label}
            onClick={() => setActive(i)}
            className={cn(
              "bg-card border rounded-[18px] p-6 text-center transition relative",
              active === i ? "border-neon shadow-[0_0_18px_rgba(51,224,125,.2)]" : "border-line"
            )}
          >
            {i === 1 && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-neon text-inkDim text-[10px] tracking-[.15em] uppercase font-display font-bold rounded-full px-2.5 py-1">хит</span>
            )}
            <div className="font-display font-bold text-2xl mb-1">{p.label} см</div>
            <div className="font-display font-bold text-xl text-neon">{formatPrice(price)}</div>
            <div className="text-[11px] text-neon-2 uppercase tracking-[.15em] mt-1">премиум бумага</div>
          </button>
        );
      })}
    </div>
  );
}
