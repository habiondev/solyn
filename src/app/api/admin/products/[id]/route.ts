import { NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const Patch = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  category: z.enum(["LAMP", "POSTER", "PAINTING", "SET"]).optional(),
  description: z.string().min(1).optional(),
  sizeLabel: z.string().min(1).optional(),
  width: z.number().int().min(50).optional(),
  height: z.number().int().min(50).optional(),
  basePrice: z.number().int().min(1).optional(),
  discountPrice: z.number().int().nullable().optional(),
  hasFrame: z.boolean().optional(),
  hasBacklight: z.boolean().optional(),
  rating: z.number().min(0).max(5).optional(),
  active: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") return null;
  return session;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const data = Patch.parse(await req.json());
    // Если меняется категория — автоматически пересчитать hasBacklight/hasFrame
    const next: Record<string, any> = { ...data };
    if (data.category) {
      next.hasBacklight = data.category === "LAMP";
      next.hasFrame = data.category !== "POSTER";
    }
    // Нормализуем скидку: null/0/>=basePrice → null (нет скидки)
    if ("discountPrice" in data) {
      if (data.discountPrice == null || data.discountPrice === 0) {
        next.discountPrice = null;
      } else if (typeof data.basePrice === "number" && data.discountPrice >= data.basePrice) {
        next.discountPrice = null;
      }
    }
    const p = await prisma.product.update({ where: { id: params.id }, data: next });
    revalidatePath("/admin/products");
    revalidatePath("/");
    return NextResponse.json(p);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Ошибка" }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    await prisma.product.delete({ where: { id: params.id } });
    revalidatePath("/admin/products");
    revalidatePath("/");
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Ошибка" }, { status: 400 });
  }
}
