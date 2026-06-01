import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new (PrismaClient as any)({ adapter }) as InstanceType<typeof PrismaClient>;

async function main() {
  const hash = await bcrypt.hash("Test1234!", 10);
  let customer = await prisma.user.findUnique({ where: { email: "sarah.test@gmail.com" } });

  if (!customer) {
    customer = await prisma.user.create({
      data: {
        email: "sarah.test@gmail.com",
        name: "Sarah Thompson",
        passwordHash: hash,
        role: "CUSTOMER",
      },
    });
    console.log("Created test customer:", customer.id);
  } else {
    await prisma.user.update({ where: { id: customer.id }, data: { passwordHash: hash } });
    console.log("Updated password for test customer:", customer.id);
  }

  const existingBooking = await prisma.booking.findFirst({
    where: { userId: customer.id },
    include: { quotes: true },
  });
  if (existingBooking?.quotes?.length) {
    console.log("");
    console.log("=== TEST ACCOUNT ===");
    console.log("Email: sarah.test@gmail.com");
    console.log("Password: Test1234!");
    console.log(`Quote URL: http://localhost:3000/dashboard/quotes/${existingBooking.id}`);
    return;
  }

  const dest = await prisma.destination.findFirst();

  const booking = await prisma.booking.create({
    data: {
      user: { connect: { id: customer.id } },
      status: "QUOTE_SENT",
      arrivalDate: new Date("2026-08-15"),
      departureDate: new Date("2026-08-22"),
      numTravelers: 2,
      items: {
        create: [
          {
            type: "ACCOMMODATION",
            description: "7 nights at boutique villa in Ella",
            ...(dest ? { destination: { connect: { id: dest.id } } } : {}),
            nights: 7,
            tier: "boutique",
            estimateMin: 1200,
            estimateMax: 1400,
            actualPrice: 1295,
            sortOrder: 1,
          },
          {
            type: "TRANSPORT",
            description: "Airport transfer + private driver for 7 days",
            estimateMin: 400,
            estimateMax: 450,
            actualPrice: 420,
            sortOrder: 2,
          },
          {
            type: "ACTIVITY",
            description: "Yala National Park safari (full day)",
            ...(dest ? { destination: { connect: { id: dest.id } } } : {}),
            estimateMin: 170,
            estimateMax: 210,
            actualPrice: 190,
            sortOrder: 3,
          },
          {
            type: "ACTIVITY",
            description: "Sigiriya Rock Fortress guided tour",
            estimateMin: 80,
            estimateMax: 100,
            actualPrice: 90,
            sortOrder: 4,
          },
          {
            type: "ADDON",
            description: "Traditional Sri Lankan cooking class",
            estimateMin: 60,
            estimateMax: 80,
            actualPrice: 70,
            sortOrder: 5,
          },
        ],
      },
    },
  });
  console.log("Created booking:", booking.id);

  const quote = await prisma.quote.create({
    data: {
      bookingId: booking.id,
      version: 1,
      totalPrice: 2065,
      deposit: 620,
      validUntil: new Date("2026-07-15"),
      sentAt: new Date(),
      response: "ACCEPTED",
      respondedAt: new Date(),
      adminNotes:
        "We have selected the finest boutique villa in Ella with stunning mountain views. Your private driver speaks fluent English and knows all the hidden gems along the way. The safari timing has been optimized for leopard sightings.",
    },
  });
  console.log("Created quote:", quote.id);
  console.log("");
  console.log("=== TEST ACCOUNT ===");
  console.log("Email: sarah.test@gmail.com");
  console.log("Password: Test1234!");
  console.log(`Quote URL: http://localhost:3000/dashboard/quotes/${booking.id}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
