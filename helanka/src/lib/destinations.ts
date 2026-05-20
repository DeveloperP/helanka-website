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
    tagline: "The Lion Rock Fortress",
    description:
      "A 5th-century rock fortress rising 200 metres above the surrounding jungle. Sigiriya is Sri Lanka's most iconic landmark — climb its ancient stairways past mirror walls and frescoes to the palace ruins at the summit for panoramic views across the cultural heartland.",
    highlights: [
      "UNESCO World Heritage Site",
      "Ancient frescoes of the Cloud Maidens",
      "Mirror Wall with 1,500-year-old graffiti",
      "Lion's Paw entrance gateway",
      "Royal gardens and water features",
    ],
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA8byS4ur0YLqV8SSm4o61Threszjg0SP-yUsTDvcAY44XGdvHjfYtEmO8xWwdqa3zsomjFqQtUBs_9fbsmGchF1ijExKBw3GDStxTXIWmBvXvbxDv6CANoGNG0bkoO87RTXHyD4ukJA_5T3DRM_YVekWrf7hsdtWPwQcUDQCJMcTQlypRC92CKbLkIXkqjXuz_5A9pFehLUBwX50r4bRM-xaJmnv9KbcgYdGPhVhfT-gJNnbo0aSzlHkBhns9h19oZzn9JNx2vi6g",
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
    tagline: "The Emerald Highlands",
    description:
      "A tiny hill-country town wrapped in tea plantations, waterfalls, and mist. Ella is the gateway to Sri Lanka's most scenic train ride, the Nine Arch Bridge, and some of the island's best short hikes — all at a pace that invites you to slow down.",
    highlights: [
      "Nine Arch Bridge at sunrise",
      "Ella Rock summit hike",
      "Little Adam's Peak panorama",
      "Ravana Falls",
      "Scenic train from Kandy",
    ],
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA7yFEXyPuNX9h_GbgmSdd2qwI4JGC1uoPb7ulTfAcuU6WQF6HvDWujaf8QEbi-HXIPSi9Ar_221wIJRyI8Oc7J9YbONA7xBcrMWiP3j9sUxtS_xURw4mrwBaIxZ8YFeFDrWujeqMRLL2Z_yQq2sEuX2EIyjhd_ytbtIFiFgLpuMSox6uLPQ4pCNGmRMXN6AjrjBnRZaTcV7N1c8-P2ncWBgCmmQPApVYrL3GlPUK8xxdDNtop4B4tKepr0tLvqmw1IS4_2n1Kc2ko",
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
    tagline: "Colonial Heritage by the Sea",
    description:
      "A living UNESCO fortress town built by the Dutch in the 17th century. Walk cobblestone streets lined with artisan boutiques, rooftop cafés, and ocean-view ramparts. Galle blends colonial architecture with Sri Lankan warmth in a setting unlike anywhere else.",
    highlights: [
      "UNESCO World Heritage ramparts",
      "Dutch Reformed Church",
      "Lighthouse and Flag Rock sunset",
      "Artisan boutiques and galleries",
      "Cricket ground inside the fort",
    ],
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDiJOIXdRp0l7rGwM8eiDyKXWXVHTHtciFZ-YXdZS3Cd9Uo-jvjFfC09J1WRQpYmbcO1BEtchv6CUXXxjYi0Pj8O9AFnXORA-4OY6xP1sCWn2N6cEUxSy-Eggf1cODQjozh-4b2OecEaGjoTRnYKY5p2xzfvI7ykfVFCQobSh7YxsSpR8Jz3XPqWXMndy5ipi7S_5kAdrq6RJQjUewrywmX-gNn0HENvBLOT0nNjqBDC3yCoO4EmHmuMhnoLYkVsDUktQR6kRPhP2M",
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
    tagline: "The Leopard Kingdom",
    description:
      "Sri Lanka's most famous national park and one of the best places on Earth to spot leopards in the wild. Yala's mosaic of lagoons, scrubland, and jungle is also home to elephants, sloth bears, crocodiles, and over 200 bird species.",
    highlights: [
      "Highest leopard density in the world",
      "Elephant herds at waterholes",
      "Sloth bear territory",
      "Coastal lagoon birdwatching",
      "Dawn and dusk game drives",
    ],
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAvL9qQCZqkuUZZhDFPiuljSOElBzTS-i7kLp90dx9jPIRgvPItqhfxy9613-soZHzobTHli7BjWkH4-Haw9lP45E2wiW9j2dUftl84hUoLQpMhO1LIzUoQRk5nyTAmY78Y-IBlM5Mrog1JBI8zdp86HBVzmlXisZYgFH5lIspaZdstoAxqxQrnPxafv0B8S_p0e8P0tS2KZMFdCj6rUEkqe56zoOq8yXRaQE2XqbrLuXWXGtJVEbnTCZcpKa2KlGrKVElRaZGsohs",
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
    tagline: "Where the Ocean Breathes",
    description:
      "A crescent bay on Sri Lanka's southern tip where palm trees lean over golden sand. Mirissa is the launch point for blue whale watching, a haven for surfers, and the place to catch the most spectacular sunsets on the island.",
    highlights: [
      "Blue whale and dolphin watching",
      "Coconut Tree Hill viewpoint",
      "Secret Beach cove",
      "Surf breaks for all levels",
      "Beachside seafood barbecues",
    ],
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBmyTIo8YOpdkZbjNE4Zb0suaLf9bdAU7twbbb6gP99Rnxc612XVWmI3SRy5DGonal9DQDihBwEKQR1sKvRwuQl9xWpSNmBnPHjnZtCU0dtxO3ivqyt4kfTEhJr5ZjH04EqJdKA_2wj6K3lpUdEMEbH7siAiTWks6W-LGz9tZMbKXbt6MK48V3T3oA7-PCIWDmkLqT6ma5Iga--4Y-rNqtL5K-96EGmEPesQ_l_EqrXPd7oJCEL-0z2vnZXeTwjUpjQkrwLobtgqB0",
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
    tagline: "The Sacred Capital",
    description:
      "Sri Lanka's cultural capital, cradled by misty hills and centred around a serene lake. Kandy is home to the Temple of the Tooth — the island's holiest Buddhist relic — and the starting point for the world-famous scenic train to Ella.",
    highlights: [
      "Temple of the Sacred Tooth Relic",
      "Kandy Lake evening walk",
      "Royal Botanical Gardens at Peradeniya",
      "Traditional Kandyan dance show",
      "Start of the scenic train to Ella",
    ],
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA8byS4ur0YLqV8SSm4o61Threszjg0SP-yUsTDvcAY44XGdvHjfYtEmO8xWwdqa3zsomjFqQtUBs_9fbsmGchF1ijExKBw3GDStxTXIWmBvXvbxDv6CANoGNG0bkoO87RTXHyD4ukJA_5T3DRM_YVekWrf7hsdtWPwQcUDQCJMcTQlypRC92CKbLkIXkqjXuz_5A9pFehLUBwX50r4bRM-xaJmnv9KbcgYdGPhVhfT-gJNnbo0aSzlHkBhns9h19oZzn9JNx2vi6g",
    facts: [
      { label: "Best Time", value: "Jan – Apr" },
      { label: "Elevation", value: "465m" },
      { label: "Type", value: "Cultural" },
    ],
  },
];

export const regionFilters = ["All", "Cultural Triangle", "Hill Country", "Southern Coast", "Southern", "Central"];

export function getDestinationBySlug(slug: string): Destination | undefined {
  return destinations.find((d) => d.slug === slug);
}
