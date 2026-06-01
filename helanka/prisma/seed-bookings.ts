import "dotenv/config";
import { PrismaClient, UserRole, BookingStatus, BookingItemType, TripSessionStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new (PrismaClient as any)({ adapter }) as InstanceType<typeof PrismaClient>;

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

async function main() {
  console.log("Seeding bookings, sessions, quotes, payments, and reviews...");

  const customers = await prisma.user.findMany({ where: { role: UserRole.CUSTOMER } });
  const specialists = await prisma.user.findMany({ where: { role: UserRole.SPECIALIST } });
  const destinations = await prisma.destination.findMany();

  if (customers.length === 0 || destinations.length === 0) {
    console.error("Run seed-users.ts and seed.ts first.");
    process.exit(1);
  }

  const destMap = Object.fromEntries(destinations.map((d: { slug: string; id: string }) => [d.slug, d.id]));

  const tripTypes = ["package", "custom", "mice"];
  const channels = ["website", "instagram", "google", "referral", "tripadvisor"];
  const flightPrefixes = ["UL", "EK", "SQ", "QR", "BA", "LH"];

  const bookingScenarios: {
    status: BookingStatus;
    weight: number;
    hasQuote: boolean;
    hasPayment: boolean;
    hasReview: boolean;
    tripStatus: TripSessionStatus;
  }[] = [
    { status: "DRAFT" as BookingStatus, weight: 3, hasQuote: false, hasPayment: false, hasReview: false, tripStatus: "ACTIVE" as TripSessionStatus },
    { status: "QUOTE_REQUESTED" as BookingStatus, weight: 2, hasQuote: false, hasPayment: false, hasReview: false, tripStatus: "QUOTE_REQUESTED" as TripSessionStatus },
    { status: "PRICING_IN_PROGRESS" as BookingStatus, weight: 2, hasQuote: false, hasPayment: false, hasReview: false, tripStatus: "QUOTE_REQUESTED" as TripSessionStatus },
    { status: "QUOTE_SENT" as BookingStatus, weight: 3, hasQuote: true, hasPayment: false, hasReview: false, tripStatus: "IDLE" as TripSessionStatus },
    { status: "CONFIRMED" as BookingStatus, weight: 3, hasQuote: true, hasPayment: true, hasReview: false, tripStatus: "ACTIVE" as TripSessionStatus },
    { status: "BALANCE_DUE" as BookingStatus, weight: 2, hasQuote: true, hasPayment: true, hasReview: false, tripStatus: "ACTIVE" as TripSessionStatus },
    { status: "COMPLETED" as BookingStatus, weight: 3, hasQuote: true, hasPayment: true, hasReview: true, tripStatus: "CLOSED" as TripSessionStatus },
    { status: "CANCELLED" as BookingStatus, weight: 1, hasQuote: true, hasPayment: false, hasReview: false, tripStatus: "CLOSED" as TripSessionStatus },
    { status: "REVISION_REQUESTED" as BookingStatus, weight: 1, hasQuote: true, hasPayment: false, hasReview: false, tripStatus: "ACTIVE" as TripSessionStatus },
  ];

  const weightedScenarios = bookingScenarios.flatMap((s) => Array(s.weight).fill(s));

  const itemTemplates: { type: BookingItemType; desc: string; dest: string; tier: string; minP: number; maxP: number; nights?: number }[] = [
    { type: "ACCOMMODATION" as BookingItemType, desc: "3 nights at boutique hotel in Galle Fort", dest: "galle", tier: "boutique", minP: 360, maxP: 660, nights: 3 },
    { type: "ACCOMMODATION" as BookingItemType, desc: "2 nights at tea estate bungalow in Ella", dest: "ella", tier: "4-star", minP: 180, maxP: 300, nights: 2 },
    { type: "ACCOMMODATION" as BookingItemType, desc: "2 nights at lakeside hotel in Kandy", dest: "kandy", tier: "4-star", minP: 180, maxP: 300, nights: 2 },
    { type: "ACCOMMODATION" as BookingItemType, desc: "1 night at safari lodge near Yala", dest: "yala", tier: "boutique", minP: 120, maxP: 220, nights: 1 },
    { type: "ACCOMMODATION" as BookingItemType, desc: "2 nights at beach resort in Bentota", dest: "bentota", tier: "5-star", minP: 360, maxP: 700, nights: 2 },
    { type: "ACCOMMODATION" as BookingItemType, desc: "2 nights at heritage hotel in Sigiriya", dest: "sigiriya", tier: "boutique", minP: 240, maxP: 440, nights: 2 },
    { type: "ACCOMMODATION" as BookingItemType, desc: "1 night at city hotel in Colombo", dest: "colombo", tier: "4-star", minP: 90, maxP: 150, nights: 1 },
    { type: "ACTIVITY" as BookingItemType, desc: "Full-day Yala leopard safari with tracker", dest: "yala", tier: "safari", minP: 55, maxP: 90 },
    { type: "ACTIVITY" as BookingItemType, desc: "Sigiriya Rock Fortress guided climb", dest: "sigiriya", tier: "cultural", minP: 25, maxP: 50 },
    { type: "ACTIVITY" as BookingItemType, desc: "Temple of the Tooth guided tour", dest: "kandy", tier: "cultural", minP: 20, maxP: 45 },
    { type: "ACTIVITY" as BookingItemType, desc: "Nine Arch Bridge sunrise photography walk", dest: "ella", tier: "nature", minP: 15, maxP: 35 },
    { type: "ACTIVITY" as BookingItemType, desc: "Galle Fort walking tour with historian", dest: "galle", tier: "cultural", minP: 25, maxP: 50 },
    { type: "ACTIVITY" as BookingItemType, desc: "Whale watching excursion from Mirissa", dest: "galle", tier: "nature", minP: 40, maxP: 70 },
    { type: "ACTIVITY" as BookingItemType, desc: "White water rafting in Kitulgala", dest: "kitulgala", tier: "adventure", minP: 60, maxP: 110 },
    { type: "ACTIVITY" as BookingItemType, desc: "Wilpattu National Park safari drive", dest: "wilpattu", tier: "safari", minP: 55, maxP: 90 },
    { type: "TRANSPORT" as BookingItemType, desc: "Airport pickup Colombo to hotel", dest: "colombo", tier: "standard", minP: 30, maxP: 55 },
    { type: "TRANSPORT" as BookingItemType, desc: "Private transfer Colombo to Sigiriya", dest: "sigiriya", tier: "premium", minP: 85, maxP: 125 },
    { type: "TRANSPORT" as BookingItemType, desc: "Scenic train Kandy to Ella (reserved seats)", dest: "ella", tier: "standard", minP: 15, maxP: 30 },
    { type: "TRANSPORT" as BookingItemType, desc: "Private transfer Ella to Yala", dest: "yala", tier: "standard", minP: 60, maxP: 90 },
    { type: "TRANSPORT" as BookingItemType, desc: "Private transfer Yala to Galle coast", dest: "galle", tier: "premium", minP: 100, maxP: 150 },
    { type: "ADDON" as BookingItemType, desc: "Local SIM card with data package", dest: "colombo", tier: "sim-card", minP: 5, maxP: 10 },
    { type: "ADDON" as BookingItemType, desc: "Travel photography package (half day)", dest: "sigiriya", tier: "photographer", minP: 150, maxP: 300 },
  ];

  const reviewTitles = [
    "Absolutely magical trip",
    "Best holiday we have ever taken",
    "Sri Lanka exceeded every expectation",
    "Helanka made it effortless",
    "Would book again in a heartbeat",
    "A trip of a lifetime",
    "Everything was perfectly arranged",
    "The leopard safari alone was worth it",
    "Better than we imagined",
    "Incredible value for money",
  ];

  const reviewBodies = [
    "From the moment we landed, everything was taken care of. The driver was waiting, the hotels were exactly as described, and the itinerary flowed beautifully. The highlight was definitely the train ride through tea country. We will be back.",
    "We were nervous about planning a trip to a country we had never visited, but the Helanka team made it completely stress-free. Every transfer, every hotel, every activity was sorted. The leopard safari at Yala was genuinely one of the best experiences of our lives.",
    "The attention to detail was impressive. They knew which side of the train to sit on for the best views, which restaurant in Galle does the best crab curry, and which time to arrive at Sigiriya to avoid the crowds. That local knowledge is priceless.",
    "We travelled with two small children and were worried about logistics. Helanka planned rest days between transfers, chose family-friendly hotels, and even arranged a private safari jeep so the kids could nap between sightings. Thoughtful planning throughout.",
    "Sri Lanka was not on our radar until a friend recommended Helanka. So glad we listened. The south coast boutique hotels were stunning, the food was incredible, and the whole trip cost less than a week in the Maldives. Genuinely outstanding value.",
    "This was our honeymoon and Helanka made it perfect. Candle-lit dinners on the beach, a private guided tour of Sigiriya at sunrise, and a surprise upgrade at the tea estate bungalow. They clearly care about getting the details right.",
    "I have travelled extensively in Southeast Asia but Sri Lanka surprised me. The cultural depth, the wildlife, the food. Helanka connected the dots in a way I could not have done independently. The itinerary was perfectly paced with no wasted days.",
    "Third trip with Helanka and they keep raising the bar. This time we did the east coast and it was like discovering a completely different country. Arugam Bay surf, Trincomalee beaches, zero crowds. They know the off-the-beaten-path spots.",
  ];

  let bookingCount = 0;
  let sessionCount = 0;
  let quoteCount = 0;
  let paymentCount = 0;
  let reviewCount = 0;

  for (const customer of customers) {
    const numBookings = randomInt(1, 3);

    for (let b = 0; b < numBookings; b++) {
      const scenario = randomItem(weightedScenarios);
      const createdDaysAgo = randomInt(5, 120);
      const arrivalDaysFromNow = scenario.status === ("COMPLETED" as BookingStatus) ? -randomInt(10, 60) : randomInt(15, 90);
      const durationDays = randomInt(5, 14);
      const numTravelers = randomInt(1, 4);
      const tripType = randomItem(tripTypes);

      const booking = await prisma.booking.create({
        data: {
          userId: customer.id,
          status: scenario.status,
          arrivalDate: daysFromNow(arrivalDaysFromNow),
          departureDate: daysFromNow(arrivalDaysFromNow + durationDays),
          numTravelers,
          flightNumber: `${randomItem(flightPrefixes)}${randomInt(100, 999)}`,
          sourceChannel: randomItem(channels),
          createdAt: daysAgo(createdDaysAgo),
        },
      });
      bookingCount++;

      // Add 3-6 random booking items
      const numItems = randomInt(3, 6);
      const selectedItems = [];
      const usedDescs = new Set<string>();
      for (let i = 0; i < numItems; i++) {
        let item = randomItem(itemTemplates);
        let attempts = 0;
        while (usedDescs.has(item.desc) && attempts < 10) {
          item = randomItem(itemTemplates);
          attempts++;
        }
        usedDescs.add(item.desc);
        selectedItems.push(item);
      }

      await prisma.bookingItem.createMany({
        data: selectedItems.map((item, idx) => ({
          bookingId: booking.id,
          type: item.type,
          destinationId: destMap[item.dest] || null,
          description: item.desc,
          tier: item.tier,
          nights: item.nights || null,
          estimateMin: item.minP * numTravelers,
          estimateMax: item.maxP * numTravelers,
          actualPrice: scenario.hasQuote ? Math.round((item.minP + (item.maxP - item.minP) * 0.6) * numTravelers) : null,
          sortOrder: idx + 1,
        })),
      });

      // Trip session
      const specialist = randomItem(specialists);
      await prisma.tripSession.create({
        data: {
          customerId: customer.id,
          specialistId: specialist.id,
          bookingId: booking.id,
          tripType,
          status: scenario.tripStatus,
          activeTab: randomItem(["overview", "itinerary", "pricing", "messages"]),
          state: {
            destinations: selectedItems.filter((i) => i.dest).map((i) => i.dest),
            travelers: numTravelers,
            budget: randomItem(["budget", "mid-range", "luxury"]),
            interests: randomItem([
              ["wildlife", "photography"],
              ["beaches", "surfing"],
              ["culture", "heritage"],
              ["adventure", "hiking"],
              ["food", "relaxation"],
            ]),
          },
          lastActivityAt: daysAgo(randomInt(0, 10)),
          idleSince: scenario.tripStatus === ("IDLE" as TripSessionStatus) ? daysAgo(randomInt(1, 5)) : null,
          createdAt: daysAgo(createdDaysAgo),
        },
      });
      sessionCount++;

      // Quote
      if (scenario.hasQuote) {
        const totalPrice = selectedItems.reduce((sum, item) => {
          const price = Math.round((item.minP + (item.maxP - item.minP) * 0.6) * numTravelers);
          return sum + price;
        }, 0);
        const deposit = Math.round(totalPrice * 0.3);

        await prisma.quote.create({
          data: {
            bookingId: booking.id,
            version: 1,
            totalPrice,
            deposit,
            validUntil: daysFromNow(14),
            adminNotes: randomItem([
              "Standard pricing applied. No peak surcharge.",
              "Upgraded to boutique tier per client request.",
              "Group discount 10% applied for 4 travelers.",
              "Repeat client. Applied loyalty rate.",
              null,
            ]),
            sentAt: scenario.status !== ("PRICING_IN_PROGRESS" as BookingStatus) ? daysAgo(randomInt(1, 15)) : null,
            respondedAt: scenario.status === ("CONFIRMED" as BookingStatus) || scenario.status === ("COMPLETED" as BookingStatus) ? daysAgo(randomInt(1, 10)) : null,
            response: scenario.status === ("CONFIRMED" as BookingStatus) || scenario.status === ("COMPLETED" as BookingStatus) || scenario.status === ("BALANCE_DUE" as BookingStatus)
              ? "ACCEPTED"
              : scenario.status === ("REVISION_REQUESTED" as BookingStatus)
              ? "REVISION"
              : scenario.status === ("CANCELLED" as BookingStatus)
              ? "EXPIRED"
              : null,
            taxRate: 0,
            taxInclusive: true,
            handlingFeeAmt: randomItem([0, 25, 50]),
            discountAmt: randomItem([0, 0, 0, 50, 100]),
          },
        });
        quoteCount++;
      }

      // Payment
      if (scenario.hasPayment) {
        const totalPrice = selectedItems.reduce((sum, item) => {
          return sum + Math.round((item.minP + (item.maxP - item.minP) * 0.6) * numTravelers);
        }, 0);
        const deposit = Math.round(totalPrice * 0.3);

        await prisma.payment.create({
          data: {
            bookingId: booking.id,
            amount: scenario.status === ("COMPLETED" as BookingStatus) ? totalPrice : deposit,
            currency: "USD",
            method: randomItem(["card", "bank_transfer", "webxpay"]),
            webxpayRef: `WXP-${randomInt(100000, 999999)}`,
            status: "SUCCESS",
            paidAt: daysAgo(randomInt(1, 30)),
          },
        });
        paymentCount++;

        // Add balance payment for completed bookings
        if (scenario.status === ("COMPLETED" as BookingStatus) && deposit < totalPrice) {
          await prisma.payment.create({
            data: {
              bookingId: booking.id,
              amount: totalPrice - deposit,
              currency: "USD",
              method: randomItem(["card", "bank_transfer", "webxpay"]),
              webxpayRef: `WXP-${randomInt(100000, 999999)}`,
              status: "SUCCESS",
              paidAt: daysAgo(randomInt(1, 15)),
            },
          });
          paymentCount++;
        }
      }

      // Review
      if (scenario.hasReview && Math.random() > 0.3) {
        await prisma.review.create({
          data: {
            userId: customer.id,
            bookingId: booking.id,
            rating: randomInt(4, 5),
            title: randomItem(reviewTitles),
            body: randomItem(reviewBodies),
            isPublished: Math.random() > 0.2,
            createdAt: daysAgo(randomInt(1, 30)),
          },
        });
        reviewCount++;
      }
    }
  }

  console.log(`  ${bookingCount} bookings created`);
  console.log(`  ${sessionCount} trip sessions created`);
  console.log(`  ${quoteCount} quotes created`);
  console.log(`  ${paymentCount} payments created`);
  console.log(`  ${reviewCount} reviews created`);
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
