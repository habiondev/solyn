import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Singleton Prisma client.
 *
 * На Vercel serverless каждая функция получает новый Node-процесс, но
 * мы храним клиент в globalThis чтобы избежать утечки коннектов
 * при HMR в dev (и для повторного использования в рамках одного
 * serverless execution context).
 *
 * ВАЖНО: переменная DATABASE_URL должна быть установлена в env.
 * В режиме serverless Prisma НЕ открывает коннект сразу — только при
 * первом запросе. После ответа коннект закрывается (serverless context завершается).
 */
function makePrisma(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    console.error(
      "[prisma] DATABASE_URL is not set. Available env keys:",
      Object.keys(process.env).filter((k) => /database|postgres|vercel/i.test(k)),
    );
  }
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? makePrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
