"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCustomerInquiry } from "@/actions/customer-actions";

export function NewInquiryButton({ role }: { role: string }) {
  const [open, setOpen] = useState(false);

  if (role !== "ADMIN" && role !== "SPECIALIST") return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2.5 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors cursor-pointer"
      >
        New Inquiry
      </button>
      {open && <NewInquiryModal onClose={() => setOpen(false)} />}
    </>
  );
}

function NewInquiryModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const result = await createCustomerInquiry({
      name: (form.get("name") as string).trim(),
      email: (form.get("email") as string).trim(),
      phone: (form.get("phone") as string)?.trim() || undefined,
      country: (form.get("country") as string)?.trim() || undefined,
      arrivalDate: form.get("arrivalDate") as string,
      departureDate: form.get("departureDate") as string,
      numTravelers: parseInt(form.get("numTravelers") as string) || 1,
      tripType: form.get("tripType") as string,
      specialRequests: (form.get("specialRequests") as string)?.trim() || undefined,
    });

    setSubmitting(false);

    if (!result.success) {
      setError(result.error ?? "Failed to create inquiry");
      return;
    }

    onClose();
    router.push(`/admin/sessions/${result.sessionId}`);
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">New Customer Inquiry</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Customer Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Name" name="name" required />
              <FormField label="Email" name="email" type="email" required />
              <FormField label="Phone" name="phone" placeholder="Optional" />
              <FormField label="Country" name="country" placeholder="Optional" />
            </div>

            <div className="border-t border-slate-100 pt-4 mt-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Trip Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Arrival Date" name="arrivalDate" type="date" required />
                <FormField label="Departure Date" name="departureDate" type="date" required />
                <FormField label="Number of Travelers" name="numTravelers" type="number" required defaultValue="1" min="1" />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Trip Type</label>
                  <select
                    name="tripType"
                    required
                    defaultValue="custom"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  >
                    <option value="package">Package</option>
                    <option value="custom">Custom</option>
                    <option value="mice">MICE</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Special Requests</label>
                <textarea
                  name="specialRequests"
                  rows={3}
                  placeholder="Optional notes about the inquiry..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {submitting ? "Creating..." : "Create Inquiry"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-sm text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function FormField({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
  defaultValue,
  min,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
  min?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        min={min}
        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
      />
    </div>
  );
}
