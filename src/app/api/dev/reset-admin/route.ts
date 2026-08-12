import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

/**
 * Сброс пароля админа по токену-секрету из .env.
 * Это аварийный endpoint — в продакшне должен быть выключен или защищён сильнее.
 * Используется если юзер ввёл неправильный пароль и не может войти.
 *
 * GET /api/dev/reset-admin?secret=...
 * → если совпадает с ADMIN_RESET_SECRET, ставит пароль из ADMIN_PASSWORD.
 */
export async function GET(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Disabled in production" }, { status: 403 });
  }

  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");
  // Требуем явно заданный секрет (dev и prod). Никаких дефолтов.
  const expected = process.env.ADMIN_RESET_SECRET || process.env.NEXTAUTH_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 403 });
  }

  const email = (process.env.ADMIN_EMAIL || "admin@solyn.studio").toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || "admin12345";
  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash: hash, role: "ADMIN" },
    create: { email, name: "Solyn Admin", role: "ADMIN", passwordHash: hash },
  });

  return NextResponse.json({
    ok: true,
    user: { id: user.id, email: user.email, role: user.role },
    passwordSet: password,
  });
}
