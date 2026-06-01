"use client";

import { useState, useTransition } from "react";
import type { DestinationWithDistance, DestinationDistanceRow } from "@/actions/rate-card-actions";
import {
  updateDestinationColomboDistance,
  getDestinationsWithDistances,
  updateDestinationDistance,
  getDestinationDistances,
} from "@/actions/rate-card-actions";
import { generateDistanceWorkbook, downloadWorkbook } from "@/lib/excel";
import { EditDrawer, DrawerField, DrawerReadOnly, DrawerActions } from "./edit-drawer";

const inputCls =
  "rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm focus:ring-2 focus:ring-slate-800/20 focus:border-slate-400 outline-none w-full";

interface DistancesViewProps {
  initialDestinations: DestinationWithDistance[];
  initialDistances: DestinationDistanceRow[];
  onBack: () => void;
}

export function DistancesView({ initialDestinations, initialDistances, onBack }: DistancesViewProps) {
  const [destinations, setDestinations] = useState(initialDestinations);
  const [distances, setDistances] = useState(initialDistances);
  const [editingColombo, setEditingColombo] = useState<DestinationWithDistance | null>(null);
  const [colomboVal, setColomboVal] = useState("");
  const [editingPair, setEditingPair] = useState<DestinationDistanceRow | null>(null);
  const [pairVal, setPairVal] = useState("");
  const [isPending, startTransition] = useTransition();

  function openColomboEdit(dest: DestinationWithDistance) {
    setEditingColombo(dest);
    setColomboVal(dest.distanceFromColomboKm != null ? String(dest.distanceFromColomboKm) : "");
  }

  function saveColombo() {
    if (!editingColombo) return;
    const km = parseFloat(colomboVal);
    if (isNaN(km)) return;
    startTransition(async () => {
      await updateDestinationColomboDistance(editingColombo.id, km);
      const refreshed = await getDestinationsWithDistances();
      setDestinations(refreshed);
      setEditingColombo(null);
    });
  }

  function openPairEdit(row: DestinationDistanceRow) {
    setEditingPair(row);
    setPairVal(String(row.distanceKm));
  }

  function savePair() {
    if (!editingPair) return;
    const km = parseFloat(pairVal);
    if (isNaN(km)) return;
    startTransition(async () => {
      await updateDestinationDistance(editingPair.id, km);
      const refreshed = await getDestinationDistances();
      setDistances(refreshed);
      setEditingPair(null);
    });
  }

  function handleExport() {
    const wb = generateDistanceWorkbook(destinations, distances);
    downloadWorkbook(wb, "helanka-distances.xlsx");
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-5">
        <button onClick={onBack} className="text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors cursor-pointer">
          ← Pricing
        </button>
        <span className="text-slate-300">/</span>
        <span className="text-sm font-semibold text-slate-800">Distances</span>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-end mb-4">
        <button onClick={handleExport} className="inline-flex items-center gap-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium px-3 py-2 transition-colors cursor-pointer">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
          Export Excel
        </button>
      </div>

      {/* Section 1: Colombo Distances */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/80 shadow-sm overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-slate-100/80">
          <h2 className="text-sm font-bold text-slate-700">Distance from Colombo</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100/80">
              <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-4 py-3">Destination</th>
              <th className="text-right text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-4 py-3">Distance (km)</th>
              <th className="text-right text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-4 py-3 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {destinations.map((dest) => (
              <tr
                key={dest.id}
                onClick={() => openColomboEdit(dest)}
                className="border-b border-slate-100/60 hover:bg-slate-50/50 transition-colors duration-150 cursor-pointer"
              >
                <td className="px-4 py-3 text-sm text-slate-700 font-medium">{dest.name}</td>
                <td className="px-4 py-3 text-sm text-slate-600 text-right">
                  {dest.distanceFromColomboKm != null ? `${dest.distanceFromColomboKm} km` : "---"}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-xs text-blue-500 font-medium">Edit →</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Section 2: Pairwise Distances */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/80 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100/80">
          <h2 className="text-sm font-bold text-slate-700">Pairwise Distances</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100/80">
              <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-4 py-3">From</th>
              <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-4 py-3">To</th>
              <th className="text-right text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-4 py-3">Distance (km)</th>
              <th className="text-right text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-4 py-3 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {distances.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-slate-400">No pairwise distances configured.</td>
              </tr>
            )}
            {distances.map((row) => (
              <tr
                key={row.id}
                onClick={() => openPairEdit(row)}
                className="border-b border-slate-100/60 hover:bg-slate-50/50 transition-colors duration-150 cursor-pointer"
              >
                <td className="px-4 py-3 text-sm text-slate-700">{row.fromName}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{row.toName}</td>
                <td className="px-4 py-3 text-sm text-slate-600 text-right">{row.distanceKm} km</td>
                <td className="px-4 py-3 text-right">
                  <span className="text-xs text-blue-500 font-medium">Edit →</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Colombo Edit Drawer */}
      <EditDrawer open={!!editingColombo} onClose={() => setEditingColombo(null)} title="Edit Distance from Colombo">
        {editingColombo && (
          <>
            <DrawerReadOnly label="Destination">{editingColombo.name}</DrawerReadOnly>
            <DrawerField label="Distance from Colombo (km)">
              <input type="number" className={inputCls} value={colomboVal} onChange={(e) => setColomboVal(e.target.value)} autoFocus />
            </DrawerField>
            <DrawerActions onSave={saveColombo} onCancel={() => setEditingColombo(null)} isPending={isPending} />
          </>
        )}
      </EditDrawer>

      {/* Pairwise Edit Drawer */}
      <EditDrawer open={!!editingPair} onClose={() => setEditingPair(null)} title="Edit Pairwise Distance">
        {editingPair && (
          <>
            <DrawerReadOnly label="From">{editingPair.fromName}</DrawerReadOnly>
            <DrawerReadOnly label="To">{editingPair.toName}</DrawerReadOnly>
            <DrawerField label="Distance (km)">
              <input type="number" className={inputCls} value={pairVal} onChange={(e) => setPairVal(e.target.value)} autoFocus />
            </DrawerField>
            <DrawerActions onSave={savePair} onCancel={() => setEditingPair(null)} isPending={isPending} />
          </>
        )}
      </EditDrawer>
    </div>
  );
}
