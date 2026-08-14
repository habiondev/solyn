"use client";

import { useTranslation } from "@/lib/i18n";

export function Steps() {
  const { t } = useTranslation();
  
  const ITEMS = [
    { n: "01", t: t("steps.01.t"), d: t("steps.01.d") },
    { n: "02", t: t("steps.02.t"), d: t("steps.02.d") },
    { n: "03", t: t("steps.03.t"), d: t("steps.03.d") },
    { n: "04", t: t("steps.04.t"), d: t("steps.04.d") },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {ITEMS.map((s) => (
        <div key={s.n} className="bg-card border border-line rounded-2xl p-6 text-center transition hover:border-neon/30">
          <div className="h-10 w-10 rounded-full bg-gradient-to-b from-neon-2 to-neon text-inkDim grid place-items-center font-display font-bold mx-auto mb-3">
            {s.n}
          </div>
          <h3 className="font-display font-semibold mb-1.5">{s.t}</h3>
          <p className="text-muted text-[13px] leading-relaxed m-0">{s.d}</p>
        </div>
      ))}
    </div>
  );
}
