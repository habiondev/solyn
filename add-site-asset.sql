-- ============================================================
-- Добавить таблицу SiteAsset (управление контент-ассетами)
-- Запустить ОДИН РАЗ в Supabase Dashboard → SQL Editor
-- ============================================================

CREATE TABLE "SiteAsset" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'general',
    "meta" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SiteAsset_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SiteAsset_category_idx" ON "SiteAsset"("category");

-- Зарегистрировать миграцию в Prisma
INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, applied_steps_count)
VALUES (gen_random_uuid()::text, 'manual', now(), '20260812_add_site_asset', 1);

-- Стартовые превью размеров (картинки-заглушки через picsum)
INSERT INTO "SiteAsset" (id, url, alt, category, meta, "updatedAt") VALUES
  ('size-preview:a4',    'https://picsum.photos/seed/solyn-a4/420/594',    'A4',    'size-preview', '{"label":"A4","tag":"21×30 см"}'::jsonb, NOW()),
  ('size-preview:a3',    'https://picsum.photos/seed/solyn-a3/420/594',    'A3',    'size-preview', '{"label":"A3","tag":"30×42 см"}'::jsonb, NOW()),
  ('size-preview:mini',  'https://picsum.photos/seed/solyn-mini/420/594',  'мини',  'size-preview', '{"label":"мини","tag":"12×18 см"}'::jsonb, NOW()),
  ('size-preview:large', 'https://picsum.photos/seed/solyn-large/420/594', 'large', 'size-preview', '{"label":"большой","tag":"50×70 см"}'::jsonb, NOW())
ON CONFLICT (id) DO NOTHING;

SELECT '✅ SiteAsset table created with seed data' AS status;
