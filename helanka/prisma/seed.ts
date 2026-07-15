import "dotenv/config";
import { PrismaClient, UserRole, BookingItemType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new (PrismaClient as any)({ adapter }) as InstanceType<typeof PrismaClient>;

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

  // ─── Specialists ────────────────────────────────────────────────────────
  const specialists = [
    { email: "kavindi@helanka.co", name: "Kavindi Weerasinghe", specialty: "package" },
    { email: "nishadi@helanka.co", name: "Nishadi Fernando", specialty: "custom" },
    { email: "ranjan@helanka.co", name: "Ranjan Perera", specialty: "mice" },
  ];

  for (const s of specialists) {
    await prisma.user.upsert({
      where: { email: s.email },
      update: { specialty: s.specialty },
      create: {
        email: s.email,
        name: s.name,
        passwordHash,
        role: UserRole.SPECIALIST,
        specialty: s.specialty,
        emailVerified: new Date(),
      },
    });
  }
  console.log(`  ${specialists.length} specialists upserted.`);

  // ─── Destinations ─────────────────────────────────────────────────────────
  const distancesFromColombo: Record<string, number> = {
    colombo: 0, bentota: 64, galle: 126, ella: 200, "nuwara-eliya": 180,
    kandy: 116, sigiriya: 170, anuradhapura: 200, yala: 305,
    "arugam-bay": 320, kitulgala: 87, wilpattu: 180,
    negombo: 37, chilaw: 80, kalpitiya: 165, jaffna: 395,
    trincomalee: 260, passikudah: 280, polonnaruwa: 215, matale: 140,
    mahiyangana: 185, "gal-oya": 280, hatton: 150, haputale: 190,
    udawalawe: 170, hambantota: 240, hikkaduwa: 100, mirissa: 150,
    sinharaja: 130, belihuloya: 160,
  };

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
    {
      name: "Negombo",
      slug: "negombo",
      region: "Western Coast",
      description:
        "Gateway beach town near Bandaranaike Airport, known for its fishing culture, golden beaches, Dutch canal heritage, and lively fish markets.",
      highlights: [
        "Negombo Fish Market",
        "Dutch Canal",
        "Muthurajawela Marsh",
        "Catamaran sailing",
        "Beach relaxation",
      ],
      photos: [] as string[],
      isActive: true,
    },
    {
      name: "Chilaw",
      slug: "chilaw",
      region: "North Western",
      description:
        "A quiet coastal town on Sri Lanka's west coast, known for the sacred Munneswaram Hindu temple and its proximity to the pristine beaches of Kalpitiya.",
      highlights: [
        "Munneswaram Temple",
        "Coastal fishing villages",
        "Quiet beaches",
        "Gateway to Kalpitiya",
      ],
      photos: [] as string[],
      isActive: true,
    },
    {
      name: "Kalpitiya",
      slug: "kalpitiya",
      region: "North Western",
      description:
        "A windswept peninsula on the northwest coast, Kalpitiya is the kitesurfing capital of Sri Lanka with dolphin watching, bar reef snorkelling, and unspoilt coastal wilderness.",
      highlights: [
        "Kitesurfing",
        "Dolphin watching",
        "Bar Reef Marine Sanctuary",
        "Kalpitiya lagoon",
        "Pristine beaches",
      ],
      photos: [] as string[],
      isActive: true,
    },
    {
      name: "Jaffna",
      slug: "jaffna",
      region: "Northern",
      description:
        "The cultural capital of Sri Lanka's Tamil heritage, Jaffna is a vibrant city of Hindu temples, colonial forts, and unique cuisine, set on a peninsula surrounded by islands.",
      highlights: [
        "Nallur Kandaswamy Kovil",
        "Jaffna Fort",
        "Nagadeepa Island",
        "Casuarina Beach",
        "Jaffna Public Library",
      ],
      photos: [] as string[],
      isActive: true,
    },
    {
      name: "Trincomalee",
      slug: "trincomalee",
      region: "Eastern Coast",
      description:
        "A historic port city on the east coast with one of the world's finest natural harbours, sacred Hindu temples atop dramatic cliffs, and pristine beaches.",
      highlights: [
        "Koneswaram Temple",
        "Pigeon Island",
        "Nilaveli Beach",
        "Kanniya Hot Springs",
        "Fort Frederick",
      ],
      photos: [] as string[],
      isActive: true,
    },
    {
      name: "Passikudah",
      slug: "passikudah",
      region: "Eastern Coast",
      description:
        "A crescent-shaped bay on the east coast with calm, shallow turquoise waters, making it one of Sri Lanka's safest and most beautiful swimming beaches.",
      highlights: [
        "Calm shallow bay",
        "Coral reef snorkelling",
        "Kalkudah Beach",
        "Water sports",
        "Batticaloa nearby",
      ],
      photos: [] as string[],
      isActive: true,
    },
    {
      name: "Polonnaruwa",
      slug: "polonnaruwa",
      region: "Cultural Triangle",
      description:
        "The medieval capital of Sri Lanka and a UNESCO World Heritage Site, Polonnaruwa contains spectacular ruins of palaces, temples, and the famous Gal Vihara rock-carved Buddha statues.",
      highlights: [
        "Gal Vihara Buddha statues",
        "Royal Palace ruins",
        "Parakrama Samudra reservoir",
        "UNESCO World Heritage Site",
        "Ancient audience halls",
      ],
      photos: [] as string[],
      isActive: true,
    },
    {
      name: "Matale",
      slug: "matale",
      region: "Central",
      description:
        "A verdant town in the central hills surrounded by spice gardens, the dramatic Knuckles Mountain Range, and the Riverston cliff viewpoints.",
      highlights: [
        "Knuckles Mountain Range",
        "Riverston viewpoints",
        "Spice gardens",
        "Aluvihare Rock Temple",
        "Sembuwatta Lake",
      ],
      photos: [] as string[],
      isActive: true,
    },
    {
      name: "Mahiyangana",
      slug: "mahiyangana",
      region: "Eastern Hills",
      description:
        "A sacred Buddhist town on the edge of the Vedda homeland, Mahiyangana is believed to be the first place the Buddha visited in Sri Lanka.",
      highlights: [
        "Mahiyangana Raja Maha Viharaya",
        "Vedda indigenous village",
        "Sorabora Wewa",
        "Scenic drives",
        "Gateway to Gal Oya",
      ],
      photos: [] as string[],
      isActive: true,
    },
    {
      name: "Gal Oya",
      slug: "gal-oya",
      region: "Eastern",
      description:
        "Home to Sri Lanka's largest reservoir, Senanayake Samudra, Gal Oya National Park offers unique boat safaris where elephants swim between islands.",
      highlights: [
        "Boat safari on Senanayake Samudra",
        "Swimming elephants",
        "Pristine wilderness",
        "Birdwatching",
        "Indigenous Vedda culture",
      ],
      photos: [] as string[],
      isActive: true,
    },
    {
      name: "Hatton",
      slug: "hatton",
      region: "Hill Country",
      description:
        "A hill country town at the heart of Sri Lanka's tea country, Hatton is the gateway to Adam's Peak and the Ceylon Tea Trails luxury bungalow experience.",
      highlights: [
        "Adam's Peak pilgrimage",
        "Ceylon Tea Trails",
        "Tea estate bungalows",
        "St. Clair's Falls",
        "Plantation heritage",
      ],
      photos: [] as string[],
      isActive: true,
    },
    {
      name: "Haputale",
      slug: "haputale",
      region: "Hill Country",
      description:
        "A narrow ridge town perched on the edge of Sri Lanka's southern escarpment, offering views from both coasts on a clear day and access to Lipton's famous Dambatenne estate.",
      highlights: [
        "Lipton's Seat viewpoint",
        "Dambatenne Tea Factory",
        "Adisham Bungalow",
        "Dramatic escarpment views",
        "Cool mountain climate",
      ],
      photos: [] as string[],
      isActive: true,
    },
    {
      name: "Udawalawe",
      slug: "udawalawe",
      region: "Southern",
      description:
        "One of Sri Lanka's best national parks for guaranteed elephant sightings, Udawalawe features open grasslands and is home to over 600 wild elephants.",
      highlights: [
        "Elephant safaris",
        "Elephant Transit Home",
        "600+ wild elephants",
        "Open grassland landscape",
        "Bird diversity",
      ],
      photos: [] as string[],
      isActive: true,
    },
    {
      name: "Hambantota",
      slug: "hambantota",
      region: "Southern",
      description:
        "A coastal district on Sri Lanka's southeastern tip featuring championship golf, salt pans, bird parks, and proximity to Yala and Bundala national parks.",
      highlights: [
        "Shangri-La Golf Resort",
        "Bundala National Park",
        "Salt pans",
        "Hambantota Bird Park",
        "Southern coast beaches",
      ],
      photos: [] as string[],
      isActive: true,
    },
    {
      name: "Hikkaduwa",
      slug: "hikkaduwa",
      region: "Southern Coast",
      description:
        "A vibrant beach town on the southern coast known for its coral reef, surf breaks, and lively nightlife, with a marine national park just offshore.",
      highlights: [
        "Coral reef snorkelling",
        "Surf breaks",
        "Marine National Park",
        "Beach nightlife",
        "Glass-bottom boat rides",
      ],
      photos: [] as string[],
      isActive: true,
    },
    {
      name: "Mirissa",
      slug: "mirissa",
      region: "Southern Coast",
      description:
        "A scenic crescent beach on the southern coast, Mirissa is Sri Lanka's premier whale watching destination and a popular spot for surfing and sunset views.",
      highlights: [
        "Blue whale watching",
        "Coconut Tree Hill",
        "Surfing",
        "Secret Beach snorkelling",
        "Sunset catamaran cruises",
      ],
      photos: [] as string[],
      isActive: true,
    },
    {
      name: "Sinharaja",
      slug: "sinharaja",
      region: "Southern Hills",
      description:
        "A UNESCO World Heritage rainforest and one of the last viable areas of primary tropical forest in Sri Lanka, home to over 50% of the island's endemic species.",
      highlights: [
        "UNESCO World Heritage rainforest",
        "Endemic wildlife",
        "Guided trekking",
        "Bird watching",
        "Mixed-species feeding flocks",
      ],
      photos: [] as string[],
      isActive: true,
    },
    {
      name: "Belihuloya",
      slug: "belihuloya",
      region: "Hill Country",
      description:
        "A quiet highland village in the Sabaragamuwa Province, Belihuloya offers treehouse accommodations, nature trails, and proximity to the Horton Plains.",
      highlights: [
        "Treehouse chalets",
        "Nature trails",
        "Samanala mountain",
        "Belihul Oya river",
        "Peaceful highland retreat",
      ],
      photos: [] as string[],
      isActive: true,
    },
  ];

  const destinations: Record<string, string> = {};
  for (const d of destinationData) {
    const dest = await prisma.destination.upsert({
      where: { slug: d.slug },
      update: { distanceFromColomboKm: distancesFromColombo[d.slug] ?? null },
      create: { ...d, distanceFromColomboKm: distancesFromColombo[d.slug] ?? null },
    });
    destinations[d.slug] = dest.id;
  }
  console.log(`  ${destinationData.length} destinations upserted.`);

  // ─── Packages ─────────────────────────────────────────────────────────────
  const packageData = [
    {
      name: "Heritage & Hill Country Escape",
      slug: "heritage-hill-country-escape",
      description:
        "Journey through Sri Lanka's misty highlands and ancient Cultural Triangle on a seven-day circuit of tea estates, sacred temples, and colonial-era railway towns. From the Temple of the Tooth in Kandy to the Nine Arch Bridge in Ella, every stop reveals a new layer of the island's rich heritage.",
      durationDays: 7,
      highlights: [
        "Scenic Kandy to Ella train journey",
        "Temple of the Tooth guided tour",
        "Tea factory visit in Nuwara Eliya",
        "Nine Arch Bridge at sunrise",
        "Sigiriya Rock Fortress climb",
      ],
      difficulty: "Easy",
      region: "Hill Country",
      isActive: true,
    },
    {
      name: "Golden Sands of the Southern Coast",
      slug: "golden-sands-southern-coast",
      description:
        "Unwind along Sri Lanka's sun-drenched southern coastline, from the UNESCO-listed Galle Fort to the whale watching waters of Mirissa and the coral reefs of Hikkaduwa. This seven-day beach escape blends colonial heritage walks with snorkelling, surfing, and sunset catamaran cruises.",
      durationDays: 7,
      highlights: [
        "Guided Galle Fort walking tour",
        "Blue whale watching from Mirissa",
        "Hikkaduwa coral reef snorkelling",
        "Coconut Tree Hill sunset",
        "Bentota water sports",
      ],
      difficulty: "Easy",
      region: "Southern Coast",
      isActive: true,
    },
    {
      name: "Boundaries in Paradise",
      slug: "boundaries-in-paradise",
      description:
        "A curated eight-day journey designed for travellers seeking a balanced mix of culture, nature, and relaxation across Sri Lanka's most iconic regions. Explore ancient ruins, hike misty highlands, and end with lazy beach days on the southern coast.",
      durationDays: 8,
      highlights: [
        "Sigiriya and Polonnaruwa UNESCO sites",
        "Kandy cultural immersion",
        "Hill country train ride",
        "Udawalawe elephant safari",
        "Southern beach finale in Mirissa",
      ],
      difficulty: "Easy",
      region: "Multi-region",
      isActive: true,
    },
    {
      name: "Jaffna Escape",
      slug: "jaffna-escape",
      description:
        "Venture north to the Tamil heartland on this nine-day cultural odyssey through Jaffna, Trincomalee, and the ancient cities of the Cultural Triangle. Discover Hindu kovils, colonial forts, pristine eastern beaches, and a cuisine found nowhere else on the island.",
      durationDays: 9,
      highlights: [
        "Nallur Kandaswamy Kovil ceremony",
        "Jaffna Fort and Public Library",
        "Pigeon Island snorkelling from Trincomalee",
        "Anuradhapura sacred city",
        "Nagadeepa Island pilgrimage",
      ],
      difficulty: "Moderate",
      region: "Northern & Cultural",
      isActive: true,
    },
    {
      name: "Honeymoon Package",
      slug: "honeymoon-package",
      description:
        "A ten-day romantic escape crafted for couples, weaving together boutique hill country retreats, private wildlife experiences, and secluded southern beaches. Candlelit dinners, spa treatments, and sunrise moments make every day feel like a celebration.",
      durationDays: 10,
      highlights: [
        "Private tea estate bungalow stay",
        "Couples Ayurveda spa retreat",
        "Sunset catamaran cruise in Mirissa",
        "Candlelit dinner at Galle Fort",
        "Hot air balloon ride over Sigiriya",
      ],
      difficulty: "Easy",
      region: "Multi-region",
      isActive: true,
    },
    {
      name: "Wildlife Getaway",
      slug: "wildlife-getaway",
      description:
        "Track leopards, swimming elephants, and exotic birdlife across four of Sri Lanka's premier national parks on this ten-day wilderness circuit. From Yala's thorny scrubland to Gal Oya's boat safaris and Udawalawe's open grasslands, every game drive brings a new encounter.",
      durationDays: 10,
      highlights: [
        "Yala leopard safari at dawn",
        "Gal Oya boat safari with swimming elephants",
        "Udawalawe Elephant Transit Home",
        "Wilpattu villu lake game drive",
        "Sinharaja rainforest bird walk",
      ],
      difficulty: "Easy",
      region: "Wildlife Circuit",
      isActive: true,
    },
    {
      name: "Elite Golf Escape",
      slug: "elite-golf-escape",
      description:
        "A fourteen-day luxury golf tour linking Sri Lanka's finest championship courses with five-star resort stays and cultural excursions. Play oceanfront fairways in Hambantota, highland greens in Nuwara Eliya, and finish with a spa retreat on the southern coast.",
      durationDays: 14,
      highlights: [
        "Shangri-La Hambantota championship course",
        "Victoria Golf & Country Resort in Kandy",
        "Nuwara Eliya Golf Club (est. 1889)",
        "Luxury resort accommodation throughout",
        "Guided Galle Fort heritage walk",
      ],
      difficulty: "Easy",
      region: "Multi-region",
      isActive: true,
    },
    {
      name: "Birdies by the Beach",
      slug: "birdies-by-the-beach",
      description:
        "A seven-day coastal golf getaway pairing beachside rounds with surf, seafood, and sunset relaxation along Sri Lanka's western and southern shores. Tee off with ocean views in the morning and unwind on golden sand by afternoon.",
      durationDays: 7,
      highlights: [
        "Oceanfront golf at Shangri-La Hambantota",
        "Beach relaxation in Bentota",
        "Hikkaduwa surf and snorkel session",
        "Galle Fort evening walk",
        "Fresh seafood dining on the coast",
      ],
      difficulty: "Easy",
      region: "Southern & Western",
      isActive: true,
    },
    {
      name: "Fairways and Greens",
      slug: "fairways-and-greens",
      description:
        "An eight-day hill country golf tour threading together highland courses, tea estate stays, and scenic train journeys through Sri Lanka's most dramatic landscapes. Play the colonial-era Nuwara Eliya links before descending through misty valleys to Kandy.",
      durationDays: 8,
      highlights: [
        "Nuwara Eliya Golf Club heritage round",
        "Victoria Golf & Country Resort",
        "Tea estate bungalow accommodation",
        "Scenic highland train journey",
        "Royal Botanical Gardens Peradeniya",
      ],
      difficulty: "Easy",
      region: "Hill Country & Western",
      isActive: true,
    },
    {
      name: "Golf Among the Misty Hills",
      slug: "golf-among-the-misty-hills",
      description:
        "A ten-day grand golf tour combining all of Sri Lanka's top courses with cultural highlights, wildlife safaris, and coastal relaxation. From the highlands of Nuwara Eliya to the championship fairways of Hambantota, this is the definitive Sri Lanka golf experience.",
      durationDays: 10,
      highlights: [
        "Three championship golf courses",
        "Yala National Park leopard safari",
        "Kandy Temple of the Tooth visit",
        "Southern coast beach days",
        "Luxury transfers throughout",
      ],
      difficulty: "Easy",
      region: "Multi-region",
      isActive: true,
    },
    {
      name: "Maldives Holidays",
      slug: "maldives-holidays",
      description:
        "Extend your Sri Lanka journey with a five-day Maldives add-on featuring overwater villas, world-class diving, and powder-white beaches. A short flight from Colombo delivers you to one of the most pristine island paradises on Earth.",
      durationDays: 5,
      highlights: [
        "Overwater villa accommodation",
        "World-class reef diving and snorkelling",
        "Sunset dolphin cruise",
        "Private sandbank picnic",
        "Spa treatments over the lagoon",
      ],
      difficulty: "Easy",
      region: "Maldives",
      isActive: true,
    },
    {
      name: "Throbbing Adventure Sri Lanka",
      slug: "throbbing-adventure",
      description:
        "A ten-day adrenaline-fuelled expedition for thrill-seekers, from white water rafting on the Kelani River and jungle canyoning in Kitulgala to Ella Rock summit hikes and mountain biking through tea country. Every day pushes the pace with a new outdoor challenge.",
      durationDays: 10,
      highlights: [
        "White water rafting on Kelani River",
        "Jungle canyoning and abseiling in Kitulgala",
        "Ella Rock summit hike at dawn",
        "Mountain biking through tea plantations",
        "Sinharaja rainforest trek",
      ],
      difficulty: "Challenging",
      region: "Hill Country & Southern",
      isActive: true,
    },
    {
      name: "Luxury Travel Sri Lanka",
      slug: "luxury-travel-sri-lanka",
      description:
        "A ten-day ultra-premium circuit of Sri Lanka's finest five-star properties, private guided experiences, and exclusive dining. Travel by seaplane, helicopter, and luxury vehicle as you explore ancient cities, misty tea estates, and secluded coastal retreats.",
      durationDays: 10,
      highlights: [
        "Five-star boutique hotel stays throughout",
        "Private helicopter transfer to Sigiriya",
        "Exclusive Galle Fort dinner experience",
        "Ceylon Tea Trails bungalow in Hatton",
        "Personal chauffeur and naturalist guide",
      ],
      difficulty: "Easy",
      region: "Multi-region",
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

  // ─── Package Items for Heritage & Hill Country Escape ─────────────────────
  // Only seed items if the package currently has none (idempotent)
  const hillCountryPkgId = packages["heritage-hill-country-escape"];
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
    console.log("  Heritage & Hill Country Escape package items created.");
  } else {
    console.log("  Heritage & Hill Country Escape package items already exist, skipping.");
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

    // Transport: daily vehicle charge (driver wages, vehicle wear) + per-km rate
    const transportTiers = [
      { tier: "standard",  peak: [60, 90],   shoulder: [50, 75],  "off-peak": [40, 60],  perKm: { peak: 0.45, shoulder: 0.38, "off-peak": 0.30 } },
      { tier: "premium",   peak: [100, 150],  shoulder: [85, 125], "off-peak": [70, 100], perKm: { peak: 0.75, shoulder: 0.63, "off-peak": 0.50 } },
      { tier: "luxury",    peak: [170, 280],  shoulder: [140, 230], "off-peak": [110, 180], perKm: { peak: 1.20, shoulder: 1.00, "off-peak": 0.80 } },
    ];

    const transportCards = transportTiers.flatMap((t) =>
      seasons.map((season) => ({
        itemType: BookingItemType.TRANSPORT,
        destinationId: null,
        tier: t.tier,
        season,
        minPrice: t[season][0],
        maxPrice: t[season][1],
        perKmRate: t.perKm[season],
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

  // ─── Destination Distances (pairwise matrix) ─────────────────────────────
  const existingDistances = await prisma.destinationDistance.count();
  if (existingDistances === 0) {
    const distancePairs: [string, string, number][] = [
      ["colombo", "kandy", 116], ["colombo", "sigiriya", 170],
      ["colombo", "anuradhapura", 200], ["colombo", "galle", 126],
      ["colombo", "bentota", 64], ["colombo", "ella", 200],
      ["colombo", "nuwara-eliya", 180], ["colombo", "yala", 305],
      ["colombo", "arugam-bay", 320], ["colombo", "kitulgala", 87],
      ["colombo", "wilpattu", 180],
      ["kandy", "sigiriya", 90], ["kandy", "ella", 140],
      ["kandy", "nuwara-eliya", 80], ["kandy", "anuradhapura", 140],
      ["kandy", "kitulgala", 75],
      ["sigiriya", "anuradhapura", 65], ["sigiriya", "kandy", 90],
      ["nuwara-eliya", "ella", 58],
      ["ella", "yala", 140], ["ella", "arugam-bay", 170],
      ["galle", "yala", 190], ["galle", "bentota", 65],
      ["galle", "ella", 180],
      ["yala", "arugam-bay", 130],
      ["bentota", "galle", 65],
      ["wilpattu", "anuradhapura", 60], ["wilpattu", "sigiriya", 120],
      ["kitulgala", "nuwara-eliya", 110], ["kitulgala", "ella", 150],
      // New destination pairs
      ["negombo", "colombo", 37], ["negombo", "kandy", 120],
      ["negombo", "sigiriya", 175],
      ["colombo", "chilaw", 80], ["chilaw", "kalpitiya", 85],
      ["colombo", "jaffna", 395], ["jaffna", "trincomalee", 200],
      ["trincomalee", "sigiriya", 150], ["trincomalee", "passikudah", 100],
      ["sigiriya", "polonnaruwa", 60], ["kandy", "matale", 26],
      ["sigiriya", "mahiyangana", 85], ["mahiyangana", "gal-oya", 95],
      ["kandy", "hatton", 65], ["nuwara-eliya", "hatton", 45],
      ["ella", "haputale", 35], ["ella", "udawalawe", 85],
      ["udawalawe", "yala", 100],
      ["colombo", "hikkaduwa", 100], ["galle", "hikkaduwa", 20],
      ["galle", "mirissa", 35], ["hikkaduwa", "mirissa", 50],
      ["colombo", "sinharaja", 130], ["udawalawe", "sinharaja", 60],
      ["nuwara-eliya", "belihuloya", 55],
      ["colombo", "hambantota", 240], ["yala", "hambantota", 40],
      ["galle", "hambantota", 120],
      ["kitulgala", "udawalawe", 110], ["gal-oya", "yala", 120],
      ["mirissa", "yala", 170],
      ["colombo", "udawalawe", 170], ["colombo", "mirissa", 150],
    ];

    const distanceData = distancePairs.flatMap(([from, to, km]) => {
      const fromId = destinations[from];
      const toId = destinations[to];
      if (!fromId || !toId) return [];
      return [
        { fromId, toId, distanceKm: km },
        { fromId: toId, toId: fromId, distanceKm: km },
      ];
    });

    const seen = new Set<string>();
    const deduped = distanceData.filter((d) => {
      const key = `${d.fromId}-${d.toId}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    await prisma.destinationDistance.createMany({ data: deduped });
    console.log(`  ${deduped.length} destination distances seeded.`);
  } else {
    console.log(`  Destination distances already exist (${existingDistances}), skipping.`);
  }

  // ─── Excursions ───────────────────────────────────────────────────────────
  const existingExcursions = await prisma.excursion.count();
  if (existingExcursions === 0) {
    const excursionData = [
      { name: "Yala Safari Drive", slug: "yala-safari-drive", dest: "yala", type: "safari", km: 80, desc: "Full-day jeep safari through Yala National Park Block 1" },
      { name: "Kataragama Temple Visit", slug: "kataragama-temple", dest: "yala", type: "cultural", km: 40, desc: "Visit to the sacred Kataragama Devalaya and surrounds" },
      { name: "Sigiriya Rock Fortress", slug: "sigiriya-rock-fortress", dest: "sigiriya", type: "cultural", km: 10, desc: "Climb the ancient rock fortress with guide" },
      { name: "Minneriya Safari", slug: "minneriya-safari", dest: "sigiriya", type: "safari", km: 30, desc: "Elephant gathering safari at Minneriya National Park" },
      { name: "Pidurangala Rock", slug: "pidurangala-rock", dest: "sigiriya", type: "nature", km: 8, desc: "Sunrise hike up Pidurangala for panoramic views of Sigiriya" },
      { name: "Temple of the Tooth", slug: "temple-of-tooth", dest: "kandy", type: "cultural", km: 5, desc: "Guided tour of Sri Dalada Maligawa" },
      { name: "Peradeniya Botanical Gardens", slug: "peradeniya-gardens", dest: "kandy", type: "nature", km: 8, desc: "Royal Botanical Gardens and spice garden visit" },
      { name: "Pinnawala Elephant Orphanage", slug: "pinnawala-elephants", dest: "kandy", type: "safari", km: 40, desc: "Visit to the elephant orphanage and river bathing" },
      { name: "Nine Arch Bridge Walk", slug: "nine-arch-bridge", dest: "ella", type: "nature", km: 10, desc: "Walk to the iconic Nine Arch Bridge at sunrise" },
      { name: "Little Adam's Peak Hike", slug: "little-adams-peak", dest: "ella", type: "nature", km: 5, desc: "Sunrise hike to Little Adam's Peak viewpoint" },
      { name: "Ella Rock Trek", slug: "ella-rock-trek", dest: "ella", type: "adventure", km: 12, desc: "Half-day guided trek to Ella Rock summit" },
      { name: "Horton Plains & World's End", slug: "horton-plains", dest: "nuwara-eliya", type: "nature", km: 35, desc: "Trek through Horton Plains to World's End precipice" },
      { name: "Tea Factory Tour", slug: "tea-factory-tour", dest: "nuwara-eliya", type: "cultural", km: 15, desc: "Visit a working tea factory and estate walk" },
      { name: "Galle Fort Walking Tour", slug: "galle-fort-tour", dest: "galle", type: "cultural", km: 5, desc: "Guided walking tour of the UNESCO-listed Galle Fort" },
      { name: "Unawatuna Beach Trip", slug: "unawatuna-beach", dest: "galle", type: "water-sport", km: 12, desc: "Beach day with snorkelling at Unawatuna" },
      { name: "Bentota River Safari", slug: "bentota-river-safari", dest: "bentota", type: "safari", km: 20, desc: "Boat safari on the Bentota River and mangroves" },
      { name: "Water Sports Package", slug: "bentota-water-sports", dest: "bentota", type: "water-sport", km: 5, desc: "Jet skiing, banana boat, and windsurfing at Bentota Beach" },
      { name: "White Water Rafting", slug: "kitulgala-rafting", dest: "kitulgala", type: "adventure", km: 15, desc: "Grade 3-4 rapids on the Kelani River" },
      { name: "Jungle Canyoning", slug: "kitulgala-canyoning", dest: "kitulgala", type: "adventure", km: 10, desc: "Canyoning and abseiling through jungle gorges" },
      { name: "Wilpattu Safari Drive", slug: "wilpattu-safari", dest: "wilpattu", type: "safari", km: 70, desc: "Full-day jeep safari through Wilpattu's villu lakes" },
      { name: "Arugam Bay Surf Lesson", slug: "arugam-bay-surf", dest: "arugam-bay", type: "water-sport", km: 5, desc: "Surf lesson at Main Point with instructor" },
      { name: "Kumana Lagoon Safari", slug: "kumana-lagoon-safari", dest: "arugam-bay", type: "safari", km: 45, desc: "Bird watching and wildlife safari at Kumana" },
    ];

    await prisma.excursion.createMany({
      data: excursionData.map((e) => ({
        name: e.name,
        slug: e.slug,
        destinationId: destinations[e.dest],
        type: e.type,
        distanceKm: e.km,
        description: e.desc,
        isActive: true,
      })),
    });
    console.log(`  ${excursionData.length} excursions seeded.`);
  } else {
    console.log(`  Excursions already exist (${existingExcursions}), skipping.`);
  }

  // ─── Blog Posts ──────────────────────────────────────────────────────────
  const existingPosts = await prisma.blogPost.count();
  if (existingPosts === 0) {
    await prisma.blogPost.createMany({
      data: [
        {
          title: "The Ultimate Guide to Sri Lanka's Scenic Train Journeys",
          slug: "ultimate-guide-sri-lanka-train-journeys",
          content: `<p>Sri Lanka's rail network was built by the British in the 1860s to move tea from the highlands to Colombo's port. Today, the same narrow-gauge tracks carry travellers through some of the most jaw-dropping scenery in Asia.</p><p>The crown jewel is the Kandy–Ella route. Over seven hours, the train climbs from the cultural capital through emerald tea plantations, crosses the famous Nine Arch Bridge, and ducks into tunnels carved through solid rock.</p><h3>When to ride</h3><p>The first-class observation car sells out weeks ahead — book at Colombo Fort station or through your hotel concierge. Second class is perfectly comfortable and the windows open for photos.</p><h3>Pro tip</h3><p>Sit on the right side heading south for the best valley views. The stretch between Haputale and Ella is the most dramatic — time your journey so you pass through in daylight.</p><p>We include this train journey in our Hill Country Explorer and Grand Tour packages, with reserved seats and a guide to narrate the passing landscapes.</p>`,
          excerpt: "From Kandy to Ella, the highland rail line is one of the most beautiful train rides on Earth. Here's everything you need to know before you board.",
          coverImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuA7yFEXyPuNX9h_GbgmSdd2qwI4JGC1uoPb7ulTfAcuU6WQF6HvDWujaf8QEbi-HXIPSi9Ar_221wIJRyI8Oc7J9YbONA7xBcrMWiP3j9sUxtS_xURw4mrwBaIxZ8YFeFDrWujeqMRLL2Z_yQq2sEuX2EIyjhd_ytbtIFiFgLpuMSox6uLPQ4pCNGmRMXN6AjrjBnRZaTcV7N1c8-P2ncWBgCmmQPApVYrL3GlPUK8xxdDNtop4B4tKepr0tLvqmw1IS4_2n1Kc2ko",
          author: "Kavinda Perera",
          category: "Travel Tips",
          readTime: "6 min",
          featured: true,
          isPublished: true,
          publishedAt: new Date("2026-05-10"),
        },
        {
          title: "Leopard Spotting in Yala: What to Expect on Your First Safari",
          slug: "leopard-spotting-yala-what-to-expect",
          content: `<p>Yala National Park sits on Sri Lanka's southeastern coast, a mosaic of thorny scrubland, rocky outcrops, and coastal lagoons. It's home to roughly 80 leopards in its most-visited Block 1 alone.</p><h3>Best time</h3><p>February to July, when the dry season concentrates animals around waterholes. Dawn drives (5:30 AM gate opening) give the best chances — leopards are most active in the cool early hours.</p><h3>What you'll see beyond leopards</h3><p>Herds of 30+ elephants, sloth bears raiding termite mounds, mugger crocodiles, and flocks of painted storks.</p><h3>Our approach</h3><p>We work with naturalist-guides who know individual leopards by name and territory. Our Wildlife Adventure package includes two full safari days with a guaranteed tracker jeep — not the crowded convoy experience.</p><h3>Kit list</h3><p>Binoculars, a 200mm+ lens, neutral-coloured clothing, and sunscreen. The park is hot and dusty — bring more water than you think you need.</p>`,
          excerpt: "Yala has the highest leopard density in the world — but seeing one still takes patience, timing, and the right guide.",
          coverImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuAvL9qQCZqkuUZZhDFPiuljSOElBzTS-i7kLp90dx9jPIRgvPItqhfxy9613-soZHzobTHli7BjWkH4-Haw9lP45E2wiW9j2dUftl84hUoLQpMhO1LIzUoQRk5nyTAmY78Y-IBlM5Mrog1JBI8zdp86HBVzmlXisZYgFH5lIspaZdstoAxqxQrnPxafv0B8S_p0e8P0tS2KZMFdCj6rUEkqe56zoOq8yXRaQE2XqbrLuXWXGtJVEbnTCZcpKa2KlGrKVElRaZGsohs",
          author: "Amara Silva",
          category: "Wildlife",
          readTime: "5 min",
          featured: true,
          isPublished: true,
          publishedAt: new Date("2026-04-28"),
        },
        {
          title: "A Weekend in Galle Fort: Where to Stay, Eat, and Explore",
          slug: "galle-fort-weekend-guide",
          content: `<p>Galle Fort is Sri Lanka's most atmospheric town — a UNESCO-listed walled enclave where 17th-century Dutch colonial architecture meets contemporary Sri Lankan creativity.</p><h3>Day 1</h3><p>Walk the ramparts at sunrise before the crowds. Start at the lighthouse, loop south past Flag Rock (sunset spot), and circle back via the Dutch Reformed Church. Lunch at a courtyard café — try the rice and curry at a family-run place on Pedlar Street.</p><h3>Day 2</h3><p>Browse the boutiques on Church Street for handmade jewellery and batik. Visit the Maritime Museum, then head to Unawatuna (10 min by tuk-tuk) for an afternoon on the beach.</p><h3>Where to stay</h3><p>Heritage boutique hotels inside the fort walls start around $120/night. For luxury, the converted warehouse hotels near the ramparts are stunning.</p><p>Galle is the perfect base for our Golden Southern Coast package — two days in the fort, then south to Mirissa and Bentota.</p>`,
          excerpt: "Cobblestone lanes, ocean ramparts, and the best crab curry on the island — your 48-hour Galle Fort itinerary.",
          coverImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuDiJOIXdRp0l7rGwM8eiDyKXWXVHTHtciFZ-YXdZS3Cd9Uo-jvjFfC09J1WRQpYmbcO1BEtchv6CUXXxjYi0Pj8O9AFnXORA-4OY6xP1sCWn2N6cEUxSy-Eggf1cODQjozh-4b2OecEaGjoTRnYKY5p2xzfvI7ykfVFCQobSh7YxsSpR8Jz3XPqWXMndy5ipi7S_5kAdrq6RJQjUewrywmX-gNn0HENvBLOT0nNjqBDC3yCoO4EmHmuMhnoLYkVsDUktQR6kRPhP2M",
          author: "Kavinda Perera",
          category: "Guides",
          readTime: "4 min",
          featured: false,
          isPublished: true,
          publishedAt: new Date("2026-04-15"),
        },
        {
          title: "When Is the Best Time to Visit Sri Lanka?",
          slug: "best-time-visit-sri-lanka",
          content: `<p>Sri Lanka's tropical climate means it's warm year-round, but rainfall patterns make timing important.</p><h3>Southwest monsoon (May–Sep)</h3><p>Rain hits the west and south coasts. Head east — Arugam Bay, Trincomalee, and Passikudah are dry and sunny.</p><h3>Northeast monsoon (Oct–Jan)</h3><p>Rain moves to the east. The south and west coasts — Galle, Mirissa, Bentota — are at their best.</p><h3>Shoulder sweet spot (Feb–Apr)</h3><p>The driest window across the whole island. Ideal for a full circuit. This is also peak season, so book early.</p><h3>Hill country</h3><p>Cooler year-round (15–25°C). Light rain possible any month, but mornings are usually clear — perfect for the train ride.</p><p>If you have flexibility, February to April gives the widest options. But we design trips for every season — just tell us your dates and we'll route you to the sunny side.</p>`,
          excerpt: "Sri Lanka has two monsoon seasons hitting opposite coasts — which means there's always a sunny side. Here's how to time your trip.",
          coverImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuBmyTIo8YOpdkZbjNE4Zb0suaLf9bdAU7twbbb6gP99Rnxc612XVWmI3SRy5DGonal9DQDihBwEKQR1sKvRwuQl9xWpSNmBnPHjnZtCU0dtxO3ivqyt4kfTEhJr5ZjH04EqJdKA_2wj6K3lpUdEMEbH7siAiTWks6W-LGz9tZMbKXbt6MK48V3T3oA7-PCIWDmkLqT6ma5Iga--4Y-rNqtL5K-96EGmEPesQ_l_EqrXPd7oJCEL-0z2vnZXeTwjUpjQkrwLobtgqB0",
          author: "Amara Silva",
          category: "Travel Tips",
          readTime: "4 min",
          featured: false,
          isPublished: true,
          publishedAt: new Date("2026-03-20"),
        },
        {
          title: "Sri Lanka Surf Guide: Best Breaks for Beginners and Beyond",
          slug: "sri-lanka-surf-guide-beginners",
          content: `<p>Sri Lanka is one of Asia's most accessible surf destinations. Warm water year-round, affordable board rentals, and breaks for every level.</p><h3>Weligama (South)</h3><p>The best learner wave in the country. A wide, sandy-bottomed bay with gentle rollers. Nov–Apr season. Lessons from $15/hour.</p><h3>Hiriketiya (South)</h3><p>A hidden horseshoe bay with a fun right-hander. Good for intermediates. Gets crowded in peak season.</p><h3>Arugam Bay (East)</h3><p>Sri Lanka's surf capital. Main Point is a long, clean right — world-class on its day. May–Sep season.</p><h3>Ahangama (South)</h3><p>Reef breaks for experienced surfers. The famous stilt fishermen are here too — iconic photo territory.</p><p>Bring a rash vest (the sun is fierce), reef booties for rocky entry points, and your own fins if you're particular.</p>`,
          excerpt: "From the mellow rollers of Weligama to the barrels of Arugam Bay — a coast-by-coast surf breakdown.",
          coverImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuA8byS4ur0YLqV8SSm4o61Threszjg0SP-yUsTDvcAY44XGdvHjfYtEmO8xWwdqa3zsomjFqQtUBs_9fbsmGchF1ijExKBw3GDStxTXIWmBvXvbxDv6CANoGNG0bkoO87RTXHyD4ukJA_5T3DRM_YVekWrf7hsdtWPwQcUDQCJMcTQlypRC92CKbLkIXkqjXuz_5A9pFehLUBwX50r4bRM-xaJmnv9KbcgYdGPhVhfT-gJNnbo0aSzlHkBhns9h19oZzn9JNx2vi6g",
          author: "Kavinda Perera",
          category: "Adventure",
          readTime: "5 min",
          featured: false,
          isPublished: true,
          publishedAt: new Date("2026-03-05"),
        },
      ],
    });
    console.log("  5 blog posts seeded.");
  } else {
    console.log(`  Blog posts already exist (${existingPosts} found), skipping.`);
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
