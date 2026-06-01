"use client";

import { useState, useTransition } from "react";
import type { ExcursionRow, DestinationWithDistance } from "@/actions/rate-card-actions";
import {
  getExcursions,
  updateExcursion,
  createExcursion,
  deleteExcursion,
} from "@/actions/rate-card-actions";
import { generateExcursionWorkbook, downloadWorkbook } from "@/lib/excel";
import { EditDrawer, DrawerField, DrawerReadOnly, DrawerActions } from "./edit-drawer";

const inputCls =
  "rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm focus:ring-2 focus:ring-slate-800/20 focus:border-slate-400 outline-none w-full";

const selectCls =
  "rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm focus:ring-2 focus:ring-slate-800/20 focus:border-slate-400 outline-none w-full";

const EXCURSION_TYPES = ["safari", "cultural", "adventure", "water-sport", "nature"] as const;

const EXCURSION_TYPE_BADGE: Record<string, string> = {
  safari: "bg-amber-100 text-amber-700",
  cultural: "bg-blue-100 text-blue-700",
  adventure: "bg-green-100 text-green-700",
  "water-sport": "bg-cyan-100 text-cyan-700",
  nature: "bg-emerald-100 text-emerald-700",
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}

interface ExcursionsViewProps {
  initialExcursions: ExcursionRow[];
  destinations: DestinationWithDistance[];
  onBack: () => void;
}

export function ExcursionsView({ initialExcursions, destinations, onBack }: ExcursionsViewProps) {
  const [excursions, setExcursions] = useState(initialExcursions);
  const [filterDest, setFilterDest] = useState("");
  const [editingExc, setEditingExc] = useState<ExcursionRow | null>(null);
  const [editValues, setEditValues] = useState({ name: "", distanceKm: "", type: "", description: "" });
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", destinationId: "", type: "safari" as string, distanceKm: "", description: "" });
  const [isPending, startTransition] = useTransition();

  const filtered = filterDest ? excursions.filter((e) => e.destinationId === filterDest) : excursions;

  function openEdit(exc: ExcursionRow) {
    setEditingExc(exc);
    setEditValues({
      name: exc.name,
      distanceKm: String(exc.distanceKm),
      type: exc.type,
      description: exc.description ?? "",
    });
  }

  function saveEdit() {
    if (!editingExc) return;
    startTransition(async () => {
      await updateExcursion(editingExc.id, {
        name: editValues.name,
        distanceKm: parseFloat(editValues.distanceKm) || 0,
        type: editValues.type,
        description: editValues.description || undefined,
      });
      const refreshed = await getExcursions();
      setExcursions(refreshed);
      setEditingExc(null);
    });
  }

  function handleDelete() {
    if (!editingExc || !window.confirm("Delete this excursion? This action cannot be undone.")) return;
    startTransition(async () => {
      await deleteExcursion(editingExc.id);
      const refreshed = await getExcursions();
      setExcursions(refreshed);
      setEditingExc(null);
    });
  }

  function handleAdd() {
    if (!addForm.name || !addForm.destinationId) return;
    startTransition(async () => {
      await createExcursion({
        name: addForm.name,
        slug: slugify(addForm.name),
        destinationId: addForm.destinationId,
        type: addForm.type,
        distanceKm: parseFloat(addForm.distanceKm) || 0,
        description: addForm.description || undefined,
      });
      const refreshed = await getExcursions();
      setExcursions(refreshed);
      setShowAddDrawer(false);
      setAddForm({ name: "", destinationId: "", type: "safari", distanceKm: "", description: "" });
    });
  }

  function handleExport() {
    const wb = generateExcursionWorkbook(excursions);
    downloadWorkbook(wb, "helanka-excursions.xlsx");
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-5">
        <button onClick={onBack} className="text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors cursor-pointer">
          ← Pricing
        </button>
        <span className="text-slate-300">/</span>
        <span className="text-sm font-semibold text-slate-800">Excursions</span>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-shrink min-w-0">
          <button
            onClick={() => setFilterDest("")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
              !filterDest ? "bg-slate-800 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            All Destinations
          </button>
          {destinations.map((d) => (
            <button
              key={d.id}
              onClick={() => setFilterDest(filterDest === d.id ? "" : d.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
                filterDest === d.id ? "bg-slate-800 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} className="inline-flex items-center gap-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium px-3 py-2 transition-colors cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
            Export
          </button>
          <button onClick={() => setShowAddDrawer(true)} disabled={isPending} className="inline-flex items-center gap-1.5 bg-slate-800 text-white hover:bg-slate-700 rounded-xl text-sm font-medium px-4 py-2 transition-colors disabled:opacity-50 cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Add Excursion
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/80 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100/80">
              <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-4 py-3">Name</th>
              <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-4 py-3">Destination</th>
              <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-4 py-3">Type</th>
              <th className="text-right text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-4 py-3">Distance</th>
              <th className="text-center text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-4 py-3">Active</th>
              <th className="text-right text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-4 py-3 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">No excursions found.</td>
              </tr>
            )}
            {filtered.map((exc) => (
              <tr
                key={exc.id}
                onClick={() => openEdit(exc)}
                className="border-b border-slate-100/60 hover:bg-slate-50/50 transition-colors duration-150 cursor-pointer"
              >
                <td className="px-4 py-3 text-sm font-medium text-slate-700">{exc.name}</td>
                <td className="px-4 py-3">
                  <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                    {exc.destinationName}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${EXCURSION_TYPE_BADGE[exc.type] ?? "bg-slate-100 text-slate-600"}`}>
                    {exc.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600 text-right">{exc.distanceKm} km</td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-block w-2.5 h-2.5 rounded-full ${exc.isActive ? "bg-emerald-400" : "bg-slate-300"}`}
                    title={exc.isActive ? "Active" : "Inactive"}
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-xs text-blue-500 font-medium">Edit →</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 text-center text-[11px] text-slate-400 border-t border-slate-100/60">
          Showing {filtered.length} of {excursions.length} excursions
        </div>
      </div>

      {/* Edit Drawer */}
      <EditDrawer open={!!editingExc} onClose={() => setEditingExc(null)} title="Edit Excursion">
        {editingExc && (
          <>
            <DrawerReadOnly label="Destination">{editingExc.destinationName}</DrawerReadOnly>
            <DrawerField label="Name">
              <input className={inputCls} value={editValues.name} onChange={(e) => setEditValues((v) => ({ ...v, name: e.target.value }))} />
            </DrawerField>
            <DrawerField label="Type">
              <select className={selectCls} value={editValues.type} onChange={(e) => setEditValues((v) => ({ ...v, type: e.target.value }))}>
                {EXCURSION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </DrawerField>
            <DrawerField label="Distance (km)">
              <input type="number" className={inputCls} value={editValues.distanceKm} onChange={(e) => setEditValues((v) => ({ ...v, distanceKm: e.target.value }))} />
            </DrawerField>
            <DrawerField label="Description">
              <input className={inputCls} value={editValues.description} onChange={(e) => setEditValues((v) => ({ ...v, description: e.target.value }))} placeholder="Optional" />
            </DrawerField>
            <DrawerActions
              onSave={saveEdit}
              onCancel={() => setEditingExc(null)}
              onDelete={handleDelete}
              isPending={isPending}
              deleteLabel="Delete this excursion"
            />
          </>
        )}
      </EditDrawer>

      {/* Add Drawer */}
      <EditDrawer open={showAddDrawer} onClose={() => setShowAddDrawer(false)} title="New Excursion">
        <DrawerField label="Name">
          <input className={inputCls} placeholder="Excursion name" value={addForm.name} onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))} />
          {addForm.name && <p className="text-[11px] text-slate-400 mt-1">Slug: {slugify(addForm.name)}</p>}
        </DrawerField>
        <DrawerField label="Destination">
          <select className={selectCls} value={addForm.destinationId} onChange={(e) => setAddForm((f) => ({ ...f, destinationId: e.target.value }))}>
            <option value="">Select destination</option>
            {destinations.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </DrawerField>
        <DrawerField label="Type">
          <select className={selectCls} value={addForm.type} onChange={(e) => setAddForm((f) => ({ ...f, type: e.target.value }))}>
            {EXCURSION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </DrawerField>
        <DrawerField label="Distance (km)">
          <input type="number" className={inputCls} placeholder="0" value={addForm.distanceKm} onChange={(e) => setAddForm((f) => ({ ...f, distanceKm: e.target.value }))} />
        </DrawerField>
        <DrawerField label="Description">
          <input className={inputCls} placeholder="Short description (optional)" value={addForm.description} onChange={(e) => setAddForm((f) => ({ ...f, description: e.target.value }))} />
        </DrawerField>
        <DrawerActions
          onSave={handleAdd}
          onCancel={() => setShowAddDrawer(false)}
          isPending={isPending}
        />
      </EditDrawer>
    </div>
  );
}
