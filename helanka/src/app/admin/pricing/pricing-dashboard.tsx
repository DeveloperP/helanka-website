"use client";

import type { RateCardRow, DestinationWithDistance, DestinationDistanceRow, ExcursionRow } from "@/actions/rate-card-actions";

type View = "dashboard" | "rate-cards" | "distances" | "excursions";

interface PricingDashboardProps {
  rateCards: RateCardRow[];
  destinations: DestinationWithDistance[];
  distances: DestinationDistanceRow[];
  excursions: ExcursionRow[];
  onNavigate: (view: View) => void;
}

function groupBy<T>(items: T[], key: (item: T) => string): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  for (const item of items) {
    const k = key(item);
    (result[k] ??= []).push(item);
  }
  return result;
}

function IconDollar() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconMapPin() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

function IconCompass() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );
}

const TYPE_BADGE: Record<string, string> = {
  ACCOMMODATION: "bg-blue-100 text-blue-700",
  ACTIVITY: "bg-green-100 text-green-700",
  TRANSPORT: "bg-amber-100 text-amber-700",
  ADDON: "bg-purple-100 text-purple-700",
};

const EXCURSION_TYPE_BADGE: Record<string, string> = {
  safari: "bg-amber-100 text-amber-700",
  cultural: "bg-blue-100 text-blue-700",
  adventure: "bg-green-100 text-green-700",
  "water-sport": "bg-cyan-100 text-cyan-700",
  nature: "bg-emerald-100 text-emerald-700",
};

export function PricingDashboard({
  rateCards,
  destinations,
  distances,
  excursions,
  onNavigate,
}: PricingDashboardProps) {
  const rateCardsByType = groupBy(rateCards, (c) => c.itemType);
  const excursionsByType = groupBy(excursions, (e) => e.type);
  const uniqueTypes = Object.keys(rateCardsByType);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Rate Cards Card */}
      <button
        onClick={() => onNavigate("rate-cards")}
        className="text-left bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-sm shadow-slate-200/50 p-6 hover:shadow-md hover:border-slate-200 transition-all duration-200 cursor-pointer"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-600">
            <IconDollar />
          </div>
          <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-600">
            Active
          </span>
        </div>
        <h3 className="text-[15px] font-semibold text-slate-800">Rate Cards</h3>
        <p className="text-xs text-slate-400 mt-1 mb-4">Accommodation, transport, activity & add-on rates</p>

        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
          <div>
            <p className="text-xl font-bold text-slate-800">{rateCards.length}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Total cards</p>
          </div>
          <div>
            <p className="text-xl font-bold text-slate-800">{uniqueTypes.length}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Item types</p>
          </div>
        </div>

        <div className="flex gap-1.5 flex-wrap mt-3">
          {Object.entries(rateCardsByType).map(([type, items]) => (
            <span
              key={type}
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${TYPE_BADGE[type] ?? "bg-slate-100 text-slate-600"}`}
            >
              {type.slice(0, 5)} {items.length}
            </span>
          ))}
        </div>

        <div className="mt-4 text-xs font-medium text-blue-500 flex items-center gap-1">
          View rate cards <span className="text-sm">→</span>
        </div>
      </button>

      {/* Distances Card */}
      <button
        onClick={() => onNavigate("distances")}
        className="text-left bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-sm shadow-slate-200/50 p-6 hover:shadow-md hover:border-slate-200 transition-all duration-200 cursor-pointer"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-amber-600">
            <IconMapPin />
          </div>
          <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-600">
            Configured
          </span>
        </div>
        <h3 className="text-[15px] font-semibold text-slate-800">Distances</h3>
        <p className="text-xs text-slate-400 mt-1 mb-4">Colombo base distances & pairwise routes</p>

        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
          <div>
            <p className="text-xl font-bold text-slate-800">{destinations.length}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Destinations</p>
          </div>
          <div>
            <p className="text-xl font-bold text-slate-800">{distances.length}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Pairwise routes</p>
          </div>
        </div>

        <div className="mt-4 text-xs font-medium text-blue-500 flex items-center gap-1">
          View distances <span className="text-sm">→</span>
        </div>
      </button>

      {/* Excursions Card */}
      <button
        onClick={() => onNavigate("excursions")}
        className="text-left bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-sm shadow-slate-200/50 p-6 hover:shadow-md hover:border-slate-200 transition-all duration-200 cursor-pointer"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center text-emerald-600">
            <IconCompass />
          </div>
          <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-600">
            {excursions.filter((e) => e.isActive).length} active
          </span>
        </div>
        <h3 className="text-[15px] font-semibold text-slate-800">Excursions</h3>
        <p className="text-xs text-slate-400 mt-1 mb-4">Safari, cultural, adventure & nature experiences</p>

        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
          <div>
            <p className="text-xl font-bold text-slate-800">{excursions.length}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Total excursions</p>
          </div>
          <div>
            <p className="text-xl font-bold text-slate-800">
              {new Set(excursions.map((e) => e.destinationId)).size}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Destinations</p>
          </div>
        </div>

        <div className="flex gap-1.5 flex-wrap mt-3">
          {Object.entries(excursionsByType).map(([type, items]) => (
            <span
              key={type}
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${EXCURSION_TYPE_BADGE[type] ?? "bg-slate-100 text-slate-600"}`}
            >
              {type} {items.length}
            </span>
          ))}
        </div>

        <div className="mt-4 text-xs font-medium text-blue-500 flex items-center gap-1">
          View excursions <span className="text-sm">→</span>
        </div>
      </button>
    </div>
  );
}
