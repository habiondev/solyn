"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Handshake, X, MessageCircle, Send, Mail, Instagram, Phone, User } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "@/lib/i18n";

/** Модалка заявки на сотрудничество. Переиспользуется в Hero и CollabCTA. */
export function CollabModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      return toast.error(t("collab.modal.error"));
    }
    setLoading(true);
    // Имитация отправки — в проде подключить API
    await new Promise((r) => setTimeout(r, 700));
    toast.success(t("collab.modal.success"));
    setLoading(false);
    setForm({ name: "", phone: "", message: "" });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm grid place-items-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 22, stiffness: 260 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[480px] bg-navy-900 border border-neon/40 rounded-3xl p-6 shadow-2xl"
      >
        <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-neon/25 blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-9 w-9 grid place-items-center rounded-full border border-line text-muted hover:text-white z-10"
          aria-label={t("catalog.back")}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[.2em] font-display text-neon-2 mb-2">
            <Handshake className="h-3 w-3" /> {t("hero.collab")}
          </div>
          <h3 className="font-display font-bold text-xl">{t("collab.modal.title")}</h3>
          <p className="text-muted text-sm mt-1">{t("collab.modal.subtitle")}</p>
        </div>

        <form onSubmit={submit} className="grid gap-3">
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              required
              placeholder={t("collab.modal.name")}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input pl-10"
            />
          </div>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              required
              type="tel"
              placeholder={t("collab.modal.phone")}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input pl-10"
            />
          </div>
          <textarea
            placeholder={t("collab.modal.message")}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            rows={3}
            className="input resize-none"
          />
          <button disabled={loading} className="btn mt-1">
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-full border-2 border-inkDim/30 border-t-inkDim animate-spin" />
                {t("collab.modal.sending")}
              </span>
            ) : (
              <>
                <Send className="h-4 w-4" /> {t("collab.modal.submit")}
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-5 border-t border-line">
          <div className="text-[10px] text-muted uppercase tracking-[.2em] font-display text-center mb-3">
            {t("collab.modal.or")}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <a
              href="https://wa.me/994555508932"
              target="_blank"
              rel="noreferrer"
              className="btn-ghost text-[12px] justify-center py-2.5"
            >
              <MessageCircle className="h-3.5 w-3.5 fill-[#25d366] text-[#25d366]" /> WhatsApp
            </a>
            <a
              href="https://t.me/solyn_studio"
              target="_blank"
              rel="noreferrer"
              className="btn-ghost text-[12px] justify-center py-2.5"
            >
              <Send className="h-3.5 w-3.5" /> Telegram
            </a>
            <a
              href="https://instagram.com/solyn.az"
              target="_blank"
              rel="noreferrer"
              className="btn-ghost text-[12px] justify-center py-2.5"
            >
              <Instagram className="h-3.5 w-3.5" /> Instagram
            </a>
            <a
              href="mailto:info@solyn.az"
              className="btn-ghost text-[12px] justify-center py-2.5"
            >
              <Mail className="h-3.5 w-3.5" /> Email
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
