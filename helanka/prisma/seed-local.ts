import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter } as any);

async function main() {
  const hash = "$2b$12$Ed.JfqldEX2HzRXbSgxDnut6gvN.vUJgGPf7LuYNZKtEdDbItp0sC"; // admin123

  const admin = await db.user.upsert({
    where: { email: "sehan@helanka.co" },
    update: {},
    create: {
      email: "sehan@helanka.co",
      name: "Sehan Ranasinghe",
      role: "ADMIN",
      passwordHash: hash,
    },
  });

  const specialist1 = await db.user.upsert({
    where: { email: "manchana@helanka.co" },
    update: {},
    create: {
      email: "manchana@helanka.co",
      name: "Manchana Perera",
      role: "SPECIALIST",
      specialty: "custom",
      passwordHash: hash,
    },
  });

  const specialist2 = await db.user.upsert({
    where: { email: "onila@helanka.co" },
    update: {},
    create: {
      email: "onila@helanka.co",
      name: "Onila Fernando",
      role: "SPECIALIST",
      specialty: "package",
      passwordHash: hash,
    },
  });

  const finance = await db.user.upsert({
    where: { email: "fin3@mendisone.com" },
    update: {},
    create: {
      email: "fin3@mendisone.com",
      name: "Sammani",
      role: "FINANCE",
      passwordHash: hash,
    },
  });

  // Sample customers (shell accounts, no password)
  const cust1 = await db.user.upsert({
    where: { email: "jason.gelineau@example.com" },
    update: {},
    create: {
      email: "jason.gelineau@example.com",
      name: "Jason Gelineau",
      country: "United States",
      phone: "+1 555 0123",
      role: "CUSTOMER",
    },
  });

  const cust2 = await db.user.upsert({
    where: { email: "sarah.mitchell@example.com" },
    update: {},
    create: {
      email: "sarah.mitchell@example.com",
      name: "Sarah Mitchell",
      country: "United Kingdom",
      phone: "+44 7700 900123",
      role: "CUSTOMER",
    },
  });

  const cust3 = await db.user.upsert({
    where: { email: "hans.mueller@example.com" },
    update: {},
    create: {
      email: "hans.mueller@example.com",
      name: "Hans Mueller",
      country: "Germany",
      role: "CUSTOMER",
    },
  });

  // Trip sessions for customers
  await db.tripSession.createMany({
    data: [
      {
        customerId: cust1.id,
        specialistId: specialist1.id,
        tripType: "custom",
        state: { tripType: "custom", guests: 2, arrivalDate: "2026-09-10", departureDate: "2026-09-18", destinations: ["Kandy", "Koggala"], specialRequests: "" },
        status: "ACTIVE",
      },
      {
        customerId: cust2.id,
        specialistId: specialist2.id,
        tripType: "package",
        state: { tripType: "package", guests: 4, arrivalDate: "2026-10-01", departureDate: "2026-10-08", packageSlug: "cultural-triangle", specialRequests: "Vegetarian meals" },
        status: "QUOTE_REQUESTED",
      },
      {
        customerId: cust3.id,
        specialistId: specialist1.id,
        tripType: "custom",
        state: { tripType: "custom", guests: 1, arrivalDate: "2026-11-15", departureDate: "2026-11-22", destinations: ["Colombo", "Galle", "Ella"], specialRequests: "Solo traveler, photography focused" },
        status: "ACTIVE",
      },
    ],
    skipDuplicates: true,
  });

  // Payment links
  await db.paymentLink.createMany({
    data: [
      {
        invoiceNumber: "HLVOJ2608010-00",
        customerName: "Jason Gelineau",
        amount: 160.0,
        currency: "USD",
        description: "Transfer from Kandy to Koggala",
        cybersourceUrl: "https://ebc2.cybersource.com/ebc2/invoicing/payInvoice/example1",
        notifyEmails: ["fin3@mendisone.com", "financemgr@mendisone.com", "mgrtours@helanka.co"],
        createdBy: finance.id,
      },
      {
        invoiceNumber: "HLVOJ2608011-00",
        customerName: "Sarah Mitchell",
        amount: 2450.0,
        currency: "USD",
        description: "Cultural Triangle Package - 4 pax, 7 nights",
        cybersourceUrl: "https://ebc2.cybersource.com/ebc2/invoicing/payInvoice/example2",
        notifyEmails: ["fin3@mendisone.com", "financemgr@mendisone.com", "mgrtours@helanka.co"],
        createdBy: finance.id,
        paidAt: new Date("2026-08-20"),
      },
      {
        invoiceNumber: "HLVOJ2608012-00",
        customerName: "Hans Mueller",
        amount: 890.0,
        currency: "EUR",
        description: "Airport transfer + 3 nights Galle accommodation deposit",
        cybersourceUrl: "https://ebc2.cybersource.com/ebc2/invoicing/payInvoice/example3",
        notifyEmails: ["fin3@mendisone.com", "financemgr@mendisone.com"],
        createdBy: admin.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seeded:");
  console.log(`  Admin: sehan@helanka.co (password: admin123)`);
  console.log(`  Specialists: manchana@helanka.co, onila@helanka.co`);
  console.log(`  Finance: fin3@mendisone.com`);
  console.log(`  Customers: 3 shell accounts with trip sessions`);
  console.log(`  Payment links: 3 (1 paid, 2 unpaid)`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
