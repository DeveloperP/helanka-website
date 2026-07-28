import "dotenv/config";
import { PrismaClient, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new (PrismaClient as any)({ adapter }) as InstanceType<typeof PrismaClient>;

async function main() {
  if (process.env.NODE_ENV !== "production" && !process.argv.includes("--force")) {
    console.error("This script is for production only. Use --force to override.");
    process.exit(1);
  }

  console.log("Production seed starting...");

  const password = randomBytes(16).toString("base64url");
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email: "admin@helanka.co" },
    update: { passwordHash },
    create: {
      email: "admin@helanka.co",
      name: "Helanka Admin",
      passwordHash,
      role: UserRole.ADMIN,
      emailVerified: new Date(),
    },
  });

  console.log("");
  console.log("=== PRODUCTION ADMIN ===");
  console.log("Email:    admin@helanka.co");
  console.log(`Password: ${password}`);
  console.log("");
  console.log("SAVE THIS PASSWORD NOW. It will not be shown again.");
  console.log("Production seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
