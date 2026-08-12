import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function makePrisma(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    // Чёткий лог вместо непонятного PrismaClientInitializationError
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
