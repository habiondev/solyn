import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Hero } from "@/components/Hero";
import { type ProductCardData } from "@/components/ProductCard";
import { CatalogClient } from "@/components/CatalogClient";
import { PricingTable } from "@/components/PricingTable";
import { PosterPricing } from "@/components/PosterPricing";
import { Steps } from "@/components/Steps";
import { ReviewCard, type Review } from "@/components/ReviewCard";
import { ThreadsIcon } from "@/components/icons/ThreadsIcon";
import { Faq } from "@/components/Faq";
import { CollabCTA } from "@/components/CollabCTA";
import { HomeReveal } from "@/components/HomeReveal";
import { Sparkles, ImagePlus, Truck, Shield } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Все товары разом — фильтрация целиком на клиенте (SPA),
  // чтобы переключение фильтров не дёргало сервер и не сбрасывало скролл.
  const [productsRaw, reviewsRaw, siteAssets] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      include: { images: true },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    }),
    prisma.review.findMany({ where: { active: true }, orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.siteAsset.findMany({ where: { category: "size-preview" } }),
  ]);

  // Карта превью размеров: { a4: "url", "LAMP:a4": "url", ... }
  const sizePreviews: Record<string, string> = {
    a4:    "https://picsum.photos/seed/solyn-a4/420/594",
    a3:    "https://picsum.photos/seed/solyn-a3/420/594",
    mini:  "https://picsum.photos/seed/solyn-mini/420/594",
    large: "https://picsum.photos/seed/solyn-large/420/594",
  };
  for (const a of siteAssets) {
    // a.id может быть "size-preview:a4" или "size-preview:LAMP:a4"
    const key = a.id.replace("size-preview:", "");
    if (key) sizePreviews[key] = a.url;
  }

  const products = productsRaw.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        sizeLabel: p.sizeLabel,
        width: p.width,
        height: p.height,
        basePrice: p.basePrice,
        discountPrice: p.discountPrice,
        hasBacklight: p.hasBacklight,
        hasFrame: p.hasFrame,
        category: p.category,
        imageUrl: p.images.find((i) => i.isPrimary)?.url ?? p.images[0]?.url,
        rating: p.rating,
        tags: p.tags,
      }));

  const reviews: Review[] = reviewsRaw.map((r) => ({
    id: r.id, author: r.author, rating: r.rating, text: r.text, avatar: r.avatar,
  }));

  return (
    <>
      <Hero />
      <HomeReveal />

      <section id="products" data-catalog className="py-16 md:py-20">
        <div className="container-x reveal">
          <div className="text-center mb-7">
         
         
           
          </div>
          <CatalogClient
            products={products}
            sizePreviews={sizePreviews}
            compact
            eyebrow=""
            title=""
            subtitle=""
          />
        </div>
      </section>

     

      

      <section id="how" className="py-16 md:py-20">
        <div className="container-x reveal">
          <div className="text-center mb-9">
            <div className="eyebrow">Процесс Как заказать</div>
           
          </div>
          <Steps />
        </div>
      </section>

      

                    <section id="reviews" className="">
        <div className="container-x reveal">
       

          <div className="mt-12">
            <div className="text-center mb-6">
              <div className="eyebrow">Мы в соцсетях</div>
              <h3 className="h-section">@solyn.az</h3>
              <p className="text-muted text-sm mt-2">Следите за нашими работами и backstage в Instagram и Threads.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div className="relative rounded-2xl border border-line overflow-hidden bg-card transition hover:border-neon/40">
                <div className="flex items-center justify-between p-3 border-b border-line">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#feda75] via-[#d62976] to-[#4f5bd5] grid place-items-center text-white text-[12px] font-bold">
                      I
                    </div>
                    <div>
                      <div className="text-sm font-display font-semibold">Instagram</div>
                      <div className="text-[10px] text-muted">@solyn.az</div>
                    </div>
                  </div>
                  <a
                    href="https://instagram.com/solyn.az"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-neon-2 hover:text-neon"
                  >
                    Открыть ↗
                  </a>
                </div>
                <iframe
                  src="https://www.instagram.com/solyn.az/embed"
                  title="Instagram @solyn.az"
                  loading="lazy"
                  className="w-full h-[720px] bg-navy-950"
                  allow="encrypted-media"
                />
                <noscript>
                  <a href="https://instagram.com/solyn.az" target="_blank" rel="noreferrer" className="block p-6 text-center text-neon-2">
                    Открыть профиль @solyn.az в Instagram
                  </a>
                </noscript>
              </div>

             
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="py-16 md:py-20">
        <div className="container-x reveal">
          <div className="text-center mb-9">
            <div className="eyebrow">FAQ</div>
            <h2 className="h-section">Частые вопросы</h2>
          </div>
          <Faq />
        </div>
      </section>

      <section className="py-10">
        <div className="container-x reveal">
          <CollabCTA />
        </div>
      </section>
    </>
  );
}
