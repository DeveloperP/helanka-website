"use client";

import { useState, useTransition, useRef } from "react";
import type {
  RateCardRow,
  DestinationWithDistance,
  DestinationDistanceRow,
  ExcursionRow,
  ImportDiff,
} from "@/actions/rate-card-actions";
import {
  getRateCards,
  updateRateCard,
  createRateCard,
  deleteRateCard,
  exportRateCardsData,
  previewRateCardImport,
  applyRateCardImport,
  getDestinationDistances,
  updateDestinationDistance,
  updateDestinationColomboDistance,
  getExcursions,
  updateExcursion,
  createExcursion,
  deleteExcursion,
  getDestinationsWithDistances,
} from "@/actions/rate-card-actions";
import {
  generateRateCardWorkbook,
  parseRateCardWorkbook,
  downloadWorkbook,
  generateDistanceWorkbook,
  generateExcursionWorkbook,
} from "@/lib/excel";

// ─── Props ───────────────────────────────────────────────────────────────────

interface PricingClientProps {
  initialRateCards: RateCardRow[];
  destinations: DestinationWithDistance[];
  initialDistances: DestinationDistanceRow[];
  initialExcursions: ExcursionRow[];
}

// ─── Inline SVG Icons ────────────────────────────────────────────────────────

function IconEdit() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function IconX() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function IconUpload() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  );
}

function IconDownload() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

// ─── Shared UI Helpers ────────────────────────────────────────────────────────

const inputCls =
  "rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm focus:ring-2 focus:ring-slate-800/20 focus:border-slate-400 outline-none w-full";

const selectCls =
  "rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm focus:ring-2 focus:ring-slate-800/20 focus:border-slate-400 outline-none";

const btnPrimary =
  "inline-flex items-center gap-1.5 bg-slate-800 text-white hover:bg-slate-700 rounded-xl text-sm font-medium px-4 py-2 transition-colors disabled:opacity-50";

const btnSecondary =
  "inline-flex items-center gap-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium px-4 py-2 transition-colors disabled:opacity-50";

function fmtPrice(n: number) {
  return `$${n.toFixed(2)}`;
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// ─── Type badge ───────────────────────────────────────────────────────────────

const TYPE_BADGE: Record<string, string> = {
  ACCOMMODATION: "bg-blue-100 text-blue-700",
  ACTIVITY: "bg-green-100 text-green-700",
  TRANSPORT: "bg-amber-100 text-amber-700",
  ADDON: "bg-purple-100 text-purple-700",
};

function TypeBadge({ type }: { type: string }) {
  const cls = TYPE_BADGE[type] ?? "bg-slate-100 text-slate-600";
  return (
    <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${cls}`}>{type}</span>
  );
}

const EXCURSION_TYPE_BADGE: Record<string, string> = {
  safari: "bg-amber-100 text-amber-700",
  cultural: "bg-blue-100 text-blue-700",
  adventure: "bg-green-100 text-green-700",
  "water-sport": "bg-cyan-100 text-cyan-700",
  nature: "bg-emerald-100 text-emerald-700",
};

function ExcursionTypeBadge({ type }: { type: string }) {
  const cls = EXCURSION_TYPE_BADGE[type] ?? "bg-slate-100 text-slate-600";
  return (
    <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${cls}`}>{type}</span>
  );
}

// ─── Tab type ────────────────────────────────────────────────────────────────

type Tab = "rate-cards" | "distances" | "excursions";

// ─── Main Component ───────────────────────────────────────────────────────────

export function PricingClient({
  initialRateCards,
  destinations,
  initialDistances,
  initialExcursions,
}: PricingClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("rate-cards");

  const tabs: { id: Tab; label: string }[] = [
    { id: "rate-cards", label: "Rate Cards" },
    { id: "distances", label: "Distances" },
    { id: "excursions", label: "Excursions" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pricing Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage rate cards, distances, and excursions</p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "rate-cards" && <RateCardHeaderActions />}
          {activeTab === "excursions" && <ExcursionHeaderActions destinations={destinations} />}
          {activeTab === "distances" && <DistanceHeaderActions />}
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 p-1 bg-white/40 backdrop-blur rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-[background-color,color,box-shadow] duration-200 ${
              activeTab === tab.id
                ? "bg-slate-800 text-white rounded-xl shadow-sm"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/80 rounded-xl"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/80 shadow-sm">
        {activeTab === "rate-cards" && (
          <RateCardsTab initialRateCards={initialRateCards} destinations={destinations} />
        )}
        {activeTab === "distances" && (
          <DistancesTab
            destinations={destinations}
            initialDistances={initialDistances}
          />
        )}
        {activeTab === "excursions" && (
          <ExcursionsTab initialExcursions={initialExcursions} destinations={destinations} />
        )}
      </div>
    </div>
  );
}

// ─── Rate Card Header Actions (stub — state lives in tab) ─────────────────────
// We use a context-like pattern: the tab exposes its action bar via a slot
// rendered at the top. For simplicity we co-locate the header actions inside
// the tab and make the header render empty placeholders.

function RateCardHeaderActions() {
  return null; // Actions are rendered inside the tab for state access
}
function ExcursionHeaderActions(_props: { destinations: DestinationWithDistance[] }) {
  return null;
}
function DistanceHeaderActions() {
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 1: Rate Cards
// ─────────────────────────────────────────────────────────────────────────────

function RateCardsTab({
  initialRateCards,
  destinations,
}: {
  initialRateCards: RateCardRow[];
  destinations: DestinationWithDistance[];
}) {
  const [rateCards, setRateCards] = useState<RateCardRow[]>(initialRateCards);
  const [filterType, setFilterType] = useState("");
  const [filterTier, setFilterTier] = useState("");
  const [filterSeason, setFilterSeason] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    minPrice: string;
    maxPrice: string;
    perKmRate: string;
  }>({ minPrice: "", maxPrice: "", perKmRate: "" });
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    itemType: "ACCOMMODATION",
    tier: "",
    season: "all",
    destinationId: "",
    minPrice: "",
    maxPrice: "",
    perKmRate: "",
    currency: "USD",
  });
  const [importDiff, setImportDiff] = useState<ImportDiff | null>(null);
  const [importRows, setImportRows] = useState<Parameters<typeof applyRateCardImport>[0]>([]);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uniqueTiers = Array.from(new Set(rateCards.map((c) => c.tier).filter(Boolean))) as string[];

  const filtered = rateCards.filter((c) => {
    if (filterType && c.itemType !== filterType) return false;
    if (filterTier && c.tier !== filterTier) return false;
    if (filterSeason && c.season !== filterSeason) return false;
    return true;
  });

  const showKm = !filterType || filterType === "TRANSPORT";

  function startEdit(card: RateCardRow) {
    setEditingId(card.id);
    setEditValues({
      minPrice: String(card.minPrice),
      maxPrice: String(card.maxPrice),
      perKmRate: card.perKmRate != null ? String(card.perKmRate) : "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function saveEdit(id: string) {
    startTransition(async () => {
      const result = await updateRateCard(id, {
        minPrice: parseFloat(editValues.minPrice),
        maxPrice: parseFloat(editValues.maxPrice),
        perKmRate: editValues.perKmRate !== "" ? parseFloat(editValues.perKmRate) : null,
      });
      if (result.success) {
        const refreshed = await getRateCards();
        setRateCards(refreshed);
        setEditingId(null);
      }
    });
  }

  function handleDelete(id: string) {
    if (!window.confirm("Delete this rate card?")) return;
    startTransition(async () => {
      await deleteRateCard(id);
      const refreshed = await getRateCards();
      setRateCards(refreshed);
    });
  }

  function handleExport() {
    startTransition(async () => {
      const data = await exportRateCardsData();
      const wb = generateRateCardWorkbook(data);
      downloadWorkbook(wb, "helanka-rate-cards.xlsx");
    });
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const parsed = await parseRateCardWorkbook(file);
    startTransition(async () => {
      const diff = await previewRateCardImport(parsed as Parameters<typeof previewRateCardImport>[0]);
      setImportDiff(diff);
      setImportRows(parsed as Parameters<typeof applyRateCardImport>[0]);
    });
    e.target.value = "";
  }

  function handleApplyImport() {
    if (!importDiff) return;
    startTransition(async () => {
      await applyRateCardImport(
        importRows,
        importDiff.toUpdate.map((u) => ({
          id: u.id,
          data: {
            minPrice: u.incoming.minPrice,
            maxPrice: u.incoming.maxPrice,
            ...(u.incoming.perKmRate != null ? { perKmRate: u.incoming.perKmRate } : {}),
          },
        })),
      );
      const refreshed = await getRateCards();
      setRateCards(refreshed);
      setImportDiff(null);
      setImportRows([]);
    });
  }

  function handleAdd() {
    startTransition(async () => {
      const result = await createRateCard({
        itemType: addForm.itemType,
        tier: addForm.tier,
        season: addForm.season,
        destinationId: addForm.destinationId || undefined,
        minPrice: parseFloat(addForm.minPrice) || 0,
        maxPrice: parseFloat(addForm.maxPrice) || 0,
        perKmRate: addForm.perKmRate !== "" ? parseFloat(addForm.perKmRate) : undefined,
        currency: addForm.currency,
      });
      if (result.success) {
        const refreshed = await getRateCards();
        setRateCards(refreshed);
        setShowAddForm(false);
        setAddForm({
          itemType: "ACCOMMODATION",
          tier: "",
          season: "all",
          destinationId: "",
          minPrice: "",
          maxPrice: "",
          perKmRate: "",
          currency: "USD",
        });
      }
    });
  }

  return (
    <div className="overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 p-4 border-b border-white/60">
        <div className="flex items-center gap-2">
          <select
            className={selectCls}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="ACCOMMODATION">ACCOMMODATION</option>
            <option value="ACTIVITY">ACTIVITY</option>
            <option value="TRANSPORT">TRANSPORT</option>
            <option value="ADDON">ADDON</option>
          </select>
          <select
            className={selectCls}
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
          >
            <option value="">All Tiers</option>
            {uniqueTiers.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            className={selectCls}
            value={filterSeason}
            onChange={(e) => setFilterSeason(e.target.value)}
          >
            <option value="">All Seasons</option>
            <option value="peak">peak</option>
            <option value="shoulder">shoulder</option>
            <option value="off-peak">off-peak</option>
            <option value="all">all</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button className={btnSecondary} onClick={handleExport} disabled={isPending}>
            <IconDownload /> Export Excel
          </button>
          <button className={btnSecondary} onClick={handleImportClick} disabled={isPending}>
            <IconUpload /> Import Excel
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            className={btnPrimary}
            onClick={() => setShowAddForm((v) => !v)}
            disabled={isPending}
          >
            <IconPlus /> Add Rate Card
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="p-4 bg-slate-50/60 border-b border-white/60">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">New Rate Card</p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 items-end">
            <div className="lg:col-span-1">
              <label className="block text-[11px] text-slate-400 mb-1">Type</label>
              <select
                className={selectCls + " w-full"}
                value={addForm.itemType}
                onChange={(e) => setAddForm((f) => ({ ...f, itemType: e.target.value }))}
              >
                <option value="ACCOMMODATION">ACCOMMODATION</option>
                <option value="ACTIVITY">ACTIVITY</option>
                <option value="TRANSPORT">TRANSPORT</option>
                <option value="ADDON">ADDON</option>
              </select>
            </div>
            <div className="lg:col-span-1">
              <label className="block text-[11px] text-slate-400 mb-1">Tier</label>
              <input
                className={inputCls}
                placeholder="e.g. luxury"
                value={addForm.tier}
                onChange={(e) => setAddForm((f) => ({ ...f, tier: e.target.value }))}
              />
            </div>
            <div className="lg:col-span-1">
              <label className="block text-[11px] text-slate-400 mb-1">Season</label>
              <select
                className={selectCls + " w-full"}
                value={addForm.season}
                onChange={(e) => setAddForm((f) => ({ ...f, season: e.target.value }))}
              >
                <option value="all">all</option>
                <option value="peak">peak</option>
                <option value="shoulder">shoulder</option>
                <option value="off-peak">off-peak</option>
              </select>
            </div>
            <div className="lg:col-span-1">
              <label className="block text-[11px] text-slate-400 mb-1">Destination</label>
              <select
                className={selectCls + " w-full"}
                value={addForm.destinationId}
                onChange={(e) => setAddForm((f) => ({ ...f, destinationId: e.target.value }))}
              >
                <option value="">None</option>
                {destinations.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="lg:col-span-1">
              <label className="block text-[11px] text-slate-400 mb-1">Min Price</label>
              <input
                type="number"
                className={inputCls}
                placeholder="0.00"
                value={addForm.minPrice}
                onChange={(e) => setAddForm((f) => ({ ...f, minPrice: e.target.value }))}
              />
            </div>
            <div className="lg:col-span-1">
              <label className="block text-[11px] text-slate-400 mb-1">Max Price</label>
              <input
                type="number"
                className={inputCls}
                placeholder="0.00"
                value={addForm.maxPrice}
                onChange={(e) => setAddForm((f) => ({ ...f, maxPrice: e.target.value }))}
              />
            </div>
            <div className="lg:col-span-1">
              <label className="block text-[11px] text-slate-400 mb-1">Per Km Rate</label>
              <input
                type="number"
                className={inputCls}
                placeholder="—"
                value={addForm.perKmRate}
                onChange={(e) => setAddForm((f) => ({ ...f, perKmRate: e.target.value }))}
              />
            </div>
            <div className="lg:col-span-1 flex gap-2">
              <button className={btnPrimary} onClick={handleAdd} disabled={isPending}>
                <IconCheck /> Save
              </button>
              <button
                className={btnSecondary}
                onClick={() => setShowAddForm(false)}
                disabled={isPending}
              >
                <IconX />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100/80">
              <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-4 py-3">Type</th>
              <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-4 py-3">Tier</th>
              <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-4 py-3">Season</th>
              <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-4 py-3">Destination</th>
              <th className="text-right text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-4 py-3">Min Price</th>
              <th className="text-right text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-4 py-3">Max Price</th>
              {showKm && (
                <th className="text-right text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-4 py-3">Per Km</th>
              )}
              <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-4 py-3">Currency</th>
              <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={showKm ? 9 : 8} className="px-4 py-10 text-center text-sm text-slate-400">
                  No rate cards match the current filters.
                </td>
              </tr>
            )}
            {filtered.map((card) => {
              const isEditing = editingId === card.id;
              return (
                <tr
                  key={card.id}
                  className="border-b border-slate-100/60 hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <TypeBadge type={card.itemType} />
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">{card.tier ?? "—"}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{card.season}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{card.destinationName ?? "—"}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 text-right">
                    {isEditing ? (
                      <input
                        type="number"
                        className={inputCls + " text-right w-24"}
                        value={editValues.minPrice}
                        onChange={(e) =>
                          setEditValues((v) => ({ ...v, minPrice: e.target.value }))
                        }
                      />
                    ) : (
                      fmtPrice(card.minPrice)
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 text-right">
                    {isEditing ? (
                      <input
                        type="number"
                        className={inputCls + " text-right w-24"}
                        value={editValues.maxPrice}
                        onChange={(e) =>
                          setEditValues((v) => ({ ...v, maxPrice: e.target.value }))
                        }
                      />
                    ) : (
                      fmtPrice(card.maxPrice)
                    )}
                  </td>
                  {showKm && (
                    <td className="px-4 py-3 text-sm text-slate-700 text-right">
                      {isEditing && card.itemType === "TRANSPORT" ? (
                        <input
                          type="number"
                          className={inputCls + " text-right w-24"}
                          value={editValues.perKmRate}
                          onChange={(e) =>
                            setEditValues((v) => ({ ...v, perKmRate: e.target.value }))
                          }
                        />
                      ) : card.perKmRate != null ? (
                        fmtPrice(card.perKmRate)
                      ) : (
                        "—"
                      )}
                    </td>
                  )}
                  <td className="px-4 py-3 text-sm text-slate-700">{card.currency}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {isEditing ? (
                        <>
                          <button
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-50"
                            onClick={() => saveEdit(card.id)}
                            disabled={isPending}
                            title="Save"
                          >
                            <IconCheck />
                          </button>
                          <button
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                            onClick={cancelEdit}
                            title="Cancel"
                          >
                            <IconX />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            onClick={() => startEdit(card)}
                            title="Edit"
                          >
                            <IconEdit />
                          </button>
                          <button
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            onClick={() => handleDelete(card.id)}
                            title="Delete"
                          >
                            <IconTrash />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Import Diff Modal */}
      {importDiff && (
        <ImportDiffModal
          diff={importDiff}
          onApply={handleApplyImport}
          onClose={() => setImportDiff(null)}
          isPending={isPending}
        />
      )}
    </div>
  );
}

// ─── Import Diff Modal ────────────────────────────────────────────────────────

function ImportDiffModal({
  diff,
  onApply,
  onClose,
  isPending,
}: {
  diff: ImportDiff;
  onApply: () => void;
  onClose: () => void;
  isPending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl bg-white/90 backdrop-blur-xl rounded-2xl border border-white/80 shadow-2xl shadow-slate-300/30 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">Import Preview</h2>
          <button
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
            onClick={onClose}
          >
            <IconX />
          </button>
        </div>

        <div className="px-6 py-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {/* Summary pills */}
          <div className="flex flex-wrap gap-2">
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700">
              {diff.toCreate.length} new
            </span>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
              {diff.toUpdate.length} to update
            </span>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              {diff.unchanged} unchanged
            </span>
            {diff.errors.length > 0 && (
              <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-red-100 text-red-600">
                {diff.errors.length} errors
              </span>
            )}
          </div>

          {/* To create */}
          {diff.toCreate.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-green-700 mb-1">New Rate Cards</p>
              <div className="space-y-1">
                {diff.toCreate.map((r, i) => (
                  <div key={i} className="text-xs text-slate-600 bg-green-50 rounded-lg px-3 py-2">
                    {r.itemType} / {r.tier} / {r.season} / {r.destination} — {fmtPrice(r.minPrice)}–{fmtPrice(r.maxPrice)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* To update */}
          {diff.toUpdate.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-amber-700 mb-1">Updates</p>
              <div className="space-y-1">
                {diff.toUpdate.map((u, i) => (
                  <div key={i} className="text-xs text-slate-600 bg-amber-50 rounded-lg px-3 py-2">
                    <span className="font-medium">{u.current.itemType} / {u.current.tier} / {u.current.season}</span>
                    <div className="mt-0.5 text-slate-400 line-through">
                      {fmtPrice(u.current.minPrice)}–{fmtPrice(u.current.maxPrice)}
                      {u.current.perKmRate != null && ` · ${fmtPrice(u.current.perKmRate)}/km`}
                    </div>
                    <div className="text-slate-700">
                      {fmtPrice(u.incoming.minPrice)}–{fmtPrice(u.incoming.maxPrice)}
                      {u.incoming.perKmRate != null && ` · ${fmtPrice(u.incoming.perKmRate)}/km`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Errors */}
          {diff.errors.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-red-600 mb-1">Errors</p>
              <div className="space-y-1">
                {diff.errors.map((err, i) => (
                  <div key={i} className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
                    {err}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100">
          <button className={btnSecondary} onClick={onClose}>
            Cancel
          </button>
          <button
            className={btnPrimary}
            onClick={onApply}
            disabled={isPending || (diff.toCreate.length === 0 && diff.toUpdate.length === 0)}
          >
            {isPending ? "Applying…" : "Apply Import"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 2: Distances
// ─────────────────────────────────────────────────────────────────────────────

function DistancesTab({
  destinations: initialDestinations,
  initialDistances,
}: {
  destinations: DestinationWithDistance[];
  initialDistances: DestinationDistanceRow[];
}) {
  const [destinations, setDestinations] = useState<DestinationWithDistance[]>(initialDestinations);
  const [distances, setDistances] = useState<DestinationDistanceRow[]>(initialDistances);
  const [editingColomboId, setEditingColomboId] = useState<string | null>(null);
  const [editingColomboVal, setEditingColomboVal] = useState("");
  const [editingPairId, setEditingPairId] = useState<string | null>(null);
  const [editingPairVal, setEditingPairVal] = useState("");
  const [isPending, startTransition] = useTransition();

  function startEditColombo(dest: DestinationWithDistance) {
    setEditingColomboId(dest.id);
    setEditingColomboVal(dest.distanceFromColomboKm != null ? String(dest.distanceFromColomboKm) : "");
  }

  function saveColombo(id: string) {
    const km = parseFloat(editingColomboVal);
    if (isNaN(km)) return;
    startTransition(async () => {
      await updateDestinationColomboDistance(id, km);
      const refreshed = await getDestinationsWithDistances();
      setDestinations(refreshed);
      setEditingColomboId(null);
    });
  }

  function startEditPair(row: DestinationDistanceRow) {
    setEditingPairId(row.id);
    setEditingPairVal(String(row.distanceKm));
  }

  function savePair(id: string) {
    const km = parseFloat(editingPairVal);
    if (isNaN(km)) return;
    startTransition(async () => {
      await updateDestinationDistance(id, km);
      const refreshed = await getDestinationDistances();
      setDistances(refreshed);
      setEditingPairId(null);
    });
  }

  function handleExportDistances() {
    const wb = generateDistanceWorkbook(destinations, distances);
    downloadWorkbook(wb, "helanka-distances.xlsx");
  }

  return (
    <div>
      {/* Section 1: Distance from Colombo */}
      <div className="p-4 border-b border-white/60">
        <h2 className="text-sm font-bold text-slate-700 mb-4">Distance from Colombo</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100/80">
                <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-3 py-2">Destination</th>
                <th className="text-right text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-3 py-2">Distance from Colombo (km)</th>
                <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-3 py-2 w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {destinations.map((dest) => {
                const isEditing = editingColomboId === dest.id;
                return (
                  <tr key={dest.id} className="border-b border-slate-100/60 hover:bg-slate-50/50 transition-colors">
                    <td className="px-3 py-2.5 text-sm text-slate-700">{dest.name}</td>
                    <td className="px-3 py-2.5 text-sm text-slate-700 text-right">
                      {isEditing ? (
                        <input
                          type="number"
                          className={inputCls + " text-right w-28 inline-block"}
                          value={editingColomboVal}
                          onChange={(e) => setEditingColomboVal(e.target.value)}
                          autoFocus
                        />
                      ) : (
                        dest.distanceFromColomboKm != null ? `${dest.distanceFromColomboKm} km` : "—"
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1">
                        {isEditing ? (
                          <>
                            <button
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-50"
                              onClick={() => saveColombo(dest.id)}
                              disabled={isPending}
                            >
                              <IconCheck />
                            </button>
                            <button
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                              onClick={() => setEditingColomboId(null)}
                            >
                              <IconX />
                            </button>
                          </>
                        ) : (
                          <button
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            onClick={() => startEditColombo(dest)}
                          >
                            <IconEdit />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Pairwise Distances */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-700">Pairwise Distances</h2>
          <button className={btnSecondary} onClick={handleExportDistances}>
            <IconDownload /> Export Excel
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100/80">
                <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-3 py-2">From</th>
                <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-3 py-2">To</th>
                <th className="text-right text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-3 py-2">Distance (km)</th>
                <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-3 py-2 w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {distances.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-10 text-center text-sm text-slate-400">
                    No pairwise distances configured.
                  </td>
                </tr>
              )}
              {distances.map((row) => {
                const isEditing = editingPairId === row.id;
                return (
                  <tr key={row.id} className="border-b border-slate-100/60 hover:bg-slate-50/50 transition-colors">
                    <td className="px-3 py-2.5 text-sm text-slate-700">{row.fromName}</td>
                    <td className="px-3 py-2.5 text-sm text-slate-700">{row.toName}</td>
                    <td className="px-3 py-2.5 text-sm text-slate-700 text-right">
                      {isEditing ? (
                        <input
                          type="number"
                          className={inputCls + " text-right w-28 inline-block"}
                          value={editingPairVal}
                          onChange={(e) => setEditingPairVal(e.target.value)}
                          autoFocus
                        />
                      ) : (
                        `${row.distanceKm} km`
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1">
                        {isEditing ? (
                          <>
                            <button
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-50"
                              onClick={() => savePair(row.id)}
                              disabled={isPending}
                            >
                              <IconCheck />
                            </button>
                            <button
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                              onClick={() => setEditingPairId(null)}
                            >
                              <IconX />
                            </button>
                          </>
                        ) : (
                          <button
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            onClick={() => startEditPair(row)}
                          >
                            <IconEdit />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 3: Excursions
// ─────────────────────────────────────────────────────────────────────────────

type ExcursionEditState = {
  name: string;
  distanceKm: string;
  type: string;
  description: string;
};

const EXCURSION_TYPES = ["safari", "cultural", "adventure", "water-sport", "nature"] as const;

function ExcursionsTab({
  initialExcursions,
  destinations,
}: {
  initialExcursions: ExcursionRow[];
  destinations: DestinationWithDistance[];
}) {
  const [excursions, setExcursions] = useState<ExcursionRow[]>(initialExcursions);
  const [filterDest, setFilterDest] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<ExcursionEditState>({
    name: "",
    distanceKm: "",
    type: "",
    description: "",
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    destinationId: "",
    type: "safari" as string,
    distanceKm: "",
    description: "",
  });
  const [isPending, startTransition] = useTransition();

  const slug = slugify(addForm.name);

  const filtered = filterDest
    ? excursions.filter((e) => e.destinationId === filterDest)
    : excursions;

  function startEdit(exc: ExcursionRow) {
    setEditingId(exc.id);
    setEditValues({
      name: exc.name,
      distanceKm: String(exc.distanceKm),
      type: exc.type,
      description: exc.description ?? "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function saveEdit(id: string) {
    startTransition(async () => {
      await updateExcursion(id, {
        name: editValues.name,
        distanceKm: parseFloat(editValues.distanceKm) || 0,
        type: editValues.type,
        description: editValues.description || undefined,
      });
      const refreshed = await getExcursions();
      setExcursions(refreshed);
      setEditingId(null);
    });
  }

  function handleDelete(id: string) {
    if (!window.confirm("Delete this excursion? This action cannot be undone.")) return;
    startTransition(async () => {
      await deleteExcursion(id);
      const refreshed = await getExcursions();
      setExcursions(refreshed);
    });
  }

  function handleAdd() {
    if (!addForm.name || !addForm.destinationId) return;
    startTransition(async () => {
      await createExcursion({
        name: addForm.name,
        slug,
        destinationId: addForm.destinationId,
        type: addForm.type,
        distanceKm: parseFloat(addForm.distanceKm) || 0,
        description: addForm.description || undefined,
      });
      const refreshed = await getExcursions();
      setExcursions(refreshed);
      setShowAddForm(false);
      setAddForm({ name: "", destinationId: "", type: "safari", distanceKm: "", description: "" });
    });
  }

  function handleExport() {
    const wb = generateExcursionWorkbook(excursions);
    downloadWorkbook(wb, "helanka-excursions.xlsx");
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 p-4 border-b border-white/60">
        <select
          className={selectCls}
          value={filterDest}
          onChange={(e) => setFilterDest(e.target.value)}
        >
          <option value="">All Destinations</option>
          {destinations.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <button className={btnSecondary} onClick={handleExport}>
            <IconDownload /> Export Excel
          </button>
          <button
            className={btnPrimary}
            onClick={() => setShowAddForm((v) => !v)}
            disabled={isPending}
          >
            <IconPlus /> Add Excursion
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="p-4 bg-slate-50/60 border-b border-white/60">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">New Excursion</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Name</label>
              <input
                className={inputCls}
                placeholder="Excursion name"
                value={addForm.name}
                onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
              />
              {addForm.name && (
                <p className="text-[11px] text-slate-400 mt-1">Slug: {slug}</p>
              )}
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Destination</label>
              <select
                className={selectCls + " w-full"}
                value={addForm.destinationId}
                onChange={(e) => setAddForm((f) => ({ ...f, destinationId: e.target.value }))}
              >
                <option value="">Select destination</option>
                {destinations.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Type</label>
              <select
                className={selectCls + " w-full"}
                value={addForm.type}
                onChange={(e) => setAddForm((f) => ({ ...f, type: e.target.value }))}
              >
                {EXCURSION_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Distance (km)</label>
              <input
                type="number"
                className={inputCls}
                placeholder="0"
                value={addForm.distanceKm}
                onChange={(e) => setAddForm((f) => ({ ...f, distanceKm: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2 lg:col-span-2">
              <label className="block text-[11px] text-slate-400 mb-1">Description</label>
              <input
                className={inputCls}
                placeholder="Short description (optional)"
                value={addForm.description}
                onChange={(e) => setAddForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              className={btnPrimary}
              onClick={handleAdd}
              disabled={isPending || !addForm.name || !addForm.destinationId}
            >
              <IconCheck /> Save Excursion
            </button>
            <button
              className={btnSecondary}
              onClick={() => setShowAddForm(false)}
            >
              <IconX /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100/80">
              <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-4 py-3">Name</th>
              <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-4 py-3">Destination</th>
              <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-4 py-3">Type</th>
              <th className="text-right text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-4 py-3">Distance (km)</th>
              <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-4 py-3">Description</th>
              <th className="text-center text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-4 py-3">Active</th>
              <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">
                  No excursions found.
                </td>
              </tr>
            )}
            {filtered.map((exc) => {
              const isEditing = editingId === exc.id;
              return (
                <tr key={exc.id} className="border-b border-slate-100/60 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-slate-700 max-w-[180px]">
                    {isEditing ? (
                      <input
                        className={inputCls}
                        value={editValues.name}
                        onChange={(e) => setEditValues((v) => ({ ...v, name: e.target.value }))}
                      />
                    ) : (
                      <span className="font-medium">{exc.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                      {exc.destinationName}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <select
                        className={selectCls}
                        value={editValues.type}
                        onChange={(e) => setEditValues((v) => ({ ...v, type: e.target.value }))}
                      >
                        {EXCURSION_TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    ) : (
                      <ExcursionTypeBadge type={exc.type} />
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 text-right">
                    {isEditing ? (
                      <input
                        type="number"
                        className={inputCls + " text-right w-24"}
                        value={editValues.distanceKm}
                        onChange={(e) => setEditValues((v) => ({ ...v, distanceKm: e.target.value }))}
                      />
                    ) : (
                      `${exc.distanceKm} km`
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500 max-w-[220px]">
                    {isEditing ? (
                      <input
                        className={inputCls}
                        value={editValues.description}
                        onChange={(e) => setEditValues((v) => ({ ...v, description: e.target.value }))}
                        placeholder="Description"
                      />
                    ) : (
                      <span className="truncate block">{exc.description ?? "—"}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block w-2.5 h-2.5 rounded-full ${
                        exc.isActive ? "bg-emerald-400" : "bg-slate-300"
                      }`}
                      title={exc.isActive ? "Active" : "Inactive"}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {isEditing ? (
                        <>
                          <button
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-50"
                            onClick={() => saveEdit(exc.id)}
                            disabled={isPending}
                            title="Save"
                          >
                            <IconCheck />
                          </button>
                          <button
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                            onClick={cancelEdit}
                            title="Cancel"
                          >
                            <IconX />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            onClick={() => startEdit(exc)}
                            title="Edit"
                          >
                            <IconEdit />
                          </button>
                          <button
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            onClick={() => handleDelete(exc.id)}
                            title="Delete"
                          >
                            <IconTrash />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
