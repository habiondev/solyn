import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase клиенты.
 *
 * - supabaseAdmin  — сервисный клиент с SERVICE_ROLE (обходит RLS, для бэкенда).
 * - supabasePublic  — анонимный клиент (только для публичных операций, лимиты RLS).
 *
 * Конфигурация:
 *   NEXT_PUBLIC_SUPABASE_URL   — публичный URL проекта (виден на клиенте).
 *   NEXT_PUBLIC_SUPABASE_ANON  — anon-ключ (виден на клиенте, лимиты RLS).
 *   SUPABASE_SERVICE_ROLE_KEY  — service role ключ (ТОЛЬКО сервер, обходит RLS).
 *   SUPABASE_STORAGE_BUCKET    — имя бакета (по умолчанию "uploads").
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const SUPABASE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "uploads";

let _admin: SupabaseClient | null = null;
let _public: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient | null {
  if (_admin) return _admin;
  if (!url || !service) return null;
  _admin = createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _admin;
}

export function supabasePublic(): SupabaseClient | null {
  if (_public) return _public;
  if (!url || !anon) return null;
  _public = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _public;
}
