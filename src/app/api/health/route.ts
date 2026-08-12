import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/health — диагностический endpoint.
 * Проверяет:
 *   - наличие критичных env-переменных (без значений)
 *   - подключение к БД
 *
 * Используй для отладки продакшена.
 */
export async function GET() {
  const envCheck: Record<string, boolean> = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  let dbOk = false;
  let dbError: string | null = null;
  let productCount: number | null = null;
  let userCount: number | null = null;
  try {
    const [p, u] = await Promise.all([
      prisma.product.count(),
      prisma.user.count(),
    ]);
    productCount = p;
    userCount = u;
    dbOk = true;
  } catch (e: any) {
    dbError = e?.message || String(e);
  }

  return NextResponse.json({
    ok: dbOk && Object.values(envCheck).every(Boolean),
    env: envCheck,
    db: { ok: dbOk, error: dbError, productCount, userCount },
    node: process.version,
    vercel: !!process.env.VERCEL,
  });
}
