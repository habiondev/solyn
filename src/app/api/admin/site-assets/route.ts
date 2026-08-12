import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

const upsertSchema = z.object({
  id: z.string().min(1).max(120),
  url: z.string().url(),
  alt: z.string().max(200).default(""),
  category: z.string().min(1).max(40).default("general"),
  meta: z.record(z.any()).optional().nullable(),
});

const deleteSchema = z.object({ id: z.string().min(1) });

/**
 * GET /api/admin/site-assets — список ассетов (фильтр по ?category=).
 */
export async function GET(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const category = url.searchParams.get("category");

  const items = await prisma.siteAsset.findMany({
    where: category ? { category } : undefined,
    orderBy: [{ category: "asc" }, { id: "asc" }],
  });
  return NextResponse.json({ items });
}

/**
 * POST /api/admin/site-assets — создать/обновить ассет (upsert по id).
 * Использует Supabase Storage URL после загрузки файла через /api/upload.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Неверные данные", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { id, url, alt, category, meta } = parsed.data;
  const item = await prisma.siteAsset.upsert({
    where: { id },
    update: { url, alt, category, meta: meta ?? undefined },
    create: { id, url, alt, category, meta: meta ?? undefined },
  });
  return NextResponse.json({ ok: true, item });
}

/**
 * DELETE /api/admin/site-assets — удалить ассет по id (?id=...).
 */
export async function DELETE(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const parsed = deleteSchema.safeParse({ id });
  if (!parsed.success) {
    return NextResponse.json({ error: "id обязателен" }, { status: 400 });
  }
  await prisma.siteAsset.delete({ where: { id: parsed.data.id } });
  return NextResponse.json({ ok: true });
}
