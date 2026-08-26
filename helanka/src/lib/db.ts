import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const rawConnStr = process.env.DATABASE_URL || process.env.POSTGRES_URL_NON_POOLING;
  if (!rawConnStr) throw new Error("No database connection string");
  const needsSsl = rawConnStr.includes("sslmode=require");
  const connStr = rawConnStr.replace(/[?&]sslmode=require/g, (m) => m.startsWith("?") ? "?" : "").replace(/\?$/, "");
  const pool = new Pool({
    connectionString: connStr,
    max: process.env.NODE_ENV === "development" ? 3 : 20,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
    ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
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
