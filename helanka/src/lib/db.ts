/**
 * Prisma Client singleton for Next.js
 *
 * Prisma 7 uses driver adapters for database connections. When DATABASE_URL
 * is configured, install @prisma/adapter-pg and update this file:
 *
 *   import { PrismaPg } from "@prisma/adapter-pg"
 *   const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
 *   export const db = new PrismaClient({ adapter, log: [...] })
 *
 * Until then the client is instantiated without an adapter so types resolve
 * and the module can be imported safely at build time.
 */
import { PrismaClient } from ".prisma/client/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const opts: any =
    process.env.NODE_ENV === "development" ? { log: ["query"] } : {};
  return new PrismaClient(opts);
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
