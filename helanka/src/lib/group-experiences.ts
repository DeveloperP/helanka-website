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
    image: "/images/groups/grp-corporate-retreat.jpg",
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
    image: "/images/groups/grp-wedding-celebration.jpg",
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
    image: "/images/groups/grp-school-expedition.jpg",
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
    image: "/images/groups/grp-family-reunion.jpg",
  },
];

export function getExperienceBySlug(slug: string): GroupExperience | undefined {
  return experiences.find((e) => e.slug === slug);
}
