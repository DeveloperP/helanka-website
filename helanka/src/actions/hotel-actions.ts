"use server";

import { db } from "@/lib/db";

export interface HotelOption {
  id: string;
  name: string;
  tier: string;
  doubleRate: number;
  singleRate: number;
  tripleRate: number;
  destinationId: string | null;
}

function toHotelOption(h: { id: string; name: string; tier: string; doubleRate: number; destinationId: string | null }): HotelOption {
  return {
    id: h.id,
    name: h.name,
    tier: h.tier,
    doubleRate: h.doubleRate,
    singleRate: Math.round(h.doubleRate * 0.90),
    tripleRate: Math.round(h.doubleRate * 1.30),
    destinationId: h.destinationId,
  };
}

export async function getHotelsByDestinationId(destinationId: string): Promise<HotelOption[]> {
  if (!db) return [];
  const hotels = await db.hotel.findMany({
    where: { destinationId, isActive: true },
    orderBy: [{ tier: "asc" }, { doubleRate: "asc" }],
  });
  return hotels.map(toHotelOption);
}

export async function getHotelsGroupedByDestination(destinationIds: string[]): Promise<Record<string, HotelOption[]>> {
  if (!db) return {};
  const hotels = await db.hotel.findMany({
    where: { destinationId: { in: destinationIds }, isActive: true },
    orderBy: [{ tier: "asc" }, { doubleRate: "asc" }],
  });

  const grouped: Record<string, HotelOption[]> = {};
  for (const id of destinationIds) {
    grouped[id] = [];
  }
  for (const h of hotels) {
    if (h.destinationId && grouped[h.destinationId]) {
      grouped[h.destinationId].push(toHotelOption(h));
    }
  }
  return grouped;
}

export async function getTransportRateCards(): Promise<{ tier: string; perKmRate: number; label: string }[]> {
  if (!db) return [];
  const cards = await db.rateCard.findMany({
    where: { itemType: "TRANSPORT" },
    orderBy: { minPrice: "asc" },
  });

  const labels: Record<string, string> = {
    "car-1-2-pax": "Car (1-2 pax)",
    "micro-van-3-7-pax": "Micro van (3-7 pax)",
    "mini-coach-8-14-pax": "Mini coach (8-14 pax)",
    "37-seater-15-28-pax": "37-seater coach (15-28 pax)",
    "45-seater-29-40-pax": "45-seater coach (29-40 pax)",
  };

  return cards
    .filter((c): c is typeof c & { tier: string } => c.tier !== null)
    .map((c) => ({
      tier: c.tier,
      perKmRate: c.perKmRate ?? 0,
      label: labels[c.tier] || c.tier,
    }));
}

export interface ExcursionOption {
  id: string;
  name: string;
  slug: string;
  type: string;
  destinationId: string;
}

export async function getAllExcursionsGrouped(): Promise<Record<string, ExcursionOption[]>> {
  if (!db) return {};
  const excursions = await db.excursion.findMany({
    where: { isActive: true },
    orderBy: [{ type: "asc" }, { name: "asc" }],
    select: { id: true, name: true, slug: true, type: true, destinationId: true },
  });

  const grouped: Record<string, ExcursionOption[]> = {};
  for (const e of excursions) {
    if (!grouped[e.destinationId]) grouped[e.destinationId] = [];
    grouped[e.destinationId].push(e);
  }
  return grouped;
}

export async function getDailyBufferRate(): Promise<number> {
  if (!db) return 85;
  const card = await db.rateCard.findFirst({
    where: { tier: "daily-buffer" },
  });
  return card?.minPrice ?? 85;
}
