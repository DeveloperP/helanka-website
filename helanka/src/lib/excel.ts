import * as XLSX from "xlsx";
import type { RateCardExportRow } from "@/actions/rate-card-actions";

export function generateRateCardWorkbook(data: RateCardExportRow[]): XLSX.WorkBook {
  const rows = data.map((r) => ({
    "Item Type": r.itemType,
    Tier: r.tier,
    Season: r.season,
    Destination: r.destination,
    "Min Price (USD)": r.minPrice,
    "Max Price (USD)": r.maxPrice,
    "Per Km Rate": r.perKmRate ?? "",
    Currency: r.currency,
    "Margin 20%": r.minPrice * 1.2,
    "Margin 30%": r.minPrice * 1.3,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Rate Cards");

  // Set column widths
  ws["!cols"] = [
    { wch: 16 }, { wch: 14 }, { wch: 12 }, { wch: 18 },
    { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 10 },
    { wch: 12 }, { wch: 12 },
  ];

  return wb;
}

export interface ParsedRateCardRow {
  itemType: string;
  tier: string;
  season: string;
  destination: string;
  minPrice: number;
  maxPrice: number;
  perKmRate?: number;
  currency: string;
}

export async function parseRateCardWorkbook(file: File): Promise<ParsedRateCardRow[]> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const jsonRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

  return jsonRows.map((row) => ({
    itemType: String(row["Item Type"] ?? ""),
    tier: String(row["Tier"] ?? ""),
    season: String(row["Season"] ?? ""),
    destination: String(row["Destination"] ?? ""),
    minPrice: Number(row["Min Price (USD)"] ?? 0),
    maxPrice: Number(row["Max Price (USD)"] ?? 0),
    perKmRate: row["Per Km Rate"] ? Number(row["Per Km Rate"]) : undefined,
    currency: String(row["Currency"] ?? "USD"),
  }));
}

export function downloadWorkbook(wb: XLSX.WorkBook, filename: string) {
  XLSX.writeFile(wb, filename);
}

export function generateDistanceWorkbook(
  destinations: Array<{ name: string; distanceFromColomboKm: number | null }>,
  distances: Array<{ fromName: string; toName: string; distanceKm: number }>,
) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Distance from Colombo
  const colomboRows = destinations.map((d) => ({
    Destination: d.name,
    "Distance from Colombo (km)": d.distanceFromColomboKm ?? "",
  }));
  const ws1 = XLSX.utils.json_to_sheet(colomboRows);
  ws1["!cols"] = [{ wch: 20 }, { wch: 26 }];
  XLSX.utils.book_append_sheet(wb, ws1, "From Colombo");

  // Sheet 2: Pairwise distances
  const pairRows = distances.map((d) => ({
    From: d.fromName,
    To: d.toName,
    "Distance (km)": d.distanceKm,
  }));
  const ws2 = XLSX.utils.json_to_sheet(pairRows);
  ws2["!cols"] = [{ wch: 18 }, { wch: 18 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, ws2, "Pairwise");

  return wb;
}

export function generateExcursionWorkbook(
  excursions: Array<{ name: string; destinationName: string; type: string; distanceKm: number; description: string | null }>,
) {
  const rows = excursions.map((e) => ({
    Name: e.name,
    Destination: e.destinationName,
    Type: e.type,
    "Distance (km)": e.distanceKm,
    Description: e.description ?? "",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [{ wch: 30 }, { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 40 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Excursions");
  return wb;
}
