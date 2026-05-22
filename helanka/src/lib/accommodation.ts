export interface AccommodationTier {
  id: string;
  name: string;
  description: string;
  priceModifier: number; // per night addon
}

export const ACCOMMODATION_TIERS: AccommodationTier[] = [
  { id: "boutique", name: "Boutique Hotel", description: "Charming local stays with character and authentic Sri Lankan hospitality", priceModifier: 0 },
  { id: "luxury-boutique", name: "Luxury Boutique", description: "Designer properties with premium service, curated interiors, and intimate luxury", priceModifier: 50 },
  { id: "five-star", name: "5-Star Resort", description: "International-standard luxury with full amenities, spas, and world-class dining", priceModifier: 120 },
];
