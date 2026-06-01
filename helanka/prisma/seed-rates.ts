import "dotenv/config";
import { PrismaClient, BookingItemType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as XLSX from "xlsx";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new (PrismaClient as any)({ adapter }) as InstanceType<typeof PrismaClient>;

function extractPrice(cell: unknown): number | null {
  if (!cell || String(cell).trim() === "N/A") return null;
  const m = String(cell).match(/USD\s*(\d[\d,]*)/i);
  return m ? parseInt(m[1].replace(",", "")) : null;
}

// Map spreadsheet destination names to DB slugs
const destSlugMap: Record<string, string> = {
  "Negombo / Katunayake": "negombo",
  "Colombo": "colombo",
  "Sigiriya / Dambulla / Kandalama / Habarana": "sigiriya",
  "Kandy / Digana": "kandy",
  "Nuwara Eliya": "nuwara-eliya",
  "Ella / Wellawaya": "ella",
  "Galle / Unawatuna / Koggala / Talpe": "galle",
  "Bentota / Beruwala": "bentota",
  "Yala / Kataragama / Tissamaharama": "yala",
  "Arugam Bay": "arugam-bay",
  "Anuradhapura": "anuradhapura",
  "Wilpattu": "wilpattu",
  "Kalpitiya": "kalpitiya",
  "Kitulgala": "kitulgala",
  "Weligama / Mirissa": "mirissa",
  "Hambantota / Tangalle": "tangalle",
  "Ambalangoda / Hikkaduwa": "hikkaduwa",
  "Trincomalee": "trincomalee",
  "Jaffna": "jaffna",
  "Passikudah": "passikudah",
  "Polonnaruwa": "polonnaruwa",
  "Hatton": "hatton",
  "Haputale / Beragala / Koslanda": "haputale",
  "Udawalawa": "udawalawe",
  "Deniyaya / Sinharaja": "sinharaja",
  "Chilaw": "chilaw",
  "Matale / Riverston / Knuckles": "matale",
  "Mahiyangana / Dabana": "mahiyangana",
  "Gal Oya": "gal-oya",
  "Belihuloya": "belihuloya",
};

const tiers = ["4-star", "5-star", "boutique", "luxury-boutique"];

async function main() {
  console.log("Seeding real hotel rates, transport rates, and daily buffer...");

  // Parse Excel
  const wb = XLSX.readFile("public/Hotels & Rates.xlsx");
  const ws = wb.Sheets["Sheet1"];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as unknown[][];

  // Collect hotel data: { destName, tier, hotelName, doubleRate }
  interface HotelEntry {
    destName: string;
    destSlug: string;
    tier: string;
    hotelName: string;
    doubleRate: number;
  }

  const hotels: HotelEntry[] = [];
  let currentDest = "";

  for (const row of data) {
    if (!row || row.length < 3) continue;

    if (row[0] && typeof row[0] === "number") {
      currentDest = String(row[1] || "").trim();
    }

    if (!currentDest) continue;

    const slug = destSlugMap[currentDest];

    for (let col = 2; col <= 5; col++) {
      const cell = row[col];
      if (!cell || String(cell).trim() === "N/A") continue;
      const price = extractPrice(cell);
      if (!price) continue;

      hotels.push({
        destName: currentDest,
        destSlug: slug || currentDest.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        tier: tiers[col - 2],
        hotelName: String(cell).replace(/\s*-?\s*USD\s*\d[\d,]*/i, "").trim(),
        doubleRate: price,
      });
    }
  }

  console.log(`  Parsed ${hotels.length} hotels with rates from Excel.`);

  // Get destination IDs from DB
  const destinations = await prisma.destination.findMany();
  const destIdMap = Object.fromEntries(
    destinations.map((d: { slug: string; id: string }) => [d.slug, d.id])
  );

  // Clear existing rate cards
  await prisma.rateCard.deleteMany();
  console.log("  Cleared existing rate cards.");

  // Group hotels by destination+tier to get min/max double rates
  const grouped: Record<string, { prices: number[]; destSlug: string }> = {};
  for (const h of hotels) {
    const key = `${h.destSlug}|${h.tier}`;
    if (!grouped[key]) grouped[key] = { prices: [], destSlug: h.destSlug };
    grouped[key].prices.push(h.doubleRate);
  }

  // Create accommodation rate cards (per night, double room)
  const accomCards = [];
  for (const [key, val] of Object.entries(grouped)) {
    const [destSlug, tier] = key.split("|");
    const min = Math.min(...val.prices);
    const max = Math.max(...val.prices);
    const destId = destIdMap[destSlug] || null;

    accomCards.push({
      itemType: BookingItemType.ACCOMMODATION,
      destinationId: destId,
      tier,
      season: "valid-till-oct-2026",
      minPrice: min,
      maxPrice: max,
      currency: "USD",
    });
  }

  await prisma.rateCard.createMany({ data: accomCards });
  console.log(`  ${accomCards.length} accommodation rate cards created (double room, per night).`);

  // Room type multiplier cards (reference info)
  // Single = double x 0.90, Triple = double x 1.30
  // These are stored as rate cards with special tiers for the pricing engine
  const roomMultiplierCards = [
    {
      itemType: BookingItemType.ADDON,
      destinationId: null,
      tier: "room-multiplier-single",
      season: "all",
      minPrice: 0.90,
      maxPrice: 0.90,
      currency: "USD",
    },
    {
      itemType: BookingItemType.ADDON,
      destinationId: null,
      tier: "room-multiplier-triple",
      season: "all",
      minPrice: 1.30,
      maxPrice: 1.30,
      currency: "USD",
    },
  ];

  await prisma.rateCard.createMany({ data: roomMultiplierCards });
  console.log("  Room type multiplier cards created (single=0.90x, triple=1.30x).");

  // Transport rate cards (per km)
  const transportCards = [
    { tier: "car-1-2-pax", desc: "Car (1-2 pax)", perKm: 0.50, minPrice: 0, maxPrice: 0 },
    { tier: "micro-van-3-7-pax", desc: "Micro van (3-7 pax)", perKm: 0.60, minPrice: 0, maxPrice: 0 },
    { tier: "mini-coach-8-14-pax", desc: "Mini coach (8-14 pax)", perKm: 0.85, minPrice: 0, maxPrice: 0 },
    { tier: "37-seater-15-28-pax", desc: "37-seater coach (15-28 pax)", perKm: 1.25, minPrice: 0, maxPrice: 0 },
    { tier: "45-seater-29-40-pax", desc: "45-seater coach (29-40 pax)", perKm: 1.75, minPrice: 0, maxPrice: 0 },
  ];

  await prisma.rateCard.createMany({
    data: transportCards.map((t) => ({
      itemType: BookingItemType.TRANSPORT,
      destinationId: null,
      tier: t.tier,
      season: "all",
      minPrice: t.minPrice,
      maxPrice: t.maxPrice,
      perKmRate: t.perKm,
      currency: "USD",
    })),
  });
  console.log(`  ${transportCards.length} transport rate cards created (per-km rates).`);

  // Daily buffer: USD 85 for airport/highway charges, driver/guide fees, accommodation
  await prisma.rateCard.create({
    data: {
      itemType: BookingItemType.ADDON,
      destinationId: null,
      tier: "daily-buffer",
      season: "all",
      minPrice: 85,
      maxPrice: 85,
      currency: "USD",
    },
  });
  console.log("  Daily buffer rate card created (USD 85/day).");

  // Seed individual Hotel records
  await prisma.hotel.deleteMany();
  const validUntil = new Date("2026-10-31T23:59:59Z");

  for (const h of hotels) {
    const destId = destIdMap[h.destSlug] || null;
    await prisma.hotel.create({
      data: {
        name: h.hotelName,
        destinationId: destId,
        tier: h.tier,
        doubleRate: h.doubleRate,
        validUntil,
        isActive: true,
      },
    });
  }
  console.log(`  ${hotels.length} individual hotel records created.`);

  // Summary stats
  const totalCards = await prisma.rateCard.count();
  console.log(`\nDone. ${totalCards} total rate cards in database.`);
  console.log("\nRate structure:");
  console.log("  Accommodation: double room rates from Excel (valid till Oct 31, 2026)");
  console.log("  Room calc: Single = Double x 90%, Triple = Double x 130%");
  console.log("  Transport: Car $0.50/km, Micro van $0.60/km, Mini coach $0.85/km, 37-seat $1.25/km, 45-seat $1.75/km");
  console.log("  Daily buffer: $85 (airport/highway, driver/guide, accommodation)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
