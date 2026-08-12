import Link from "next/link";

export function CTA() {
  return (
    <div className="mt-2 mx-auto max-w-[720px] text-center bg-gradient-to-br from-neon-dark to-neon rounded-[24px] px-7 py-11 text-inkDim">
      <h2 className="text-[clamp(24px,3.6vw,34px)] mb-2.5 font-display">Готовы сделать свой арт?</h2>
      <p className="m-0 mb-5 text-[15px] opacity-90">Загрузите своё фото и увидите готовый светильник за 2 минуты.</p>
      <Link href="/custom" className="inline-flex items-center gap-2 bg-inkDim text-neon-2 font-display font-semibold text-[15px] px-8 py-3 rounded-full">
        Открыть конструктор →
      </Link>
    </div>
  );
}
