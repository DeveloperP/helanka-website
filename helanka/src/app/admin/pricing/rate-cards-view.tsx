"use client";

import { useState, useTransition, useRef } from "react";
import type { RateCardRow, DestinationWithDistance, ImportDiff } from "@/actions/rate-card-actions";
import {
  getRateCards,
  updateRateCard,
  createRateCard,
  deleteRateCard,
  exportRateCardsData,
  previewRateCardImport,
  applyRateCardImport,
} from "@/actions/rate-card-actions";
import {
  generateRateCardWorkbook,
  parseRateCardWorkbook,
  downloadWorkbook,
} from "@/lib/excel";
import { EditDrawer, DrawerField, DrawerReadOnly, DrawerActions } from "./edit-drawer";

const inputCls =
  "rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm focus:ring-2 focus:ring-slate-800/20 focus:border-slate-400 outline-none w-full";

const selectCls =
  "rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm focus:ring-2 focus:ring-slate-800/20 focus:border-slate-400 outline-none w-full";

function fmtPrice(n: number) {
  return `$${n.toFixed(2)}`;
}

const TYPE_BADGE: Record<string, string> = {
  ACCOMMODATION: "bg-blue-100 text-blue-700",
  ACTIVITY: "bg-green-100 text-green-700",
  TRANSPORT: "bg-amber-100 text-amber-700",
  ADDON: "bg-purple-100 text-purple-700",
};

const ITEM_TYPES = ["ACCOMMODATION", "ACTIVITY", "TRANSPORT", "ADDON"] as const;

interface RateCardsViewProps {
  initialRateCards: RateCardRow[];
  destinations: DestinationWithDistance[];
  onBack: () => void;
}

export function RateCardsView({ initialRateCards, destinations, onBack }: RateCardsViewProps) {
  const [rateCards, setRateCards] = useState(initialRateCards);
  const [filterType, setFilterType] = useState("");
  const [editingCard, setEditingCard] = useState<RateCardRow | null>(null);
  const [editValues, setEditValues] = useState({ minPrice: "", maxPrice: "", perKmRate: "" });
  const [showAddDrawer, setShowAddDrawer] = useState(false);
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

  const filtered = rateCards.filter((c) => !filterType || c.itemType === filterType);

  function openEdit(card: RateCardRow) {
    setEditingCard(card);
    setEditValues({
      minPrice: String(card.minPrice),
      maxPrice: String(card.maxPrice),
      perKmRate: card.perKmRate != null ? String(card.perKmRate) : "",
    });
  }

  function saveEdit() {
    if (!editingCard) return;
    startTransition(async () => {
      const result = await updateRateCard(editingCard.id, {
        minPrice: parseFloat(editValues.minPrice),
        maxPrice: parseFloat(editValues.maxPrice),
        perKmRate: editValues.perKmRate !== "" ? parseFloat(editValues.perKmRate) : null,
      });
      if (result.success) {
        const refreshed = await getRateCards();
        setRateCards(refreshed);
        setEditingCard(null);
      }
    });
  }

  function handleDelete() {
    if (!editingCard || !window.confirm("Delete this rate card?")) return;
    startTransition(async () => {
      await deleteRateCard(editingCard.id);
      const refreshed = await getRateCards();
      setRateCards(refreshed);
      setEditingCard(null);
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
        setShowAddDrawer(false);
        setAddForm({ itemType: "ACCOMMODATION", tier: "", season: "all", destinationId: "", minPrice: "", maxPrice: "", perKmRate: "", currency: "USD" });
      }
    });
  }

  function handleExport() {
    startTransition(async () => {
      const data = await exportRateCardsData();
      const wb = generateRateCardWorkbook(data);
      downloadWorkbook(wb, "helanka-rate-cards.xlsx");
    });
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

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-5">
        <button onClick={onBack} className="text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors cursor-pointer">
          ← Pricing
        </button>
        <span className="text-slate-300">/</span>
        <span className="text-sm font-semibold text-slate-800">Rate Cards</span>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType("")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
              !filterType ? "bg-slate-800 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            All Types
          </button>
          {ITEM_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(filterType === type ? "" : type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                filterType === type ? "bg-slate-800 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} disabled={isPending} className="inline-flex items-center gap-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium px-3 py-2 transition-colors disabled:opacity-50 cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
            Export
          </button>
          <button onClick={() => fileInputRef.current?.click()} disabled={isPending} className="inline-flex items-center gap-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium px-3 py-2 transition-colors disabled:opacity-50 cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
            Import
          </button>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileChange} />
          <button onClick={() => setShowAddDrawer(true)} disabled={isPending} className="inline-flex items-center gap-1.5 bg-slate-800 text-white hover:bg-slate-700 rounded-xl text-sm font-medium px-4 py-2 transition-colors disabled:opacity-50 cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Add Rate
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/80 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100/80">
              <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-4 py-3">Type / Tier</th>
              <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-4 py-3">Season</th>
              <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-4 py-3">Destination</th>
              <th className="text-right text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-4 py-3">Price Range</th>
              <th className="text-right text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-4 py-3">Per Km</th>
              <th className="text-right text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-4 py-3 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">
                  No rate cards match the current filter.
                </td>
              </tr>
            )}
            {filtered.map((card) => (
              <tr
                key={card.id}
                onClick={() => openEdit(card)}
                className="border-b border-slate-100/60 hover:bg-slate-50/50 transition-colors duration-150 cursor-pointer"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${TYPE_BADGE[card.itemType] ?? "bg-slate-100 text-slate-600"}`}>
                      {card.itemType}
                    </span>
                    <span className="text-sm font-medium text-slate-700">{card.tier ?? "---"}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{card.season}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{card.destinationName ?? "---"}</td>
                <td className="px-4 py-3 text-sm font-medium text-slate-700 text-right">
                  {fmtPrice(card.minPrice)} – {fmtPrice(card.maxPrice)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-500 text-right">
                  {card.perKmRate != null ? fmtPrice(card.perKmRate) : "---"}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-xs text-blue-500 font-medium">Edit →</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 text-center text-[11px] text-slate-400 border-t border-slate-100/60">
          Showing {filtered.length} of {rateCards.length} rate cards
        </div>
      </div>

      {/* Edit Drawer */}
      <EditDrawer open={!!editingCard} onClose={() => setEditingCard(null)} title="Edit Rate Card">
        {editingCard && (
          <>
            <DrawerReadOnly label="Type">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${TYPE_BADGE[editingCard.itemType] ?? "bg-slate-100 text-slate-600"}`}>
                  {editingCard.itemType}
                </span>
                <span className="font-medium">{editingCard.tier ?? "---"}</span>
              </div>
            </DrawerReadOnly>
            <DrawerReadOnly label="Season">{editingCard.season}</DrawerReadOnly>
            <DrawerReadOnly label="Destination">{editingCard.destinationName ?? "None (global)"}</DrawerReadOnly>
            <DrawerField label="Min Price (USD)">
              <input
                type="number"
                className={inputCls}
                value={editValues.minPrice}
                onChange={(e) => setEditValues((v) => ({ ...v, minPrice: e.target.value }))}
              />
            </DrawerField>
            <DrawerField label="Max Price (USD)">
              <input
                type="number"
                className={inputCls}
                value={editValues.maxPrice}
                onChange={(e) => setEditValues((v) => ({ ...v, maxPrice: e.target.value }))}
              />
            </DrawerField>
            {editingCard.itemType === "TRANSPORT" && (
              <DrawerField label="Per Km Rate (USD)">
                <input
                  type="number"
                  className={inputCls}
                  value={editValues.perKmRate}
                  onChange={(e) => setEditValues((v) => ({ ...v, perKmRate: e.target.value }))}
                />
              </DrawerField>
            )}
            <DrawerActions
              onSave={saveEdit}
              onCancel={() => setEditingCard(null)}
              onDelete={handleDelete}
              isPending={isPending}
              deleteLabel="Delete this rate card"
            />
          </>
        )}
      </EditDrawer>

      {/* Add Drawer */}
      <EditDrawer open={showAddDrawer} onClose={() => setShowAddDrawer(false)} title="New Rate Card">
        <DrawerField label="Type">
          <select className={selectCls} value={addForm.itemType} onChange={(e) => setAddForm((f) => ({ ...f, itemType: e.target.value }))}>
            {ITEM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </DrawerField>
        <DrawerField label="Tier">
          <input className={inputCls} placeholder="e.g. luxury" value={addForm.tier} onChange={(e) => setAddForm((f) => ({ ...f, tier: e.target.value }))} />
        </DrawerField>
        <DrawerField label="Season">
          <select className={selectCls} value={addForm.season} onChange={(e) => setAddForm((f) => ({ ...f, season: e.target.value }))}>
            <option value="all">all</option>
            <option value="peak">peak</option>
            <option value="shoulder">shoulder</option>
            <option value="off-peak">off-peak</option>
          </select>
        </DrawerField>
        <DrawerField label="Destination">
          <select className={selectCls} value={addForm.destinationId} onChange={(e) => setAddForm((f) => ({ ...f, destinationId: e.target.value }))}>
            <option value="">None (global)</option>
            {destinations.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </DrawerField>
        <DrawerField label="Min Price">
          <input type="number" className={inputCls} placeholder="0.00" value={addForm.minPrice} onChange={(e) => setAddForm((f) => ({ ...f, minPrice: e.target.value }))} />
        </DrawerField>
        <DrawerField label="Max Price">
          <input type="number" className={inputCls} placeholder="0.00" value={addForm.maxPrice} onChange={(e) => setAddForm((f) => ({ ...f, maxPrice: e.target.value }))} />
        </DrawerField>
        {addForm.itemType === "TRANSPORT" && (
          <DrawerField label="Per Km Rate">
            <input type="number" className={inputCls} placeholder="0.00" value={addForm.perKmRate} onChange={(e) => setAddForm((f) => ({ ...f, perKmRate: e.target.value }))} />
          </DrawerField>
        )}
        <DrawerActions onSave={handleAdd} onCancel={() => setShowAddDrawer(false)} isPending={isPending} />
      </EditDrawer>

      {/* Import Diff Modal */}
      {importDiff && (
        <ImportDiffModal diff={importDiff} onApply={handleApplyImport} onClose={() => setImportDiff(null)} isPending={isPending} />
      )}
    </div>
  );
}

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
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white/90 backdrop-blur-xl rounded-2xl border border-white/80 shadow-2xl shadow-slate-300/30 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">Import Preview</h2>
          <button className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer" onClick={onClose}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="px-6 py-4 space-y-3 max-h-[60vh] overflow-y-auto">
          <div className="flex flex-wrap gap-2">
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700">{diff.toCreate.length} new</span>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">{diff.toUpdate.length} to update</span>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">{diff.unchanged} unchanged</span>
            {diff.errors.length > 0 && (
              <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-red-100 text-red-600">{diff.errors.length} errors</span>
            )}
          </div>
          {diff.toCreate.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-green-700 mb-1">New Rate Cards</p>
              <div className="space-y-1">
                {diff.toCreate.map((r, i) => (
                  <div key={i} className="text-xs text-slate-600 bg-green-50 rounded-lg px-3 py-2">
                    {r.itemType} / {r.tier} / {r.season} / {r.destination} -- {fmtPrice(r.minPrice)}--{fmtPrice(r.maxPrice)}
                  </div>
                ))}
              </div>
            </div>
          )}
          {diff.toUpdate.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-amber-700 mb-1">Updates</p>
              <div className="space-y-1">
                {diff.toUpdate.map((u, i) => (
                  <div key={i} className="text-xs text-slate-600 bg-amber-50 rounded-lg px-3 py-2">
                    <span className="font-medium">{u.current.itemType} / {u.current.tier} / {u.current.season}</span>
                    <div className="mt-0.5 text-slate-400 line-through">
                      {fmtPrice(u.current.minPrice)}--{fmtPrice(u.current.maxPrice)}
                      {u.current.perKmRate != null && ` / ${fmtPrice(u.current.perKmRate)}/km`}
                    </div>
                    <div className="text-slate-700">
                      {fmtPrice(u.incoming.minPrice)}--{fmtPrice(u.incoming.maxPrice)}
                      {u.incoming.perKmRate != null && ` / ${fmtPrice(u.incoming.perKmRate)}/km`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {diff.errors.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-red-600 mb-1">Errors</p>
              <div className="space-y-1">
                {diff.errors.map((err, i) => (
                  <div key={i} className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{err}</div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100">
          <button className="inline-flex items-center gap-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium px-4 py-2 transition-colors cursor-pointer" onClick={onClose}>Cancel</button>
          <button
            className="inline-flex items-center gap-1.5 bg-slate-800 text-white hover:bg-slate-700 rounded-xl text-sm font-medium px-4 py-2 transition-colors disabled:opacity-50 cursor-pointer"
            onClick={onApply}
            disabled={isPending || (diff.toCreate.length === 0 && diff.toUpdate.length === 0)}
          >
            {isPending ? "Applying..." : "Apply Import"}
          </button>
        </div>
      </div>
    </div>
  );
}
