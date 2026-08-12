import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { status } = await req.json();
  if (!["PENDING", "IN_PROGRESS", "SHIPPED", "DELIVERED", "CANCELLED"].includes(status))
    return NextResponse.json({ error: "Неверный статус" }, { status: 400 });
  const o = await prisma.order.update({ where: { id: params.id }, data: { status } });
  return NextResponse.json(o);
}
