export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  featured?: boolean;
}

export const posts: BlogPost[] = [
  {
    slug: "ultimate-guide-sri-lanka-train-journeys",
    title: "The Ultimate Guide to Sri Lanka's Scenic Train Journeys",
    excerpt:
      "From Kandy to Ella, the highland rail line is one of the most beautiful train rides on Earth. Here's everything you need to know before you board.",
    body: `Sri Lanka's rail network was built by the British in the 1860s to move tea from the highlands to Colombo's port. Today, the same narrow-gauge tracks carry travellers through some of the most jaw-dropping scenery in Asia.

The crown jewel is the Kandy–Ella route. Over seven hours, the train climbs from the cultural capital through emerald tea plantations, crosses the famous Nine Arch Bridge, and ducks into tunnels carved through solid rock.

**When to ride:** The first-class observation car sells out weeks ahead — book at Colombo Fort station or through your hotel concierge. Second class is perfectly comfortable and the windows open for photos.

**Pro tip:** Sit on the right side heading south for the best valley views. The stretch between Haputale and Ella is the most dramatic — time your journey so you pass through in daylight.

We include this train journey in our Hill Country Explorer and Grand Tour packages, with reserved seats and a guide to narrate the passing landscapes.`,
    category: "Travel Tips",
    author: "Kavinda Perera",
    date: "2026-05-10",
    readTime: "6 min",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA7yFEXyPuNX9h_GbgmSdd2qwI4JGC1uoPb7ulTfAcuU6WQF6HvDWujaf8QEbi-HXIPSi9Ar_221wIJRyI8Oc7J9YbONA7xBcrMWiP3j9sUxtS_xURw4mrwBaIxZ8YFeFDrWujeqMRLL2Z_yQq2sEuX2EIyjhd_ytbtIFiFgLpuMSox6uLPQ4pCNGmRMXN6AjrjBnRZaTcV7N1c8-P2ncWBgCmmQPApVYrL3GlPUK8xxdDNtop4B4tKepr0tLvqmw1IS4_2n1Kc2ko",
    featured: true,
  },
  {
    slug: "leopard-spotting-yala-what-to-expect",
    title: "Leopard Spotting in Yala: What to Expect on Your First Safari",
    excerpt:
      "Yala has the highest leopard density in the world — but seeing one still takes patience, timing, and the right guide.",
    body: `Yala National Park sits on Sri Lanka's southeastern coast, a mosaic of thorny scrubland, rocky outcrops, and coastal lagoons. It's home to roughly 80 leopards in its most-visited Block 1 alone.

**Best time:** February to July, when the dry season concentrates animals around waterholes. Dawn drives (5:30 AM gate opening) give the best chances — leopards are most active in the cool early hours.

**What you'll see beyond leopards:** Herds of 30+ elephants, sloth bears raiding termite mounds, mugger crocodiles, and flocks of painted storks.

**Our approach:** We work with naturalist-guides who know individual leopards by name and territory. Our Wildlife Adventure package includes two full safari days with a guaranteed tracker jeep — not the crowded convoy experience.

**Kit list:** Binoculars, a 200mm+ lens, neutral-coloured clothing, and sunscreen. The park is hot and dusty — bring more water than you think you need.`,
    category: "Wildlife",
    author: "Amara Silva",
    date: "2026-04-28",
    readTime: "5 min",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAvL9qQCZqkuUZZhDFPiuljSOElBzTS-i7kLp90dx9jPIRgvPItqhfxy9613-soZHzobTHli7BjWkH4-Haw9lP45E2wiW9j2dUftl84hUoLQpMhO1LIzUoQRk5nyTAmY78Y-IBlM5Mrog1JBI8zdp86HBVzmlXisZYgFH5lIspaZdstoAxqxQrnPxafv0B8S_p0e8P0tS2KZMFdCj6rUEkqe56zoOq8yXRaQE2XqbrLuXWXGtJVEbnTCZcpKa2KlGrKVElRaZGsohs",
    featured: true,
  },
  {
    slug: "galle-fort-weekend-guide",
    title: "A Weekend in Galle Fort: Where to Stay, Eat, and Explore",
    excerpt:
      "Cobblestone lanes, ocean ramparts, and the best crab curry on the island — your 48-hour Galle Fort itinerary.",
    body: `Galle Fort is Sri Lanka's most atmospheric town — a UNESCO-listed walled enclave where 17th-century Dutch colonial architecture meets contemporary Sri Lankan creativity.

**Day 1:** Walk the ramparts at sunrise before the crowds. Start at the lighthouse, loop south past Flag Rock (sunset spot), and circle back via the Dutch Reformed Church. Lunch at a courtyard café — try the rice and curry at a family-run place on Pedlar Street.

**Day 2:** Browse the boutiques on Church Street for handmade jewellery and batik. Visit the Maritime Museum, then head to Unawatuna (10 min by tuk-tuk) for an afternoon on the beach.

**Where to stay:** Heritage boutique hotels inside the fort walls start around $120/night. For luxury, the converted warehouse hotels near the ramparts are stunning.

**Our tip:** Galle is the perfect base for our Golden Southern Coast package — two days in the fort, then south to Mirissa and Bentota.`,
    category: "Guides",
    author: "Kavinda Perera",
    date: "2026-04-15",
    readTime: "4 min",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDiJOIXdRp0l7rGwM8eiDyKXWXVHTHtciFZ-YXdZS3Cd9Uo-jvjFfC09J1WRQpYmbcO1BEtchv6CUXXxjYi0Pj8O9AFnXORA-4OY6xP1sCWn2N6cEUxSy-Eggf1cODQjozh-4b2OecEaGjoTRnYKY5p2xzfvI7ykfVFCQobSh7YxsSpR8Jz3XPqWXMndy5ipi7S_5kAdrq6RJQjUewrywmX-gNn0HENvBLOT0nNjqBDC3yCoO4EmHmuMhnoLYkVsDUktQR6kRPhP2M",
  },
  {
    slug: "best-time-visit-sri-lanka",
    title: "When Is the Best Time to Visit Sri Lanka?",
    excerpt:
      "Sri Lanka has two monsoon seasons hitting opposite coasts — which means there's always a sunny side. Here's how to time your trip.",
    body: `Sri Lanka's tropical climate means it's warm year-round, but rainfall patterns make timing important.

**Southwest monsoon (May–Sep):** Rain hits the west and south coasts. Head east — Arugam Bay, Trincomalee, and Passikudah are dry and sunny.

**Northeast monsoon (Oct–Jan):** Rain moves to the east. The south and west coasts — Galle, Mirissa, Bentota — are at their best.

**Shoulder sweet spot (Feb–Apr):** The driest window across the whole island. Ideal for a full circuit. This is also peak season, so book early.

**Hill country:** Cooler year-round (15–25°C). Light rain possible any month, but mornings are usually clear — perfect for the train ride.

**Our advice:** If you have flexibility, February to April gives the widest options. But we design trips for every season — just tell us your dates and we'll route you to the sunny side.`,
    category: "Travel Tips",
    author: "Amara Silva",
    date: "2026-03-20",
    readTime: "4 min",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBmyTIo8YOpdkZbjNE4Zb0suaLf9bdAU7twbbb6gP99Rnxc612XVWmI3SRy5DGonal9DQDihBwEKQR1sKvRwuQl9xWpSNmBnPHjnZtCU0dtxO3ivqyt4kfTEhJr5ZjH04EqJdKA_2wj6K3lpUdEMEbH7siAiTWks6W-LGz9tZMbKXbt6MK48V3T3oA7-PCIWDmkLqT6ma5Iga--4Y-rNqtL5K-96EGmEPesQ_l_EqrXPd7oJCEL-0z2vnZXeTwjUpjQkrwLobtgqB0",
  },
  {
    slug: "sri-lanka-surf-guide-beginners",
    title: "Sri Lanka Surf Guide: Best Breaks for Beginners and Beyond",
    excerpt:
      "From the mellow rollers of Weligama to the barrels of Arugam Bay — a coast-by-coast surf breakdown.",
    body: `Sri Lanka is one of Asia's most accessible surf destinations. Warm water year-round, affordable board rentals, and breaks for every level.

**Weligama (South):** The best learner wave in the country. A wide, sandy-bottomed bay with gentle rollers. Nov–Apr season. Lessons from $15/hour.

**Hiriketiya (South):** A hidden horseshoe bay with a fun right-hander. Good for intermediates. Gets crowded in peak season.

**Arugam Bay (East):** Sri Lanka's surf capital. Main Point is a long, clean right — world-class on its day. May–Sep season. The Throbbing Adventure package is based nearby.

**Ahangama (South):** Reef breaks for experienced surfers. The famous stilt fishermen are here too — iconic photo territory.

**What to bring:** Rash vest (the sun is fierce), reef booties for rocky entry points, and your own fins if you're particular.`,
    category: "Adventure",
    author: "Kavinda Perera",
    date: "2026-03-05",
    readTime: "5 min",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA8byS4ur0YLqV8SSm4o61Threszjg0SP-yUsTDvcAY44XGdvHjfYtEmO8xWwdqa3zsomjFqQtUBs_9fbsmGchF1ijExKBw3GDStxTXIWmBvXvbxDv6CANoGNG0bkoO87RTXHyD4ukJA_5T3DRM_YVekWrf7hsdtWPwQcUDQCJMcTQlypRC92CKbLkIXkqjXuz_5A9pFehLUBwX50r4bRM-xaJmnv9KbcgYdGPhVhfT-gJNnbo0aSzlHkBhns9h19oZzn9JNx2vi6g",
  },
];

export const categories = ["All", "Travel Tips", "Wildlife", "Guides", "Adventure"];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}
