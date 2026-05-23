import { destinations } from "./destinations";

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
    slug: "hill-country-explorer",
    name: "Hill Country Explorer",
    minGuests: 2,
    maxGuests: 8,
    description:
      "From Kandy's temple ceremonies to Nuwara Eliya's cool highlands and Ella's green peaks. Travel the famous train through tea estates, hike to viewpoints, and move at a pace that lets you actually take things in.",
    durationDays: 6,
    difficulty: "Easy",
    region: "Hill Country",
    price: 1800,
    highlights: [
      "Iconic Kandy to Ella train journey",
      "Tea factory and estate tour in Nuwara Eliya",
      "Nine Arch Bridge at sunrise",
      "Temple of the Tooth in Kandy",
      "Little Adam's Peak hike",
    ],
    image: "/images/packages/pkg-hill-country-explorer.jpg",
    gallery: [],
    itinerary: [
      { day: 1, title: "Arrive in Kandy", description: "Airport pickup, drive to Kandy. Evening visit to the Temple of the Tooth and a cultural dance performance." },
      { day: 2, title: "Kandy to Nuwara Eliya", description: "Morning tea estate tour, drive through misty highlands to Nuwara Eliya. Visit a working tea factory." },
      { day: 3, title: "Horton Plains & Train", description: "Early morning trek to World's End at Horton Plains. Afternoon scenic train to Ella." },
      { day: 4, title: "Ella Exploration", description: "Sunrise at Nine Arch Bridge, hike Little Adam's Peak, visit Ravana Falls." },
      { day: 5, title: "Ella to Udawalawe", description: "Drive to Udawalawe for an afternoon elephant safari at the national park." },
      { day: 6, title: "Departure", description: "Morning at leisure. Transfer to Colombo airport for departure." },
    ],
    transportTiers: TRANSPORT_TIERS,
    standardInclusions: STANDARD_INCLUSIONS,
    excursions: [
      ALL_EXCURSIONS.find((e) => e.id === "kan-1")!,
      ALL_EXCURSIONS.find((e) => e.id === "kan-3")!,
      ALL_EXCURSIONS.find((e) => e.id === "kan-4")!,
      ALL_EXCURSIONS.find((e) => e.id === "kan-13")!,
      ALL_EXCURSIONS.find((e) => e.id === "ne-1")!,
      ALL_EXCURSIONS.find((e) => e.id === "ne-7")!,
      ALL_EXCURSIONS.find((e) => e.id === "ne-11")!,
      ALL_EXCURSIONS.find((e) => e.id === "ella-1")!,
      ALL_EXCURSIONS.find((e) => e.id === "ella-2")!,
      ALL_EXCURSIONS.find((e) => e.id === "ella-4")!,
    ],
  },
  {
    slug: "wildlife-adventure",
    minGuests: 2,
    maxGuests: 6,
    name: "Wildlife Adventure",
    description:
      "Track leopards and elephants on dawn game drives across Yala and Wilpattu. Our naturalist guides read the landscape and animal behaviour. You come back each evening with real stories from the wild.",
    durationDays: 4,
    difficulty: "Easy",
    region: "Southern",
    price: 2400,
    highlights: [
      "Yala leopard safari",
      "Wilpattu villu lake game drive",
      "Elephant herds",
      "Sloth bear spotting",
      "Expert naturalist guide",
    ],
    image: "/images/packages/pkg-wildlife-adventure.jpg",
    gallery: [],
    itinerary: [
      { day: 1, title: "Colombo to Yala", description: "Morning drive to Yala. Afternoon game drive with expert tracker through prime leopard territory." },
      { day: 2, title: "Full Day Yala Safari", description: "Dawn and dusk game drives. Spot elephants, sloth bears, crocodiles, and over 200 bird species." },
      { day: 3, title: "Yala to Wilpattu", description: "Transfer to Wilpattu National Park. Twilight safari along the unique villu (natural lakes)." },
      { day: 4, title: "Wilpattu & Departure", description: "Early morning game drive. Afternoon transfer to Colombo airport." },
    ],
    transportTiers: TRANSPORT_TIERS,
    standardInclusions: STANDARD_INCLUSIONS,
    excursions: [
      ALL_EXCURSIONS.find((e) => e.id === "yala-1")!,
      ALL_EXCURSIONS.find((e) => e.id === "yala-2")!,
      ALL_EXCURSIONS.find((e) => e.id === "yala-3")!,
      ALL_EXCURSIONS.find((e) => e.id === "yala-4")!,
      ALL_EXCURSIONS.find((e) => e.id === "yala-5")!,
      ALL_EXCURSIONS.find((e) => e.id === "yala-6")!,
      ALL_EXCURSIONS.find((e) => e.id === "yala-7")!,
      ALL_EXCURSIONS.find((e) => e.id === "sig-8")!,
      ALL_EXCURSIONS.find((e) => e.id === "sig-9")!,
      ALL_EXCURSIONS.find((e) => e.id === "sig-10")!,
    ],
  },
  {
    slug: "golden-southern-coast",
    minGuests: 2,
    maxGuests: 10,
    name: "Golden Southern Coast",
    description:
      "Colonial Galle Fort, whale watching boats, turtle hatcheries, and beaches where you can swim or just watch the fishermen work. Five days along the southern shore where the ocean is warm and the pace feels right.",
    durationDays: 5,
    difficulty: "Easy",
    region: "Southern",
    price: 2200,
    highlights: [
      "Guided tour of Galle Fort",
      "Turtle hatchery visit",
      "Bentota water sports",
      "Whale watching (seasonal)",
      "Beachfront sunset dining",
    ],
    image: "/images/packages/pkg-golden-southern-coast.jpg",
    gallery: [],
    itinerary: [
      { day: 1, title: "Arrive in Galle", description: "Airport transfer to Galle. Afternoon walking tour of the UNESCO fort, including ramparts, boutiques, and cafes." },
      { day: 2, title: "Galle to Mirissa", description: "Morning whale watching excursion (seasonal). Afternoon at Mirissa beach." },
      { day: 3, title: "Mirissa to Unawatuna", description: "Snorkelling at Jungle Beach, visit the Japanese Peace Pagoda. Evening beachside dining." },
      { day: 4, title: "Unawatuna to Bentota", description: "Turtle hatchery visit, river safari on the Madu River, water sports in Bentota." },
      { day: 5, title: "Departure", description: "Morning at leisure on Bentota beach. Transfer to Colombo airport." },
    ],
    transportTiers: TRANSPORT_TIERS,
    standardInclusions: STANDARD_INCLUSIONS,
    excursions: [
      ALL_EXCURSIONS.find((e) => e.id === "gal-1")!,
      ALL_EXCURSIONS.find((e) => e.id === "gal-2")!,
      ALL_EXCURSIONS.find((e) => e.id === "gal-5")!,
      ALL_EXCURSIONS.find((e) => e.id === "gal-6")!,
      ALL_EXCURSIONS.find((e) => e.id === "gal-8")!,
      ALL_EXCURSIONS.find((e) => e.id === "mir-1")!,
      ALL_EXCURSIONS.find((e) => e.id === "mir-4")!,
      ALL_EXCURSIONS.find((e) => e.id === "mir-6")!,
      ALL_EXCURSIONS.find((e) => e.id === "ben-3")!,
      ALL_EXCURSIONS.find((e) => e.id === "ben-4")!,
    ],
  },
  {
    slug: "throbbing-adventure",
    minGuests: 4,
    maxGuests: 12,
    name: "Throbbing Adventure",
    description:
      "White water rafting on the Kelani River, waterfall jumps in jungle canyons, and Ella Rock at dawn. Three intense days in the hills for people who want to move fast and feel something real.",
    durationDays: 3,
    difficulty: "Challenging",
    region: "Hill Country",
    price: 1500,
    highlights: [
      "White water rafting on Kelani River",
      "Jungle canyoning and abseiling",
      "Ella Rock summit hike",
      "Nine Arch Bridge photography",
      "Adventure-camp accommodation",
    ],
    image: "/images/packages/pkg-throbbing-adventure.jpg",
    gallery: [],
    itinerary: [
      { day: 1, title: "Colombo to Kitulgala", description: "Drive to Kitulgala. Afternoon Grade 3–4 white water rafting on the Kelani River." },
      { day: 2, title: "Canyoning & Ella", description: "Morning jungle canyoning and abseiling. Transfer to Ella, evening at Nine Arch Bridge." },
      { day: 3, title: "Ella Rock & Departure", description: "Pre-dawn Ella Rock summit hike. Breakfast with highland views. Transfer to airport." },
    ],
    transportTiers: TRANSPORT_TIERS,
    standardInclusions: STANDARD_INCLUSIONS,
    excursions: [
      ALL_EXCURSIONS.find((e) => e.id === "ella-3")!,
      ALL_EXCURSIONS.find((e) => e.id === "ella-6")!,
      ALL_EXCURSIONS.find((e) => e.id === "ella-9")!,
      ALL_EXCURSIONS.find((e) => e.id === "ella-11")!,
      ALL_EXCURSIONS.find((e) => e.id === "ella-1")!,
      ALL_EXCURSIONS.find((e) => e.id === "ella-2")!,
      ALL_EXCURSIONS.find((e) => e.id === "ella-8")!,
      ALL_EXCURSIONS.find((e) => e.id === "kan-9")!,
      ALL_EXCURSIONS.find((e) => e.id === "ne-7")!,
      ALL_EXCURSIONS.find((e) => e.id === "ne-10")!,
    ],
  },
  {
    slug: "east-coast-escape",
    minGuests: 2,
    maxGuests: 8,
    name: "East Coast Escape",
    description:
      "Surf breaks at Arugam Bay, lagoon safaris at Kumana where flamingos gather, and beaches so quiet you will think you are the only one there. The east coast stays raw because fewer visitors find their way here.",
    durationDays: 5,
    difficulty: "Moderate",
    region: "Eastern Coast",
    price: 1900,
    highlights: [
      "Surfing at Arugam Bay Main Point",
      "Kumana National Park lagoon safari",
      "Pristine eastern beaches",
      "Local fishing village visit",
      "Stargazing on the beach",
    ],
    image: "/images/packages/pkg-east-coast-escape.jpg",
    gallery: [],
    itinerary: [
      { day: 1, title: "Colombo to Arugam Bay", description: "Scenic drive through the eastern highlands to Arugam Bay. Evening beach walk." },
      { day: 2, title: "Surf Day", description: "Morning and afternoon surf sessions at Main Point. Lessons available for all levels." },
      { day: 3, title: "Kumana Safari", description: "Dawn lagoon safari at Kumana National Park. Flamingos, painted storks, and crocodiles." },
      { day: 4, title: "Beach & Village", description: "Visit a local fishing village, explore Pottuvil lagoon, relax on Whiskey Point beach." },
      { day: 5, title: "Departure", description: "Morning stargazing optional. Transfer to Colombo airport." },
    ],
    transportTiers: TRANSPORT_TIERS,
    standardInclusions: STANDARD_INCLUSIONS,
    excursions: [
      ALL_EXCURSIONS.find((e) => e.id === "mir-3")!,
      ALL_EXCURSIONS.find((e) => e.id === "mir-7")!,
      ALL_EXCURSIONS.find((e) => e.id === "yala-5")!,
      ALL_EXCURSIONS.find((e) => e.id === "yala-7")!,
      ALL_EXCURSIONS.find((e) => e.id === "neg-4")!,
      ALL_EXCURSIONS.find((e) => e.id === "neg-7")!,
      ALL_EXCURSIONS.find((e) => e.id === "neg-8")!,
      ALL_EXCURSIONS.find((e) => e.id === "ben-7")!,
      ALL_EXCURSIONS.find((e) => e.id === "gal-8")!,
      ALL_EXCURSIONS.find((e) => e.id === "col-13")!,
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
