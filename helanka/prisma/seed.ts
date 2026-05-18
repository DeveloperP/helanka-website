import { PrismaClient, UserRole, BookingItemType } from "../node_modules/.prisma/client/client";
import bcrypt from "bcryptjs";

// Prisma 7 requires an adapter or accelerateUrl at runtime, but the seed runs
// standalone via tsx. We cast to any here so the file type-checks in isolation;
// when DATABASE_URL is wired up, pass a real adapter.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new (PrismaClient as any)() as InstanceType<typeof PrismaClient>;

async function main() {
  console.log("Seeding database...");

  // ─── Admin User ───────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("Admin123!", 12);

  await prisma.user.upsert({
    where: { email: "admin@helanka.co" },
    update: {},
    create: {
      email: "admin@helanka.co",
      name: "Helanka Admin",
      passwordHash,
      role: UserRole.ADMIN,
      emailVerified: new Date(),
    },
  });
  console.log("  Admin user upserted.");

  // ─── Destinations ─────────────────────────────────────────────────────────
  const destinationData = [
    {
      name: "Ella",
      slug: "ella",
      region: "Hill Country",
      description:
        "A small hill town in the Badulla District surrounded by lush tea plantations and misty mountains. Ella is famous for its dramatic landscapes, iconic Nine Arch Bridge, and rewarding hikes up Little Adam's Peak and Ella Rock.",
      highlights: [
        "Nine Arch Bridge",
        "Little Adam's Peak hike",
        "Ella Rock trek",
        "Tea plantation walks",
        "Ravana Falls",
      ],
      photos: [] as string[],
      isActive: true,
    },
    {
      name: "Yala",
      slug: "yala",
      region: "Southern",
      description:
        "Sri Lanka's most visited national park and a biodiversity hotspot. Yala boasts the highest concentration of leopards in the world alongside herds of elephants, sloth bears, and over 200 bird species across its savannah and lagoon ecosystems.",
      highlights: [
        "Leopard safaris",
        "Elephant herds",
        "Sloth bear sightings",
        "200+ bird species",
        "Lagoon landscapes",
      ],
      photos: [] as string[],
      isActive: true,
    },
    {
      name: "Sigiriya",
      slug: "sigiriya",
      region: "Cultural Triangle",
      description:
        "An ancient rock fortress rising 200 metres above the surrounding jungle, Sigiriya is a UNESCO World Heritage Site. The 5th-century citadel features elaborate frescoes, landscaped gardens, and panoramic views across the Cultural Triangle.",
      highlights: [
        "Rock fortress summit",
        "UNESCO World Heritage Site",
        "Ancient frescoes",
        "Water gardens",
        "Panoramic views",
      ],
      photos: [] as string[],
      isActive: true,
    },
    {
      name: "Galle",
      slug: "galle",
      region: "Southern",
      description:
        "A fortified city on the southwestern coast of Sri Lanka, Galle Fort was built by the Portuguese and later reinforced by the Dutch. The UNESCO-listed fort is a living town filled with colonial architecture, boutique hotels, and pristine beaches.",
      highlights: [
        "Galle Fort (Dutch colonial)",
        "UNESCO World Heritage Site",
        "Pristine southern beaches",
        "Lighthouse views",
        "Artisan boutiques",
      ],
      photos: [] as string[],
      isActive: true,
    },
    {
      name: "Nuwara Eliya",
      slug: "nuwara-eliya",
      region: "Hill Country",
      description:
        "Often called 'Little England', Nuwara Eliya sits at 1,868 metres above sea level amid rolling tea estates and cool misty air. The town retains much of its colonial-era charm with Tudor-style bungalows, a race course, and manicured gardens.",
      highlights: [
        "Tea estate tours",
        "Horton Plains & World's End",
        "Gregory Lake",
        "Colonial architecture",
        "Cool mountain climate",
      ],
      photos: [] as string[],
      isActive: true,
    },
    {
      name: "Kandy",
      slug: "kandy",
      region: "Hill Country",
      description:
        "The cultural capital of Sri Lanka and a UNESCO World Heritage City, Kandy is home to the sacred Temple of the Tooth Relic (Sri Dalada Maligawa). Set around a scenic lake and surrounded by forested hills, it is the centre of traditional Kandyan arts, dance, and crafts.",
      highlights: [
        "Temple of the Tooth (Sri Dalada Maligawa)",
        "Esala Perahera festival",
        "Kandy Lake",
        "Royal Botanical Gardens Peradeniya",
        "Kandyan dance performances",
      ],
      photos: [] as string[],
      isActive: true,
    },
    {
      name: "Bentota",
      slug: "bentota",
      region: "Western Coast",
      description:
        "A sun-drenched beach resort town on Sri Lanka's west coast, Bentota is renowned for its golden sandy beaches, warm Indian Ocean waters, and thriving water sports scene. The Bentota lagoon is ideal for jet skiing, windsurfing, and river boat safaris.",
      highlights: [
        "Golden beach",
        "Water sports hub",
        "Bentota lagoon safari",
        "Turtle hatcheries",
        "Ayurveda spa retreats",
      ],
      photos: [] as string[],
      isActive: true,
    },
    {
      name: "Arugam Bay",
      slug: "arugam-bay",
      region: "Eastern Coast",
      description:
        "A laid-back bay village on Sri Lanka's east coast and one of the top surfing destinations in Asia. Arugam Bay offers consistent surf breaks from May to October, abundant wildlife in nearby lagoons, and a vibrant backpacker culture.",
      highlights: [
        "World-class surf breaks",
        "Main Point surf spot",
        "Lagoon safaris",
        "Kumana National Park nearby",
        "Relaxed beach culture",
      ],
      photos: [] as string[],
      isActive: true,
    },
    {
      name: "Anuradhapura",
      slug: "anuradhapura",
      region: "Cultural Triangle",
      description:
        "One of the ancient capitals of Sri Lanka and a UNESCO World Heritage Site, Anuradhapura is home to some of the most important Buddhist ruins in the world. The city contains towering dagobas, ancient pools, and the sacred Sri Maha Bodhi tree.",
      highlights: [
        "Sri Maha Bodhi (sacred fig tree)",
        "Ruwanwelisaya Dagoba",
        "Jetavanaramaya stupa",
        "UNESCO World Heritage Site",
        "Ancient hydraulic reservoirs",
      ],
      photos: [] as string[],
      isActive: true,
    },
    {
      name: "Kitulgala",
      slug: "kitulgala",
      region: "Hill Country",
      description:
        "A small riverside town in the Sabaragamuwa Province, Kitulgala is the adventure capital of Sri Lanka. The Kelani River provides some of the best white water rafting in the country, while the surrounding rainforest offers canyoning, abseiling, and bird watching.",
      highlights: [
        "White water rafting",
        "Canyoning and abseiling",
        "Kelani River adventures",
        "Rainforest bird watching",
        "Bridge on the River Kwai filming location",
      ],
      photos: [] as string[],
      isActive: true,
    },
    {
      name: "Wilpattu",
      slug: "wilpattu",
      region: "North Western",
      description:
        "Sri Lanka's largest national park by area, Wilpattu is a wilderness of natural lakes (villus), dry scrub forest, and open grassland. Less visited than Yala, it offers an exclusive safari experience with excellent leopard sightings and a rich diversity of wildlife.",
      highlights: [
        "Sri Lanka's largest national park",
        "Leopard sightings",
        "Natural villus (lakes)",
        "Sloth bear and elephant",
        "Uncrowded safari experience",
      ],
      photos: [] as string[],
      isActive: true,
    },
    {
      name: "Colombo",
      slug: "colombo",
      region: "Western",
      description:
        "Sri Lanka's vibrant commercial capital, Colombo blends colonial heritage with modern skyscrapers, bustling markets, and a cosmopolitan food scene. The city serves as the main gateway to the island and rewards visitors with waterfront promenades, museums, and diverse neighbourhoods.",
      highlights: [
        "Galle Face Green promenade",
        "Pettah bazaar district",
        "National Museum",
        "Colombo Lotus Tower",
        "Diverse dining and nightlife",
      ],
      photos: [] as string[],
      isActive: true,
    },
  ];

  const destinations: Record<string, string> = {};
  for (const d of destinationData) {
    const dest = await prisma.destination.upsert({
      where: { slug: d.slug },
      update: {},
      create: d,
    });
    destinations[d.slug] = dest.id;
  }
  console.log(`  ${destinationData.length} destinations upserted.`);

  // ─── Packages ─────────────────────────────────────────────────────────────
  const packageData = [
    {
      name: "Hill Country Explorer",
      slug: "hill-country-explorer",
      description:
        "Wind through misty mountains, colonial tea estates, and sacred cultural sites on this classic Sri Lanka hill country circuit. Travel by scenic train from Nuwara Eliya down to Ella before finishing in the cultural capital Kandy.",
      durationDays: 6,
      highlights: [
        "Iconic Kandy to Ella train journey",
        "Tea factory and estate tour in Nuwara Eliya",
        "Nine Arch Bridge at sunrise",
        "Temple of the Tooth in Kandy",
        "Little Adam's Peak hike",
      ],
      difficulty: "Easy",
      region: "Hill Country",
      isActive: true,
    },
    {
      name: "Wildlife Adventure",
      slug: "wildlife-adventure",
      description:
        "Track leopards, elephants, and exotic birds across two of Sri Lanka's premier national parks. Combine dawn game drives in Yala with a twilight excursion to Wilpattu for an unparalleled wildlife experience.",
      durationDays: 4,
      highlights: [
        "Yala leopard safari",
        "Wilpattu villu lake game drive",
        "Elephant herds",
        "Sloth bear spotting",
        "Expert naturalist guide",
      ],
      difficulty: "Easy",
      region: "Southern",
      isActive: true,
    },
    {
      name: "Golden Southern Coast",
      slug: "golden-southern-coast",
      description:
        "Explore the sun-kissed southern coastline from the UNESCO-listed Galle Fort to the turtle-nesting beaches of Bentota. Enjoy colonial heritage, world-class snorkelling, and relaxing beachside evenings.",
      durationDays: 5,
      highlights: [
        "Guided tour of Galle Fort",
        "Turtle hatchery visit",
        "Bentota water sports",
        "Whale watching (seasonal)",
        "Beachfront sunset dining",
      ],
      difficulty: "Easy",
      region: "Southern",
      isActive: true,
    },
    {
      name: "Throbbing Adventure",
      slug: "throbbing-adventure",
      description:
        "An action-packed hill country escape for thrill-seekers. Raft the Grade 3–4 rapids of the Kelani River in Kitulgala, abseil cliff faces through jungle canyons, and summit Ella Rock for sweeping highland panoramas.",
      durationDays: 3,
      highlights: [
        "White water rafting on Kelani River",
        "Jungle canyoning and abseiling",
        "Ella Rock summit hike",
        "Nine Arch Bridge photography",
        "Adventure-camp accommodation",
      ],
      difficulty: "Challenging",
      region: "Hill Country",
      isActive: true,
    },
    {
      name: "East Coast Escape",
      slug: "east-coast-escape",
      description:
        "Discover the raw, unhurried beauty of Sri Lanka's east coast. Ride consistent surf breaks at Arugam Bay, explore the wildlife-rich Kumana lagoon, and unwind on some of the island's most pristine and uncrowded beaches.",
      durationDays: 5,
      highlights: [
        "Surfing at Arugam Bay Main Point",
        "Kumana National Park lagoon safari",
        "Pristine eastern beaches",
        "Local fishing village visit",
        "Stargazing on the beach",
      ],
      difficulty: "Moderate",
      region: "Eastern Coast",
      isActive: true,
    },
  ];

  const packages: Record<string, string> = {};
  for (const p of packageData) {
    const pkg = await prisma.package.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
    packages[p.slug] = pkg.id;
  }
  console.log(`  ${packageData.length} packages upserted.`);

  // ─── Package Items for Hill Country Explorer ──────────────────────────────
  // Only seed items if the package currently has none (idempotent)
  const hillCountryPkgId = packages["hill-country-explorer"];
  const existingItems = await prisma.packageItem.count({
    where: { packageId: hillCountryPkgId },
  });

  if (existingItems === 0) {
    await prisma.packageItem.createMany({
      data: [
        // Day 1–2: Nuwara Eliya
        {
          packageId: hillCountryPkgId,
          type: BookingItemType.TRANSPORT,
          destinationId: destinations["nuwara-eliya"],
          description: "Private transfer from Colombo to Nuwara Eliya (approx 5 hours)",
          sortOrder: 1,
        },
        {
          packageId: hillCountryPkgId,
          type: BookingItemType.ACCOMMODATION,
          destinationId: destinations["nuwara-eliya"],
          description: "2 nights accommodation in Nuwara Eliya (tea estate bungalow or boutique hotel)",
          sortOrder: 2,
        },
        {
          packageId: hillCountryPkgId,
          type: BookingItemType.ACTIVITY,
          destinationId: destinations["nuwara-eliya"],
          description: "Tea factory tour and estate walk in Nuwara Eliya",
          sortOrder: 3,
        },
        {
          packageId: hillCountryPkgId,
          type: BookingItemType.ACTIVITY,
          destinationId: destinations["nuwara-eliya"],
          description: "Horton Plains National Park visit including World's End viewpoint",
          sortOrder: 4,
        },
        // Day 3–4: Ella (scenic train from Nuwara Eliya)
        {
          packageId: hillCountryPkgId,
          type: BookingItemType.TRANSPORT,
          destinationId: destinations["ella"],
          description: "Scenic train journey Nanu Oya to Ella (approx 3.5 hours)",
          sortOrder: 5,
        },
        {
          packageId: hillCountryPkgId,
          type: BookingItemType.ACCOMMODATION,
          destinationId: destinations["ella"],
          description: "2 nights accommodation in Ella (mountain view guesthouse or boutique hotel)",
          sortOrder: 6,
        },
        {
          packageId: hillCountryPkgId,
          type: BookingItemType.ACTIVITY,
          destinationId: destinations["ella"],
          description: "Guided hike to Little Adam's Peak at sunrise",
          sortOrder: 7,
        },
        {
          packageId: hillCountryPkgId,
          type: BookingItemType.ACTIVITY,
          destinationId: destinations["ella"],
          description: "Nine Arch Bridge visit and photography walk",
          sortOrder: 8,
        },
        // Day 5–6: Kandy
        {
          packageId: hillCountryPkgId,
          type: BookingItemType.TRANSPORT,
          destinationId: destinations["kandy"],
          description: "Private transfer from Ella to Kandy (approx 3 hours)",
          sortOrder: 9,
        },
        {
          packageId: hillCountryPkgId,
          type: BookingItemType.ACCOMMODATION,
          destinationId: destinations["kandy"],
          description: "2 nights accommodation in Kandy (lakeside hotel)",
          sortOrder: 10,
        },
        {
          packageId: hillCountryPkgId,
          type: BookingItemType.ACTIVITY,
          destinationId: destinations["kandy"],
          description: "Temple of the Tooth Relic visit and guided tour",
          sortOrder: 11,
        },
        {
          packageId: hillCountryPkgId,
          type: BookingItemType.ACTIVITY,
          destinationId: destinations["kandy"],
          description: "Royal Botanical Gardens Peradeniya and evening Kandyan dance performance",
          sortOrder: 12,
        },
        {
          packageId: hillCountryPkgId,
          type: BookingItemType.TRANSPORT,
          destinationId: null,
          description: "Private transfer from Kandy to Colombo airport (departure)",
          sortOrder: 13,
        },
      ],
    });
    console.log("  Hill Country Explorer package items created.");
  } else {
    console.log("  Hill Country Explorer package items already exist, skipping.");
  }

  // ─── Rate Cards ───────────────────────────────────────────────────────────
  // Strategy: delete and re-insert rate cards on each seed run for simplicity,
  // since RateCard has no unique slug. Guard with a count check for idempotency.
  const existingRateCards = await prisma.rateCard.count();

  if (existingRateCards === 0) {
    const seasons = ["peak", "shoulder", "off-peak"] as const;

    // Accommodation tiers per season (USD per night, per person basis)
    // peak: Dec–Mar; shoulder: Apr, Jul–Aug; off-peak: May–Jun, Sep–Nov
    const accommodationTiers = [
      { tier: "3-star",  peak: [45, 75],  shoulder: [35, 60],  "off-peak": [25, 45] },
      { tier: "4-star",  peak: [90, 150], shoulder: [70, 120], "off-peak": [55, 90] },
      { tier: "5-star",  peak: [180, 350], shoulder: [140, 270], "off-peak": [110, 200] },
      { tier: "boutique", peak: [120, 220], shoulder: [95, 175], "off-peak": [70, 130] },
    ];

    const accommodationCards = accommodationTiers.flatMap((t) =>
      seasons.map((season) => ({
        itemType: BookingItemType.ACCOMMODATION,
        destinationId: null,
        tier: t.tier,
        season,
        minPrice: t[season][0],
        maxPrice: t[season][1],
        currency: "USD",
      }))
    );

    // Activities (per person, USD) — season-agnostic pricing with small variance
    const activityCards = [
      {
        tier: "safari",
        prices: { peak: [55, 90], shoulder: [45, 75], "off-peak": [35, 60] },
      },
      {
        tier: "cultural",
        prices: { peak: [25, 50], shoulder: [20, 45], "off-peak": [15, 35] },
      },
      {
        tier: "adventure",
        prices: { peak: [60, 110], shoulder: [50, 90], "off-peak": [40, 75] },
      },
      {
        tier: "water-sport",
        prices: { peak: [40, 80], shoulder: [35, 65], "off-peak": [28, 55] },
      },
      {
        tier: "nature",
        prices: { peak: [30, 55], shoulder: [25, 45], "off-peak": [18, 35] },
      },
    ];

    const activityRateCards = activityCards.flatMap((a) =>
      seasons.map((season) => ({
        itemType: BookingItemType.ACTIVITY,
        destinationId: null,
        tier: a.tier,
        season,
        minPrice: a.prices[season][0],
        maxPrice: a.prices[season][1],
        currency: "USD",
      }))
    );

    // Transport (per vehicle per day, USD)
    const transportTiers = [
      { tier: "standard",  peak: [60, 90],   shoulder: [50, 75],  "off-peak": [40, 60] },
      { tier: "premium",   peak: [100, 150],  shoulder: [85, 125], "off-peak": [70, 100] },
      { tier: "luxury",    peak: [170, 280],  shoulder: [140, 230], "off-peak": [110, 180] },
    ];

    const transportCards = transportTiers.flatMap((t) =>
      seasons.map((season) => ({
        itemType: BookingItemType.TRANSPORT,
        destinationId: null,
        tier: t.tier,
        season,
        minPrice: t[season][0],
        maxPrice: t[season][1],
        currency: "USD",
      }))
    );

    // Add-ons (flat / per person, USD) — season-invariant, one card per type
    const addonCards = [
      { tier: "airport-pickup",     min: 30,  max: 55  },
      { tier: "sim-card",           min: 5,   max: 10  },
      { tier: "travel-insurance",   min: 20,  max: 45  },
      { tier: "photographer",       min: 150, max: 300 },
    ].map((a) => ({
      itemType: BookingItemType.ADDON,
      destinationId: null,
      tier: a.tier,
      season: "all",
      minPrice: a.min,
      maxPrice: a.max,
      currency: "USD",
    }));

    const allRateCards = [
      ...accommodationCards,
      ...activityRateCards,
      ...transportCards,
      ...addonCards,
    ];

    await prisma.rateCard.createMany({ data: allRateCards });
    console.log(`  ${allRateCards.length} rate cards created.`);
  } else {
    console.log(`  Rate cards already exist (${existingRateCards} found), skipping.`);
  }

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
