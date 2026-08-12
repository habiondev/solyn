"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Save, Trash2, ImageIcon, Pencil, X } from "lucide-react";

export type ContentAsset = {
  id: string;
  url: string;
  alt: string;
  category: string;
  meta: any;
  updatedAt: string;
};

const CATEGORIES: { key: string; label: string; hint: string }[] = [
  { key: "size-preview", label: "Превью размеров (A4, A3, мини, большой)", hint: "Картинки в карточках фильтра размеров" },
  { key: "hero", label: "Hero-баннер", hint: "Главный баннер на главной" },
  { key: "banner", label: "Промо-баннеры", hint: "Дополнительные секции" },
  { key: "og", label: "Open Graph", hint: "Картинка для превью в соцсетях" },
];

const SIZE_PRESETS = [
  { id: "size-preview:a4",    label: "A4",    tag: "21×30 см" },
  { id: "size-preview:a3",    label: "A3",    tag: "30×42 см" },
  { id: "size-preview:mini",  label: "мини",  tag: "12×18 см" },
  { id: "size-preview:large", label: "большой", tag: "50×70 см" },
];

export function ContentClient({ initial }: { initial: ContentAsset[] }) {
  const [items, setItems] = useState<ContentAsset[]>(initial);
  const [editing, setEditing] = useState<string | null>(null);

  const byCategory = (cat: string) => items.filter((i) => i.category === cat);
  const getById = (id: string) => items.find((i) => i.id === id);

  const uploadFile = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);
    const r = await fetch("/api/upload", { method: "POST", body: fd });
    if (!r.ok) throw new Error((await r.json()).error || "Upload failed");
    const { url } = await r.json();
    return url as string;
  };

  const save = async (id: string, url: string, alt: string, category: string) => {
    try {
      const r = await fetch("/api/admin/site-assets", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, url, alt, category }),
      });
      if (!r.ok) throw new Error((await r.json()).error || "Save failed");
      const { item } = await r.json();
      setItems((arr) => {
        const ix = arr.findIndex((x) => x.id === id);
        if (ix >= 0) {
          const next = arr.slice();
          next[ix] = item;
          return next;
        }
        return [...arr, item];
      });
      setEditing(null);
      toast.success("Сохранено");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const remove = async (id: string) => {
    if (!confirm(`Удалить «${id}»?`)) return;
    try {
      const r = await fetch(`/api/admin/site-assets?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Delete failed");
      setItems((arr) => arr.filter((x) => x.id !== id));
      toast.success("Удалено");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl text-white">Контент сайта</h1>
        <p className="text-muted text-sm mt-1">
          Управляйте изображениями, которые используются вне карточек товаров — превью размеров,
          баннеры, OG-картинки. Загруженные файлы попадают в Supabase Storage.
        </p>
      </div>

      {CATEGORIES.map((cat) => (
        <section key={cat.key} className="space-y-3">
          <div>
            <h2 className="font-display text-lg text-white">{cat.label}</h2>
            <p className="text-xs text-muted">{cat.hint}</p>
          </div>

          {cat.key === "size-preview" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {SIZE_PRESETS.map((p) => {
                const item = getById(p.id);
                return (
                  <SizePreviewCard
                    key={p.id}
                    presetId={p.id}
                    label={p.label}
                    tag={p.tag}
                    initial={item}
                    onSave={save}
                    onRemove={remove}
                  />
                );
              })}
            </div>
          ) : (
            <GenericCategory
              category={cat.key}
              items={byCategory(cat.key)}
              onSave={save}
              onRemove={remove}
              onAdd={(it) => setItems((arr) => [...arr, it])}
            />
          )}
        </section>
      ))}
    </div>
  );
}

function SizePreviewCard({
  presetId, label, tag, initial, onSave, onRemove,
}: {
  presetId: string;
  label: string;
  tag: string;
  initial: ContentAsset | undefined;
  onSave: (id: string, url: string, alt: string, cat: string) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}) {
  const [url, setUrl] = useState(initial?.url || "");
  const [alt, setAlt] = useState(initial?.alt || label);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);

  const onFile = async (file: File) => {
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/upload", { method: "POST", body: fd });
      if (!r.ok) throw new Error("Upload failed");
      const { url } = await r.json();
      setUrl(url as string);
      toast.success("Загружено в Storage");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-line bg-card p-4 space-y-3">
      <div className="aspect-[3/4] rounded-xl bg-inkDim/40 overflow-hidden flex items-center justify-center">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <ImageIcon className="h-10 w-10 text-muted" />
        )}
      </div>
      <div>
        <div className="font-display text-white">{label}</div>
        <div className="text-xs text-muted">{tag}</div>
      </div>
      {editing ? (
        <div className="space-y-2">
          <label className="block">
            <span className="text-xs text-muted">URL</span>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full mt-1 rounded-lg bg-inkDim border border-line px-3 py-2 text-sm text-white"
              placeholder="https://..."
            />
          </label>
          <label className="block">
            <span className="text-xs text-muted">Alt</span>
            <input
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              className="w-full mt-1 rounded-lg bg-inkDim border border-line px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="block">
            <span className="text-xs text-muted">Загрузить файл</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
              className="w-full mt-1 text-xs text-muted file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-neon file:text-inkDim file:font-display"
            />
          </label>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => onSave(presetId, url, alt, "size-preview").then(() => setEditing(false))}
              disabled={!url || busy}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-neon text-inkDim font-display py-2 disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> Сохранить
            </button>
            <button
              onClick={() => setEditing(false)}
              className="rounded-lg border border-line text-muted hover:text-white px-3"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => setEditing(true)}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-line text-white hover:border-neon py-2"
          >
            <Pencil className="h-4 w-4" /> Изменить
          </button>
          {initial && (
            <button
              onClick={() => onRemove(presetId)}
              className="rounded-lg border border-line text-muted hover:text-red-400 hover:border-red-400 px-3"
              title="Удалить"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function GenericCategory({
  category, items, onSave, onRemove, onAdd,
}: {
  category: string;
  items: ContentAsset[];
  onSave: (id: string, url: string, alt: string, cat: string) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  onAdd: (a: ContentAsset) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [id, setId] = useState("");
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [busy, setBusy] = useState(false);

  const onFile = async (file: File) => {
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/upload", { method: "POST", body: fd });
      if (!r.ok) throw new Error("Upload failed");
      const { url } = await r.json();
      setUrl(url as string);
      toast.success("Загружено");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    if (!id.trim() || !url.trim()) {
      toast.error("id и url обязательны");
      return;
    }
    await onSave(id.trim(), url, alt, category);
    onAdd({ id: id.trim(), url, alt, category, meta: null, updatedAt: new Date().toISOString() });
    setId(""); setUrl(""); setAlt("");
    setAdding(false);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((it) => (
          <div key={it.id} className="rounded-2xl border border-line bg-card p-3 space-y-2">
            <div className="aspect-video rounded-lg overflow-hidden bg-inkDim/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.url} alt={it.alt} className="w-full h-full object-cover" />
            </div>
            <div className="text-xs text-muted truncate">{it.id}</div>
            <button
              onClick={() => onRemove(it.id)}
              className="text-xs text-muted hover:text-red-400 inline-flex items-center gap-1"
            >
              <Trash2 className="h-3 w-3" /> Удалить
            </button>
          </div>
        ))}
      </div>
      {adding ? (
        <div className="rounded-2xl border border-line bg-card p-4 space-y-2">
          <input
            value={id} onChange={(e) => setId(e.target.value)}
            placeholder={`id (например ${category}:main)`}
            className="w-full rounded-lg bg-inkDim border border-line px-3 py-2 text-sm text-white"
          />
          <input
            value={url} onChange={(e) => setUrl(e.target.value)}
            placeholder="URL картинки (или загрузите файл ниже)"
            className="w-full rounded-lg bg-inkDim border border-line px-3 py-2 text-sm text-white"
          />
          <input
            value={alt} onChange={(e) => setAlt(e.target.value)}
            placeholder="Alt-текст"
            className="w-full rounded-lg bg-inkDim border border-line px-3 py-2 text-sm text-white"
          />
          <input
            type="file" accept="image/*"
            onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
            className="text-xs text-muted file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-neon file:text-inkDim"
          />
          <div className="flex gap-2">
            <button
              onClick={submit}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-lg bg-neon text-inkDim font-display py-2 px-4 disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> Сохранить
            </button>
            <button
              onClick={() => { setAdding(false); setId(""); setUrl(""); setAlt(""); }}
              className="rounded-lg border border-line text-muted hover:text-white px-4"
            >
              Отмена
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="rounded-2xl border border-dashed border-line text-muted hover:text-white hover:border-neon py-6 px-4 w-full"
        >
          + Добавить ассет
        </button>
      )}
    </div>
  );
}
