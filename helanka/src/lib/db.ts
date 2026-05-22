import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg(process.env.DATABASE_URL!);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const opts: any = {
    adapter,
    ...(process.env.NODE_ENV === "development" ? { log: ["query"] } : {}),
  };
  return new PrismaClient(opts);
}

let db: PrismaClient;
try {
  db = globalForPrisma.prisma ?? createPrismaClient();
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
} catch {
  db = null as unknown as PrismaClient;
}

export { db };
