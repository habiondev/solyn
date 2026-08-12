import { PrismaClient, ProductCategory, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { readdirSync, statSync } from "fs";
import path from "path";

const prisma = new PrismaClient();

/**
 * Источник изображений для seed:
 * - Если задана SUPABASE_SEED_URL (например, https://...supabase.co/storage/v1/object/public/seed),
 *   используем её как базу и генерируем имена файлов из IMG_DIR.
 * - Иначе — берём локальные файлы из public/uploads/imgs и отдаём как /uploads/imgs/...
 */
const SUPABASE_SEED_URL = (process.env.SUPABASE_SEED_URL || "").replace(/\/+$/, "");
const IMG_DIR = path.join(process.cwd(), "public", "uploads", "imgs");

function readLocalImages(): string[] {
  try {
    if (!statSync(IMG_DIR).isDirectory()) return [];
    return readdirSync(IMG_DIR)
      .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
      .sort();
  } catch {
    return [];
  }
}

function buildImageUrls(): string[] {
  const files = readLocalImages();
  if (files.length === 0) return [];
  if (SUPABASE_SEED_URL) {
    return files.map((f) => `${SUPABASE_SEED_URL}/${f}`);
  }
  return files.map((f) => `/uploads/imgs/${f}`);
}

/** Детерминированно перемешивает массив (mulberry32 PRNG) — стабильно между запусками. */
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed >>> 0;
  const rand = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function main() {
  console.log("🌱 Seeding Solyn Studio…");

  // --- Admin user ---
  // В продакшене ADMIN_EMAIL и ADMIN_PASSWORD ОБЯЗАТЕЛЬНО должны быть
  // установлены в env. Без них — аварийный выход, чтобы не создать
  // демо-аккаунт с дефолтным паролем.
  const email = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || "";

  if (!email || !password) {
    throw new Error(
      "ADMIN_EMAIL и ADMIN_PASSWORD должны быть заданы перед seed (см. .env).",
    );
  }
  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD слишком короткий (минимум 8 символов).");
  }
  const hash = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email },
    update: { role: Role.ADMIN, passwordHash: hash },
    create: { email, name: "Solyn Admin", role: Role.ADMIN, passwordHash: hash },
  });
  console.log(`✓ admin: ${email}`);

  // --- Изображения ---
  const localImages = buildImageUrls();
  if (localImages.length === 0) {
    throw new Error(
      `Нет фото в ${IMG_DIR}. Положите изображения и повторите. ` +
        `Если хотите брать фото из Supabase Storage — задайте SUPABASE_SEED_URL.`,
    );
  }
  console.log(`✓ images: ${localImages.length}` + (SUPABASE_SEED_URL ? " (Supabase)" : " (local)"));

  // Берём 2-3 уникальных фото для каждого товара (стабильно через seededShuffle)
  const pickImages = (slug: string, n: number): string[] => {
    const seed = [...slug].reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const shuffled = seededShuffle(localImages, seed);
    const count = Math.max(1, Math.min(n, shuffled.length));
    return shuffled.slice(0, count);
  };

  // --- Products ---
  // Новые правила:
  // - Категория LAMP = картина-светильник (подсветка определяется автоматически)
  // - Категория POSTER = без рамы, без подсветки
  // - Категория SET = готовый комплект
  // - Размеры в sizeLabel короткие: "A4" | "A3" | "мини" (width/height всё равно в мм)
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customDesign.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();

  const products: Array<{
    title: string;
    slug: string;
    category: ProductCategory;
    description: string;
    sizeLabel: string;
    width: number;
    height: number;
    basePrice: number;
    tags: string[];
    imageCount?: number;
  }> = [
    {
      title: "Aurora", slug: "aurora", category: ProductCategory.LAMP,
      description: "Северное сияние в тёплых неоновых переливах. Готовая работа, светится мягко и атмосферно.",
      sizeLabel: "A3", width: 297, height: 420, basePrice: 14900, tags: ["хит", "неон"],
      imageCount: 3,
    },
    {
      title: "Ocean", slug: "ocean", category: ProductCategory.LAMP,
      description: "Глубокий океан с лунной дорожкой. Идеален для спальни и зон отдыха.",
      sizeLabel: "A3", width: 297, height: 420, basePrice: 14900, tags: ["природа"],
      imageCount: 2,
    },
    {
      title: "Sunset", slug: "sunset", category: ProductCategory.LAMP,
      description: "Тёплый закат в горах. Светится в стиле «золотой час».",
      sizeLabel: "A3", width: 297, height: 420, basePrice: 14900, tags: ["новинка", "тёплый свет"],
      imageCount: 3,
    },
    {
      title: "Forest", slug: "forest", category: ProductCategory.LAMP,
      description: "Туманный хвойный лес. Спокойный зелёный оттенок подсветки.",
      sizeLabel: "A4", width: 210, height: 297, basePrice: 9900, tags: ["природа", "лес"],
      imageCount: 2,
    },
    {
      title: "Galaxy", slug: "galaxy", category: ProductCategory.LAMP,
      description: "Космическая туманность. Ультра-яркая фиолетово-розовая подсветка.",
      sizeLabel: "A4", width: 210, height: 297, basePrice: 9900, tags: ["космос", "хит"],
      imageCount: 3,
    },
    {
      title: "Sakura", slug: "sakura", category: ProductCategory.LAMP,
      description: "Цветущая сакура у озера. Нежная палитра, мягкая тёплая подсветка.",
      sizeLabel: "A4", width: 210, height: 297, basePrice: 9900, tags: ["природа", "япония"],
      imageCount: 2,
    },
    {
      title: "City Night", slug: "city-night", category: ProductCategory.POSTER,
      description: "Неоновый ночной мегаполис. Постер на премиум-бумаге.",
      sizeLabel: "A3", width: 297, height: 420, basePrice: 3900, tags: ["постер", "город"],
      imageCount: 2,
    },
    {
      title: "Botanic", slug: "botanic", category: ProductCategory.POSTER,
      description: "Тропические листья. Постер в стиле ботанической иллюстрации.",
      sizeLabel: "A4", width: 210, height: 297, basePrice: 2900, tags: ["постер", "растения"],
      imageCount: 2,
    },
    {
      title: "Minimal Lines", slug: "minimal-lines", category: ProductCategory.POSTER,
      description: "Тонкие линии в стиле минимализм. Идеально для офиса и студии.",
      sizeLabel: "A3", width: 297, height: 420, basePrice: 3400, tags: ["постер", "минимализм"],
      imageCount: 2,
    },
    {
      title: "Set: Aurora + Sunset", slug: "set-aurora-sunset", category: ProductCategory.SET,
      description: "Готовый комплект из двух картин-светильников со скидкой 15%. Идеальная пара для гостиной.",
      sizeLabel: "A3", width: 297, height: 420, basePrice: 25900, tags: ["комплект", "хит"],
      imageCount: 3,
    },
  ];

  for (const p of products) {
    const { imageCount = 2, ...rest } = p;
    const urls = pickImages(p.slug, imageCount);
    // hasBacklight / hasFrame выставляются автоматически на основе category:
    // LAMP → подсветка + рама, POSTER → без рамы и без подсветки, SET → с рамой
    const hasBacklight = p.category === ProductCategory.LAMP || p.category === ProductCategory.SET;
    const hasFrame = p.category !== ProductCategory.POSTER;
    await prisma.product.create({
      data: {
        ...rest,
        hasBacklight,
        hasFrame,
        featured: false,
        images: {
          create: urls.map((url, i) => ({ url, isPrimary: i === 0, alt: rest.title })),
        },
      },
    });
  }
  console.log(`✓ products: ${products.length}`);

  // --- Reviews ---
  await prisma.review.deleteMany();
  await prisma.review.createMany({
    data: [
      { author: "Айдан М.", rating: 5, text: "Светильник получился волшебный. Светит ровно, рамка аккуратная, доставили за 2 дня в Баку." },
      { author: "Эльвин Г.", rating: 5, text: "Заказывал постер в офис — качество печати огонь, цвета как на экране." },
      { author: "Лала А.", rating: 4, text: "Сделали картину из нашего свадебного фото. Получилось очень душевно, спасибо!" },
      { author: "Тимур К.", rating: 5, text: "Уже второй раз заказываю. Команда подсказала размер под стену — село идеально." },
      { author: "Нигяр С.", rating: 5, text: "Дочка в восторге от Galaxy. Ночью как маленькая вселенная в комнате." },
    ],
  });
  console.log("✓ reviews: 5");

  console.log("✅ Seed done.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
