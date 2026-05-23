export interface Destination {
  slug: string;
  name: string;
  region: string;
  tagline: string;
  description: string;
  highlights: string[];
  image: string;
  facts: { label: string; value: string }[];
}

export const destinations: Destination[] = [
  {
    slug: "sigiriya",
    name: "Sigiriya",
    region: "Cultural Triangle",
    tagline: "Ancient Lion's Rock",
    description:
      "A 5th-century rock fortress rising 200 metres above the jungle. Climb the ancient stairways past frescoes and mirror walls to the palace ruins at the summit. The views across the cultural heartland stretch for miles in every direction.",
    highlights: [
      "UNESCO World Heritage Site",
      "Ancient frescoes of the Cloud Maidens",
      "Mirror Wall with 1,500-year-old graffiti",
      "Lion's Paw entrance gateway",
      "Royal gardens and water features",
    ],
    image: "/images/destinations/dest-sigiriya.jpg",
    facts: [
      { label: "Best Time", value: "Jan – Apr" },
      { label: "Elevation", value: "349m" },
      { label: "Type", value: "Heritage" },
    ],
  },
  {
    slug: "ella",
    name: "Ella",
    region: "Hill Country",
    tagline: "Tea Hills and Train Rides",
    description:
      "A small hill-country town surrounded by tea plantations and cool air. The famous blue train rolls through here on its way from Kandy. Hike to waterfalls, catch sunrise at Nine Arch Bridge, or walk the quiet valleys with the mist around you.",
    highlights: [
      "Nine Arch Bridge at sunrise",
      "Ella Rock summit hike",
      "Little Adam's Peak panorama",
      "Ravana Falls",
      "Scenic train from Kandy",
    ],
    image: "/images/destinations/dest-ella.jpg",
    facts: [
      { label: "Best Time", value: "Jan – Mar" },
      { label: "Elevation", value: "1,041m" },
      { label: "Type", value: "Adventure" },
    ],
  },
  {
    slug: "galle",
    name: "Galle Fort",
    region: "Southern Coast",
    tagline: "Ramparts by the Sea",
    description:
      "Walk the 17th-century Dutch ramparts with cafes, galleries, and old colonial buildings lining the streets below. The fort sits right on the ocean. Watch the sunset from Flag Rock or spend an afternoon exploring the narrow cobblestone lanes.",
    highlights: [
      "UNESCO World Heritage ramparts",
      "Dutch Reformed Church",
      "Lighthouse and Flag Rock sunset",
      "Artisan boutiques and galleries",
      "Cricket ground inside the fort",
    ],
    image: "/images/destinations/dest-galle.jpg",
    facts: [
      { label: "Best Time", value: "Dec – Apr" },
      { label: "Elevation", value: "Sea level" },
      { label: "Type", value: "Heritage" },
    ],
  },
  {
    slug: "yala",
    name: "Yala",
    region: "Southern",
    tagline: "Where Leopards Live",
    description:
      "One of the best places on Earth to see leopards in the wild. The park has lagoons, jungle, and scrubland where you will also spot elephant herds at waterholes, sloth bears, and over 200 bird species. Early morning safaris give you the best chances.",
    highlights: [
      "Highest leopard density in the world",
      "Elephant herds at waterholes",
      "Sloth bear territory",
      "Coastal lagoon birdwatching",
      "Dawn and dusk game drives",
    ],
    image: "/images/destinations/dest-yala.jpg",
    facts: [
      { label: "Best Time", value: "Feb – Jul" },
      { label: "Area", value: "979 km²" },
      { label: "Type", value: "Wildlife" },
    ],
  },
  {
    slug: "mirissa",
    name: "Mirissa",
    region: "Southern Coast",
    tagline: "Southern Bay, Big Whales",
    description:
      "A crescent bay at the island's southern tip where blue whales swim offshore and palm trees lean over the sand. The beach break works for surfers, the sunsets run long, and the local seafood grilled fresh each evening is worth every visit.",
    highlights: [
      "Blue whale and dolphin watching",
      "Coconut Tree Hill viewpoint",
      "Secret Beach cove",
      "Surf breaks for all levels",
      "Beachside seafood barbecues",
    ],
    image: "/images/destinations/dest-mirissa.jpg",
    facts: [
      { label: "Best Time", value: "Nov – Apr" },
      { label: "Elevation", value: "Sea level" },
      { label: "Type", value: "Coastal" },
    ],
  },
  {
    slug: "kandy",
    name: "Kandy",
    region: "Central",
    tagline: "Sacred Hills, Living Culture",
    description:
      "Sri Lanka's cultural heart sits in green hills around a calm lake. The Temple of the Tooth holds one of Buddhism's most sacred relics. The scenic train to Ella leaves from here, and the city's Kandyan dance traditions remain vibrant and alive.",
    highlights: [
      "Temple of the Sacred Tooth Relic",
      "Kandy Lake evening walk",
      "Royal Botanical Gardens at Peradeniya",
      "Traditional Kandyan dance show",
      "Start of the scenic train to Ella",
    ],
    image: "/images/destinations/dest-kandy.jpg",
    facts: [
      { label: "Best Time", value: "Jan – Apr" },
      { label: "Elevation", value: "465m" },
      { label: "Type", value: "Cultural" },
    ],
  },
  {
    slug: "colombo",
    name: "Colombo",
    region: "Western",
    tagline: "Energy, History, Layers",
    description:
      "The capital mixes colonial buildings with modern skyscrapers, temple incense with traffic, and street food stalls with rooftop bars. Wander the Pettah bazaar, visit Gangaramaya Temple, climb the Lotus Tower, or sit on Galle Face Green as the sun sets.",
    highlights: [
      "Gangaramaya Temple",
      "Lotus Tower",
      "Pettah Market",
      "Independence Square",
      "Galle Face Green",
    ],
    image: "/images/destinations/dest-colombo.jpg",
    facts: [
      { label: "Best Time", value: "Dec – Apr" },
      { label: "Elevation", value: "Sea level" },
      { label: "Type", value: "City" },
    ],
  },
  {
    slug: "negombo",
    name: "Negombo",
    region: "Western Coast",
    tagline: "First Taste of Sri Lanka",
    description:
      "Just minutes from the airport, this fishing town has colourful boats on the beach, a busy fish market at dawn, and the old Dutch canal running through town. It is the perfect place to start or end your trip without rushing into the highlands.",
    highlights: [
      "Negombo Lagoon",
      "Fish Market",
      "Dutch Canal",
      "Catamaran sailing",
      "Beach sunsets",
    ],
    image: "/images/destinations/dest-negombo.jpg",
    facts: [
      { label: "Best Time", value: "Dec – Apr" },
      { label: "Elevation", value: "Sea level" },
      { label: "Type", value: "Coastal" },
    ],
  },
  {
    slug: "nuwara-eliya",
    name: "Nuwara Eliya",
    region: "Hill Country",
    tagline: "Cool Colonial Highlands",
    description:
      "At nearly 2,000 metres, this hill station feels like stepping into another era. Red post boxes, tea estates on every slope, and cool air that makes you reach for a jacket. Hike to World's End at Horton Plains or walk the mist-covered trails with views that seem to go on forever.",
    highlights: [
      "Tea Plantations",
      "Gregory Lake",
      "Horton Plains",
      "World's End",
      "Hakgala Gardens",
    ],
    image: "/images/destinations/dest-nuwara-eliya.jpg",
    facts: [
      { label: "Best Time", value: "Jan – Apr" },
      { label: "Elevation", value: "1,868m" },
      { label: "Type", value: "Hill Country" },
    ],
  },
  {
    slug: "bentota",
    name: "Bentota",
    region: "Southern Coast",
    tagline: "River, Ocean, Turtles",
    description:
      "The Bentota River meets the Indian Ocean here, creating a lagoon surrounded by mangroves and cinnamon islands. Visit the turtle hatchery, explore the waterways by boat, or simply relax between the river and the sea where everything moves at its own speed.",
    highlights: [
      "Bentota River Safari",
      "Water Sports",
      "Madu River",
      "Turtle Hatchery",
      "Cinnamon Island",
    ],
    image: "/images/destinations/dest-bentota.jpg",
    facts: [
      { label: "Best Time", value: "Dec – Apr" },
      { label: "Elevation", value: "Sea level" },
      { label: "Type", value: "Coastal" },
    ],
  },
];

export const regionFilters = [
  "All",
  "Cultural Triangle",
  "Hill Country",
  "Southern Coast",
  "Southern",
  "Central",
  "Western",
  "Western Coast",
];

export function getDestinationBySlug(slug: string): Destination | undefined {
  return destinations.find((d) => d.slug === slug);
}
