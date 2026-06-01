import "dotenv/config";
import { PrismaClient, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new (PrismaClient as any)({ adapter }) as InstanceType<typeof PrismaClient>;

async function main() {
  console.log("Seeding users...");

  const passwordHash = await bcrypt.hash("Admin123!", 12);
  const customerHash = await bcrypt.hash("Customer123!", 12);

  // Admin user
  await prisma.user.upsert({
    where: { email: "admin@helanka.co" },
    update: {},
    create: {
      email: "admin@helanka.co",
      name: "Helanka Admin",
      passwordHash,
      role: UserRole.ADMIN,
      emailVerified: new Date(),
      phone: "+94 77 123 4567",
      country: "Sri Lanka",
    },
  });
  console.log("  Admin user upserted.");

  // 20 mock customer profiles
  const customers = [
    { email: "sarah.mitchell@gmail.com", name: "Sarah Mitchell", phone: "+44 7911 234567", country: "United Kingdom", lastLogin: new Date("2026-05-28"), createdAt: new Date("2026-01-15") },
    { email: "james.oconnor@outlook.com", name: "James O'Connor", phone: "+353 87 654 3210", country: "Ireland", lastLogin: new Date("2026-05-25"), createdAt: new Date("2026-02-03") },
    { email: "emma.bergstrom@gmail.com", name: "Emma Bergström", phone: "+46 70 123 4567", country: "Sweden", lastLogin: new Date("2026-05-30"), createdAt: new Date("2025-12-10") },
    { email: "lucas.martin@yahoo.fr", name: "Lucas Martin", phone: "+33 6 12 34 56 78", country: "France", lastLogin: new Date("2026-05-20"), createdAt: new Date("2026-03-01") },
    { email: "priya.sharma@gmail.com", name: "Priya Sharma", phone: "+91 98765 43210", country: "India", lastLogin: new Date("2026-05-31"), createdAt: new Date("2026-01-22") },
    { email: "tom.wilson@gmail.com", name: "Tom Wilson", phone: "+61 4 1234 5678", country: "Australia", lastLogin: new Date("2026-05-15"), createdAt: new Date("2026-02-18") },
    { email: "maria.gonzalez@hotmail.com", name: "Maria González", phone: "+34 612 345 678", country: "Spain", lastLogin: new Date("2026-05-27"), createdAt: new Date("2026-04-05") },
    { email: "david.chen@gmail.com", name: "David Chen", phone: "+65 9123 4567", country: "Singapore", lastLogin: new Date("2026-05-29"), createdAt: new Date("2025-11-20") },
    { email: "anna.kowalski@wp.pl", name: "Anna Kowalski", phone: "+48 501 234 567", country: "Poland", lastLogin: new Date("2026-04-10"), createdAt: new Date("2026-03-15") },
    { email: "michael.braun@gmail.com", name: "Michael Braun", phone: "+49 170 1234567", country: "Germany", lastLogin: new Date("2026-05-22"), createdAt: new Date("2026-01-08") },
    { email: "sofia.rossi@libero.it", name: "Sofia Rossi", phone: "+39 333 123 4567", country: "Italy", lastLogin: new Date("2026-05-18"), createdAt: new Date("2026-02-25") },
    { email: "ryan.thompson@gmail.com", name: "Ryan Thompson", phone: "+1 415 555 0123", country: "United States", lastLogin: new Date("2026-05-26"), createdAt: new Date("2025-12-30") },
    { email: "yuki.tanaka@gmail.com", name: "Yuki Tanaka", phone: "+81 90 1234 5678", country: "Japan", lastLogin: new Date("2026-05-10"), createdAt: new Date("2026-04-12") },
    { email: "hannah.devries@gmail.com", name: "Hannah de Vries", phone: "+31 6 12345678", country: "Netherlands", lastLogin: new Date("2026-05-24"), createdAt: new Date("2026-01-30") },
    { email: "oliver.smith@icloud.com", name: "Oliver Smith", phone: "+64 21 123 4567", country: "New Zealand", lastLogin: new Date("2026-05-12"), createdAt: new Date("2026-03-20") },
    { email: "chloe.dubois@gmail.com", name: "Chloé Dubois", phone: "+41 79 123 45 67", country: "Switzerland", lastLogin: new Date("2026-05-19"), createdAt: new Date("2026-02-14") },
    { email: "ahmed.hassan@gmail.com", name: "Ahmed Hassan", phone: "+971 50 123 4567", country: "United Arab Emirates", lastLogin: new Date("2026-05-21"), createdAt: new Date("2026-04-01") },
    { email: "natasha.petrov@yandex.ru", name: "Natasha Petrov", phone: "+7 916 123 4567", country: "Russia", lastLogin: null, createdAt: new Date("2026-05-01") },
    { email: "kevin.lee@gmail.com", name: "Kevin Lee", phone: "+82 10 1234 5678", country: "South Korea", lastLogin: new Date("2026-05-23"), createdAt: new Date("2026-03-10") },
    { email: "lisa.anderson@gmail.com", name: "Lisa Anderson", phone: "+1 604 555 0198", country: "Canada", lastLogin: new Date("2026-05-30"), createdAt: new Date("2025-11-15") },
  ];

  for (const c of customers) {
    await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: {
        email: c.email,
        name: c.name,
        passwordHash: customerHash,
        role: UserRole.CUSTOMER,
        emailVerified: new Date(),
        phone: c.phone,
        country: c.country,
        lastLogin: c.lastLogin,
        createdAt: c.createdAt,
      },
    });
  }
  console.log(`  ${customers.length} customer profiles seeded.`);

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
