import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new (PrismaClient as any)({ adapter }) as InstanceType<typeof PrismaClient>;

const MOCK_EMAILS = [
  "sarah.test@gmail.com",
  "sarah.mitchell@gmail.com",
  "james.oconnor@outlook.com",
  "emma.bergstrom@gmail.com",
  "lucas.martin@yahoo.fr",
  "priya.sharma@gmail.com",
  "tom.wilson@gmail.com",
  "maria.gonzalez@hotmail.com",
  "david.chen@gmail.com",
  "anna.kowalski@wp.pl",
  "michael.braun@gmail.com",
  "sofia.rossi@libero.it",
  "ryan.thompson@gmail.com",
  "yuki.tanaka@gmail.com",
  "hannah.devries@gmail.com",
  "oliver.smith@icloud.com",
  "chloe.dubois@gmail.com",
  "ahmed.hassan@gmail.com",
  "natasha.petrov@yandex.ru",
  "kevin.lee@gmail.com",
  "lisa.anderson@gmail.com",
];

async function main() {
  if (!process.argv.includes("--confirm")) {
    console.error("This will permanently delete mock users and their data.");
    console.error("Run with --confirm to proceed.");
    process.exit(1);
  }

  console.log("Purging mock data...");

  let deleted = 0;
  for (const email of MOCK_EMAILS) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.user.delete({ where: { id: user.id } });
      deleted++;
      console.log(`  Deleted: ${email}`);
    }
  }

  console.log(`\nPurged ${deleted} mock users (cascade deleted their bookings, quotes, and payments).`);
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
