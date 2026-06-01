"use client";

import { useState, useRef } from "react";
import type {
  RateCardRow,
  DestinationWithDistance,
  DestinationDistanceRow,
  ExcursionRow,
} from "@/actions/rate-card-actions";
import {
  exportRateCardsData,
  previewRateCardImport,
  applyRateCardImport,
} from "@/actions/rate-card-actions";
import {
  generateRateCardWorkbook,
  parseRateCardWorkbook,
  downloadWorkbook,
} from "@/lib/excel";
import { PricingDashboard } from "./pricing-dashboard";
import { RateCardsView } from "./rate-cards-view";
import { DistancesView } from "./distances-view";
import { ExcursionsView } from "./excursions-view";

type View = "dashboard" | "rate-cards" | "distances" | "excursions";

interface PricingClientProps {
  initialRateCards: RateCardRow[];
  destinations: DestinationWithDistance[];
  initialDistances: DestinationDistanceRow[];
  initialExcursions: ExcursionRow[];
}

export function PricingClient({
  initialRateCards,
  destinations,
  initialDistances,
  initialExcursions,
}: PricingClientProps) {
  const [view, setView] = useState<View>("dashboard");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleExportAll() {
    exportRateCardsData().then((data) => {
      const wb = generateRateCardWorkbook(data);
      downloadWorkbook(wb, "helanka-rate-cards.xlsx");
    });
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const parsed = await parseRateCardWorkbook(file);
    const diff = await previewRateCardImport(parsed as Parameters<typeof previewRateCardImport>[0]);
    if (diff.toCreate.length === 0 && diff.toUpdate.length === 0) {
      alert("No changes to apply.");
    } else {
      const proceed = window.confirm(
        `Import will create ${diff.toCreate.length} new cards and update ${diff.toUpdate.length}. Proceed?`,
      );
      if (proceed) {
        await applyRateCardImport(
          parsed as Parameters<typeof applyRateCardImport>[0],
          diff.toUpdate.map((u) => ({
            id: u.id,
            data: {
              minPrice: u.incoming.minPrice,
              maxPrice: u.incoming.maxPrice,
              ...(u.incoming.perKmRate != null ? { perKmRate: u.incoming.perKmRate } : {}),
            },
          })),
        );
        window.location.reload();
      }
    }
    e.target.value = "";
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pricing Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            {view === "dashboard"
              ? "Overview of rate cards, distances, and excursions"
              : view === "rate-cards"
                ? "Manage accommodation, transport, activity & add-on rates"
                : view === "distances"
                  ? "Manage Colombo base distances & pairwise routes"
                  : "Manage safari, cultural, adventure & nature experiences"}
          </p>
        </div>
        {view === "dashboard" && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportAll}
              className="inline-flex items-center gap-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium px-4 py-2 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Export All
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium px-4 py-2 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              Import Excel
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleImportFile}
            />
          </div>
        )}
      </div>

      {/* View Content */}
      {view === "dashboard" && (
        <PricingDashboard
          rateCards={initialRateCards}
          destinations={destinations}
          distances={initialDistances}
          excursions={initialExcursions}
          onNavigate={setView}
        />
      )}
      {view === "rate-cards" && (
        <RateCardsView
          initialRateCards={initialRateCards}
          destinations={destinations}
          onBack={() => setView("dashboard")}
        />
      )}
      {view === "distances" && (
        <DistancesView
          initialDestinations={destinations}
          initialDistances={initialDistances}
          onBack={() => setView("dashboard")}
        />
      )}
      {view === "excursions" && (
        <ExcursionsView
          initialExcursions={initialExcursions}
          destinations={destinations}
          onBack={() => setView("dashboard")}
        />
      )}
    </div>
  );
}
