import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
    ssl: process.env.DATABASE_URL!.includes("sslmode=require")
      ? { rejectUnauthorized: false }
      : undefined,
  });
  const adapter = new PrismaPg(pool);
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
