export interface GroupExperience {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  groupSize: string;
  duration: string;
  includes: string[];
  image: string;
}

export const experiences: GroupExperience[] = [
  {
    slug: "incentives",
    name: "Incentives",
    tagline: "Transform Business into Experiences",
    description:
      "Host impactful meetings, incentive trips, conferences, and corporate retreats across Sri Lanka's most inspiring destinations. From beachfront boardrooms to luxury hill country resorts, create memorable events that combine productivity with authentic local experiences.",
    groupSize: "20–500",
    duration: "2–7 Days",
    includes: [
      "Dedicated event management team",
      "Venue sourcing and logistics",
      "Team-building experiences",
      "Conference and AV support",
      "Gala dinners and networking events",
    ],
    image: "/images/groups/grp-incentives.webp",
  },
  {
    slug: "cricket-tours",
    name: "Cricket Tours",
    tagline: "Play Where Legends Were Made",
    description:
      "Experience Sri Lanka through cricket. Whether you're a school team, club side, or professional squad, enjoy competitive fixtures, training sessions, and unforgettable cultural experiences on and off the field.",
    groupSize: "15–40",
    duration: "5–12 Days",
    includes: [
      "International and local fixtures",
      "Practice facilities and coaching",
      "Match logistics and transportation",
      "Accommodation and meals",
      "Cultural excursions included",
    ],
    image: "/images/groups/grp-cricket-tours.webp",
  },
  {
    slug: "rugby-tours",
    name: "Rugby Tours",
    tagline: "Challenge Your Team. Discover Sri Lanka.",
    description:
      "Take your rugby team beyond the ordinary with competitive matches, training camps, and adventure-filled experiences across Sri Lanka's stunning landscapes.",
    groupSize: "20–50",
    duration: "5–12 Days",
    includes: [
      "Competitive rugby fixtures",
      "Training facilities",
      "Team bonding activities",
      "Dedicated tour coordinator",
      "Accommodation and transport",
    ],
    image: "/images/groups/grp-rugby-tours.webp",
  },
  {
    slug: "golf-holidays",
    name: "Golf Holidays",
    tagline: "Tee Off in Paradise",
    description:
      "Play championship golf courses surrounded by breathtaking scenery. Combine world-class golfing with luxury accommodations, fine dining, and unforgettable Sri Lankan experiences.",
    groupSize: "2–20",
    duration: "4–10 Days",
    includes: [
      "Championship golf rounds",
      "Luxury accommodation",
      "Private transfers",
      "Caddie and tee-time arrangements",
      "Sightseeing experiences",
    ],
    image: "/images/groups/grp-golf-holidays.webp",
  },
];

export function getExperienceBySlug(slug: string): GroupExperience | undefined {
  return experiences.find((e) => e.slug === slug);
}
