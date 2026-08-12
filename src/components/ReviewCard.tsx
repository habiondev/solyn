import { Star } from "lucide-react";

export type Review = { id: string; author: string; rating: number; text: string; avatar?: string | null };

export function ReviewCard({ r }: { r: Review }) {
  return (
    <div className="bg-card border border-line rounded-[18px] p-5 flex flex-col gap-3">
      <div className="text-neon tracking-[3px] text-[15px]">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`inline-block h-3.5 w-3.5 ${i < r.rating ? "fill-neon" : "opacity-30"}`} />
        ))}
      </div>
      <p className="m-0 text-ink/95 text-[15px] leading-relaxed">{r.text}</p>
      <div className="flex items-center gap-3 mt-auto">
        <div className="h-10 w-10 rounded-full bg-gradient-to-b from-neon-2 to-neon text-inkDim grid place-items-center font-display font-bold">
          {r.author[0]}
        </div>
        <div>
          <b className="font-display font-semibold text-[14px] block">{r.author}</b>
          <span className="text-muted text-[12px]">Покупатель Solyn</span>
        </div>
      </div>
    </div>
  );
}
