export interface GroupExperience {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  groupSize: string;
  durationDays: number;
  price: number;
  includes: string[];
  image: string;
}

export const experiences: GroupExperience[] = [
  {
    slug: "corporate-retreat",
    name: "Corporate Retreat",
    tagline: "Team building in paradise",
    description:
      "Combine strategic off-sites with immersive Sri Lankan experiences. Your team will bond over white-water rafting in Kitulgala, brainstorm in a colonial-era hill country villa, and celebrate milestones with a private beach dinner under the stars.",
    groupSize: "10–40",
    durationDays: 4,
    price: 950,
    includes: [
      "Dedicated event coordinator",
      "Private meeting rooms with AV",
      "Team-building activities",
      "All meals and transfers",
      "Welcome dinner and closing ceremony",
    ],
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA7yFEXyPuNX9h_GbgmSdd2qwI4JGC1uoPb7ulTfAcuU6WQF6HvDWujaf8QEbi-HXIPSi9Ar_221wIJRyI8Oc7J9YbONA7xBcrMWiP3j9sUxtS_xURw4mrwBaIxZ8YFeFDrWujeqMRLL2Z_yQq2sEuX2EIyjhd_ytbtIFiFgLpuMSox6uLPQ4pCNGmRMXN6AjrjBnRZaTcV7N1c8-P2ncWBgCmmQPApVYrL3GlPUK8xxdDNtop4B4tKepr0tLvqmw1IS4_2n1Kc2ko",
  },
  {
    slug: "wedding-celebration",
    name: "Wedding Celebration",
    tagline: "Say \"I do\" on the island",
    description:
      "Exchange vows on a private southern coast beach or inside the walls of a heritage fort. We handle every detail — from floral mandaps to traditional drummers, multi-day guest itineraries, and post-ceremony excursions for your wedding party.",
    groupSize: "20–100",
    durationDays: 3,
    price: 1200,
    includes: [
      "Venue scouting and booking",
      "Wedding planner on-site",
      "Guest accommodation blocks",
      "Welcome bags and farewell brunch",
      "Photography coordination",
    ],
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBmyTIo8YOpdkZbjNE4Zb0suaLf9bdAU7twbbb6gP99Rnxc612XVWmI3SRy5DGonal9DQDihBwEKQR1sKvRwuQl9xWpSNmBnPHjnZtCU0dtxO3ivqyt4kfTEhJr5ZjH04EqJdKA_2wj6K3lpUdEMEbH7siAiTWks6W-LGz9tZMbKXbt6MK48V3T3oA7-PCIWDmkLqT6ma5Iga--4Y-rNqtL5K-96EGmEPesQ_l_EqrXPd7oJCEL-0z2vnZXeTwjUpjQkrwLobtgqB0",
  },
  {
    slug: "school-expedition",
    name: "School Expedition",
    tagline: "Learning beyond the classroom",
    description:
      "Designed for student groups, this expedition blends wildlife conservation, cultural immersion, and soft adventure. Students track elephants in Udawalawe, learn traditional mask-carving in Ambalangoda, and explore the living history of Galle Fort.",
    groupSize: "15–50",
    durationDays: 7,
    price: 750,
    includes: [
      "Qualified trip leaders (1:10 ratio)",
      "Risk assessments and safety plans",
      "Educational workshop programme",
      "Student journals and certificates",
      "24/7 ground support",
    ],
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAvL9qQCZqkuUZZhDFPiuljSOElBzTS-i7kLp90dx9jPIRgvPItqhfxy9613-soZHzobTHli7BjWkH4-Haw9lP45E2wiW9j2dUftl84hUoLQpMhO1LIzUoQRk5nyTAmY78Y-IBlM5Mrog1JBI8zdp86HBVzmlXisZYgFH5lIspaZdstoAxqxQrnPxafv0B8S_p0e8P0tS2KZMFdCj6rUEkqe56zoOq8yXRaQE2XqbrLuXWXGtJVEbnTCZcpKa2KlGrKVElRaZGsohs",
  },
  {
    slug: "family-reunion",
    name: "Family Reunion",
    tagline: "Generations together",
    description:
      "Bring the whole family — from grandparents to toddlers. We design multi-pace itineraries so everyone enjoys the trip: gentle temple visits and cooking classes for elders, surf lessons and wildlife safaris for the kids, spa days for parents who need a break.",
    groupSize: "8–30",
    durationDays: 5,
    price: 850,
    includes: [
      "Multi-generational activity planning",
      "Child-friendly meals and rooms",
      "Private villa or adjoining suites",
      "Family photo session",
      "Flexible daily schedule",
    ],
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDiJOIXdRp0l7rGwM8eiDyKXWXVHTHtciFZ-YXdZS3Cd9Uo-jvjFfC09J1WRQpYmbcO1BEtchv6CUXXxjYi0Pj8O9AFnXORA-4OY6xP1sCWn2N6cEUxSy-Eggf1cODQjozh-4b2OecEaGjoTRnYKY5p2xzfvI7ykfVFCQobSh7YxsSpR8Jz3XPqWXMndy5ipi7S_5kAdrq6RJQjUewrywmX-gNn0HENvBLOT0nNjqBDC3yCoO4EmHmuMhnoLYkVsDUktQR6kRPhP2M",
  },
];

export function getExperienceBySlug(slug: string): GroupExperience | undefined {
  return experiences.find((e) => e.slug === slug);
}
