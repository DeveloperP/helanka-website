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

export const packages: Package[] = [
  {
    slug: "hill-country-explorer",
    name: "Hill Country Explorer",
    minGuests: 2,
    maxGuests: 8,
    description:
      "Wind through misty mountains, colonial tea estates, and sacred cultural sites on this classic Sri Lanka hill country circuit. Travel by scenic train from Nuwara Eliya down to Ella before finishing in the cultural capital Kandy.",
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
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA7yFEXyPuNX9h_GbgmSdd2qwI4JGC1uoPb7ulTfAcuU6WQF6HvDWujaf8QEbi-HXIPSi9Ar_221wIJRyI8Oc7J9YbONA7xBcrMWiP3j9sUxtS_xURw4mrwBaIxZ8YFeFDrWujeqMRLL2Z_yQq2sEuX2EIyjhd_ytbtIFiFgLpuMSox6uLPQ4pCNGmRMXN6AjrjBnRZaTcV7N1c8-P2ncWBgCmmQPApVYrL3GlPUK8xxdDNtop4B4tKepr0tLvqmw1IS4_2n1Kc2ko",
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
      { id: "hce-1", name: "Temple of the Tooth Evening Ceremony", description: "Witness the sacred Dalada Perahera evening puja ceremony inside Kandy's most revered Buddhist temple.", durationHours: 2, destinationSlug: "kandy" },
      { id: "hce-2", name: "Royal Botanical Gardens Walk", description: "Guided walk through 150 acres of tropical orchids, spice gardens, and giant Java fig trees in Peradeniya.", durationHours: 3, destinationSlug: "kandy" },
      { id: "hce-3", name: "Kandyan Dance Performance", description: "Private viewing of traditional fire-walking, plate-spinning, and masked dance by Kandy's finest troupe.", durationHours: 1.5, destinationSlug: "kandy" },
      { id: "hce-4", name: "Nine Arch Bridge Sunrise Trek", description: "Pre-dawn hike to the iconic Nine Arch Bridge viewpoint to watch the first train cross at golden hour.", durationHours: 3, destinationSlug: "ella" },
      { id: "hce-5", name: "Little Adam's Peak Hike", description: "A gentle summit hike through tea plantations with 360-degree panoramic views of Ella Gap.", durationHours: 2.5, destinationSlug: "ella" },
      { id: "hce-6", name: "Pedro Tea Factory Tour", description: "Walk through a working colonial-era tea factory in Nuwara Eliya, from withering troughs to tasting room.", durationHours: 2, destinationSlug: "kandy" },
      { id: "hce-7", name: "Horton Plains World's End Trek", description: "Sunrise trek across cloud-forest plains to the sheer 880m cliff drop at World's End.", durationHours: 4, destinationSlug: "ella" },
      { id: "hce-8", name: "Udawalawe Elephant Safari", description: "Afternoon jeep safari through Udawalawe National Park — home to over 500 wild elephants.", durationHours: 3.5, destinationSlug: "yala" },
      { id: "hce-9", name: "Ravana Falls & Cave Visit", description: "Visit the cascading Ravana Falls and explore the legendary cave associated with the Ramayana epic.", durationHours: 2, destinationSlug: "ella" },
      { id: "hce-10", name: "Kandy Lake Sunset Stroll", description: "Leisurely evening walk around the scenic Kandy Lake with a stop at a lakeside café.", durationHours: 1.5, destinationSlug: "kandy" },
    ],
  },
  {
    slug: "wildlife-adventure",
    minGuests: 2,
    maxGuests: 6,
    name: "Wildlife Adventure",
    description:
      "Track leopards, elephants, and exotic birds across two of Sri Lanka's premier national parks. Combine dawn game drives in Yala with a twilight excursion to Wilpattu for an unparalleled wildlife experience.",
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
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAvL9qQCZqkuUZZhDFPiuljSOElBzTS-i7kLp90dx9jPIRgvPItqhfxy9613-soZHzobTHli7BjWkH4-Haw9lP45E2wiW9j2dUftl84hUoLQpMhO1LIzUoQRk5nyTAmY78Y-IBlM5Mrog1JBI8zdp86HBVzmlXisZYgFH5lIspaZdstoAxqxQrnPxafv0B8S_p0e8P0tS2KZMFdCj6rUEkqe56zoOq8yXRaQE2XqbrLuXWXGtJVEbnTCZcpKa2KlGrKVElRaZGsohs",
    gallery: [],
    itinerary: [
      { day: 1, title: "Colombo to Yala", description: "Morning drive to Yala. Afternoon game drive with expert tracker — prime leopard territory." },
      { day: 2, title: "Full Day Yala Safari", description: "Dawn and dusk game drives. Spot elephants, sloth bears, crocodiles, and over 200 bird species." },
      { day: 3, title: "Yala to Wilpattu", description: "Transfer to Wilpattu National Park. Twilight safari along the unique villu (natural lakes)." },
      { day: 4, title: "Wilpattu & Departure", description: "Early morning game drive. Afternoon transfer to Colombo airport." },
    ],
    transportTiers: TRANSPORT_TIERS,
    standardInclusions: STANDARD_INCLUSIONS,
    excursions: [
      { id: "wa-1", name: "Yala Leopard Tracking Safari", description: "Dawn jeep safari led by an expert tracker through Yala's Block 1 — the highest leopard density on Earth.", durationHours: 4, destinationSlug: "yala" },
      { id: "wa-2", name: "Yala Birding Walk", description: "Guided birding walk along Yala's lagoon fringes — spot painted storks, kingfishers, and sea eagles.", durationHours: 3, destinationSlug: "yala" },
      { id: "wa-3", name: "Wilpattu Villu Lake Drive", description: "Twilight game drive through Wilpattu's unique villu lakes to spot sloth bears, leopards, and deer.", durationHours: 3.5, destinationSlug: "yala" },
      { id: "wa-4", name: "Elephant Herd Observation", description: "Spend time at a known elephant gathering point watching herds bathe, feed, and socialize.", durationHours: 2.5, destinationSlug: "yala" },
      { id: "wa-5", name: "Crocodile Lagoon Boat Ride", description: "Quiet boat ride through a saltwater lagoon teeming with mugger and saltwater crocodiles.", durationHours: 2, destinationSlug: "yala" },
      { id: "wa-6", name: "Night Safari Experience", description: "After-dark spotlighting safari to find nocturnal species — fishing cats, civets, and owls.", durationHours: 3, destinationSlug: "yala" },
      { id: "wa-7", name: "Wildlife Photography Workshop", description: "Half-day photography masterclass in the park with a professional wildlife photographer.", durationHours: 4, destinationSlug: "yala" },
      { id: "wa-8", name: "Kataragama Temple Visit", description: "Visit the sacred multi-faith Kataragama Temple complex on the border of Yala.", durationHours: 2, destinationSlug: "yala" },
      { id: "wa-9", name: "Bundala Wetlands Excursion", description: "Day trip to Bundala National Park — flamingo flocks, sea turtles, and pristine sand dunes.", durationHours: 4, destinationSlug: "yala" },
      { id: "wa-10", name: "Tissa Lake Sunset & Stupa", description: "Evening visit to the ancient Tissa Dagoba stupa, followed by a sunset walk around Tissa Lake.", durationHours: 2, destinationSlug: "yala" },
    ],
  },
  {
    slug: "golden-southern-coast",
    minGuests: 2,
    maxGuests: 10,
    name: "Golden Southern Coast",
    description:
      "Explore the sun-kissed southern coastline from the UNESCO-listed Galle Fort to the turtle-nesting beaches of Bentota. Enjoy colonial heritage, world-class snorkelling, and relaxing beachside evenings.",
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
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDiJOIXdRp0l7rGwM8eiDyKXWXVHTHtciFZ-YXdZS3Cd9Uo-jvjFfC09J1WRQpYmbcO1BEtchv6CUXXxjYi0Pj8O9AFnXORA-4OY6xP1sCWn2N6cEUxSy-Eggf1cODQjozh-4b2OecEaGjoTRnYKY5p2xzfvI7ykfVFCQobSh7YxsSpR8Jz3XPqWXMndy5ipi7S_5kAdrq6RJQjUewrywmX-gNn0HENvBLOT0nNjqBDC3yCoO4EmHmuMhnoLYkVsDUktQR6kRPhP2M",
    gallery: [],
    itinerary: [
      { day: 1, title: "Arrive in Galle", description: "Airport transfer to Galle. Afternoon walking tour of the UNESCO fort — ramparts, boutiques, and cafés." },
      { day: 2, title: "Galle to Mirissa", description: "Morning whale watching excursion (seasonal). Afternoon at Mirissa beach." },
      { day: 3, title: "Mirissa to Unawatuna", description: "Snorkelling at Jungle Beach, visit the Japanese Peace Pagoda. Evening beachside dining." },
      { day: 4, title: "Unawatuna to Bentota", description: "Turtle hatchery visit, river safari on the Madu River, water sports in Bentota." },
      { day: 5, title: "Departure", description: "Morning at leisure on Bentota beach. Transfer to Colombo airport." },
    ],
    transportTiers: TRANSPORT_TIERS,
    standardInclusions: STANDARD_INCLUSIONS,
    excursions: [
      { id: "gsc-1", name: "Galle Fort Heritage Walking Tour", description: "Guided 2-hour walking tour through the UNESCO fort — Dutch ramparts, lighthouse, and artisan shops.", durationHours: 2, destinationSlug: "galle" },
      { id: "gsc-2", name: "Mirissa Whale Watching", description: "Early morning boat excursion to spot blue whales, sperm whales, and spinner dolphins off the southern coast.", durationHours: 4, destinationSlug: "mirissa" },
      { id: "gsc-3", name: "Jungle Beach Snorkelling", description: "Snorkel over coral gardens at Unawatuna's hidden Jungle Beach, teeming with tropical reef fish.", durationHours: 2.5, destinationSlug: "galle" },
      { id: "gsc-4", name: "Madu River Boat Safari", description: "Cruise through mangrove tunnels and visit a cinnamon island on the Madu Ganga river.", durationHours: 3, destinationSlug: "galle" },
      { id: "gsc-5", name: "Sea Turtle Hatchery Visit", description: "Visit a conservation hatchery in Bentota, learn about turtle species, and release hatchlings at dusk.", durationHours: 1.5, destinationSlug: "galle" },
      { id: "gsc-6", name: "Bentota Water Sports", description: "Jet-skiing, banana boat rides, and wakeboarding on the Bentota River and lagoon.", durationHours: 3, destinationSlug: "galle" },
      { id: "gsc-7", name: "Stilt Fishermen Experience", description: "Meet the famous stilt fishermen of Koggala and try your hand at this centuries-old fishing technique.", durationHours: 1.5, destinationSlug: "mirissa" },
      { id: "gsc-8", name: "Japanese Peace Pagoda Visit", description: "Hike to the hilltop Peace Pagoda in Unawatuna for sweeping views of the southern coastline.", durationHours: 1.5, destinationSlug: "galle" },
      { id: "gsc-9", name: "Mirissa Sunset Catamaran Cruise", description: "Private catamaran cruise along the Mirissa coast with drinks and canapes as the sun sets.", durationHours: 2, destinationSlug: "mirissa" },
      { id: "gsc-10", name: "Galle Fort Cooking Class", description: "Learn to prepare authentic Sri Lankan rice and curry with a Galle Fort chef in a heritage kitchen.", durationHours: 3, destinationSlug: "galle" },
    ],
  },
  {
    slug: "throbbing-adventure",
    minGuests: 4,
    maxGuests: 12,
    name: "Throbbing Adventure",
    description:
      "An action-packed hill country escape for thrill-seekers. Raft the Grade 3–4 rapids of the Kelani River in Kitulgala, abseil cliff faces through jungle canyons, and summit Ella Rock for sweeping highland panoramas.",
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
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA8byS4ur0YLqV8SSm4o61Threszjg0SP-yUsTDvcAY44XGdvHjfYtEmO8xWwdqa3zsomjFqQtUBs_9fbsmGchF1ijExKBw3GDStxTXIWmBvXvbxDv6CANoGNG0bkoO87RTXHyD4ukJA_5T3DRM_YVekWrf7hsdtWPwQcUDQCJMcTQlypRC92CKbLkIXkqjXuz_5A9pFehLUBwX50r4bRM-xaJmnv9KbcgYdGPhVhfT-gJNnbo0aSzlHkBhns9h19oZzn9JNx2vi6g",
    gallery: [],
    itinerary: [
      { day: 1, title: "Colombo to Kitulgala", description: "Drive to Kitulgala. Afternoon Grade 3–4 white water rafting on the Kelani River." },
      { day: 2, title: "Canyoning & Ella", description: "Morning jungle canyoning and abseiling. Transfer to Ella, evening at Nine Arch Bridge." },
      { day: 3, title: "Ella Rock & Departure", description: "Pre-dawn Ella Rock summit hike. Breakfast with highland views. Transfer to airport." },
    ],
    transportTiers: TRANSPORT_TIERS,
    standardInclusions: STANDARD_INCLUSIONS,
    excursions: [
      { id: "ta-1", name: "Kelani River White Water Rafting", description: "Grade 3–4 rapids through jungle-lined gorges on the Kelani River with certified instructors.", durationHours: 3, destinationSlug: "ella" },
      { id: "ta-2", name: "Jungle Canyoning & Abseiling", description: "Descend cliff faces and natural waterfalls through dense jungle canyons with full safety gear.", durationHours: 4, destinationSlug: "ella" },
      { id: "ta-3", name: "Ella Rock Summit Hike", description: "Pre-dawn trek through tea estates to the Ella Rock summit for sunrise panoramas over the highlands.", durationHours: 4, destinationSlug: "ella" },
      { id: "ta-4", name: "Zip Line Over Ella Gap", description: "Soar 200m above the valley floor on Sri Lanka's longest zip line with unreal highland views.", durationHours: 1.5, destinationSlug: "ella" },
      { id: "ta-5", name: "Kitulgala Jungle Trek", description: "Guided trek through the jungle where Bridge on the River Kwai was filmed, with waterfall swims.", durationHours: 3, destinationSlug: "ella" },
      { id: "ta-6", name: "Mountain Biking Ella to Demodara", description: "Downhill mountain bike ride from Ella town through tea plantations to the Demodara Loop bridge.", durationHours: 3, destinationSlug: "ella" },
      { id: "ta-7", name: "Rock Climbing at Bambarakanda", description: "Guided rock climbing session near Bambarakanda Falls, Sri Lanka's tallest waterfall.", durationHours: 4, destinationSlug: "ella" },
      { id: "ta-8", name: "Waterfall Rappelling", description: "Rappel down a 30m jungle waterfall in Kitulgala with certified adventure guides.", durationHours: 2.5, destinationSlug: "ella" },
      { id: "ta-9", name: "Night Hike & Firefly Trail", description: "After-dark guided hike through the forest with bioluminescent fungi and firefly swarms.", durationHours: 2, destinationSlug: "ella" },
      { id: "ta-10", name: "Kayaking on Castlereagh Reservoir", description: "Paddle across the glass-still Castlereagh Reservoir surrounded by misty tea-covered mountains.", durationHours: 2.5, destinationSlug: "ella" },
    ],
  },
  {
    slug: "east-coast-escape",
    minGuests: 2,
    maxGuests: 8,
    name: "East Coast Escape",
    description:
      "Discover the raw, unhurried beauty of Sri Lanka's east coast. Ride consistent surf breaks at Arugam Bay, explore the wildlife-rich Kumana lagoon, and unwind on some of the island's most pristine and uncrowded beaches.",
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
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBmyTIo8YOpdkZbjNE4Zb0suaLf9bdAU7twbbb6gP99Rnxc612XVWmI3SRy5DGonal9DQDihBwEKQR1sKvRwuQl9xWpSNmBnPHjnZtCU0dtxO3ivqyt4kfTEhJr5ZjH04EqJdKA_2wj6K3lpUdEMEbH7siAiTWks6W-LGz9tZMbKXbt6MK48V3T3oA7-PCIWDmkLqT6ma5Iga--4Y-rNqtL5K-96EGmEPesQ_l_EqrXPd7oJCEL-0z2vnZXeTwjUpjQkrwLobtgqB0",
    gallery: [],
    itinerary: [
      { day: 1, title: "Colombo to Arugam Bay", description: "Scenic drive through the eastern highlands to Arugam Bay. Evening beach walk." },
      { day: 2, title: "Surf Day", description: "Morning and afternoon surf sessions at Main Point. Lessons available for all levels." },
      { day: 3, title: "Kumana Safari", description: "Dawn lagoon safari at Kumana National Park — flamingos, painted storks, and crocodiles." },
      { day: 4, title: "Beach & Village", description: "Visit a local fishing village, explore Pottuvil lagoon, relax on Whiskey Point beach." },
      { day: 5, title: "Departure", description: "Morning stargazing optional. Transfer to Colombo airport." },
    ],
    transportTiers: TRANSPORT_TIERS,
    standardInclusions: STANDARD_INCLUSIONS,
    excursions: [
      { id: "ece-1", name: "Arugam Bay Surf Lesson", description: "Two-hour surf lesson at Main Point with a local instructor — boards and rash guards included.", durationHours: 2, destinationSlug: "mirissa" },
      { id: "ece-2", name: "Kumana Lagoon Safari", description: "Dawn boat safari through Kumana's bird-rich lagoons — flamingos, painted storks, and pelicans.", durationHours: 3.5, destinationSlug: "yala" },
      { id: "ece-3", name: "Pottuvil Lagoon Kayak", description: "Paddle through the serene Pottuvil lagoon surrounded by mangroves and wading birds.", durationHours: 2, destinationSlug: "mirissa" },
      { id: "ece-4", name: "Fishing Village Cultural Visit", description: "Spend a morning with a traditional fishing family — help haul nets, prepare lunch, learn local crafts.", durationHours: 3, destinationSlug: "mirissa" },
      { id: "ece-5", name: "Whiskey Point Beach Day", description: "Full day at the pristine Whiskey Point beach with sun loungers, fresh seafood lunch, and bodyboarding.", durationHours: 5, destinationSlug: "mirissa" },
      { id: "ece-6", name: "Lahugala Elephant Gathering", description: "Visit Lahugala Tank at dusk to witness wild elephant herds gathering to drink and bathe.", durationHours: 2.5, destinationSlug: "yala" },
      { id: "ece-7", name: "Beach Bonfire & Stargazing", description: "Private beach bonfire setup with telescope-guided stargazing along the unpolluted eastern coast.", durationHours: 2, destinationSlug: "mirissa" },
      { id: "ece-8", name: "Okanda Ancient Temple Visit", description: "Visit the remote Okanda Devalaya shrine at the edge of Kumana, sacred to Buddhist and Hindu pilgrims.", durationHours: 2, destinationSlug: "yala" },
      { id: "ece-9", name: "Stand-Up Paddleboarding", description: "SUP session on the calm morning waters of Arugam Bay with gear and instruction included.", durationHours: 1.5, destinationSlug: "mirissa" },
      { id: "ece-10", name: "East Coast Seafood Cooking Class", description: "Learn to prepare crab curry, prawn ambul thiyal, and more with a local chef on the beach.", durationHours: 3, destinationSlug: "mirissa" },
    ],
  },
];

export function getPackageBySlug(slug: string): Package | undefined {
  return packages.find((p) => p.slug === slug);
}

export function getExcursionsForDestination(
  destinationSlug: string
): (Excursion & { packageSlug: string; packageName: string })[] {
  return packages.flatMap((pkg) =>
    pkg.excursions
      .filter((e) => e.destinationSlug === destinationSlug)
      .map((e) => ({ ...e, packageSlug: pkg.slug, packageName: pkg.name }))
  );
}
