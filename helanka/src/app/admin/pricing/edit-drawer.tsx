"use client";

import { useEffect, useRef } from "react";

interface EditDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function EditDrawer({ open, onClose, title, children }: EditDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !drawerRef.current) return;
    const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length > 0) focusable[0].focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={drawerRef}
        className="relative w-[400px] max-w-full bg-white border-l-2 border-blue-500 shadow-2xl shadow-slate-300/30 overflow-y-auto drawer-slide-in"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close drawer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}

export function DrawerField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

export function DrawerReadOnly({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <DrawerField label={label}>
      <div className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600">
        {children}
      </div>
    </DrawerField>
  );
}

export function DrawerActions({
  onSave,
  onCancel,
  onDelete,
  isPending,
  deleteLabel,
}: {
  onSave: () => void;
  onCancel: () => void;
  onDelete?: () => void;
  isPending: boolean;
  deleteLabel?: string;
}) {
  return (
    <>
      <div className="flex gap-2 pt-4">
        <button
          onClick={onSave}
          disabled={isPending}
          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-slate-800 text-white hover:bg-slate-700 rounded-xl text-sm font-medium px-4 py-2.5 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isPending ? "Saving..." : "Save Changes"}
        </button>
        <button
          onClick={onCancel}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium px-4 py-2.5 transition-colors disabled:opacity-50 cursor-pointer"
        >
          Cancel
        </button>
      </div>
      {onDelete && (
        <div className="pt-4 mt-2 border-t border-red-100">
          <button
            onClick={onDelete}
            disabled={isPending}
            className="text-sm text-red-500 hover:text-red-600 transition-colors cursor-pointer"
          >
            {deleteLabel ?? "Delete this item"}
          </button>
        </div>
      )}
    </>
  );
}
