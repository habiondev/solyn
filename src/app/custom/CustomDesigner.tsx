"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { Upload, Sparkles, Frame, Lightbulb, Save, Send, ChevronLeft, Check } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCart } from "@/components/CartContext";
import { useAuth } from "@/components/auth/AuthContext";
import { formatPrice, SIZES, calculatePrice, type Finish, cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const TIPS = [
  { icon: "📐", title: "Большое разрешение", text: "Загрузите фото от 1500×2000 px — будет чётче." },
  { icon: "🌗", title: "Светлые и тёмные зоны", text: "Контрастные фото эффектнее с подсветкой." },
  { icon: "🖼", title: "Пейзажи и портреты", text: "Лучше всего смотрятся природа и силуэты." },
];

export function CustomDesigner() {
  const { data: session } = useSession();
  const router = useRouter();
  const { add } = useCart();
  const { open: openAuth } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  const [image, setImage] = useState<string | null>(null);
  const [filename, setFilename] = useState<string>("");
  const [sizeKey, setSizeKey] = useState<string>("M");
  const [customW, setCustomW] = useState(400);
  const [customH, setCustomH] = useState(500);
  const [hasFrame, setHasFrame] = useState(true);
  const [hasBacklight, setHasBacklight] = useState(true);
  const [finish, setFinish] = useState<Finish>("matte");
  const [title, setTitle] = useState("Моя картина");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const { w, h } = useMemo(() => {
    if (sizeKey === "custom") return { w: customW, h: customH };
    const found = SIZES.find((s) => s.label === sizeKey);
    return { w: found?.w ?? 300, h: found?.h ?? 400 };
  }, [sizeKey, customW, customH]);

  const price = useMemo(
    () => calculatePrice(w, h, { hasFrame, hasBacklight, finish }),
    [w, h, hasFrame, hasBacklight, finish]
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

  // сохранение проекта (для авторизованных)
  const saveProject = async () => {
    if (!image) return toast.error("Сначала загрузите фото");
    if (!session) { openAuth("login", "/custom"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, imageUrl: image, width: w, height: h,
          hasFrame, hasBacklight, finish, notes, totalPrice: price,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Проект сохранён в личном кабинете");
    } catch { toast.error("Не удалось сохранить"); }
    finally { setSaving(false); }
  };

  const addToCart = () => {
    if (!image) return toast.error("Сначала загрузите фото");
    add({
      id: `custom-${Date.now()}`, type: "custom", title: title || "Свой дизайн",
      imageUrl: image, width: w, height: h, hasFrame, hasBacklight, price,
    });
  };

  return (
    <div className="pt-24 pb-16">
      <div className="container-x">
        <div className="text-center mb-7">
          <div className="eyebrow flex items-center justify-center gap-2"><Sparkles className="h-3.5 w-3.5" /> Конструктор</div>
          <h1 className="h-section">Создай свою картину</h1>
          <p className="text-muted mt-3 max-w-[48ch] mx-auto">Загрузите фото, выберите размер и опции. Увидите готовый результат и стоимость.</p>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          {/* Превью */}
          <div className="bg-card border border-line rounded-2xl p-5 lg:p-6">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className="relative aspect-[3/4] w-full rounded-2xl border-2 border-dashed border-line hover:border-neon transition cursor-pointer overflow-hidden grid place-items-center"
            >
              {image ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt="превью" className="absolute inset-0 w-full h-full object-cover" />
                  {hasBacklight && (
                    <div className="absolute inset-0 pointer-events-none mix-blend-screen" aria-hidden>
                      <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_50%,rgba(51,224,125,.22),transparent_60%)]" />
                    </div>
                  )}
                  {hasFrame && <div className="absolute inset-2 border-2 border-white/30 rounded-xl pointer-events-none" />}
                  <div className="absolute top-3 left-3 bg-card/80 backdrop-blur border border-line rounded-full px-3 py-1 text-xs font-display">
                    {w}×{h} мм
                  </div>
                </>
              ) : (
                <div className="text-center text-muted p-8">
                  <div className="mx-auto h-14 w-14 rounded-full bg-navy-800 grid place-items-center mb-3">
                    <Upload className="h-5 w-5 text-neon" />
                  </div>
                  <div className="font-display font-semibold text-white mb-1">Перетащите фото сюда</div>
                  <div className="text-sm">или нажмите, чтобы выбрать · JPG/PNG до 20 МБ</div>
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
            <div className="mt-5 grid sm:grid-cols-3 gap-3">
              {TIPS.map((t) => (
                <div key={t.title} className="rounded-xl border border-line p-3 text-sm">
                  <div className="text-lg">{t.icon}</div>
                  <div className="font-display font-semibold mt-1">{t.title}</div>
                  <div className="text-muted text-[12px] mt-0.5">{t.text}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Опции */}
          <div className="bg-card border border-line rounded-2xl p-5 h-fit lg:sticky lg:top-24">
            <h2 className="font-display font-semibold text-lg mb-3">Параметры</h2>

            <label className="block text-xs text-muted uppercase tracking-[.15em] font-display mb-1.5">Название</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="input mb-3" />

            <div className="text-xs text-muted uppercase tracking-[.15em] font-display mb-1.5">Размер</div>
            <div className="grid grid-cols-4 gap-1.5 mb-3">
              {SIZES.map((s) => (
                <button
                  key={s.label}
                  onClick={() => setSizeKey(s.label)}
                  className={cn("chip h-auto py-2", sizeKey === s.label && "chip-on")}
                >
                  <div className="font-display font-semibold">{s.label}</div>
                  <div className="text-[10px] text-muted">{s.w}×{s.h}</div>
                </button>
              ))}
            </div>

            {sizeKey === "custom" && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="text-[10px] text-muted uppercase font-display">Ширина, мм</label>
                  <input type="number" min={100} max={1500} value={customW} onChange={(e) => setCustomW(+e.target.value || 0)} className="input" />
                </div>
                <div>
                  <label className="text-[10px] text-muted uppercase font-display">Высота, мм</label>
                  <input type="number" min={100} max={1500} value={customH} onChange={(e) => setCustomH(+e.target.value || 0)} className="input" />
                </div>
              </div>
            )}

            <div className="text-xs text-muted uppercase tracking-[.15em] font-display mb-1.5">Опции</div>
            <div className="grid gap-2 mb-3">
              <Toggle on={hasFrame} onChange={setHasFrame} icon={<Frame className="h-4 w-4" />} title="Рамка" desc="Деревянная, в цвет интерьера" />
              <Toggle on={hasBacklight} onChange={setHasBacklight} icon={<Lightbulb className="h-4 w-4" />} title="LED-подсветка" desc="Тёплый свет + диммер в комплекте" />
            </div>

            <div className="text-xs text-muted uppercase tracking-[.15em] font-display mb-1.5">Финиш</div>
            <div className="grid grid-cols-3 gap-1.5 mb-4">
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

            <label className="block text-xs text-muted uppercase tracking-[.15em] font-display mb-1.5">Комментарий (необязательно)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="input mb-4" placeholder="Например: обрезать поле снизу" />

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
            {!session && (
              <div className="mt-3 text-[12px] text-muted text-center">
                Чтобы сохранить проект,{" "}
                <button type="button" onClick={() => openAuth("login", "/custom")} className="text-neon-2 hover:text-neon">
                  войдите
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Toggle({ on, onChange, icon, title, desc }: { on: boolean; onChange: (v: boolean) => void; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl border text-left transition",
        on ? "border-neon bg-neon/5" : "border-line"
      )}
    >
      <div className={cn("h-8 w-8 grid place-items-center rounded-full", on ? "bg-neon text-inkDim" : "bg-navy-800 text-muted")}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="font-display font-semibold text-sm">{title}</div>
        <div className="text-[12px] text-muted">{desc}</div>
      </div>
      <div className={cn("h-5 w-9 rounded-full relative transition", on ? "bg-neon" : "bg-navy-800")}>
        <div className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all", on ? "left-4" : "left-0.5")} />
      </div>
    </button>
  );
}
