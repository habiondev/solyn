import { prisma } from "@/lib/prisma";
import { formatPrice, SIZE_CATS, type SizeCat } from "@/lib/utils";
import { ProductForm } from "./ProductForm";
import { ProductRow } from "./ProductRow";
import { AdminFilters } from "./AdminFilters";

export const dynamic = "force-dynamic";

type SP = { cat?: string; size?: string; q?: string };

export default async function AdminProducts({ searchParams }: { searchParams: SP }) {
  const cat = searchParams.cat || "";
  const size = (searchParams.size || "") as SizeCat | "";
  const q = (searchParams.q || "").trim();

  // Фильтрация по ширине/высоте через диапазоны SizeCat
  const sizeWhere: any = {};
  if (size) {
    const def = SIZE_CATS.find((s) => s.key === size);
    if (def) {
      const w = def.w;
      sizeWhere.OR = [
        { AND: [{ width: { gte: w - 10, lte: w + 10 } }] },
        { AND: [{ height: { gte: w - 10, lte: w + 10 } }] },
      ];
    }
  }

  const products = await prisma.product.findMany({
    where: {
      ...(cat ? { category: cat as any } : {}),
      ...(q ? { title: { contains: q, mode: "insensitive" as const } } : {}),
      ...sizeWhere,
    },
    include: { images: true },
    orderBy: { createdAt: "desc" },
  });

  const counts = await prisma.product.groupBy({ by: ["category"], _count: { _all: true } });
  const byCat: Record<string, number> = {};
  for (const c of counts) byCat[c.category] = c._count._all;
  const total = products.length;
  const all = await prisma.product.count();

  return (
    <div className="space-y-5">
      <ProductForm />

      <div className="bg-card border border-line rounded-2xl overflow-hidden">
        {/* Шапка с фильтрами */}
        <div className="p-4 sm:p-5 border-b border-line">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <a href="/admin/products" className={`chip ${!cat ? "chip-on" : ""}`}>
              Все <span className="text-muted ml-1">{all}</span>
            </a>
            <a href="/admin/products?cat=LAMP" className={`chip ${cat === "LAMP" ? "chip-on" : ""}`}>
              Светильники<span className="text-muted ml-1">{byCat.LAMP || 0}</span>
            </a>
            <a href="/admin/products?cat=POSTER" className={`chip ${cat === "POSTER" ? "chip-on" : ""}`}>
              Постеры <span className="text-muted ml-1">{byCat.POSTER || 0}</span>
            </a>
            <a href="/admin/products?cat=SET" className={`chip ${cat === "SET" ? "chip-on" : ""}`}>
              Сеты <span className="text-muted ml-1">{byCat.SET || 0}</span>
            </a>
          </div>

          <AdminFilters total={total} />
        </div>

        {/* Список товаров */}
        {products.length === 0 ? (
          <div className="text-center text-muted py-14">
            <div className="font-display text-lg mb-1">Нет товаров</div>
            <div className="text-sm">Измени фильтры или создай новый товар в форме выше.</div>
          </div>
        ) : (
          <div className="divide-y divide-line">
            {products.map((p) => (
              <ProductRow
                key={p.id}
                p={{
                  id: p.id,
                  title: p.title,
                  slug: p.slug,
                  category: p.category,
                  description: p.description,
                  sizeLabel: p.sizeLabel,
                  width: p.width,
                  height: p.height,
                  basePrice: p.basePrice,
                  discountPrice: p.discountPrice,
                  hasFrame: p.hasFrame,
                  hasBacklight: p.hasBacklight,
                  rating: p.rating,
                  active: p.active,
                  tags: p.tags,
                  imageUrl: p.images.find((i) => i.isPrimary)?.url ?? p.images[0]?.url ?? "",
                  imageCount: p.images.length,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
