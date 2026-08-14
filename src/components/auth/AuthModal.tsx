"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, X, Mail, Lock, User as UserIcon, ShieldCheck, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "./AuthContext";
import { useTranslation } from "@/lib/i18n";

export function AuthModal() {
  const { t } = useTranslation();
  const { isOpen, tab, next, open, close, setTab } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, close]);

  if (!isOpen) return null;

  return (
    <div
      onClick={close}
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm grid place-items-center px-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[420px] bg-gradient-to-br from-navy-900 to-navy-950 border border-line rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-neon/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-neon/10 blur-3xl" />

        <button
          onClick={close}
          className="absolute top-3 right-3 z-10 h-9 w-9 grid place-items-center rounded-full bg-navy-950/60 border border-line text-muted hover:text-white hover:border-neon/60 transition"
          aria-label={t("catalog.back")}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative grid grid-cols-2 border-b border-line">
          {(["login", "register"] as const).map((t_key) => (
            <button
              key={t_key}
              onClick={() => setTab(t_key)}
              className={
                "py-4 text-sm font-display font-semibold transition relative " +
                (tab === t_key ? "text-white" : "text-muted hover:text-white")
              }
            >
              {t_key === "login" ? t("nav.login") : t("auth.register.submit")}
              {tab === t_key && (
                <span className="absolute left-1/2 -translate-x-1/2 bottom-0 h-[2px] w-12 bg-neon rounded-full" />
              )}
            </button>
          ))}
        </div>

        <div className="relative p-6 sm:p-7">
          {tab === "login" ? (
            <LoginForm
              next={next}
              onSwitch={() => setTab("register")}
              onSuccess={() => {
                close();
                router.refresh();
              }}
            />
          ) : (
            <RegisterForm
              onSwitch={() => setTab("login")}
              onSuccess={() => {
                close();
                router.refresh();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  icon, type = "text", placeholder, value, onChange, required, minLength, autoComplete, end,
}: {
  icon: React.ReactNode;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  end?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted z-10">{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        className="input pl-10 pr-10"
      />
      {end && <span className="absolute right-2 top-1/2 -translate-y-1/2">{end}</span>}
    </div>
  );
}

function ErrorBox({ message, hint }: { message: string; hint?: string }) {
  return (
    <div className="flex gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-400/30 text-rose-200 text-sm">
      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
      <div>
        <div className="font-medium">{message}</div>
        {hint && <div className="text-rose-300/80 text-xs mt-0.5">{hint}</div>}
      </div>
    </div>
  );
}

function LoginForm({
  next, onSwitch, onSuccess,
}: { next: string | null; onSwitch: () => void; onSuccess: () => void }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });
      if (!res?.ok) {
        setError(`${t("auth.login.error")}${email ? ` для ${email.trim().toLowerCase()}` : ""}`);
        return;
      }
      // Узнаём роль: если админ — отправим в /admin (если next не задан)
      const sess = await fetch("/api/auth/session", { cache: "no-store" }).then((r) => r.json());
      const role = (sess?.user as any)?.role;
      const dest = next || (role === "ADMIN" ? "/admin" : "/account");
      toast.success(t("hero.view_catalog")); // Placeholder success
      onSuccess();
      // Полная навигация — иначе server-компоненты не видят новую сессию
      window.location.href = dest;
    } catch (e: any) {
      setError("Ошибка соединения. Попробуй ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-3">
      <div className="mb-1">
        <h2 className="font-display font-bold text-xl">{t("auth.login.title")}</h2>
        <p className="text-muted text-sm">{t("auth.login.desc")}</p>
      </div>

      {error && <ErrorBox message={error} hint={t("auth.login.hint")} />}

      <Field
        icon={<Mail className="h-4 w-4" />}
        type="email" placeholder="Email" value={email} onChange={setEmail}
        required autoComplete="email"
      />
      <Field
        icon={<Lock className="h-4 w-4" />}
        type={showPw ? "text" : "password"} placeholder={t("nav.logout")} value={password} onChange={setPassword}
        required autoComplete="current-password"
        end={
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="h-7 w-7 grid place-items-center text-muted hover:text-white"
            tabIndex={-1}
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
      />

      <button disabled={loading} className="btn mt-1">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />} {t("auth.login.submit")}
      </button>

      <p className="text-sm text-muted text-center mt-2">
        {t("auth.login.no_account")}{" "}
        <button type="button" onClick={onSwitch} className="text-neon-2 hover:text-neon transition">
          {t("auth.register.submit")}
        </button>
      </p>
    </form>
  );
}

function RegisterForm({ onSwitch, onSuccess }: { onSwitch: () => void; onSuccess: () => void }) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);
    if (password.length < 6) {
      setError(t("auth.register.pw_min"));
      return;
    }
    setLoading(true);
    try {
      const r = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: email.trim().toLowerCase(), password }),
      });
      const j = await r.json();
      if (!r.ok) {
        setError(j.error || "Ошибка регистрации");
        return;
      }
      const s = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });
      if (!s?.ok) {
        setError("Аккаунт создан, но авто-вход не сработал. Войди вручную.");
        return;
      }
      toast.success(t("auth.register.success"));
      onSuccess();
      window.location.href = "/account";
    } catch (e: any) {
      setError(e?.message || "Ошибка соединения");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-3">
      <div className="mb-1">
        <h2 className="font-display font-bold text-xl">{t("auth.register.title")}</h2>
        <p className="text-muted text-sm">{t("auth.register.desc")}</p>
      </div>

      {error && <ErrorBox message={error} />}

      <Field
        icon={<UserIcon className="h-4 w-4" />}
        placeholder={t("auth.register.name")} value={name} onChange={setName}
        autoComplete="name"
      />
      <Field
        icon={<Mail className="h-4 w-4" />}
        type="email" placeholder="Email" value={email} onChange={setEmail}
        required autoComplete="email"
      />
      <Field
        icon={<Lock className="h-4 w-4" />}
        type="password" placeholder={`${t("nav.logout")} (минимум 6)`} value={password} onChange={setPassword}
        required minLength={6} autoComplete="new-password"
      />
      <div className="flex items-center gap-2 text-[11px] text-muted">
        <ShieldCheck className="h-3.5 w-3.5 text-neon-2" />
        {t("auth.register.shield")}
      </div>
      <button disabled={loading} className="btn mt-1">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />} {t("auth.register.submit")}
      </button>
      <p className="text-sm text-muted text-center mt-2">
        {t("auth.register.has_account")}{" "}
        <button type="button" onClick={onSwitch} className="text-neon-2 hover:text-neon transition">
          {t("nav.login")}
        </button>
      </p>
    </form>
  );
}
