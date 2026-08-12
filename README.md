# Solyn Studio

Полноценный e-commerce на **Next.js 14 + PostgreSQL (Docker) + Prisma + NextAuth**.

## Что внутри

- 🎨 Главная: hero с парящими буквами, каталог, конструктор, постеры, отзывы, FAQ
- 🛍 Каталог: фильтры по категориям, поиск, сортировка по цене/новизне/популярности
- ✨ Конструктор: загрузка своего фото, выбор размера (S/M/L/XL/свой), рамы, LED-подсветки, финиша — с мгновенным расчётом стоимости и превью
- 🛒 Корзина: сохранение в localStorage, drawer, оформление заказа
- 👤 Аккаунты: регистрация/вход (NextAuth), личный кабинет с заказами и сохранёнными проектами
- 🛠 Админ-панель: дашборд, управление товарами, заказами (статусы), пользователями, загрузка фото

## Запуск

```bash
# 1. Скопировать переменные окружения
cp .env.example .env

# 2. Установить зависимости
npm install

# 3. Поднять PostgreSQL в Docker
npm run db:up

# 4. Применить миграции и засеять данные
npm run prisma:migrate
npm run prisma:seed

# 5. Запустить dev-сервер
npm run dev
```

Открой [http://localhost:3000](http://localhost:3000).

### Админ по умолчанию
- Email: `admin@solyn.studio`
- Пароль: `admin12345`

## Стек

- Next.js 14 (App Router, RSC)
- TypeScript
- Tailwind CSS
- Prisma ORM + PostgreSQL 16
- NextAuth v5 (Credentials)
- Framer Motion, Lucide Icons, Sharp
- Zod для валидации

## Структура

```
src/
├── app/
│   ├── page.tsx               # Главная
│   ├── catalog/               # Каталог с фильтрами
│   ├── product/[slug]/        # Карточка товара
│   ├── custom/                # Конструктор
│   ├── cart, checkout         # Корзина и оформление
│   ├── login, register, account
│   ├── admin/                 # Админ-панель
│   └── api/                   # REST endpoints
├── components/                # UI компоненты
├── lib/                       # prisma, auth, utils
└── ...
prisma/
├── schema.prisma
└── seed.ts
```

## Переменные окружения

См. `.env.example`.

## Деплой

- Vercel / Railway / любой хостинг с Node.js
- PostgreSQL: managed (Neon, Supabase, Render) или свой Docker
- Загрузка фото: локально в `public/uploads/`, для прода замените на S3/Cloudflare R2
