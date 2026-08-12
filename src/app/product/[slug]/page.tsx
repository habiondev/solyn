import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "./ProductDetailClient";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const p = await prisma.product.findUnique({ where: { slug: params.slug }, include: { images: true } });
  if (!p) return notFound();
  return <ProductDetailClient product={{
    id: p.id, title: p.title, slug: p.slug, description: p.description,
    sizeLabel: p.sizeLabel, width: p.width, height: p.height, basePrice: p.basePrice,
    discountPrice: p.discountPrice,
    hasBacklight: p.hasBacklight, hasFrame: p.hasFrame, category: p.category, rating: p.rating,
    images: p.images.map((i) => ({ url: i.url, alt: i.alt, primary: i.isPrimary })),
    tags: p.tags,
  }} />;
}
