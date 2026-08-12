const ITEMS = [
  { n: "01", t: "Выбираешь дизайн", d: "Из каталога, отправляешь свою фотографию нам или загружаешь своё фото в конструкторе." },
  { n: "02", t: "Подбираем размер, и цвет рамки", d: "S, M, L или XL. Подскажем под твою стену." },
  { n: "03", t: "Делаем за 2–3 дня", d: "Печатаем на премиум-материале, собираем раму и LED-подсветку." },
  { n: "04", t: "Доставляем по Баку", d: "Курьером за 1 день, по Азербайджану — почтой или транспортной." },
];

export function Steps() {
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
