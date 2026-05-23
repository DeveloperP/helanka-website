import { db } from "@/lib/db";
import type { BookingItemType } from "@prisma/client";

const SEASON_MONTHS: Record<string, number[]> = {
  peak: [12, 1, 2, 3],
  shoulder: [4, 7, 8],
  "off-peak": [5, 6, 9, 10, 11],
};

const BUFFER_KM_PER_DAY = 30;

export function determineSeason(date: Date): string {
  const month = date.getMonth() + 1;
  for (const [season, months] of Object.entries(SEASON_MONTHS)) {
    if (months.includes(month)) return season;
  }
  return "off-peak";
}

export interface TransportDistanceResult {
  routeKm: number;
  excursionKm: number;
  bufferKm: number;
  totalKm: number;
}

export async function calculateTransportDistance(params: {
  destinationIds: string[];
  excursionIds: string[];
  tripDays: number;
}): Promise<TransportDistanceResult> {
  if (!db) return { routeKm: 0, excursionKm: 0, bufferKm: 0, totalKm: 0 };

  const { destinationIds, excursionIds, tripDays } = params;

  // Colombo destination for route start/end
  const colombo = await db.destination.findFirst({ where: { slug: "colombo" } });
  const colomboId = colombo?.id;

  let routeKm = 0;

  if (destinationIds.length > 0 && colomboId) {
    // Build the full route: Colombo -> dest1 -> dest2 -> ... -> Colombo
    const stops = [colomboId, ...destinationIds, colomboId];

    const distances = await db.destinationDistance.findMany({
      where: {
        OR: stops.flatMap((fromId, i) => {
          if (i >= stops.length - 1) return [];
          const toId = stops[i + 1];
          return [{ fromId, toId }];
        }),
      },
    });

    const distMap = new Map(distances.map((d) => [`${d.fromId}-${d.toId}`, d.distanceKm]));

    for (let i = 0; i < stops.length - 1; i++) {
      const key = `${stops[i]}-${stops[i + 1]}`;
      const km = distMap.get(key);
      if (km) {
        routeKm += km;
      } else if (stops[i] !== stops[i + 1]) {
        // Fallback: use distanceFromColomboKm sum as approximation
        const [from, to] = await Promise.all([
          db.destination.findUnique({ where: { id: stops[i] }, select: { distanceFromColomboKm: true } }),
          db.destination.findUnique({ where: { id: stops[i + 1] }, select: { distanceFromColomboKm: true } }),
        ]);
        routeKm += Math.abs((from?.distanceFromColomboKm ?? 0) - (to?.distanceFromColomboKm ?? 0));
      }
    }
  }

  // Excursion distances
  let excursionKm = 0;
  if (excursionIds.length > 0) {
    const excursions = await db.excursion.findMany({
      where: { id: { in: excursionIds } },
      select: { distanceKm: true },
    });
    excursionKm = excursions.reduce((sum, e) => sum + e.distanceKm, 0);
  }

  const bufferKm = BUFFER_KM_PER_DAY * tripDays;
  const totalKm = routeKm + excursionKm + bufferKm;

  return { routeKm, excursionKm, bufferKm, totalKm };
}

export interface TransportCostResult {
  perKmRate: number;
  kmCost: number;
  dailyRate: number;
  dailyCost: number;
  totalTransportCost: number;
  totalKm: number;
}

export async function calculateTransportCost(
  totalKm: number,
  tier: string,
  season: string,
  tripDays: number,
): Promise<TransportCostResult> {
  if (!db) return { perKmRate: 0, kmCost: 0, dailyRate: 0, dailyCost: 0, totalTransportCost: 0, totalKm };

  const card = await db.rateCard.findFirst({
    where: { itemType: "TRANSPORT", tier, season },
  });

  const perKmRate = card?.perKmRate ?? 0;
  const dailyRate = ((card?.minPrice ?? 0) + (card?.maxPrice ?? 0)) / 2;

  const kmCost = totalKm * perKmRate;
  const dailyCost = dailyRate * tripDays;
  const totalTransportCost = kmCost + dailyCost;

  return { perKmRate, kmCost, dailyRate, dailyCost, totalTransportCost, totalKm };
}

export interface RateCardLookupResult {
  itemType: string;
  tier: string | null;
  season: string;
  minPrice: number;
  maxPrice: number;
  perKmRate: number | null;
}

export async function lookupRateCards(
  items: Array<{ type: BookingItemType; tier: string | null; destinationId: string | null }>,
  travelDate: Date,
): Promise<Map<string, RateCardLookupResult>> {
  if (!db) return new Map();

  const season = determineSeason(travelDate);
  const results = new Map<string, RateCardLookupResult>();

  const allCards = await db.rateCard.findMany({
    where: {
      OR: [{ season }, { season: "all" }],
    },
  });

  for (const item of items) {
    const key = `${item.type}|${item.tier ?? ""}|${item.destinationId ?? ""}`;

    // Try destination-specific first, then generic
    const match =
      allCards.find(
        (c) => c.itemType === item.type && c.tier === item.tier && c.destinationId === item.destinationId && c.destinationId !== null,
      ) ??
      allCards.find(
        (c) => c.itemType === item.type && c.tier === item.tier && c.destinationId === null,
      );

    if (match) {
      results.set(key, {
        itemType: match.itemType,
        tier: match.tier,
        season: match.season,
        minPrice: match.minPrice,
        maxPrice: match.maxPrice,
        perKmRate: match.perKmRate,
      });
    }
  }

  return results;
}
