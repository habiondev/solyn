# Деплой SOLYN Studio на Vercel + Supabase

Пошаговая инструкция: от пустого репозитория до работающего продакшена.
**Все сервисы — с бесплатным тарифом.** Кредитная карта не нужна.

---

## 1. Что используем

| Компонент | Сервис | Бесплатно |
|-----------|--------|-----------|
| Frontend + SSR | **Vercel** | 100 GB bandwidth/мес, безлимитные деплои |
| База данных | **Supabase** (PostgreSQL 15) | 500 MB, unlimited API запросы |
| Хранилище изображений | **Supabase Storage** | 1 GB, 2 GB трафика/мес |
| Домен | `*.vercel.app` (сразу) или свой | - |

Никакого S3, никакого Cloudflare, никаких VPC.

---

## 2. Подготовка Supabase

Ты уже зарегался, у тебя есть проект `habiondev's Project`
с регионом **ap-southeast-2** (Sydney). Отлично — это ближайший к Азербайджану.

### 2.1. Получи ключи

В Supabase Dashboard:
- **Settings → API**:
  - `Project URL` — это `NEXT_PUBLIC_SUPABASE_URL`
  - `anon public` key — это `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `service_role secret` key — это `SUPABASE_SERVICE_ROLE_KEY` (⚠️ никогда не публикуй)
- **Settings → Database**:
  - **Connection string → Transaction pooler** (порт **6543**) — это `DATABASE_URL` для Vercel
  - **Connection string → Direct connection** (порт **5432**) — это `DATABASE_URL_DIRECT` для миграций

⚠️ **Важно:** на Vercel используй **Transaction pooler (6543)**. Direct connection (5432) не работает с serverless.

### 2.2. Создай Storage бакет

В Supabase Dashboard:
- **Storage → Create bucket**:
  - Name: `uploads`
  - Public bucket: ✅ ON
  - File size limit: 20 MB
  - Allowed MIME types: оставь пустым (любые)

Скопируй все ключи в `.env` (см. шаг 3).

---

## 3. Настрой локальный `.env`

В корне проекта замени `.env` (он уже у нас обновлён):

```env
# Прямое подключение — для миграций (использует DATABASE_URL_DIRECT, порт 5432)
DATABASE_URL_DIRECT="postgresql://postgres:G4T8o8wNJVnhBkyd@db.ap-southeast-2.supabase.co:5432/postgres?sslmode=require"

# Через pgbouncer — для приложения (порт 6543)
DATABASE_URL="postgresql://postgres.ap-southeast-2:G4T8o8wNJVnhBkyd@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"

# Supabase Storage
NEXT_PUBLIC_SUPABASE_URL="https://ap-southeast-2.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<вставь сюда anon key>"
SUPABASE_SERVICE_ROLE_KEY="<вставь сюда service_role key>"
SUPABASE_STORAGE_BUCKET="uploads"

# NextAuth — СГЕНЕРИРУЙ случайную строку 32+ символов
NEXTAUTH_SECRET="запусти: node -e \"console.log(require('crypto').randomBytes(48).toString('base64'))\""
NEXTAUTH_URL="http://localhost:3000"   # для локали

# Админ для seed
ADMIN_EMAIL="admin@solyn.studio"
ADMIN_PASSWORD="<придумай сложный пароль 12+ символов>"
```

### Сгенерируй `NEXTAUTH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

---

## 4. Применить миграции и засеять данные

Подключение через `DATABASE_URL_DIRECT` (порт 5432) — миграции не работают через pgbouncer.

```bash
# Временно подставь прямой URL для миграции
$env:DATABASE_URL=$env:DATABASE_URL_DIRECT
npm run prisma:migrate deploy
$env:DATABASE_URL=$env:DATABASE_URL  # верни обратно

# Сид (создаст админа и товары)
npm run prisma:seed
```

Если миграции уже применялись раньше локально (в Docker), на Supabase таблицы пустые —
запусти `prisma:migrate deploy` чтобы перенести схему.

Чтобы залить **исходные картинки товаров** в Supabase Storage (опционально, для прода):

1. В Supabase Dashboard → Storage → bucket `uploads` → Create folder `imgs`
2. Загрузи все файлы из `public/uploads/imgs/` (через UI или `supabase` CLI)
3. Скопируй публичный URL папки — выглядит как:
   `https://ap-southeast-2.supabase.co/storage/v1/object/public/uploads/imgs`
4. Установи env `SUPABASE_SEED_URL=...` и перезапусти seed.

Если не хочешь заливать сейчас — картинки из демо будут доступны по `/uploads/imgs/...`
локально, а на проде просто отдадут 404. Продолжай.

---

## 5. Залей код в GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<твой-юзер>/solyn-studio.git
git push -u origin main
```

⚠️ **Проверь, что `.env` в `.gitignore`** — иначе утёкнет `NEXTAUTH_SECRET`.

---

## 6. Деплой на Vercel

1. Открой https://vercel.com → **Sign up with GitHub**
2. **Add New → Project** → выбери свой репозиторий `solyn-studio`
3. **Configure Project**:
   - Framework Preset: **Next.js** (auto)
   - Build Command: оставь `npm run build` (или `prisma generate && next build`)
   - Install Command: `npm install`
   - **Output Directory**: оставь `.next`
4. **Environment Variables** — добавь ВСЕ из `.env` кроме `NEXTAUTH_URL`:
   - `DATABASE_URL` ← строка с **портом 6543** (pgbouncer)
   - `NEXTAUTH_SECRET` ← тот же что в `.env`
   - `NEXTAUTH_URL` ← **поставь ПОСЛЕ первого деплоя** (см. ниже)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_STORAGE_BUCKET=uploads`
   - `NEXT_PUBLIC_SITE_NAME="Solyn Studio"`
   - `NEXT_PUBLIC_WHATSAPP="+994555508932"`
   - `NEXT_PUBLIC_INSTAGRAM="https://instagram.com/solyn.az"`
   - `ADMIN_EMAIL` и `ADMIN_PASSWORD` — нужны только для seed (см. шаг 7)
5. **Deploy** — Vercel соберёт проект. Должно выдать URL вида `solyn-studio-xxx.vercel.app`.

### 6.1. Обнови NEXTAUTH_URL

После первого деплоя:
- Vercel → Project → Settings → Environment Variables
- Измени `NEXTAUTH_URL` на `https://<твой-url>.vercel.app`
- Redeploy.

---

## 7. Засеять базу данных на проде

Vercel **не запускает seed** автоматически. У тебя два варианта:

### Вариант A: seed локально (рекомендую)

```bash
# В .env временно переключи DATABASE_URL на ПРОДОВЫЙ pgbouncer-URL
DATABASE_URL="postgresql://postgres.ap-southeast-2:G4T8o8wNJVnhBkyd@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"

npm run prisma:seed
```

Готово. Админ создан, товары и отзывы — в БД.

### Вариант B: создать админа вручную

В Supabase Dashboard → **Table Editor → User** → Insert row.

---

## 8. Подключи свой домен (опционально)

1. Vercel → Project → Settings → Domains → Add
2. Введи `solyn.studio` (или что у тебя)
3. Vercel покажет DNS записи — добавь их у регистратора
4. После применения Vercel автоматически выпустит SSL
5. Не забудь обновить `NEXTAUTH_URL` и `NEXT_PUBLIC_SUPABASE_URL` (origin allowlist)

---

## 9. Чеклист после деплоя

Открой свой сайт и проверь:

- [ ] Главная загружается
- [ ] Товары из каталога видны
- [ ] Картинки товаров отображаются
- [ ] Кнопка «Войти» открывает попап
- [ ] Вход под `admin@solyn.studio` + пароль из `.env` работает
- [ ] `/admin` доступен
- [ ] Создание товара в админке → загрузка фото в Storage
- [ ] Заказ из чекаута → запись в БД + WhatsApp-ссылка

---

## 10. Частые проблемы

### ❌ Ошибка `Can't reach database server`
→ Проверь что используешь **pgbouncer URL (порт 6543)** в `DATABASE_URL` на Vercel.
→ Для миграций — **прямой URL (порт 5432)** через `DATABASE_URL_DIRECT`.

### ❌ `prisma migrate` падает с `prepared statement` ошибкой
→ Это известная проблема pgbouncer в transaction mode. Для миграций
используй **прямое подключение** (`DATABASE_URL_DIRECT`).

### ❌ Картинки не загружаются в админке
→ Проверь что бакет `uploads` создан и **public**.
→ `SUPABASE_SERVICE_ROLE_KEY` — это **secret** key, не anon.

### ❌ Vercel build падает на `sharp`
→ `sharp` уже в `dependencies`. Если ошибка — добавь в `package.json`:
```json
"engines": { "node": ">=20" }
```

### ❌ Админ не может войти
→ `ADMIN_PASSWORD` должен быть задан в `.env` ДО запуска `npm run prisma:seed`.
→ Либо создай пользователя через Supabase SQL Editor:
```sql
-- Вставь заранее сгенерированный bcrypt-хеш
INSERT INTO "User" (id, email, name, role, "passwordHash", "createdAt")
VALUES ('admin-id', 'admin@solyn.studio', 'Admin', 'ADMIN', '<bcrypt-hash>', NOW());
```

---

## 11. Мониторинг и обновления

- **Логи**: Vercel → Project → Logs
- **БД**: Supabase → Table Editor
- **Файлы**: Supabase → Storage → uploads
- **Бекапы**: Supabase → Database → Backups (автоматически раз в день на платных, вручную на Free)
- **Обновить код**: `git push` → Vercel задеплоит автоматически

---

## Готово!

Сайт работает на `https://<твой-проект>.vercel.app`.
Все сервисы бесплатные. Кредитная карта не нужна.
