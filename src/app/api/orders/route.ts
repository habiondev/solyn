import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const Item = z.object({
  id: z.string(),
  type: z.enum(["product", "custom"]),
  title: z.string(),
  imageUrl: z.string().optional(),
  width: z.number().int(),
  height: z.number().int(),
  hasFrame: z.boolean(),
  hasBacklight: z.boolean(),
  price: z.number().int(),
  quantity: z.number().int().min(1).max(99),
});

const Body = z.object({
  customerName: z.string().min(2),
  phone: z.string().min(6),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  comment: z.string().max(500).optional(),
  items: z.array(Item).min(1),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const data = Body.parse(json);
    const total = data.items.reduce((s, i) => s + i.price * i.quantity, 0);
    const session = await auth();

    const order = await prisma.order.create({
      data: {
        customerName: data.customerName,
        phone: data.phone,
        email: data.email || null,
        address: data.address || "",
        comment: data.comment || null,
        total,
        userId: session?.user ? (session.user as any).id : null,
        items: {
          create: data.items.map((it) => ({
            productId: it.type === "product" ? it.id : null,
            title: it.title,
            imageUrl: it.imageUrl,
            width: it.width,
            height: it.height,
            hasFrame: it.hasFrame,
            hasBacklight: it.hasBacklight,
            quantity: it.quantity,
            price: it.price,
          })),
        },
      },
    });

    return NextResponse.json({ ok: true, id: order.id, total });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Ошибка" }, { status: 400 });
  }
}
