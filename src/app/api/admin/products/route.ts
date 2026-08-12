import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * Поля для создания товара.
 * - Категория LAMP автоматически получает hasBacklight=true, остальные — false.
 * - hasFrame по умолчанию true (все картины в рамке), можно отключить вручную.
 * - hasBacklight/hasFrame на этом эндпоинте не принимаются — управляются сервером.
 * - stock в UI не показываем, в БД остаётся default(10).
 * - discountPrice опционально: если задано и < basePrice, то это скидка.
 */
const Body = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  category: z.enum(["LAMP", "POSTER", "SET"]),
  description: z.string().min(1),
  sizeLabel: z.string().min(1),
  width: z.number().int().min(50),
  height: z.number().int().min(50),
  basePrice: z.number().int().min(1), // в копейках
  discountPrice: z.number().int().nullable().optional(), // null = без скидки
  active: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
  imageUrl: z.string().min(1),
});

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") return null;
  return session;
}

export async function POST(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const data = Body.parse(await req.json());
    const { imageUrl, tags, category, discountPrice, ...rest } = data;

    // Нормализуем скидку: если >= basePrice или null — скидки нет
    const finalDiscount = discountPrice && discountPrice > 0 && discountPrice < rest.basePrice
      ? discountPrice
      : null;

    const p = await prisma.product.create({
      data: {
        ...rest,
        tags,
        category,
        discountPrice: finalDiscount,
        // Автоматические признаки по категории:
        hasBacklight: category === "LAMP",
        hasFrame: category !== "POSTER",
        featured: false,
        images: {
          create: [{ url: imageUrl, isPrimary: true, alt: rest.title }],
        },
      },
    });
    return NextResponse.json(p);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Ошибка" }, { status: 400 });
  }
}
