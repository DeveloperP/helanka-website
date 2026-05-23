"use server";

import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import type { BookingItemType } from "@prisma/client";
import {
  rateCardCreateSchema,
  rateCardUpdateSchema,
  rateCardImportRowSchema,
  excursionCreateSchema,
  type RateCardImportRow,
} from "@/lib/validations";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface RateCardRow {
  id: string;
  itemType: string;
  tier: string | null;
  season: string;
  destinationId: string | null;
  destinationName: string | null;
  minPrice: number;
  maxPrice: number;
  perKmRate: number | null;
  currency: string;
  updatedAt: string;
}

export interface DestinationDistanceRow {
  id: string;
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  distanceKm: number;
}

export interface DestinationWithDistance {
  id: string;
  name: string;
  slug: string;
  distanceFromColomboKm: number | null;
}

export interface ExcursionRow {
  id: string;
  name: string;
  slug: string;
  destinationId: string;
  destinationName: string;
  type: string;
  distanceKm: number;
  description: string | null;
  isActive: boolean;
}

export interface RateCardExportRow {
  itemType: string;
  tier: string;
  season: string;
  destination: string;
  minPrice: number;
  maxPrice: number;
  perKmRate: number | null;
  currency: string;
}

export interface ImportDiff {
  toCreate: RateCardImportRow[];
  toUpdate: Array<{ id: string; current: RateCardExportRow; incoming: RateCardImportRow }>;
  unchanged: number;
  errors: string[];
}

// ─── Rate Card CRUD ─────────────────────────────────────────────────────────

export async function getRateCards(filters?: {
  itemType?: string;
  tier?: string;
  season?: string;
}): Promise<RateCardRow[]> {
  await requireAdmin();
  if (!db) return [];

  const where: Record<string, unknown> = {};
  if (filters?.itemType) where.itemType = filters.itemType;
  if (filters?.tier) where.tier = filters.tier;
  if (filters?.season) where.season = filters.season;

  const cards = await db.rateCard.findMany({
    where,
    include: { destination: { select: { name: true } } },
    orderBy: [{ itemType: "asc" }, { tier: "asc" }, { season: "asc" }],
  });

  return cards.map((c) => ({
    id: c.id,
    itemType: c.itemType,
    tier: c.tier,
    season: c.season,
    destinationId: c.destinationId,
    destinationName: c.destination?.name ?? null,
    minPrice: c.minPrice,
    maxPrice: c.maxPrice,
    perKmRate: c.perKmRate,
    currency: c.currency,
    updatedAt: c.updatedAt.toISOString(),
  }));
}

export async function updateRateCard(
  id: string,
  data: { minPrice: number; maxPrice: number; perKmRate?: number | null },
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  if (!db) return { success: false, error: "Database not available" };

  const parsed = rateCardUpdateSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Invalid data" };

  await db.rateCard.update({
    where: { id },
    data: { minPrice: parsed.data.minPrice, maxPrice: parsed.data.maxPrice, perKmRate: parsed.data.perKmRate ?? undefined },
  });

  return { success: true };
}

export async function createRateCard(
  data: {
    itemType: string;
    tier: string;
    season: string;
    destinationId?: string;
    minPrice: number;
    maxPrice: number;
    perKmRate?: number;
    currency?: string;
  },
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  if (!db) return { success: false, error: "Database not available" };

  const parsed = rateCardCreateSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Invalid data" };

  await db.rateCard.create({
    data: {
      itemType: parsed.data.itemType as BookingItemType,
      tier: parsed.data.tier,
      season: parsed.data.season,
      destinationId: parsed.data.destinationId || null,
      minPrice: parsed.data.minPrice,
      maxPrice: parsed.data.maxPrice,
      perKmRate: parsed.data.perKmRate ?? null,
      currency: parsed.data.currency ?? "USD",
    },
  });

  return { success: true };
}

export async function deleteRateCard(id: string): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  if (!db) return { success: false, error: "Database not available" };
  await db.rateCard.delete({ where: { id } });
  return { success: true };
}

// ─── Rate Card Export / Import ──────────────────────────────────────────────

export async function exportRateCardsData(): Promise<RateCardExportRow[]> {
  await requireAdmin();
  if (!db) return [];

  const cards = await db.rateCard.findMany({
    include: { destination: { select: { name: true } } },
    orderBy: [{ itemType: "asc" }, { tier: "asc" }, { season: "asc" }],
  });

  return cards.map((c) => ({
    itemType: c.itemType,
    tier: c.tier ?? "",
    season: c.season,
    destination: c.destination?.name ?? "",
    minPrice: c.minPrice,
    maxPrice: c.maxPrice,
    perKmRate: c.perKmRate,
    currency: c.currency,
  }));
}

export async function previewRateCardImport(rows: RateCardImportRow[]): Promise<ImportDiff> {
  await requireAdmin();
  if (!db) return { toCreate: [], toUpdate: [], unchanged: 0, errors: [] };

  const errors: string[] = [];
  const validRows: RateCardImportRow[] = [];

  for (let i = 0; i < rows.length; i++) {
    const parsed = rateCardImportRowSchema.safeParse(rows[i]);
    if (!parsed.success) {
      errors.push(`Row ${i + 1}: ${parsed.error.issues.map((e) => e.message).join(", ")}`);
    } else {
      validRows.push(parsed.data);
    }
  }

  const existing = await db.rateCard.findMany({
    include: { destination: { select: { name: true } } },
  });

  const toCreate: RateCardImportRow[] = [];
  const toUpdate: ImportDiff["toUpdate"] = [];
  let unchanged = 0;

  for (const row of validRows) {
    const match = existing.find(
      (c) =>
        c.itemType === row.itemType &&
        (c.tier ?? "") === row.tier &&
        c.season === row.season &&
        (c.destination?.name ?? "") === row.destination,
    );

    if (!match) {
      toCreate.push(row);
    } else if (
      match.minPrice !== row.minPrice ||
      match.maxPrice !== row.maxPrice ||
      (match.perKmRate ?? undefined) !== row.perKmRate
    ) {
      toUpdate.push({
        id: match.id,
        current: {
          itemType: match.itemType,
          tier: match.tier ?? "",
          season: match.season,
          destination: match.destination?.name ?? "",
          minPrice: match.minPrice,
          maxPrice: match.maxPrice,
          perKmRate: match.perKmRate,
          currency: match.currency,
        },
        incoming: row,
      });
    } else {
      unchanged++;
    }
  }

  return { toCreate, toUpdate, unchanged, errors };
}

export async function applyRateCardImport(
  toCreate: RateCardImportRow[],
  toUpdate: Array<{ id: string; data: { minPrice: number; maxPrice: number; perKmRate?: number } }>,
): Promise<{ success: boolean; created: number; updated: number; error?: string }> {
  await requireAdmin();
  if (!db) return { success: false, created: 0, updated: 0, error: "Database not available" };

  // Resolve destination names to IDs for creates
  const destNames = [...new Set(toCreate.map((r) => r.destination).filter(Boolean))];
  const dests = destNames.length > 0
    ? await db.destination.findMany({ where: { name: { in: destNames } }, select: { id: true, name: true } })
    : [];
  const destMap = new Map(dests.map((d) => [d.name, d.id]));

  if (toCreate.length > 0) {
    await db.rateCard.createMany({
      data: toCreate.map((r) => ({
        itemType: r.itemType as BookingItemType,
        tier: r.tier,
        season: r.season,
        destinationId: destMap.get(r.destination) ?? null,
        minPrice: r.minPrice,
        maxPrice: r.maxPrice,
        perKmRate: r.perKmRate ?? null,
        currency: r.currency ?? "USD",
      })),
    });
  }

  for (const u of toUpdate) {
    await db.rateCard.update({ where: { id: u.id }, data: u.data });
  }

  return { success: true, created: toCreate.length, updated: toUpdate.length };
}

// ─── Destination Distances ──────────────────────────────────────────────────

export async function getDestinationsWithDistances(): Promise<DestinationWithDistance[]> {
  await requireAdmin();
  if (!db) return [];

  const dests = await db.destination.findMany({
    select: { id: true, name: true, slug: true, distanceFromColomboKm: true },
    orderBy: { name: "asc" },
  });

  return dests;
}

export async function getDestinationDistances(): Promise<DestinationDistanceRow[]> {
  await requireAdmin();
  if (!db) return [];

  const distances = await db.destinationDistance.findMany({
    include: {
      from: { select: { name: true } },
      to: { select: { name: true } },
    },
    orderBy: [{ from: { name: "asc" } }, { to: { name: "asc" } }],
  });

  return distances.map((d) => ({
    id: d.id,
    fromId: d.fromId,
    fromName: d.from.name,
    toId: d.toId,
    toName: d.to.name,
    distanceKm: d.distanceKm,
  }));
}

export async function updateDestinationDistance(
  id: string,
  distanceKm: number,
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  if (!db) return { success: false, error: "Database not available" };
  if (distanceKm <= 0) return { success: false, error: "Distance must be positive" };

  await db.destinationDistance.update({ where: { id }, data: { distanceKm } });
  return { success: true };
}

export async function updateDestinationColomboDistance(
  id: string,
  distanceKm: number,
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  if (!db) return { success: false, error: "Database not available" };

  await db.destination.update({ where: { id }, data: { distanceFromColomboKm: distanceKm } });
  return { success: true };
}

// ─── Excursions ─────────────────────────────────────────────────────────────

export async function getExcursions(destinationId?: string): Promise<ExcursionRow[]> {
  await requireAdmin();
  if (!db) return [];

  const where = destinationId ? { destinationId } : {};
  const excursions = await db.excursion.findMany({
    where,
    include: { destination: { select: { name: true } } },
    orderBy: [{ destination: { name: "asc" } }, { name: "asc" }],
  });

  return excursions.map((e) => ({
    id: e.id,
    name: e.name,
    slug: e.slug,
    destinationId: e.destinationId,
    destinationName: e.destination.name,
    type: e.type,
    distanceKm: e.distanceKm,
    description: e.description,
    isActive: e.isActive,
  }));
}

export async function updateExcursion(
  id: string,
  data: { name?: string; distanceKm?: number; type?: string; description?: string; isActive?: boolean },
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  if (!db) return { success: false, error: "Database not available" };

  await db.excursion.update({ where: { id }, data });
  return { success: true };
}

export async function createExcursion(
  data: { name: string; slug: string; destinationId: string; type: string; distanceKm: number; description?: string },
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  if (!db) return { success: false, error: "Database not available" };

  const parsed = excursionCreateSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Invalid data" };

  await db.excursion.create({ data: { ...parsed.data, isActive: true } });
  return { success: true };
}

export async function deleteExcursion(id: string): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  if (!db) return { success: false, error: "Database not available" };
  await db.excursion.delete({ where: { id } });
  return { success: true };
}
