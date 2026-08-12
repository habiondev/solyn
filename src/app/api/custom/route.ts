import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const Body = z.object({
  title: z.string().min(1).max(120),
  imageUrl: z.string().min(10),
  width: z.number().int().min(50).max(2000),
  height: z.number().int().min(50).max(2000),
  hasFrame: z.boolean(),
  hasBacklight: z.boolean(),
  finish: z.enum(["matte", "glossy", "canvas"]),
  notes: z.string().max(500).optional(),
  totalPrice: z.number().int().min(100),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  try {
    const body = Body.parse(await req.json());
    const d = await prisma.customDesign.create({
      data: { ...body, userId: (session.user as any).id },
    });
    return NextResponse.json({ ok: true, id: d.id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Ошибка" }, { status: 400 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  const list = await prisma.customDesign.findMany({
    where: { userId: (session.user as any).id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(list);
}
