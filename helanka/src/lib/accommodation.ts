export interface AccommodationTier {
  id: string;
  name: string;
  description: string;
  priceModifier: number; // per night addon
}

export const ACCOMMODATION_TIERS: AccommodationTier[] = [
  { id: "boutique", name: "Boutique Hotel", description: "Charming local stays with character and authentic Sri Lankan hospitality", priceModifier: 0 },
  { id: "4-star", name: "4 Star", description: "Well-appointed properties with reliable service and modern comforts", priceModifier: 30 },
  { id: "5-star", name: "5 Star", description: "International-standard luxury with full amenities, spas, and world-class dining", priceModifier: 80 },
  { id: "luxury-stay", name: "Luxury Stay", description: "Designer properties with premium service, curated interiors, and intimate luxury", priceModifier: 120 },
];
