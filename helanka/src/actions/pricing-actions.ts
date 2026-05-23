"use server";

import { db } from "@/lib/db";
import { packages } from "@/lib/packages";
import { determineSeason } from "@/lib/pricing-engine";

export interface PackagePriceEstimate {
  slug: string;
  fromPrice: number;
}

export async function getPackagePriceEstimates(
  travelDate?: Date,
): Promise<Record<string, number>> {
  if (!db) {
    return Object.fromEntries(packages.map((p) => [p.slug, p.price]));
  }

  const date = travelDate ?? new Date();
  const season = determineSeason(date);

  const rateCards = await db.rateCard.findMany({
    where: { OR: [{ season }, { season: "all" }, { season: "off-peak" }] },
  });

  function findRate(itemType: string, tier: string): { min: number; max: number } | null {
    const match =
      rateCards.find((c) => c.itemType === itemType && c.tier === tier && c.season === season) ??
      rateCards.find((c) => c.itemType === itemType && c.tier === tier && c.season === "off-peak") ??
      rateCards.find((c) => c.itemType === itemType && c.tier === tier);
    if (!match) return null;
    return { min: match.minPrice, max: match.maxPrice };
  }

  const result: Record<string, number> = {};

  for (const pkg of packages) {
    const nights = pkg.durationDays - 1;

    const accomRate = findRate("ACCOMMODATION", "3-star");
    const accomCost = (accomRate?.min ?? 25) * nights;

    const transportRate = findRate("TRANSPORT", "standard");
    const transportCost = (transportRate?.min ?? 40) * pkg.durationDays;

    const activityRate = findRate("ACTIVITY", "cultural");
    const numActivities = Math.min(pkg.excursions.length, 3);
    const activityCost = (activityRate?.min ?? 15) * numActivities;

    result[pkg.slug] = Math.round(accomCost + transportCost + activityCost);
  }

  return result;
}
