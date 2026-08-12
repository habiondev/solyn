import { formatPrice, SIZES, calculatePrice, cn } from "@/lib/utils";
import { Check } from "lucide-react";

export function PricingTable() {
  return (
    <div className="grid md:grid-cols-3 gap-4 max-w-[820px] mx-auto">
      {SIZES.map((s) => {
        const lamp = calculatePrice(s.w, s.h, { hasFrame: true, hasBacklight: true });
        const frame = calculatePrice(s.w, s.h, { hasFrame: true, hasBacklight: false });
        const noFrame = calculatePrice(s.w, s.h, { hasFrame: false, hasBacklight: false });
        return (
          <div key={s.label} className="bg-card border border-line rounded-[18px] p-5">
            <div className="font-display font-bold text-2xl text-neon mb-1">{s.label}</div>
            <div className="text-xs text-muted uppercase tracking-[.15em] font-display">{s.w}×{s.h} мм · {s.hint}</div>
            <div className="mt-5 grid gap-2 text-sm">
              <Row label="Светильник с подсветкой" value={lamp} hi />
              <Row label="Картина в раме" value={frame} />
              <Row label="Постер без рамы" value={noFrame} />
            </div>
            <ul className="mt-5 grid gap-1.5 text-[12px] text-muted">
              <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-neon" /> Печать на премиум-материале</li>
              <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-neon" /> LED-подсветка с диммером</li>
              <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-neon" /> Деревянная рама</li>
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function Row({ label, value, hi }: { label: string; value: number; hi?: boolean }) {
  return (
    <div className={cn("flex justify-between items-center py-2 border-b border-line last:border-0", hi && "text-white")}>
      <span className="text-muted">{label}</span>
      <b className={cn("font-display text-lg", hi ? "text-neon" : "text-white")}>{formatPrice(value)}</b>
    </div>
  );
}
