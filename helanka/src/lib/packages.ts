
export type TransportTier = "standard" | "super-luxury";

export interface Excursion {
  id: string;
  name: string;
  description: string;
  durationHours: number;
  destinationSlug: string;
}

export interface TransportTierOption {
  tier: TransportTier;
  label: string;
  description: string;
  vehicleType: string;
  features: string[];
  priceModifier: number;
}

export interface PackageInclusion {
  name: string;
  description: string;
}

export interface Package {
  slug: string;
  name: string;
  description: string;
  durationDays: number;
  difficulty: string;
  region: string;
  price: number;
  minGuests: number;
  maxGuests: number;
  highlights: string[];
  image: string;
  gallery: string[];
  itinerary: { day: number; title: string; description: string }[];
  excursions: Excursion[];
  transportTiers: TransportTierOption[];
  standardInclusions: PackageInclusion[];
}

/**
 * Derive max excursion picks from trip duration.
 * Day 1 (arrival) and 1 rest day per 4 days are excluded.
 * 6 days → 5, 10 days → 8, 12 days → 9.
 */
export function getExcursionCap(days: number): number {
  return Math.max(1, days - 1 - Math.floor(Math.max(0, days - 3) / 4));
}

export const STANDARD_INCLUSIONS: PackageInclusion[] = [
  {
    name: "Airport Pickup & Drop-off",
    description:
      "Meet-and-greet at Bandaranaike International Airport on arrival and departure.",
  },
  {
    name: "Private Chauffeur",
    description:
      "Dedicated English-speaking driver for the entire duration of your trip.",
  },
  {
    name: "Multilingual National Guide",
    description:
      "Licensed national guide with fluency in English, French, German, or Mandarin.",
  },
];

const TRANSPORT_TIERS: TransportTierOption[] = [
  {
    tier: "standard",
    label: "Standard",
    description: "Comfortable air-conditioned transport for your journey.",
    vehicleType: "Toyota KDH Van",
    features: [
      "Air conditioning",
      "Ample luggage space",
      "Bottled water on board",
      "Phone charging ports",
    ],
    priceModifier: 0,
  },
  {
    tier: "super-luxury",
    label: "Super Luxury",
    description:
      "Premium vehicle with luxury amenities for a first-class experience.",
    vehicleType: "Mercedes V-Class",
    features: [
      "Leather reclining seats",
      "On-board Wi-Fi",
      "Mini fridge with refreshments",
      "Noise-cancelling cabin",
      "Premium sound system",
      "Tinted privacy glass",
    ],
    priceModifier: 400,
  },
];

// ---------------------------------------------------------------------------
// ALL EXCURSIONS - real curated data across all destinations
// ---------------------------------------------------------------------------

export const ALL_EXCURSIONS: Excursion[] = [
  // --- Colombo ---
  { id: "col-1",  name: "Colombo City Tour",                      description: "A sweeping guided drive and walk through Colombo's colonial landmarks, modern skyline, and vibrant neighbourhoods.", durationHours: 4,   destinationSlug: "colombo" },
  { id: "col-2",  name: "Gangaramaya Temple",                     description: "Explore the eclectic and sacred Gangaramaya Temple, one of Colombo's most important Buddhist shrines, filled with art and antiquities.", durationHours: 1.5, destinationSlug: "colombo" },
  { id: "col-3",  name: "Lotus Tower",                            description: "Ascend South Asia's tallest tower for 360-degree panoramic views of Colombo and the Indian Ocean coastline.", durationHours: 1.5, destinationSlug: "colombo" },
  { id: "col-4",  name: "Independence Square",                    description: "Visit the grand open-air monument celebrating Sri Lanka's 1948 independence, set within beautifully landscaped gardens.", durationHours: 1,   destinationSlug: "colombo" },
  { id: "col-5",  name: "Pettah Market Experience",               description: "Immerse yourself in the sensory overload of Pettah Bazaar, Sri Lanka's oldest and busiest street market.", durationHours: 2,   destinationSlug: "colombo" },
  { id: "col-6",  name: "Dutch Hospital Precinct",                description: "Stroll through the beautifully restored 17th-century Dutch Hospital, now home to upscale restaurants and boutiques.", durationHours: 1.5, destinationSlug: "colombo" },
  { id: "col-7",  name: "Galle Face Green",                       description: "Enjoy a classic Colombo evening on the iconic seafront promenade with street food stalls and ocean breezes.", durationHours: 1.5, destinationSlug: "colombo" },
  { id: "col-8",  name: "Colombo National Museum",                description: "Discover Sri Lanka's finest collection of royal regalia, ancient artefacts, and natural history exhibits in the capital's flagship museum.", durationHours: 2,   destinationSlug: "colombo" },
  { id: "col-9",  name: "Red Mosque",                             description: "Visit the striking red-and-white Jami Ul-Alfar Mosque, one of Colombo's most photogenic colonial-era landmarks.", durationHours: 1,   destinationSlug: "colombo" },
  { id: "col-10", name: "Colombo Port City Drive",                description: "A guided drive through the futuristic Port City reclamation development reshaping Colombo's waterfront.", durationHours: 1.5, destinationSlug: "colombo" },
  { id: "col-11", name: "Shopping Excursions",                    description: "Curated shopping tour covering Colombo's best malls, fabric stores, gem shops, and local design boutiques.", durationHours: 3,   destinationSlug: "colombo" },
  { id: "col-12", name: "Colombo Nightlife & Casino Experience",  description: "A guided evening through Colombo's rooftop bars, live music venues, and world-class casino floors.", durationHours: 4,   destinationSlug: "colombo" },
  { id: "col-13", name: "Street Food Tours",                      description: "Walk the backstreets of Colombo tasting kottu roti, hoppers, isso wadé, and fresh king coconut with a local foodie guide.", durationHours: 3,   destinationSlug: "colombo" },
  { id: "col-14", name: "Sunset Dining Experiences",              description: "Private sunset dinner at one of Colombo's most celebrated rooftop or beachfront restaurants with curated Sri Lankan cuisine.", durationHours: 2.5, destinationSlug: "colombo" },

  // --- Negombo ---
  { id: "neg-1",  name: "Negombo Lagoon Boat Ride",               description: "A peaceful guided boat ride across the Negombo Lagoon, spotting birds, crab nets, and traditional fishing craft.", durationHours: 2,   destinationSlug: "negombo" },
  { id: "neg-2",  name: "Muthurajawela Marsh Safari",             description: "Guided boat safari through the largest coastal peat-bog wetland in South Asia, rich with water birds and rare flora.", durationHours: 2.5, destinationSlug: "negombo" },
  { id: "neg-3",  name: "Dutch Canal Tour",                       description: "Cruise along the historic 17th-century Dutch Canal, tracing the colonial waterway that once linked Negombo to Colombo.", durationHours: 2,   destinationSlug: "negombo" },
  { id: "neg-4",  name: "Fish Market Visit",                      description: "An early-morning visit to Negombo's famous fish market, where the overnight catch is auctioned at dawn in a flurry of colour and noise.", durationHours: 1.5, destinationSlug: "negombo" },
  { id: "neg-5",  name: "Catamaran Sailing",                      description: "Set sail on a traditional outrigger catamaran with local fishermen for a hands-on experience on the open sea.", durationHours: 2.5, destinationSlug: "negombo" },
  { id: "neg-6",  name: "Beach Relaxation",                       description: "A curated beach day on Negombo's long sandy shore with sun loungers, fresh seafood, and ocean swimming.", durationHours: 4,   destinationSlug: "negombo" },
  { id: "neg-7",  name: "Cycling Through Fishing Villages",       description: "Pedal through Negombo's colourful Catholic fishing villages, passing churches, boat yards, and roadside toddy tappers.", durationHours: 3,   destinationSlug: "negombo" },
  { id: "neg-8",  name: "Lagoon Crab & Seafood Experience",       description: "A hands-on crab fishing session on the lagoon followed by a freshly prepared seafood feast with local families.", durationHours: 3,   destinationSlug: "negombo" },
  { id: "neg-9",  name: "Sunset Lagoon Cruise",                   description: "Glide across the glittering Negombo Lagoon at dusk on a private boat with drinks and snacks as the sky turns gold.", durationHours: 2,   destinationSlug: "negombo" },

  // --- Kandy ---
  { id: "kan-1",  name: "Temple of the Sacred Tooth Relic",       description: "Attend the evening puja ceremony at Sri Lanka's most sacred Buddhist shrine, housing the relic of the Buddha's tooth.", durationHours: 2,   destinationSlug: "kandy" },
  { id: "kan-2",  name: "Kandy City Tour",                        description: "A guided walk through Kandy's historic centre, including the lake, markets, colonial architecture, and sacred sites.", durationHours: 3,   destinationSlug: "kandy" },
  { id: "kan-3",  name: "Royal Botanical Gardens – Peradeniya",   description: "Explore 150 acres of tropical orchids, spice groves, and giant Java fig trees at Sri Lanka's premier botanical garden.", durationHours: 3,   destinationSlug: "kandy" },
  { id: "kan-4",  name: "Kandy Cultural Dance Show",              description: "A private performance of traditional Kandyan dance and drumming, including fire-walking and plate-spinning acts.", durationHours: 1.5, destinationSlug: "kandy" },
  { id: "kan-5",  name: "Bahirawakanda Buddha Statue",            description: "Climb to the hilltop white Buddha statue overlooking Kandy for sweeping views of the city and surrounding hills.", durationHours: 1,   destinationSlug: "kandy" },
  { id: "kan-6",  name: "Gem Museum & Lapidary Visit",            description: "Tour a working gem museum and lapidary workshop to discover Sri Lanka's world-famous sapphires, rubies, and cat's-eyes.", durationHours: 1.5, destinationSlug: "kandy" },
  { id: "kan-7",  name: "Tea Factory & Tea Plantation Tour",      description: "Visit a working highland tea estate and factory to trace the journey from leaf to cup with a tasting session.", durationHours: 3,   destinationSlug: "kandy" },
  { id: "kan-8",  name: "Ambuluwawa Tower Excursion",             description: "Drive to the unique helical-staircase tower atop Ambuluwawa Hill, surrounded by bio-diversity reserve forest.", durationHours: 3,   destinationSlug: "kandy" },
  { id: "kan-9",  name: "Knuckles Mountain Trekking",             description: "A guided trek into the UNESCO Knuckles Mountain Range, a pristine wilderness of cloud forest, streams, and rare wildlife.", durationHours: 6,   destinationSlug: "kandy" },
  { id: "kan-10", name: "Riverston Excursion",                    description: "Drive to Riverston's dramatic ridge viewpoints, known as the 'Mini World's End', for staggering highland vistas.", durationHours: 4,   destinationSlug: "kandy" },
  { id: "kan-11", name: "Spice Garden Visit",                     description: "A guided walk through a traditional spice garden to discover cinnamon, cardamom, pepper, and nutmeg growing in their natural habitat.", durationHours: 1.5, destinationSlug: "kandy" },
  { id: "kan-12", name: "Traditional Kandyan Cooking Experience", description: "A hands-on cooking class with a local family learning to prepare rice and curry, pol sambol, and milk hoppers.", durationHours: 3,   destinationSlug: "kandy" },
  { id: "kan-13", name: "Scenic Train Ride (Kandy–Ella)",         description: "Board the world-famous blue train for the spectacular Highland Railway journey through mist, tea estates, and ravines.", durationHours: 7,   destinationSlug: "kandy" },
  { id: "kan-14", name: "Hanthana Mountain Hiking",               description: "A guided half-day hike through the forested Hanthana Range, offering sweeping views over Kandy valley.", durationHours: 4,   destinationSlug: "kandy" },
  { id: "kan-15", name: "Udawattakele Forest Walk",               description: "A tranquil guided walk through Kandy's royal forest sanctuary, home to monkeys, birds, and ancient rock hermitages.", durationHours: 2,   destinationSlug: "kandy" },

  // --- Sigiriya / Dambulla ---
  { id: "sig-1",  name: "Sigiriya Rock Fortress Climb",           description: "Climb the iconic 5th-century rock citadel through terraced gardens, frescoes, and the lion's paw gateway to summit palace ruins.", durationHours: 3.5, destinationSlug: "sigiriya" },
  { id: "sig-2",  name: "Pidurangala Rock Hiking",                description: "Hike the neighbouring Pidurangala Rock for the most celebrated aerial view of Sigiriya and the surrounding forest canopy.", durationHours: 2.5, destinationSlug: "sigiriya" },
  { id: "sig-3",  name: "Dambulla Cave Temple",                   description: "Visit the largest and best-preserved cave temple complex in Sri Lanka, adorned with 153 Buddha statues and ancient murals.", durationHours: 2,   destinationSlug: "sigiriya" },
  { id: "sig-4",  name: "Village Safari Experience",              description: "An immersive bullock-cart and tuk-tuk tour through traditional village life, paddy fields, pottery, and home cooking.", durationHours: 3,   destinationSlug: "sigiriya" },
  { id: "sig-5",  name: "Bullock Cart Ride",                      description: "A slow, charming ride through the Sigiriya countryside on a traditional ox-drawn cart with a village family.", durationHours: 1.5, destinationSlug: "sigiriya" },
  { id: "sig-6",  name: "Catamaran Ride on Village Lake",         description: "Glide across a calm village reservoir on a wooden catamaran as the sun sets behind Sigiriya Rock.", durationHours: 1.5, destinationSlug: "sigiriya" },
  { id: "sig-7",  name: "Traditional Sri Lankan Village Lunch",   description: "Enjoy a multi-dish home-cooked Sri Lankan rice and curry lunch with a local village family in their traditional homestead.", durationHours: 2,   destinationSlug: "sigiriya" },
  { id: "sig-8",  name: "Minneriya National Park Safari",         description: "Jeep safari to Minneriya Tank, famous for 'The Gathering', one of Asia's greatest elephant congregations.", durationHours: 4,   destinationSlug: "sigiriya" },
  { id: "sig-9",  name: "Kaudulla National Park Safari",          description: "Afternoon game drive at Kaudulla, a quieter alternative to Minneriya for excellent elephant herds and birdlife.", durationHours: 3.5, destinationSlug: "sigiriya" },
  { id: "sig-10", name: "Hurulu Eco Park Safari",                 description: "Explore the UNESCO Hurulu Forest Reserve on a guided jeep safari through dry-zone jungle rich with elephants and deer.", durationHours: 3,   destinationSlug: "sigiriya" },
  { id: "sig-11", name: "Hot Air Ballooning",                     description: "Drift silently above Sigiriya's ancient landscape at sunrise on a private hot-air balloon for unparalleled aerial views.", durationHours: 3,   destinationSlug: "sigiriya" },
  { id: "sig-12", name: "Ritigala Forest Monastery",              description: "Trek through dense forest to discover the atmospheric ruins of the ancient forest hermitage of Ritigala.", durationHours: 3.5, destinationSlug: "sigiriya" },
  { id: "sig-13", name: "Ayurvedic Village Experiences",          description: "A holistic village Ayurveda session with herbal garden tour, consultation, and traditional treatments in a rural setting.", durationHours: 3,   destinationSlug: "sigiriya" },
  { id: "sig-14", name: "Cycling Around Sigiriya Countryside",    description: "Pedal through the flat, scenic Sigiriya countryside on a guided cycling tour past lakes, temples, and farmer villages.", durationHours: 3,   destinationSlug: "sigiriya" },
  { id: "sig-15", name: "Sigiriya Museum Visit",                  description: "Explore the modern on-site museum detailing the history, archaeology, and royal legends of the Sigiriya citadel.", durationHours: 1.5, destinationSlug: "sigiriya" },

  // --- Ella ---
  { id: "ella-1",  name: "Nine Arch Bridge",                      description: "Visit the iconic nine-arched colonial viaduct at golden hour and watch the blue train roll across the jungle ravine.", durationHours: 2,   destinationSlug: "ella" },
  { id: "ella-2",  name: "Little Adam's Peak Hiking",             description: "A gentle, rewarding hike through tea estates to a summit with sweeping 360-degree views of the Ella Gap.", durationHours: 2.5, destinationSlug: "ella" },
  { id: "ella-3",  name: "Ella Rock Trekking",                    description: "A half-day trek through jungle and tea plantation to the dramatic Ella Rock summit for panoramic highland views.", durationHours: 5,   destinationSlug: "ella" },
  { id: "ella-4",  name: "Ravana Falls",                          description: "Visit the wide, cascading Ravana Falls, one of Sri Lanka's broadest waterfalls, steeped in Ramayana legend.", durationHours: 1,   destinationSlug: "ella" },
  { id: "ella-5",  name: "Ravana Cave",                           description: "Explore the legendary cave in the hillside above Ella, mythologically linked to King Ravana of the Ramayana.", durationHours: 1.5, destinationSlug: "ella" },
  { id: "ella-6",  name: "Flying Ravana Zipline",                 description: "Soar over the valley floor on one of Asia's longest ziplines for an adrenaline-charged perspective of the Ella highlands.", durationHours: 2,   destinationSlug: "ella" },
  { id: "ella-7",  name: "Tea Plantation Visits",                 description: "Walk through a working Ella tea estate and meet the pluckers, before a guided factory tour and estate tasting.", durationHours: 2.5, destinationSlug: "ella" },
  { id: "ella-8",  name: "Demodara Loop",                        description: "Walk across or observe the Demodara railway loop, an engineering marvel where the train passes over its own tunnel.", durationHours: 1.5, destinationSlug: "ella" },
  { id: "ella-9",  name: "ATV Adventure Experiences",            description: "Power through jungle trails and tea estate roads on an all-terrain quad bike for a thrilling off-road experience.", durationHours: 2,   destinationSlug: "ella" },
  { id: "ella-10", name: "Scenic Train Journey",                  description: "Board the celebrated Hill Country train for a window-seat journey through tunnels, tea estates, and mountain mist.", durationHours: 3,   destinationSlug: "ella" },
  { id: "ella-11", name: "Sunrise Viewpoints",                    description: "Rise before dawn and hike to Ella's finest ridge-top viewpoint to watch the sun emerge over the Eastern Province plains.", durationHours: 2,   destinationSlug: "ella" },
  { id: "ella-12", name: "Cafe & Chill Experiences",             description: "A curated half-day of Ella's best rooftop cafes, artisan coffee spots, and scenic terraced restaurants.", durationHours: 2.5, destinationSlug: "ella" },

  // --- Nuwara Eliya ---
  { id: "ne-1",  name: "Tea Plantation & Factory Tours",          description: "Tour a colonial-era Nuwara Eliya tea estate from leaf to cup, with a factory walkthrough and high-altitude tasting session.", durationHours: 3,   destinationSlug: "nuwara-eliya" },
  { id: "ne-2",  name: "Gregory Lake Activities",                 description: "Enjoy boating, cycling, and picnicking beside the beautiful Gregory Lake in the heart of Little England.", durationHours: 2.5, destinationSlug: "nuwara-eliya" },
  { id: "ne-3",  name: "Hakgala Botanical Gardens",              description: "Walk through the terraced Hakgala gardens, set at 1,700m and famous for roses, ferns, and colonial-era plant collections.", durationHours: 2,   destinationSlug: "nuwara-eliya" },
  { id: "ne-4",  name: "Seetha Amman Temple",                    description: "Visit the sacred Hindu temple near Hakgala, traditionally associated with Sita's captivity during the Ramayana epic.", durationHours: 1,   destinationSlug: "nuwara-eliya" },
  { id: "ne-5",  name: "Strawberry Farm Visits",                 description: "Pick fresh strawberries at a highland farm and enjoy locally made strawberry jam and juice in the cool hill air.", durationHours: 1.5, destinationSlug: "nuwara-eliya" },
  { id: "ne-6",  name: "Horton Plains National Park",            description: "Trek through the cloud-forest plateau of Horton Plains, one of Asia's most important montane ecosystems.", durationHours: 4,   destinationSlug: "nuwara-eliya" },
  { id: "ne-7",  name: "World's End Trek",                       description: "Hike to the sheer 880-metre cliff drop at World's End on the edge of Horton Plains for a view across half of Sri Lanka.", durationHours: 5,   destinationSlug: "nuwara-eliya" },
  { id: "ne-8",  name: "Colonial City Walk",                     description: "A guided walking tour of Nuwara Eliya's colonial legacy, including the Hill Club, Grand Hotel, post office, and English market.", durationHours: 2,   destinationSlug: "nuwara-eliya" },
  { id: "ne-9",  name: "Horse Riding",                           description: "Ride through scenic highland trails and tea estate paths on horseback with an experienced Nuwara Eliya guide.", durationHours: 2,   destinationSlug: "nuwara-eliya" },
  { id: "ne-10", name: "Waterfall Excursions",                   description: "Visit a curated selection of the hill country's most dramatic waterfalls, including Lovers Leap and Devon Falls.", durationHours: 3,   destinationSlug: "nuwara-eliya" },
  { id: "ne-11", name: "High Tea Experiences",                   description: "Savour traditional high tea with freshly brewed estate tea, scones, and pastries at a grand colonial hill-country property.", durationHours: 2,   destinationSlug: "nuwara-eliya" },

  // --- Yala ---
  { id: "yala-1",  name: "Yala National Park Safari",            description: "Dawn jeep safari through Yala's Block 1, the highest leopard density on Earth, plus elephants, bears, and 200 bird species.", durationHours: 4,   destinationSlug: "yala" },
  { id: "yala-2",  name: "Leopard Tracking Experiences",         description: "A specialist-guided leopard tracking safari with an expert naturalist who reads spoor, calls, and territorial behaviour.", durationHours: 5,   destinationSlug: "yala" },
  { id: "yala-3",  name: "Kataragama Temple Visit",              description: "Visit the sacred multi-faith Kataragama complex on the Yala border, revered by Buddhists, Hindus, and Muslims alike.", durationHours: 2,   destinationSlug: "yala" },
  { id: "yala-4",  name: "Sithulpawwa Rock Temple",              description: "Climb to the ancient 2nd-century BC cave monastery on a granite inselberg deep inside the Yala wilderness.", durationHours: 2.5, destinationSlug: "yala" },
  { id: "yala-5",  name: "Bundala Bird Watching Safari",         description: "A guided birdwatching excursion through Bundala's flamingo flats, lagoons, and coastal dunes. Bundala is a Ramsar wetland site.", durationHours: 3.5, destinationSlug: "yala" },
  { id: "yala-6",  name: "Camping Safari Experiences",           description: "An overnight glamping safari inside the Yala buffer zone, sleeping under stars to the sounds of the wilderness.", durationHours: 18,  destinationSlug: "yala" },
  { id: "yala-7",  name: "Sunrise & Sunset Safari Drives",       description: "Twin golden-hour drives to experience Yala's wildlife during the most active periods of dawn and dusk.", durationHours: 4,   destinationSlug: "yala" },

  // --- Bentota ---
  { id: "ben-1",  name: "Bentota River Safari",                  description: "Cruise the Bentota River estuary past mangroves, monitor lizards, kingfishers, and traditional fishing huts.", durationHours: 2,   destinationSlug: "bentota" },
  { id: "ben-2",  name: "Water Sports",                          description: "Jet-skiing, wakeboarding, banana boat rides, and windsurfing on the famous Bentota water sports lagoon.", durationHours: 3,   destinationSlug: "bentota" },
  { id: "ben-3",  name: "Turtle Hatchery Visit",                 description: "Visit a Bentota turtle conservation hatchery, learn about five sea turtle species, and release hatchlings at dusk.", durationHours: 1.5, destinationSlug: "bentota" },
  { id: "ben-4",  name: "Madu River Safari",                     description: "A guided boat ride through the Madu Ganga lagoon's winding mangrove channels, cinnamon islands, and fish therapy pools.", durationHours: 2.5, destinationSlug: "bentota" },
  { id: "ben-5",  name: "Cinnamon Island Visit",                 description: "Stop at a river island where cinnamon is grown, harvested, and peeled by hand using traditional techniques.", durationHours: 1,   destinationSlug: "bentota" },
  { id: "ben-6",  name: "Spa & Wellness Experiences",            description: "A curated Ayurvedic or Swedish spa session at one of Bentota's celebrated beachfront wellness retreats.", durationHours: 2.5, destinationSlug: "bentota" },
  { id: "ben-7",  name: "Deep Sea Fishing",                      description: "A chartered deep-sea fishing excursion off the Bentota coast targeting tuna, barracuda, and dorado.", durationHours: 5,   destinationSlug: "bentota" },
  { id: "ben-8",  name: "Mangrove Boat Tours",                   description: "A quiet guided paddle through the mangrove forest of the Madu Ganga, spotting wildlife and rare bird species.", durationHours: 2,   destinationSlug: "bentota" },

  // --- Galle ---
  { id: "gal-1",  name: "Galle Fort Walking Tour",               description: "A guided 2-hour walking tour through the UNESCO ramparts, Dutch architecture, lighthouse, and artisan lanes of Galle Fort.", durationHours: 2,   destinationSlug: "galle" },
  { id: "gal-2",  name: "Dutch Colonial Architecture Tour",      description: "An in-depth architectural tour of Galle Fort's finest Dutch colonial buildings with a heritage conservation expert.", durationHours: 2,   destinationSlug: "galle" },
  { id: "gal-3",  name: "Lighthouse Visit",                      description: "Visit the 1848 Galle Lighthouse at Flag Rock for panoramic ocean views and a glimpse into maritime history.", durationHours: 1,   destinationSlug: "galle" },
  { id: "gal-4",  name: "Cafe & Boutique Experiences",           description: "A leisurely guided tour of Galle Fort's finest independent cafes, galleries, and design boutiques within the ramparts.", durationHours: 2.5, destinationSlug: "galle" },
  { id: "gal-5",  name: "Whale Watching",                        description: "Early morning boat excursion from Mirissa or Galle to spot blue whales, sperm whales, and spinner dolphins.", durationHours: 4,   destinationSlug: "galle" },
  { id: "gal-6",  name: "Cooking Classes",                       description: "Learn to prepare authentic Sri Lankan rice and curry, pol roti, and fresh coconut sambol in a Galle Fort heritage kitchen.", durationHours: 3,   destinationSlug: "galle" },
  { id: "gal-7",  name: "Cycling Tours",                         description: "A scenic cycling tour along the southern coast from Galle Fort to Unawatuna, passing beaches, temples, and fishing hamlets.", durationHours: 3,   destinationSlug: "galle" },
  { id: "gal-8",  name: "Southern Coast Beach Excursions",       description: "A curated coastal day trip covering Jungle Beach, Unawatuna Bay, and the stilt fishermen of Koggala.", durationHours: 5,   destinationSlug: "galle" },

  // --- Mirissa ---
  { id: "mir-1",  name: "Blue Whale Watching",                   description: "An early morning pelagic boat excursion to spot blue whales off Sri Lanka's southern tip.", durationHours: 4,   destinationSlug: "mirissa" },
  { id: "mir-2",  name: "Dolphin Watching Cruise",               description: "Spot large pods of spinner and bottlenose dolphins leaping alongside the boat in the warm Indian Ocean waters.", durationHours: 3,   destinationSlug: "mirissa" },
  { id: "mir-3",  name: "Surfing at Mirissa",                    description: "A surf lesson or guided session at Mirissa's consistent beach break, suitable for beginners and intermediate surfers.", durationHours: 2,   destinationSlug: "mirissa" },
  { id: "mir-4",  name: "Coconut Tree Hill Sunset",              description: "Walk to the famous Instagram viewpoint where coconut palms arch over the bay for the perfect Mirissa sunset shot.", durationHours: 1.5, destinationSlug: "mirissa" },
  { id: "mir-5",  name: "Secret Beach Snorkelling",              description: "Snorkel over the coral reef at Mirissa's hidden Secret Beach, accessed by a short coastal walk from the main bay.", durationHours: 2,   destinationSlug: "mirissa" },
  { id: "mir-6",  name: "Sunset Catamaran Cruise",               description: "Private catamaran cruise along the Mirissa coast at sunset, with drinks, canapés, and dolphin sightings on the horizon.", durationHours: 2,   destinationSlug: "mirissa" },
  { id: "mir-7",  name: "Beachside Seafood BBQ",                 description: "A private seafood barbecue on the beach featuring freshly caught tuna, prawns, and lobster grilled over open coals.", durationHours: 2.5, destinationSlug: "mirissa" },

  // --- Pekoe Trail (Stages 1–22) ---
  // Stages 1–4 → kandy
  { id: "pekoe-1",  name: "Pekoe Trail Stage 1",                 description: "Begin Sri Lanka's iconic long-distance tea trail from Nuwara Eliya's Shanthipura with sweeping highland panoramas.", durationHours: 5, destinationSlug: "kandy" },
  { id: "pekoe-2",  name: "Pekoe Trail Stage 2",                 description: "Trek through immaculate tea carpets and forested ridges on Stage 2 of Sri Lanka's premier long-distance walking trail.", durationHours: 5, destinationSlug: "kandy" },
  { id: "pekoe-3",  name: "Pekoe Trail Stage 3",                 description: "Follow ancient estate paths through rolling tea fields and small villages on a rewarding Stage 3 highland walk.", durationHours: 5, destinationSlug: "kandy" },
  { id: "pekoe-4",  name: "Pekoe Trail Stage 4",                 description: "Stage 4 winds through waterfalls, cloud forest patches, and working tea estates on the descent toward Hatton.", durationHours: 6, destinationSlug: "kandy" },
  // Stages 5–10 → nuwara-eliya
  { id: "pekoe-5",  name: "Pekoe Trail Stage 5",                 description: "A spectacular day's walk through Norwood's dramatic highland terrain, crossing streams and ridge-top viewpoints.", durationHours: 5, destinationSlug: "nuwara-eliya" },
  { id: "pekoe-6",  name: "Pekoe Trail Stage 6",                 description: "Trek across sweeping Dickoya and Bogawantalawa tea carpets with views across the valley to Nuwara Eliya's peaks.", durationHours: 5, destinationSlug: "nuwara-eliya" },
  { id: "pekoe-7",  name: "Pekoe Trail Stage 7",                 description: "Stage 7 traverses the cloud-forest boundary above Bogawantalawa, passing waterfalls and misty jungle edges.", durationHours: 6, destinationSlug: "nuwara-eliya" },
  { id: "pekoe-8",  name: "Pekoe Trail Stage 8",                 description: "Walk through some of Sri Lanka's finest high-grown tea country on the Stage 8 ridge between Bogawantalawa and Dimbula.", durationHours: 5, destinationSlug: "nuwara-eliya" },
  { id: "pekoe-9",  name: "Pekoe Trail Stage 9",                 description: "A gentle descent through Dimbula's colonial bungalows and estate roads, with abundant birdlife along the way.", durationHours: 5, destinationSlug: "nuwara-eliya" },
  { id: "pekoe-10", name: "Pekoe Trail Stage 10",                description: "Stage 10 approaches Nuwara Eliya through Agra Oya Valley, crossing rivers and emerging onto the hill station plateau.", durationHours: 5, destinationSlug: "nuwara-eliya" },
  // Stages 11–15 → ella
  { id: "pekoe-11", name: "Pekoe Trail Stage 11",                description: "Begin the southern arc of the Pekoe Trail, walking from Nuwara Eliya toward the Ambewela highlands with alpine scenery.", durationHours: 5, destinationSlug: "ella" },
  { id: "pekoe-12", name: "Pekoe Trail Stage 12",                description: "Trek through Ambewela's cattle farms and pine forests, with Horton Plains looming on the horizon.", durationHours: 5, destinationSlug: "ella" },
  { id: "pekoe-13", name: "Pekoe Trail Stage 13",                description: "Stage 13 crosses the escarpment edge above Haputale, with vast lowland views stretching to the eastern plains.", durationHours: 6, destinationSlug: "ella" },
  { id: "pekoe-14", name: "Pekoe Trail Stage 14",                description: "Walk through Haputale's dramatic ridge, the thinnest point on the island, with views from both coasts on a clear day.", durationHours: 5, destinationSlug: "ella" },
  { id: "pekoe-15", name: "Pekoe Trail Stage 15",                description: "Descend from Haputale's spine through Dambatenne tea estate, home to Sir Thomas Lipton's original Ceylon tea factory.", durationHours: 5, destinationSlug: "ella" },
  // Stages 16–22 → ella / nuwara-eliya split
  { id: "pekoe-16", name: "Pekoe Trail Stage 16",                description: "Stage 16 winds through the Bandarawela highlands, a transition zone of cooler estates and lush valley villages.", durationHours: 5, destinationSlug: "ella" },
  { id: "pekoe-17", name: "Pekoe Trail Stage 17",                description: "Trek across Uva Province's rolling grasslands and abandoned estate tracks toward the Ella valley.", durationHours: 6, destinationSlug: "ella" },
  { id: "pekoe-18", name: "Pekoe Trail Stage 18",                description: "Approach Ella from the north on Stage 18, walking through jungle-fringed tea estates with Nine Arch Bridge views.", durationHours: 5, destinationSlug: "ella" },
  { id: "pekoe-19", name: "Pekoe Trail Stage 19",                description: "A rewarding highland stage through Poonagala and Badulla's outskirts, passing ancient temple ruins and waterfalls.", durationHours: 5, destinationSlug: "nuwara-eliya" },
  { id: "pekoe-20", name: "Pekoe Trail Stage 20",                description: "Stage 20 descends toward Hali Ela through spice-garden villages and rubber forests on the edge of the hill country.", durationHours: 5, destinationSlug: "nuwara-eliya" },
  { id: "pekoe-21", name: "Pekoe Trail Stage 21",                description: "The penultimate Pekoe Trail stage crosses the Badulla basin through paddy lands and river valleys.", durationHours: 5, destinationSlug: "nuwara-eliya" },
  { id: "pekoe-22", name: "Pekoe Trail Stage 22",                description: "Complete the 300km Pekoe Trail at Nuwara Eliya, a triumphant finale through high-grown estates and mist-wrapped hills.", durationHours: 6, destinationSlug: "nuwara-eliya" },
];

// ---------------------------------------------------------------------------
// PACKAGES
// ---------------------------------------------------------------------------

export const packages: Package[] = [
  {
    slug: "heritage-hill-country-escape",
    name: "Heritage & Hill Country Escape",
    description:
      "Trace Sri Lanka's ancient kingdoms and misty highlands across Habarana, Kandy, and Negombo. Climb Sigiriya Rock Fortress, watch elephants gather at Minneriya, explore cave temples with centuries-old murals, and witness Kandyan dance traditions that have endured for generations.",
    durationDays: 7,
    difficulty: "Easy",
    region: "Hill Country / Cultural Triangle",
    price: 1800,
    minGuests: 2,
    maxGuests: 10,
    highlights: [
      "Sigiriya Rock Fortress",
      "Minneriya National Park",
      "Dambulla Cave Temple",
      "Temple of the Sacred Tooth",
      "Kandyan cultural dance",
    ],
    image: "/images/packages/pkg-heritage-hill-country.jpg",
    gallery: [],
    itinerary: [
      { day: 1, title: "Airport to Habarana", description: "Arrive at Bandaranaike International Airport and transfer to Habarana through Sri Lanka's Cultural Triangle heartland. Settle into your hotel surrounded by ancient reservoir country. Drive time approximately 4-5 hours." },
      { day: 2, title: "Habarana Exploration", description: "Climb the iconic Sigiriya Rock Fortress for panoramic views across the jungle canopy. Afternoon jeep safari at Minneriya National Park to witness the famous elephant gathering. End the day with a traditional village safari experience." },
      { day: 3, title: "Habarana to Kandy", description: "Depart Habarana and stop at the Dambulla Cave Temple, home to 153 Buddha statues and ancient murals. Continue through spice country to the hill capital of Kandy." },
      { day: 4, title: "Kandy Discovery", description: "Visit the Temple of the Sacred Tooth Relic for the morning puja ceremony. Explore Kandy Lake and the historic city centre. Evening Kandyan cultural dance performance featuring fire-walking and traditional drumming." },
      { day: 5, title: "Kandy to Negombo", description: "Depart Kandy and drive to the coastal town of Negombo, passing through coconut plantations and fishing villages along the western seaboard." },
      { day: 6, title: "Negombo Leisure", description: "A full day at leisure on Negombo's long sandy beach. Optional lagoon boat ride, catamaran sailing, or cycling through the colourful Catholic fishing villages." },
      { day: 7, title: "Departure", description: "Early morning visit to Negombo's famous fish market to watch the overnight catch auctioned at dawn. Transfer to Bandaranaike International Airport for departure." },
    ],
    transportTiers: TRANSPORT_TIERS,
    standardInclusions: STANDARD_INCLUSIONS,
    excursions: [
      ALL_EXCURSIONS.find((e) => e.id === "sig-1")!,
      ALL_EXCURSIONS.find((e) => e.id === "sig-3")!,
      ALL_EXCURSIONS.find((e) => e.id === "sig-8")!,
      ALL_EXCURSIONS.find((e) => e.id === "sig-4")!,
      ALL_EXCURSIONS.find((e) => e.id === "kan-1")!,
      ALL_EXCURSIONS.find((e) => e.id === "kan-2")!,
      ALL_EXCURSIONS.find((e) => e.id === "kan-4")!,
      ALL_EXCURSIONS.find((e) => e.id === "neg-4")!,
      ALL_EXCURSIONS.find((e) => e.id === "neg-6")!,
    ],
  },
  {
    slug: "golden-sands-southern-coast",
    name: "Golden Sands of the Southern Coast",
    description:
      "Follow Sri Lanka's southern coastline from Bentota's golden beaches through the colonial ramparts of Galle Fort to the whale-watching waters of Mirissa. Water sports, mangrove safaris, turtle hatcheries, and a Colombo city tour round out a week of tropical coastal exploration.",
    durationDays: 7,
    difficulty: "Easy",
    region: "Southern Coast",
    price: 2200,
    minGuests: 2,
    maxGuests: 10,
    highlights: [
      "Pristine beaches",
      "Whale watching",
      "Galle Fort UNESCO",
      "Madu River mangrove safari",
      "Colombo city tour",
    ],
    image: "/images/packages/pkg-golden-sands-south.jpg",
    gallery: [],
    itinerary: [
      { day: 1, title: "Airport to Bentota", description: "Arrive at Bandaranaike International Airport and transfer south along the coastal highway to Bentota. Settle into your beachfront hotel and enjoy the sunset over the Indian Ocean." },
      { day: 2, title: "Bentota Leisure", description: "A full day of beach relaxation and water sports. Jet-skiing, wakeboarding, and banana boat rides on the Bentota lagoon. Afternoon guided boat safari through the Madu River's winding mangrove channels." },
      { day: 3, title: "Bentota Exploration", description: "Visit the Lunuganga estate gardens and a turtle conservation hatchery where you can learn about five sea turtle species and release hatchlings at dusk." },
      { day: 4, title: "Bentota to Mirissa", description: "Drive south along the coast with a stop at the UNESCO-listed Galle Fort for a guided walking tour through Dutch ramparts, colonial architecture, and artisan boutiques. Continue to Mirissa." },
      { day: 5, title: "Mirissa Whale Watching", description: "Early morning boat excursion to spot blue whales, sperm whales, and spinner dolphins off Sri Lanka's southern tip. Afternoon at leisure on Mirissa beach with a sunset at Coconut Tree Hill." },
      { day: 6, title: "Mirissa to Colombo", description: "Depart Mirissa and drive to the capital for a guided Colombo city tour covering colonial landmarks, the modern skyline, Gangaramaya Temple, and vibrant neighbourhoods." },
      { day: 7, title: "Departure", description: "Transfer to Bandaranaike International Airport for departure." },
    ],
    transportTiers: TRANSPORT_TIERS,
    standardInclusions: STANDARD_INCLUSIONS,
    excursions: [
      ALL_EXCURSIONS.find((e) => e.id === "ben-2")!,
      ALL_EXCURSIONS.find((e) => e.id === "ben-4")!,
      ALL_EXCURSIONS.find((e) => e.id === "ben-3")!,
      ALL_EXCURSIONS.find((e) => e.id === "gal-1")!,
      ALL_EXCURSIONS.find((e) => e.id === "mir-1")!,
      ALL_EXCURSIONS.find((e) => e.id === "mir-4")!,
      ALL_EXCURSIONS.find((e) => e.id === "col-1")!,
      ALL_EXCURSIONS.find((e) => e.id === "col-5")!,
    ],
  },
  {
    slug: "boundaries-in-paradise",
    name: "Boundaries in Paradise",
    description:
      "Combine live ODI cricket with Sri Lanka's finest cultural and coastal highlights. Watch matches in Colombo, explore Galle Fort's colonial ramparts, visit Pinnawala Elephant Orphanage, and choose between whale watching or a cooking class. A cricket tour designed for groups who want the full Sri Lankan experience beyond the stadium.",
    durationDays: 8,
    difficulty: "Easy",
    region: "Multi-region",
    price: 2800,
    minGuests: 10,
    maxGuests: 40,
    highlights: [
      "Live ODI cricket matches",
      "Galle Fort exploration",
      "Pinnawala Elephant Orphanage",
      "Whale watching",
      "Cultural immersion",
    ],
    image: "/images/packages/pkg-boundaries-paradise.jpg",
    gallery: [],
    itinerary: [
      { day: 1, title: "Airport to Colombo", description: "Arrive at Bandaranaike International Airport and transfer to Cinnamon Grand Colombo. Welcome briefing and evening at leisure to explore the city." },
      { day: 2, title: "Colombo Sightseeing & 1st ODI", description: "Morning guided Colombo city tour covering colonial landmarks and vibrant neighbourhoods. Afternoon and evening at the stadium for the first ODI cricket match." },
      { day: 3, title: "Day Trip to Kandy", description: "Full day excursion to Kandy via Pinnawala Elephant Orphanage. Visit the Temple of the Sacred Tooth Relic and explore the hill capital before returning to Colombo." },
      { day: 4, title: "Colombo & 2nd ODI", description: "Morning at leisure for shopping or exploring Colombo's Dutch Hospital precinct and Pettah market. Afternoon and evening at the stadium for the second ODI match." },
      { day: 5, title: "Colombo to Galle", description: "Drive south along the coast with stops at a turtle hatchery, the Madu River mangrove safari, and the Ambalangoda mask museum. Arrive at Radisson Blu Galle and explore Galle Fort." },
      { day: 6, title: "Galle Experiences", description: "Choose your adventure: early morning whale watching boat excursion or a hands-on Sri Lankan cooking class in a Galle Fort heritage kitchen. Afternoon at leisure within the fort's boutiques and cafes." },
      { day: 7, title: "Galle to Colombo", description: "Depart Galle and return to Colombo. Afternoon at leisure for last-minute shopping or sightseeing. Farewell dinner." },
      { day: 8, title: "Departure", description: "Transfer to Bandaranaike International Airport for departure." },
    ],
    transportTiers: TRANSPORT_TIERS,
    standardInclusions: STANDARD_INCLUSIONS,
    excursions: [
      ALL_EXCURSIONS.find((e) => e.id === "col-1")!,
      ALL_EXCURSIONS.find((e) => e.id === "col-6")!,
      ALL_EXCURSIONS.find((e) => e.id === "kan-8")!,
      ALL_EXCURSIONS.find((e) => e.id === "gal-1")!,
      ALL_EXCURSIONS.find((e) => e.id === "mir-1")!,
      ALL_EXCURSIONS.find((e) => e.id === "gal-6")!,
      ALL_EXCURSIONS.find((e) => e.id === "ben-4")!,
    ],
  },
  {
    slug: "jaffna-escape",
    name: "Jaffna Escape",
    description:
      "Journey through Sri Lanka's lesser-visited north and east, from the ancient Hindu temples of Jaffna to the hot springs and islands of Trincomalee, with a return through the Cultural Triangle's most celebrated sites. A route that reveals a side of the island most travellers never see.",
    durationDays: 9,
    difficulty: "Moderate",
    region: "Northern & Cultural",
    price: 2400,
    minGuests: 2,
    maxGuests: 8,
    highlights: [
      "Jaffna Fort",
      "Nallur Kandaswamy Kovil",
      "Pigeon Island",
      "Sigiriya Rock Fortress",
      "Minneriya elephant gathering",
    ],
    image: "/images/packages/pkg-jaffna-escape.jpg",
    gallery: [],
    itinerary: [
      { day: 1, title: "Airport to Chilaw", description: "Arrive at Bandaranaike International Airport and transfer to Chilaw. Visit the ancient Munneswaram Temple, one of Sri Lanka's most sacred Hindu shrines." },
      { day: 2, title: "Chilaw to Jaffna", description: "Drive north through the Vanni region to Jaffna. Explore the Dutch-built Jaffna Fort and its surroundings." },
      { day: 3, title: "Discover Jaffna", description: "Visit the ornate Nallur Kandaswamy Kovil, the Jaffna Public Library, and drive out to Casuarina Beach on the northern coast. Explore the local food scene and Tamil cultural heritage." },
      { day: 4, title: "Jaffna to Trincomalee", description: "Travel east along the northern coastal road to the port city of Trincomalee. Visit the clifftop Koneswaram Temple overlooking the Indian Ocean." },
      { day: 5, title: "Trincomalee Exploration", description: "Morning visit to the Kanniya hot springs. Afternoon boat trip to Pigeon Island for snorkelling over coral reefs and spotting reef sharks." },
      { day: 6, title: "Trincomalee to Habarana", description: "Drive inland through the dry zone to Habarana. Afternoon jeep safari at Minneriya National Park to witness the famous elephant gathering." },
      { day: 7, title: "Habarana to Negombo", description: "Morning climb of the iconic Sigiriya Rock Fortress. Depart for the western coast and settle into Negombo." },
      { day: 8, title: "Negombo Leisure", description: "A full day at leisure. Enjoy the beach, explore the lagoon, or cycle through the colourful fishing villages." },
      { day: 9, title: "Departure", description: "Transfer to Bandaranaike International Airport for departure." },
    ],
    transportTiers: TRANSPORT_TIERS,
    standardInclusions: STANDARD_INCLUSIONS,
    excursions: [
      ALL_EXCURSIONS.find((e) => e.id === "sig-1")!,
      ALL_EXCURSIONS.find((e) => e.id === "sig-8")!,
      ALL_EXCURSIONS.find((e) => e.id === "neg-4")!,
      ALL_EXCURSIONS.find((e) => e.id === "neg-6")!,
    ],
  },
  {
    slug: "honeymoon-package",
    name: "Honeymoon Package",
    description:
      "A romantic journey across Sri Lanka's most enchanting landscapes, from the ancient rock fortress of Sigiriya to the misty tea country aboard the world-famous highland train, a leopard safari at Yala, and intimate beach days on the southern coast. Designed exclusively for couples seeking an unforgettable start together.",
    durationDays: 10,
    difficulty: "Easy",
    region: "Multi-region",
    price: 3200,
    minGuests: 2,
    maxGuests: 2,
    highlights: [
      "Sigiriya Rock Fortress",
      "Scenic Kandy-Ella train",
      "Yala leopard safari",
      "Romantic beach getaway",
      "Traditional village experience",
    ],
    image: "/images/packages/pkg-honeymoon.jpg",
    gallery: [],
    itinerary: [
      { day: 1, title: "Airport to Negombo", description: "Arrive at Bandaranaike International Airport and transfer to your beachfront hotel in Negombo. Evening at leisure with a welcome dinner." },
      { day: 2, title: "Negombo to Sigiriya", description: "Drive to the Cultural Triangle and settle into your Sigiriya hotel. Afternoon immersive village excursion with a bullock-cart ride, paddy fields, and home cooking." },
      { day: 3, title: "Sigiriya & Minneriya", description: "Morning climb of the iconic Sigiriya Rock Fortress. Afternoon jeep safari at Minneriya National Park to spot wild elephant herds." },
      { day: 4, title: "Sigiriya to Kandy", description: "Depart Sigiriya and drive to Kandy via a traditional spice garden visit. Explore the hill capital and its lakeside setting." },
      { day: 5, title: "Kandy to Ella", description: "Board the world-famous scenic train for the spectacular highland railway journey through mist, tea estates, and ravines to Ella." },
      { day: 6, title: "Ella Exploration", description: "Visit the iconic Nine Arch Bridge at golden hour. Hike Little Adam's Peak through tea estates for sweeping 360-degree views of the Ella Gap." },
      { day: 7, title: "Ella to Yala", description: "Drive south to Yala National Park for a dawn jeep safari through Block 1, home to the highest leopard density on Earth." },
      { day: 8, title: "Yala to South Coast", description: "Depart Yala and drive to the southern coast. Settle into your beach hotel for two nights of seaside relaxation." },
      { day: 9, title: "Beach Leisure", description: "A full day at leisure on the pristine southern beaches. Optional sunset at Coconut Tree Hill, snorkelling, or a private beachside dinner." },
      { day: 10, title: "Departure", description: "Transfer to Bandaranaike International Airport for departure." },
    ],
    transportTiers: TRANSPORT_TIERS,
    standardInclusions: STANDARD_INCLUSIONS,
    excursions: [
      ALL_EXCURSIONS.find((e) => e.id === "neg-6")!,
      ALL_EXCURSIONS.find((e) => e.id === "sig-1")!,
      ALL_EXCURSIONS.find((e) => e.id === "sig-4")!,
      ALL_EXCURSIONS.find((e) => e.id === "sig-8")!,
      ALL_EXCURSIONS.find((e) => e.id === "kan-11")!,
      ALL_EXCURSIONS.find((e) => e.id === "kan-13")!,
      ALL_EXCURSIONS.find((e) => e.id === "ella-1")!,
      ALL_EXCURSIONS.find((e) => e.id === "ella-2")!,
      ALL_EXCURSIONS.find((e) => e.id === "yala-1")!,
      ALL_EXCURSIONS.find((e) => e.id === "mir-4")!,
    ],
  },
  {
    slug: "wildlife-getaway",
    name: "Wildlife Getaway",
    description:
      "Sri Lanka's ultimate wildlife circuit, spanning four national parks from the leopard territory of Wilpattu and Yala to the elephant-rich shores of Minneriya and the remote island wilderness of Gal Oya. Finish with blue whale watching off the southern coast for a complete land-and-sea wildlife experience.",
    durationDays: 10,
    difficulty: "Easy",
    region: "Wildlife Circuit",
    price: 2800,
    minGuests: 2,
    maxGuests: 8,
    highlights: [
      "Four national park safaris",
      "Highest leopard density in world",
      "Elephant swimming between islands",
      "Blue whale watching",
    ],
    image: "/images/packages/pkg-wildlife-getaway.jpg",
    gallery: [],
    itinerary: [
      { day: 1, title: "Airport to Negombo", description: "Arrive at Bandaranaike International Airport and transfer to your Negombo hotel. Evening at leisure on the beach." },
      { day: 2, title: "Negombo to Wilpattu", description: "Drive to Wilpattu National Park for a full day jeep safari along the unique villu (natural lakes), spotting leopards, sloth bears, and elephants." },
      { day: 3, title: "Wilpattu to Minneriya", description: "Transfer to the Cultural Triangle for an afternoon jeep safari at Minneriya National Park, famous for 'The Gathering', one of Asia's greatest elephant congregations." },
      { day: 4, title: "Habarana to Gal Oya", description: "Drive south-east to the remote Gal Oya National Park, Sri Lanka's least-visited and most rewarding wilderness area." },
      { day: 5, title: "Gal Oya Full Day", description: "Full day boat safari on the Senanayake Samudra reservoir, watching elephants swim between islands, with expert naturalist guides and exceptional birdlife." },
      { day: 6, title: "Gal Oya to Yala", description: "Transfer to Yala National Park. Afternoon game drive through Block 1, home to the highest leopard density on Earth." },
      { day: 7, title: "Yala Full Day", description: "Dawn and dusk safari drives to experience Yala's wildlife during the most active periods, spotting elephants, crocodiles, and over 200 bird species." },
      { day: 8, title: "Yala to Mirissa", description: "Depart Yala and drive to the southern coast at Mirissa. Settle into your beach hotel and enjoy the sunset." },
      { day: 9, title: "Mirissa Whale Watching", description: "Early morning pelagic boat excursion to spot blue whales and spinner dolphins off Sri Lanka's southern tip. Afternoon at leisure with optional dolphin watching cruise." },
      { day: 10, title: "Departure", description: "Transfer to Bandaranaike International Airport for departure." },
    ],
    transportTiers: TRANSPORT_TIERS,
    standardInclusions: STANDARD_INCLUSIONS,
    excursions: [
      ALL_EXCURSIONS.find((e) => e.id === "neg-6")!,
      ALL_EXCURSIONS.find((e) => e.id === "sig-8")!,
      ALL_EXCURSIONS.find((e) => e.id === "yala-1")!,
      ALL_EXCURSIONS.find((e) => e.id === "yala-2")!,
      ALL_EXCURSIONS.find((e) => e.id === "yala-7")!,
      ALL_EXCURSIONS.find((e) => e.id === "mir-1")!,
      ALL_EXCURSIONS.find((e) => e.id === "mir-2")!,
    ],
  },
  {
    slug: "elite-golf-escape",
    name: "Elite Golf Escape",
    description:
      "Play Sri Lanka's four championship golf courses across 14 days, from the colonial fairways of Victoria Golf Club and Nuwara Eliya to the ocean-view greens of Shangri-La Hambantota and Royal Colombo. Between rounds, explore ancient temples, ride the highland train, and safari through Yala's leopard territory.",
    durationDays: 14,
    difficulty: "Easy",
    region: "Multi-region",
    price: 3780,
    minGuests: 1,
    maxGuests: 6,
    highlights: [
      "Victoria Golf Club",
      "Nuwara Eliya Golf Club",
      "Shangri-La Hambantota Golf Resort",
      "Royal Colombo Golf Club",
      "Yala safari",
    ],
    image: "/images/packages/pkg-elite-golf-escape.jpg",
    gallery: [],
    itinerary: [
      { day: 1, title: "Airport to Negombo", description: "Arrive at Bandaranaike International Airport and transfer to Amagi Aria Negombo. Welcome dinner and briefing." },
      { day: 2, title: "Negombo to Kandy", description: "Drive to Kandy and check in at Victoria Golf Resort. Afternoon visit to the Temple of the Sacred Tooth and evening Kandyan cultural dance performance." },
      { day: 3, title: "Victoria Golf Club", description: "Full day at the stunning Victoria Golf Club in Digana, set against the backdrop of the Knuckles Mountain Range and Victoria Reservoir." },
      { day: 4, title: "Kandy to Nuwara Eliya", description: "Drive to the colonial hill station of Nuwara Eliya. Check in at the Grand Hotel and explore the town's English heritage architecture." },
      { day: 5, title: "Nuwara Eliya Golf Club", description: "Play a round at one of Asia's oldest golf courses, the Nuwara Eliya Golf Club, set at 1,900 metres in the cool highlands. Afternoon tea plantation tour." },
      { day: 6, title: "Nuwara Eliya to Ella", description: "Board the celebrated hill country train for the scenic journey through tunnels, tea estates, and mountain mist to Ella. Check in at 98 Acres Resort." },
      { day: 7, title: "Ella & Yala", description: "Morning exploration of Ella. Afternoon transfer to Yala and check in at DoubleTree by Hilton. Evening at leisure." },
      { day: 8, title: "Yala Safari", description: "Dawn jeep safari through Yala Block 1, home to the highest leopard density on Earth, plus elephants, bears, and over 200 bird species." },
      { day: 9, title: "Yala to Hambantota", description: "Transfer to Shangri-La Hambantota. Afternoon round at the Shangri-La Hambantota Golf Resort, an 18-hole championship course with ocean views." },
      { day: 10, title: "Hambantota to Galle", description: "Drive to Galle with a stop at a turtle hatchery. Check in at Radisson Collection and explore Galle Fort's ramparts and boutiques." },
      { day: 11, title: "Galle Exploration", description: "Guided walking tour of the UNESCO-listed Galle Fort. Afternoon Madu River mangrove safari. Evening at leisure." },
      { day: 12, title: "Galle to Colombo", description: "Drive to Colombo and check in at The Kingsbury. Afternoon guided city tour of the capital's colonial landmarks and modern skyline." },
      { day: 13, title: "Royal Colombo Golf Club", description: "Full day at the historic Royal Colombo Golf Club, one of Asia's oldest golf clubs, founded in 1879. Farewell dinner." },
      { day: 14, title: "Departure", description: "Transfer to Bandaranaike International Airport for departure." },
    ],
    transportTiers: TRANSPORT_TIERS,
    standardInclusions: STANDARD_INCLUSIONS,
    excursions: [
      ALL_EXCURSIONS.find((e) => e.id === "kan-1")!,
      ALL_EXCURSIONS.find((e) => e.id === "kan-4")!,
      ALL_EXCURSIONS.find((e) => e.id === "ne-1")!,
      ALL_EXCURSIONS.find((e) => e.id === "ne-8")!,
      ALL_EXCURSIONS.find((e) => e.id === "ella-10")!,
      ALL_EXCURSIONS.find((e) => e.id === "yala-1")!,
      ALL_EXCURSIONS.find((e) => e.id === "gal-1")!,
      ALL_EXCURSIONS.find((e) => e.id === "ben-3")!,
      ALL_EXCURSIONS.find((e) => e.id === "ben-4")!,
      ALL_EXCURSIONS.find((e) => e.id === "col-1")!,
    ],
  },
  {
    slug: "birdies-by-the-beach",
    name: "Birdies by the Beach",
    description:
      "Two of Sri Lanka's finest golf courses paired with luxury Shangri-La stays in Colombo and Hambantota. Play the historic Royal Colombo Golf Club and the ocean-view championship course at Shangri-La Hambantota, with four full days of golf and premium resort dining between rounds.",
    durationDays: 7,
    difficulty: "Easy",
    region: "Southern & Western",
    price: 2600,
    minGuests: 2,
    maxGuests: 8,
    highlights: [
      "Royal Colombo Golf Club",
      "Shangri-La Hambantota championship course",
      "Ocean-view fairways",
      "Luxury resort",
    ],
    image: "/images/packages/pkg-birdies-beach.jpg",
    gallery: [],
    itinerary: [
      { day: 1, title: "Airport to Colombo", description: "Arrive at Bandaranaike International Airport and transfer to Shangri-La Colombo. Welcome dinner and trip briefing." },
      { day: 2, title: "Royal Colombo Golf", description: "Full day at the historic Royal Colombo Golf Club, one of Asia's oldest golf clubs founded in 1879. Evening sunset dining experience at the hotel." },
      { day: 3, title: "Colombo to Hambantota", description: "Drive south along the coast to Shangri-La Hambantota. Afternoon round at the 18-hole championship golf course with panoramic ocean views." },
      { day: 4, title: "Hambantota Golf Day 1", description: "Full day on the Shangri-La Hambantota championship course. Explore the resort's spa and dining options between rounds." },
      { day: 5, title: "Hambantota Golf Day 2", description: "Second full day of golf at Shangri-La Hambantota. Afternoon at leisure by the pool or beach." },
      { day: 6, title: "Hambantota Golf Day 3", description: "Final round at Shangri-La Hambantota. Farewell dinner at the resort's signature restaurant." },
      { day: 7, title: "Departure", description: "Transfer to Bandaranaike International Airport for departure." },
    ],
    transportTiers: TRANSPORT_TIERS,
    standardInclusions: STANDARD_INCLUSIONS,
    excursions: [
      ALL_EXCURSIONS.find((e) => e.id === "col-1")!,
      ALL_EXCURSIONS.find((e) => e.id === "col-14")!,
    ],
  },
  {
    slug: "fairways-and-greens",
    name: "Fairways and Greens",
    description:
      "Three championship golf courses across Sri Lanka's hill country and western seaboard. Play the mountain-framed Victoria Golf Club in Kandy, the colonial Nuwara Eliya Golf Club at 1,900 metres, and the historic Royal Colombo Golf Club. Between rounds, explore tea plantations, the hill capital, and the colonial charm of Little England.",
    durationDays: 8,
    difficulty: "Easy",
    region: "Hill Country & Western",
    price: 2800,
    minGuests: 2,
    maxGuests: 8,
    highlights: [
      "Victoria Golf Club Digana",
      "Nuwara Eliya Golf Club",
      "Royal Colombo Golf Club",
      "Tea plantation tour",
    ],
    image: "/images/packages/pkg-fairways-greens.jpg",
    gallery: [],
    itinerary: [
      { day: 1, title: "Airport to Negombo", description: "Arrive at Bandaranaike International Airport and transfer to Jetwing Blue Negombo. Evening beach walk and welcome dinner." },
      { day: 2, title: "Negombo to Kandy", description: "Drive to Kandy and check in at Golden Crown Hotel. Afternoon guided Kandy city tour including the lake, markets, and colonial architecture." },
      { day: 3, title: "Victoria Golf Club", description: "Full day at Victoria Golf Club in Digana, one of Asia's most scenic courses set against the Knuckles Mountain Range and Victoria Reservoir." },
      { day: 4, title: "Kandy to Nuwara Eliya", description: "Drive through misty highlands to Nuwara Eliya with a stop at a working tea plantation and factory for a guided tour and tasting session. Check in at the Grand Hotel." },
      { day: 5, title: "Nuwara Eliya Golf", description: "Play a round at the Nuwara Eliya Golf Club, one of Asia's oldest courses at 1,900 metres. Afternoon colonial city walk through the Hill Club, post office, and English market." },
      { day: 6, title: "Nuwara Eliya to Colombo", description: "Scenic drive through the highlands to Colombo. Check in at Shangri-La Colombo. Evening at leisure." },
      { day: 7, title: "Royal Colombo Golf", description: "Full day at the historic Royal Colombo Golf Club. Farewell dinner with city views." },
      { day: 8, title: "Departure", description: "Transfer to Bandaranaike International Airport for departure." },
    ],
    transportTiers: TRANSPORT_TIERS,
    standardInclusions: STANDARD_INCLUSIONS,
    excursions: [
      ALL_EXCURSIONS.find((e) => e.id === "neg-6")!,
      ALL_EXCURSIONS.find((e) => e.id === "kan-2")!,
      ALL_EXCURSIONS.find((e) => e.id === "kan-7")!,
      ALL_EXCURSIONS.find((e) => e.id === "ne-1")!,
      ALL_EXCURSIONS.find((e) => e.id === "ne-8")!,
      ALL_EXCURSIONS.find((e) => e.id === "col-1")!,
    ],
  },
  {
    slug: "golf-among-the-misty-hills",
    name: "Golf Among the Misty Hills",
    description:
      "Five championship rounds across four of Sri Lanka's finest golf courses over 10 days. Two rounds at Victoria Golf Club, plus Nuwara Eliya, Royal Colombo, and Shangri-La Hambantota. Between tee times, explore Kandy's sacred sites, walk through highland tea estates, and enjoy luxury resort stays throughout.",
    durationDays: 10,
    difficulty: "Easy",
    region: "Multi-region",
    price: 3400,
    minGuests: 2,
    maxGuests: 8,
    highlights: [
      "Five championship golf rounds",
      "Victoria Golf Club",
      "Nuwara Eliya Golf Club",
      "Shangri-La Hambantota",
      "Tea plantation tour",
    ],
    image: "/images/packages/pkg-golf-misty-hills.jpg",
    gallery: [],
    itinerary: [
      { day: 1, title: "Airport to Colombo", description: "Arrive at Bandaranaike International Airport and transfer to Shangri-La Colombo. Welcome dinner and trip briefing." },
      { day: 2, title: "Royal Colombo Golf", description: "Full day at the historic Royal Colombo Golf Club, one of Asia's oldest clubs founded in 1879. Evening guided city tour." },
      { day: 3, title: "Colombo to Kandy", description: "Drive to Kandy and check in at Golden Crown Hotel. Afternoon Kandy city tour with visits to the Royal Botanical Gardens at Peradeniya." },
      { day: 4, title: "Victoria Golf Club - Round 1", description: "First round at the stunning Victoria Golf Club in Digana, set against the Knuckles Mountain Range. Afternoon tea factory and plantation tour." },
      { day: 5, title: "Victoria Golf Club - Round 2", description: "Second round at Victoria Golf Club. Evening at leisure in Kandy." },
      { day: 6, title: "Kandy to Nuwara Eliya", description: "Drive through misty highlands to Nuwara Eliya with stops at working tea estates. Check in at the Grand Hotel. Afternoon colonial city walk." },
      { day: 7, title: "Nuwara Eliya Golf", description: "Play a round at the Nuwara Eliya Golf Club at 1,900 metres, one of Asia's oldest and most scenic highland courses." },
      { day: 8, title: "Nuwara Eliya to Hambantota", description: "Scenic drive through the southern highlands to Shangri-La Hambantota. Afternoon at leisure in the resort." },
      { day: 9, title: "Shangri-La Hambantota Golf", description: "Full day on the Shangri-La Hambantota championship course with panoramic ocean views. Farewell dinner at the resort." },
      { day: 10, title: "Departure", description: "Transfer to Bandaranaike International Airport for departure." },
    ],
    transportTiers: TRANSPORT_TIERS,
    standardInclusions: STANDARD_INCLUSIONS,
    excursions: [
      ALL_EXCURSIONS.find((e) => e.id === "col-1")!,
      ALL_EXCURSIONS.find((e) => e.id === "kan-2")!,
      ALL_EXCURSIONS.find((e) => e.id === "kan-3")!,
      ALL_EXCURSIONS.find((e) => e.id === "kan-7")!,
      ALL_EXCURSIONS.find((e) => e.id === "ne-1")!,
      ALL_EXCURSIONS.find((e) => e.id === "ne-8")!,
    ],
  },
  {
    slug: "maldives-holidays",
    name: "Maldives Holidays",
    description:
      "Crystal-clear waters, overwater villas, and white sand atolls in the Indian Ocean. Whether arriving by speedboat or seaplane, this flexible 3-to-7-day escape offers world-class snorkelling, water sports, island hopping, and spa indulgence across the Maldives' most pristine resort islands.",
    durationDays: 5,
    difficulty: "Easy",
    region: "Maldives",
    price: 3500,
    minGuests: 2,
    maxGuests: 10,
    highlights: [
      "Crystal-clear waters",
      "Overwater villas",
      "Speedboat or seaplane transfers",
      "Snorkelling and water sports",
      "Multi-island holiday",
    ],
    image: "/images/packages/pkg-maldives-holidays.jpg",
    gallery: [],
    itinerary: [
      { day: 1, title: "Arrival & Resort", description: "Arrive at Velana International Airport and transfer to your resort island by speedboat or seaplane. Check in to your overwater or beachfront villa. Afternoon at leisure." },
      { day: 2, title: "Snorkelling & Water Sports", description: "Morning guided snorkelling excursion over pristine coral reefs. Afternoon water sports including kayaking, paddleboarding, and jet-skiing." },
      { day: 3, title: "Island Hopping", description: "Full day island-hopping excursion visiting local fishing villages, sandbank picnics, and snorkelling at secluded reefs across multiple atolls." },
      { day: 4, title: "Leisure & Spa", description: "A day of pure relaxation. Overwater spa treatment, beachside dining, sunset dolphin cruise, or simply enjoy the villa and lagoon." },
      { day: 5, title: "Departure", description: "Final morning at leisure. Transfer to Velana International Airport for departure." },
    ],
    transportTiers: TRANSPORT_TIERS,
    standardInclusions: STANDARD_INCLUSIONS,
    excursions: [],
  },
  {
    slug: "throbbing-adventure",
    name: "Throbbing Adventure Sri Lanka",
    description:
      "Ten days of adrenaline across Sri Lanka's wildest terrain. White water rafting and jungle canyoning in Kitulgala, ziplines and mountain biking in Ella, elephant safaris and wilderness camping at Udawalawe, and a trek through the UNESCO-listed Sinharaja Rainforest. Built for groups who want to push their limits.",
    durationDays: 10,
    difficulty: "Challenging",
    region: "Hill Country & Southern",
    price: 2200,
    minGuests: 4,
    maxGuests: 12,
    highlights: [
      "White water rafting",
      "Jungle canyoning",
      "Ella zipline",
      "Udawalawe safari and camping",
      "Sinharaja rainforest (UNESCO)",
    ],
    image: "/images/packages/pkg-throbbing-adventure.jpg",
    gallery: [],
    itinerary: [
      { day: 1, title: "Airport to Kitulgala", description: "Arrive at Bandaranaike International Airport and transfer to Kitulgala, the adventure capital of Sri Lanka set along the Kelani River." },
      { day: 2, title: "Kitulgala Adventures", description: "Full day of adrenaline: Grade 3-4 white water rafting on the Kelani River, jungle canyoning through waterfalls, and river tubing." },
      { day: 3, title: "Kitulgala to Ella", description: "Board the scenic highland train through tea estates and mountain mist to Ella. Settle into your hillside accommodation." },
      { day: 4, title: "Ella Adventure Day", description: "Morning at the Flying Ravana zipline, one of Asia's longest. Afternoon mountain cycling through tea estate roads and an evening Sri Lankan cooking class." },
      { day: 5, title: "Ella to Udawalawe", description: "Drive to Udawalawe National Park for an afternoon elephant safari. Spot herds of wild elephants, water buffalo, and crocodiles." },
      { day: 6, title: "Udawalawe Camping", description: "Full day safari and overnight wilderness camping in the Udawalawe buffer zone, sleeping under stars to the sounds of the wild." },
      { day: 7, title: "Udawalawe to Sinharaja", description: "Visit the Elephant Transit Home rehabilitation centre. Continue to the edge of the Sinharaja Rainforest, a UNESCO World Heritage Site." },
      { day: 8, title: "Sinharaja Forest Exploration", description: "Full day guided trek through Sri Lanka's last viable area of primary tropical rainforest, spotting endemic birds, reptiles, and rare flora." },
      { day: 9, title: "Sinharaja to Colombo", description: "Depart Sinharaja and drive to Colombo. Afternoon at leisure for shopping or sightseeing. Farewell dinner." },
      { day: 10, title: "Departure", description: "Transfer to Bandaranaike International Airport for departure." },
    ],
    transportTiers: TRANSPORT_TIERS,
    standardInclusions: STANDARD_INCLUSIONS,
    excursions: [
      ALL_EXCURSIONS.find((e) => e.id === "ella-1")!,
      ALL_EXCURSIONS.find((e) => e.id === "ella-2")!,
      ALL_EXCURSIONS.find((e) => e.id === "ella-3")!,
      ALL_EXCURSIONS.find((e) => e.id === "ella-6")!,
      ALL_EXCURSIONS.find((e) => e.id === "ella-9")!,
      ALL_EXCURSIONS.find((e) => e.id === "yala-1")!,
      ALL_EXCURSIONS.find((e) => e.id === "mir-7")!,
    ],
  },
  {
    slug: "luxury-travel-sri-lanka",
    name: "Luxury Travel Sri Lanka",
    description:
      "Sri Lanka's most exclusive properties, from The Walawwa in Negombo and Water Garden Sigiriya to The Kandy House, Ceylon Tea Trails with personal butler service, and the Galle Fort Hotel within the UNESCO ramparts. Ten days of world-class luxury, curated experiences, and unhurried exploration across the island's finest landscapes.",
    durationDays: 10,
    difficulty: "Easy",
    region: "Multi-region",
    price: 4500,
    minGuests: 2,
    maxGuests: 6,
    highlights: [
      "Ceylon Tea Trails butler service",
      "Water Garden Sigiriya",
      "Galle Fort boutique hotel",
      "The Kandy House heritage",
      "World-class luxury throughout",
    ],
    image: "/images/packages/pkg-luxury-travel.jpg",
    gallery: [],
    itinerary: [
      { day: 1, title: "Airport to Negombo", description: "Arrive at Bandaranaike International Airport and transfer to The Walawwa, a restored 18th-century country manor in Negombo. Welcome dinner in the garden courtyard." },
      { day: 2, title: "Negombo to Sigiriya", description: "Drive to the Cultural Triangle and check in at Water Garden Sigiriya, a luxury lakeside retreat beneath the ancient rock fortress. Afternoon village safari experience." },
      { day: 3, title: "Sigiriya Leisure", description: "Morning climb of Sigiriya Rock Fortress at your own pace. Afternoon at leisure with spa treatments, pool, or cycling through the countryside." },
      { day: 4, title: "Sigiriya to Kandy", description: "Depart Sigiriya and drive to Kandy. Check in at The Kandy House, a restored colonial planter's mansion. Visit the Temple of the Sacred Tooth." },
      { day: 5, title: "Kandy Leisure", description: "A day at your own pace. Visit the Royal Botanical Gardens at Peradeniya, explore the hill capital, or simply relax at The Kandy House." },
      { day: 6, title: "Kandy to Tea Country", description: "Drive to the heart of Ceylon tea country and check in at Ceylon Tea Trails, a collection of restored colonial tea planter bungalows with personal butler service. Afternoon tea plantation walk." },
      { day: 7, title: "Tea Estate Walks", description: "Full day exploring the tea estates with your resident butler. Guided walks through highland tea gardens, factory visits, and a high tea experience at the bungalow." },
      { day: 8, title: "Tea Country to Galle", description: "Drive south to the coast and check in at the Galle Fort Hotel, a boutique property within the UNESCO-listed ramparts." },
      { day: 9, title: "Galle Fort Exploration", description: "Guided walking tour of Galle Fort's Dutch architecture, lighthouse, and artisan lanes. Afternoon at leisure in the fort's cafes and boutiques." },
      { day: 10, title: "Departure", description: "Transfer to Bandaranaike International Airport or Colombo for departure." },
    ],
    transportTiers: TRANSPORT_TIERS,
    standardInclusions: STANDARD_INCLUSIONS,
    excursions: [
      ALL_EXCURSIONS.find((e) => e.id === "neg-6")!,
      ALL_EXCURSIONS.find((e) => e.id === "sig-1")!,
      ALL_EXCURSIONS.find((e) => e.id === "sig-4")!,
      ALL_EXCURSIONS.find((e) => e.id === "kan-1")!,
      ALL_EXCURSIONS.find((e) => e.id === "kan-3")!,
      ALL_EXCURSIONS.find((e) => e.id === "ne-1")!,
      ALL_EXCURSIONS.find((e) => e.id === "ne-11")!,
      ALL_EXCURSIONS.find((e) => e.id === "gal-1")!,
      ALL_EXCURSIONS.find((e) => e.id === "gal-4")!,
    ],
  },
];

export function getPackageBySlug(slug: string): Package | undefined {
  return packages.find((p) => p.slug === slug);
}

export function getExcursionsForDestination(
  destinationSlug: string
): (Excursion & { packageSlug: string; packageName: string })[] {
  const matched = ALL_EXCURSIONS.filter(
    (e) => e.destinationSlug === destinationSlug
  );

  // Enrich each excursion with the first package that references it (by id).
  // If no package references it, fall back to a generic entry.
  return matched.map((exc) => {
    const pkg = packages.find((p) => p.excursions.some((pe) => pe.id === exc.id));
    return {
      ...exc,
      packageSlug: pkg?.slug ?? "",
      packageName: pkg?.name ?? "",
    };
  });
}
