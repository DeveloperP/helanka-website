"use client";

import { useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";

interface CustomerData {
  id: string;
  name: string;
  amount: number;
  currency: string;
  description: string;
  cybersourceUrl: string;
}

export default function PaymentPage() {
  const { customerId } = useParams<{ customerId: string }>();
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "paid" | "error">(
    "loading",
  );
  const [payClicked, setPayClicked] = useState(false);
  const [email, setEmail] = useState("");

  useState(() => {
    fetch(`/api/payments/info/${customerId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data: CustomerData) => {
        setCustomer(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  });

  if (status === "loading") {
    return (
      <Shell>
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--on-surface-subtle)] border-t-[var(--primary)]" />
        </div>
      </Shell>
    );
  }

  if (status === "error" || !customer) {
    return (
      <Shell>
        <div className="text-center space-y-4 py-16">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl text-[var(--foreground)]">
            Payment Not Found
          </h1>
          <p className="text-[var(--on-surface-muted)] text-sm max-w-sm mx-auto">
            This payment link is invalid or has expired. Please contact us if
            you believe this is an error.
          </p>
          <a
            href="mailto:tours@helanka.co"
            className="inline-block mt-4 text-sm text-[var(--primary)] hover:text-[var(--primary-light)] transition-colors"
          >
            tours@helanka.co
          </a>
        </div>
      </Shell>
    );
  }

  if (status === "paid") {
    return (
      <Shell>
        <div className="text-center space-y-6 py-16">
          <div className="mx-auto w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center animate-[scaleIn_0.4s_ease-out]">
            <svg
              className="w-10 h-10 text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>
          <div className="space-y-2">
            <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--foreground)]">
              Thank You!
            </h1>
            <p className="text-[var(--on-surface-muted)] text-sm max-w-md mx-auto">
              Your payment of{" "}
              <span className="text-[var(--foreground)] font-semibold">
                {formatCurrency(customer.amount, customer.currency)}
              </span>{" "}
              has been submitted. A confirmation email has been sent to you.
            </p>
          </div>
          <div className="rounded-xl border border-[var(--outline)] bg-[var(--surface-raised)] p-5 max-w-sm mx-auto text-left space-y-3">
            <Row label="Reference" value={customer.id} />
            <Row label="Amount" value={formatCurrency(customer.amount, customer.currency)} />
            <Row label="Description" value={customer.description} />
          </div>
          <p className="text-[var(--on-surface-subtle)] text-xs pt-4">
            If you have any questions, contact us at{" "}
            <a
              href="mailto:tours@helanka.co"
              className="text-[var(--primary)] hover:text-[var(--primary-light)] transition-colors"
            >
              tours@helanka.co
            </a>
          </p>
        </div>
      </Shell>
    );
  }

  function handlePayNow() {
    if (!customer) return;
    setPayClicked(true);
    window.open(customer.cybersourceUrl, "_blank", "noopener,noreferrer");
  }

  async function handleConfirmPayment() {
    setStatus("loading");
    try {
      const res = await fetch("/api/payments/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, email }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("paid");
    } catch {
      setStatus("paid");
    }
  }

  return (
    <Shell>
      <div className="space-y-8 py-8">
        <div className="text-center space-y-2">
          <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--foreground)]">
            Payment
          </h1>
          <p className="text-[var(--on-surface-muted)] text-sm">
            Complete your payment securely via our banking partner
          </p>
        </div>

        <div className="rounded-xl border border-[var(--outline)] bg-[var(--surface-raised)] p-6 space-y-5">
          <div className="space-y-4">
            <Row label="Customer" value={customer.name} />
            <Row label="Reference" value={customer.id} />
            <Row label="Description" value={customer.description} />
            <div className="pt-2 border-t border-[var(--outline)]">
              <Row
                label="Amount Due"
                value={formatCurrency(customer.amount, customer.currency)}
                bold
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-[var(--on-surface-muted)] text-sm"
            >
              Your email address
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--outline)] text-[var(--foreground)] text-sm placeholder:text-[var(--on-surface-subtle)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
            <p className="text-[var(--on-surface-subtle)] text-xs">
              A payment confirmation will be sent to this address
            </p>
          </div>

          {!payClicked ? (
            <button
              onClick={handlePayNow}
              disabled={!email || !email.includes("@")}
              className="w-full py-3.5 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] font-semibold text-sm hover:brightness-110 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Pay Now
            </button>
          ) : (
            <div className="space-y-3 pt-2">
              <p className="text-[var(--on-surface-muted)] text-sm text-center">
                Complete your payment in the new tab, then confirm below.
              </p>
              <button
                onClick={handleConfirmPayment}
                className="w-full py-3.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-500 transition-colors cursor-pointer"
              >
                I Have Completed My Payment
              </button>
              <button
                onClick={handlePayNow}
                className="w-full py-2.5 rounded-xl border border-[var(--outline)] text-[var(--on-surface-muted)] text-sm hover:border-[var(--outline-hover)] transition-colors cursor-pointer"
              >
                Reopen Payment Page
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 text-[var(--on-surface-subtle)] text-xs">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
          <span>Secured by CyberSource (Visa)</span>
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Image
            src="/images/logo-header.png"
            alt="Helanka Vacations"
            width={160}
            height={48}
            priority
          />
        </div>
        {children}
      </div>
      <style jsx global>{`
        @keyframes scaleIn {
          from {
            transform: scale(0.5);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[var(--on-surface-muted)] text-sm">{label}</span>
      <span
        className={`text-[var(--foreground)] text-sm text-right ${bold ? "text-lg font-semibold" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}
