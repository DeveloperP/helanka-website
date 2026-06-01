import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as XLSX from "xlsx";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new (PrismaClient as any)({ adapter }) as InstanceType<typeof PrismaClient>;

const sheetToDestSlug: Record<string, string> = {
  Colombo: "colombo",
  Negombo: "negombo",
  Kandy: "kandy",
  Sigiriya_Dambulla: "sigiriya",
  Ella: "ella",
  Nuwara_Eliya: "nuwara-eliya",
  Yala: "yala",
  Bentota: "bentota",
  Galle: "galle",
  Pekoe_Trail_Stages: "kandy",
};

const sheetToType: Record<string, string> = {
  Colombo: "cultural",
  Negombo: "nature",
  Kandy: "cultural",
  Sigiriya_Dambulla: "cultural",
  Ella: "adventure",
  Nuwara_Eliya: "nature",
  Yala: "safari",
  Bentota: "water-sport",
  Galle: "cultural",
  Pekoe_Trail_Stages: "adventure",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

async function main() {
  console.log("Seeding excursions from Excel...");

  const wb = XLSX.readFile("public/Sri Lankan Excursions Master List.xlsx");

  const destinations = await prisma.destination.findMany();
  const destIdMap = Object.fromEntries(
    destinations.map((d: { slug: string; id: string }) => [d.slug, d.id])
  );

  let created = 0;
  let skipped = 0;

  for (const sheetName of wb.SheetNames) {
    const destSlug = sheetToDestSlug[sheetName];
    if (!destSlug) { console.log(`  Skipping sheet: ${sheetName}`); continue; }

    const destId = destIdMap[destSlug];
    if (!destId) { console.log(`  No destination for slug: ${destSlug}`); continue; }

    const ws = wb.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as unknown[][];

    const excursions = data
      .filter((r) => r[0] && typeof r[0] === "number" && r[1])
      .map((r) => String(r[1]).trim());

    const type = sheetToType[sheetName] || "cultural";

    for (const name of excursions) {
      const slug = slugify(name);
      const existing = await prisma.excursion.findUnique({ where: { slug } });
      if (existing) { skipped++; continue; }

      await prisma.excursion.create({
        data: {
          name,
          slug,
          destinationId: destId,
          type,
          distanceKm: 15,
          description: name,
          isActive: true,
        },
      });
      created++;
    }

    console.log(`  ${sheetName}: ${excursions.length} excursions (${excursions.length - created + skipped > 0 ? "some skipped" : "all new"})`);
  }

  const total = await prisma.excursion.count();
  console.log(`\nDone. Created ${created}, skipped ${skipped} duplicates. Total excursions in DB: ${total}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
