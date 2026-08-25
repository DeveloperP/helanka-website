"use client";

import { useState } from "react";
import { createPaymentLink } from "@/actions/payment-link-actions";

interface PaymentLinkRow {
  id: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  currency: string;
  description: string;
  createdAt: string;
  paidAt: string | null;
}

export function PaymentsClient({ links }: { links: PaymentLinkRow[] }) {
  const [showForm, setShowForm] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const notifyRaw = (form.get("notifyEmails") as string) || "";
    const notifyEmails = notifyRaw
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter((s) => s.includes("@"));

    const result = await createPaymentLink({
      invoiceNumber: (form.get("invoiceNumber") as string).trim(),
      customerName: (form.get("customerName") as string).trim(),
      amount: parseFloat(form.get("amount") as string),
      currency: (form.get("currency") as string) || "USD",
      description: (form.get("description") as string).trim(),
      cybersourceUrl: (form.get("cybersourceUrl") as string).trim(),
      notifyEmails,
    });

    setSubmitting(false);

    if (!result.success) {
      setError(result.error ?? "Failed to create payment link");
      return;
    }

    const url = `${window.location.origin}/payments/${result.invoiceNumber}`;
    setCreatedLink(url);
    setShowForm(false);
  }

  function copyLink(invoiceNumber: string) {
    const url = `${window.location.origin}/payments/${invoiceNumber}`;
    navigator.clipboard.writeText(url);
    setCopied(invoiceNumber);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payment Links</h1>
          <p className="text-sm text-slate-500 mt-1">
            {links.length} payment link{links.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setCreatedLink(null); setError(null); }}
          className="px-4 py-2.5 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors cursor-pointer"
        >
          New Payment Link
        </button>
      </div>

      {createdLink && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <p className="text-sm font-medium text-emerald-800 mb-1">Payment link created</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm text-emerald-700 bg-emerald-100 rounded-lg px-3 py-2 break-all">
              {createdLink}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(createdLink);
                setCopied("__created__");
                setTimeout(() => setCopied(null), 2000);
              }}
              className="shrink-0 px-3 py-2 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-500 transition-colors cursor-pointer"
            >
              {copied === "__created__" ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="mb-8 bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Create Payment Link</h2>
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Customer Name" name="customerName" required />
              <Field label="Invoice Number" name="invoiceNumber" required placeholder="e.g. HLVOJ2608009-00" />
              <Field label="Amount" name="amount" type="number" required step="0.01" min="0.01" />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                <select
                  name="currency"
                  defaultValue="USD"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="AUD">AUD</option>
                  <option value="LKR">LKR</option>
                </select>
              </div>
            </div>
            <Field label="Description" name="description" placeholder="e.g. Transfer from Kandy to Koggala" />
            <Field label="CyberSource Payment URL" name="cybersourceUrl" required placeholder="https://ebc2.cybersource.com/..." />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Notify Emails <span className="text-slate-400 font-normal">(one per line)</span>
              </label>
              <textarea
                name="notifyEmails"
                rows={3}
                defaultValue={"fin3@mendisone.com\nfinancemgr@mendisone.com\nmgrtours@helanka.co"}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 resize-none"
              />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {submitting ? "Creating..." : "Create Payment Link"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 text-sm text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {links.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <p className="text-slate-400">No payment links yet. Create your first one above.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Invoice</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {links.map((link) => (
                  <tr key={link.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono text-xs text-slate-700">{link.invoiceNumber}</td>
                    <td className="py-3 px-4 text-slate-900">{link.customerName}</td>
                    <td className="py-3 px-4 text-right font-medium text-slate-900">
                      {formatCurrency(link.amount, link.currency)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {link.paidAt ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                          Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                          Unpaid
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-xs">
                      {new Date(link.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => copyLink(link.invoiceNumber)}
                        className="text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors cursor-pointer"
                      >
                        {copied === link.invoiceNumber ? "Copied!" : "Copy Link"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
  step,
  min,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  step?: string;
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
        step={step}
        min={min}
        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
      />
    </div>
  );
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}
