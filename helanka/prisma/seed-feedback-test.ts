import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new (PrismaClient as any)({ adapter }) as InstanceType<typeof PrismaClient>;

async function main() {
  const hash = await bcrypt.hash("Test1234!", 10);
  const email = "feedback.test@gmail.com";

  let customer = await prisma.user.findUnique({ where: { email } });

  if (!customer) {
    customer = await prisma.user.create({
      data: {
        email,
        name: "James Wilson",
        passwordHash: hash,
        role: "CUSTOMER",
        country: "United Kingdom",
      },
    });
    console.log("Created test customer:", customer.id);
  } else {
    await prisma.user.update({ where: { id: customer.id }, data: { passwordHash: hash } });
    console.log("Updated password for existing customer:", customer.id);
  }

  const existingBooking = await prisma.booking.findFirst({
    where: { userId: customer.id, status: "CONFIRMED" },
  });

  if (existingBooking) {
    console.log("\n=== TEST ACCOUNT (already exists) ===");
    console.log("Email:", email);
    console.log("Password: Test1234!");
    console.log("Dashboard: http://localhost:3001/dashboard");
    return;
  }

  const dest = await prisma.destination.findFirst();

  const booking = await prisma.booking.create({
    data: {
      user: { connect: { id: customer.id } },
      status: "CONFIRMED",
      arrivalDate: new Date("2026-07-20"),
      departureDate: new Date("2026-07-25"),
      numTravelers: 2,
      items: {
        create: [
          {
            type: "ACCOMMODATION",
            description: "3 nights at Cinnamon Wild Yala",
            ...(dest ? { destination: { connect: { id: dest.id } } } : {}),
            nights: 3,
            tier: "luxury",
            actualPrice: 850,
            sortOrder: 1,
          },
          {
            type: "ACCOMMODATION",
            description: "2 nights at 98 Acres Resort Ella",
            ...(dest ? { destination: { connect: { id: dest.id } } } : {}),
            nights: 2,
            tier: "boutique",
            actualPrice: 520,
            sortOrder: 2,
          },
          {
            type: "TRANSPORT",
            description: "Airport pickup + private driver 5 days",
            actualPrice: 380,
            sortOrder: 3,
          },
          {
            type: "ACTIVITY",
            description: "Yala National Park morning safari",
            ...(dest ? { destination: { connect: { id: dest.id } } } : {}),
            actualPrice: 190,
            sortOrder: 4,
          },
          {
            type: "ACTIVITY",
            description: "Nine Arches Bridge & Little Adam's Peak hike",
            ...(dest ? { destination: { connect: { id: dest.id } } } : {}),
            actualPrice: 75,
            sortOrder: 5,
          },
          {
            type: "ACTIVITY",
            description: "Tea factory tour & tasting",
            actualPrice: 45,
            sortOrder: 6,
          },
        ],
      },
    },
  });
  console.log("Created confirmed booking:", booking.id);

  console.log("\n=== TEST ACCOUNT ===");
  console.log("Email:", email);
  console.log("Password: Test1234!");
  console.log("Dashboard: http://localhost:3001/dashboard");
  console.log("5-day trip (Jul 20-25), 6 booking items");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
