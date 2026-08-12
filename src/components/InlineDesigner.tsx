"use client";

import { useState, useRef, useMemo } from "react";
import { Upload, Frame, Lightbulb, Save, Send, Check } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCart } from "./CartContext";
import { useAuth } from "./auth/AuthContext";
import { formatPrice, calculatePrice, type Finish, cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function InlineDesigner({
  width,
  height,
  sizeLabel,
}: {
  width: number;
  height: number;
  sizeLabel: string;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const { add } = useCart();
  const { open: openAuth } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  const [image, setImage] = useState<string | null>(null);
  const [filename, setFilename] = useState("");
  const [hasFrame, setHasFrame] = useState(true);
  const [hasBacklight, setHasBacklight] = useState(true);
  const [finish, setFinish] = useState<Finish>("matte");
  const [title, setTitle] = useState("Моя картина");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const price = useMemo(
    () => calculatePrice(width, height, { hasFrame, hasBacklight, finish }),
    [width, height, hasFrame, hasBacklight, finish]
  );

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return toast.error("Загрузите изображение");
    if (file.size > 20 * 1024 * 1024) return toast.error("Максимум 20 МБ");
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
    setFilename(file.name);
    if (title === "Моя картина") setTitle(file.name.replace(/\.[^.]+$/, ""));
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const saveProject = async () => {
    if (!image) return toast.error("Сначала загрузите фото");
    if (!session) { openAuth("login", "/"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, imageUrl: image, width, height,
          hasFrame, hasBacklight, finish, notes, totalPrice: price,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Проект сохранён в кабинете");
    } catch {
      toast.error("Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  };

  const addToCart = () => {
    if (!image) return toast.error("Сначала загрузите фото");
    add({
      id: `custom-${Date.now()}`,
      type: "custom",
      title: title || "Свой дизайн",
      imageUrl: image, width, height,
      hasFrame, hasBacklight, price,
    });
    toast.success("Добавлено в корзину");
  };

  return (
    <div className="grid lg:grid-cols-[1.2fr_1fr] gap-5">
      {/* Левая колонка: загрузка + лайв-превью */}
      <div className="bg-card border border-line rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs text-muted uppercase tracking-[.15em] font-display">
            Превью · {sizeLabel}
          </div>
          {image && (
            <div className="text-[10px] font-display text-neon-2 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-neon animate-pulse" /> LIVE
            </div>
          )}
        </div>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className="relative aspect-[3/4] w-full rounded-2xl border-2 border-dashed border-line hover:border-neon transition cursor-pointer overflow-hidden grid place-items-center bg-navy-950"
        >
          {image ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="превью" className="absolute inset-0 w-full h-full object-cover" />
              {hasBacklight && (
                <div className="absolute inset-0 pointer-events-none mix-blend-screen">
                  <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_50%,rgba(51,224,125,.28),transparent_60%)]" />
                </div>
              )}
              {hasFrame && (
                <div className="absolute inset-2 border-2 border-white/40 rounded-xl pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.3)]" />
              )}
              <div className="absolute top-3 left-3 bg-card/85 backdrop-blur border border-line rounded-full px-3 py-1 text-[11px] font-display">
                {width}×{height} мм
              </div>
              <div className="absolute bottom-3 right-3 bg-neon/20 backdrop-blur border border-neon rounded-full px-2.5 py-1 text-[10px] font-display text-neon-2 uppercase tracking-[.15em]">
                {finish === "matte" ? "матовый" : finish === "glossy" ? "глянец" : "холст"}
              </div>
            </>
          ) : (
            <div className="text-center text-muted p-8">
              <div className="mx-auto h-14 w-14 rounded-full bg-navy-800 grid place-items-center mb-3">
                <Upload className="h-5 w-5 text-neon" />
              </div>
              <div className="font-display font-semibold text-white mb-1">Перетащите фото</div>
              <div className="text-sm">или нажмите · JPG/PNG до 20 МБ</div>
              <div className="text-[11px] text-muted mt-3">
                Увидите, как будет выглядеть в размере {width}×{height} мм
              </div>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
        {filename && (
          <div className="mt-3 text-sm text-muted flex items-center gap-2">
            <Check className="h-4 w-4 text-neon" /> {filename}
          </div>
        )}
        <div className="mt-3 text-[11px] text-muted text-center">
          💡 Совет: фото от 1500×2000 px будет чётче. Контрастные снимки эффектнее с подсветкой.
        </div>
      </div>

      {/* Правая колонка: настройки */}
      <div className="bg-card border border-line rounded-2xl p-4 h-fit">
        <label className="block text-xs text-muted uppercase tracking-[.15em] font-display mb-1.5">Название</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input mb-3"
          placeholder="Моя картина"
        />

        <div className="text-xs text-muted uppercase tracking-[.15em] font-display mb-1.5">Опции</div>
        <div className="grid gap-2 mb-3">
          <Toggle on={hasFrame} onChange={setHasFrame} icon={<Frame className="h-4 w-4" />} title="Рамка" desc="Деревянная, в цвет интерьера" />
          <Toggle on={hasBacklight} onChange={setHasBacklight} icon={<Lightbulb className="h-4 w-4" />} title="LED-подсветка" desc="Тёплый свет + диммер в комплекте" />
        </div>

        <div className="text-xs text-muted uppercase tracking-[.15em] font-display mb-1.5">Финиш</div>
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          {(["matte", "glossy", "canvas"] as Finish[]).map((f) => (
            <button
              key={f}
              onClick={() => setFinish(f)}
              className={cn("chip h-auto py-2", finish === f && "chip-on")}
            >
              <div className="font-display font-semibold text-[12px]">
                {f === "matte" ? "Матовый" : f === "glossy" ? "Глянец" : "Холст"}
              </div>
            </button>
          ))}
        </div>

        <label className="block text-xs text-muted uppercase tracking-[.15em] font-display mb-1.5">Комментарий</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="input mb-3"
          placeholder="Например: обрезать поле снизу"
        />

        <div className="rounded-2xl bg-navy-800/60 border border-line p-4 mb-3">
          <div className="text-xs text-muted uppercase tracking-[.15em] font-display">Стоимость</div>
          <div className="font-display font-bold text-3xl mt-1 text-neon">{formatPrice(price)}</div>
          <div className="text-[11px] text-muted mt-1">Готово за 2–3 дня · доставка по Баку бесплатно от 200 ₼</div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={saveProject} disabled={saving} className="btn-ghost text-[13px]">
            <Save className="h-4 w-4" /> Сохранить
          </button>
          <button onClick={addToCart} className="btn text-[13px]">
            <Send className="h-4 w-4" /> В корзину
          </button>
        </div>
      </div>
    </div>
  );
}

function Toggle({
  on, onChange, icon, title, desc,
}: { on: boolean; onChange: (v: boolean) => void; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={cn(
        "flex items-center gap-3 p-2.5 rounded-xl border text-left transition",
        on ? "border-neon bg-neon/5" : "border-line"
      )}
    >
      <div className={cn("h-8 w-8 grid place-items-center rounded-full shrink-0", on ? "bg-neon text-inkDim" : "bg-navy-800 text-muted")}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-display font-semibold text-[13px] leading-tight">{title}</div>
        <div className="text-[11px] text-muted truncate">{desc}</div>
      </div>
      <div className={cn("h-4 w-7 rounded-full relative transition shrink-0", on ? "bg-neon" : "bg-navy-800")}>
        <div className={cn("absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all", on ? "left-3.5" : "left-0.5")} />
      </div>
    </button>
  );
}
