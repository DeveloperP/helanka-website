"use client";

import { useState } from "react";
import Link from "next/link";
import { packages as allPackages, getExcursionCap } from "@/lib/packages";

interface DashboardClientProps {
  user: { name: string; email: string; image: string | null };
}

// --- Sidebar Tab Config ---

type TabId = "overview" | "itinerary" | "excursions" | "transport" | "dining" | "review";

const sidebarTabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  {
    id: "overview",
    label: "Overview",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    id: "itinerary",
    label: "Itinerary",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
      </svg>
    ),
  },
  {
    id: "excursions",
    label: "Excursions",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
  },
  {
    id: "transport",
    label: "Transport",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H6.375c-.621 0-1.125-.504-1.125-1.125V14.25m17.25 0V7.875A1.875 1.875 0 0020.25 6H5.25A1.875 1.875 0 003.375 7.875V14.25" />
      </svg>
    ),
  },
  {
    id: "dining",
    label: "Dining",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.379a48.474 48.474 0 00-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12M16.5 3.75V16.5" />
      </svg>
    ),
  },
  {
    id: "review",
    label: "Review",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

// --- Mock Trip Data ---

// Dummy per-excursion price lookup (will come from backend later)
const EXCURSION_PRICES: Record<string, number> = {};
allPackages.forEach((pkg) =>
  pkg.excursions.forEach((exc, i) => {
    EXCURSION_PRICES[exc.id] = [45, 25, 30, 55, 20, 40, 75, 35, 30, 65][i % 10];
  })
);

const DEFAULT_PACKAGE_SLUG = "hill-country-explorer";

export default function DashboardClient({ user }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [selectedPackageSlug, setSelectedPackageSlug] = useState(DEFAULT_PACKAGE_SLUG);
  const [showPackagePicker, setShowPackagePicker] = useState(false);

  const activePackage = allPackages.find((p) => p.slug === selectedPackageSlug) ?? allPackages[0];

  const tripInfo = {
    name: activePackage.name,
    tagline: activePackage.description,
    days: activePackage.durationDays,
    basePrice: activePackage.price,
    image: activePackage.image,
    status: "Customizing",
    destinations: activePackage.itinerary.map((d) => d.title),
    minGuests: activePackage.minGuests,
    maxGuests: activePackage.maxGuests,
  };

  const allExcursions = activePackage.excursions.map((exc) => ({
    ...exc,
    price: EXCURSION_PRICES[exc.id] ?? 30,
  }));

  const itineraryDays = activePackage.itinerary;

  // Customization state
  const [guests, setGuests] = useState(activePackage.minGuests);
  const [arrivalDate, setArrivalDate] = useState("2026-12-15");
  const [departureDate, setDepartureDate] = useState("2026-12-20");
  const [transport, setTransport] = useState<"standard" | "super-luxury">("standard");
  const [selectedExcursionIds, setSelectedExcursionIds] = useState<string[]>(["hce-1", "hce-3", "hce-5", "hce-7"]);
  const [mealPlan, setMealPlan] = useState("Full Board");
  const [allergies, setAllergies] = useState<string[]>(["Nuts"]);
  const [dietaryNotes, setDietaryNotes] = useState("");
  const [quoteRequested, setQuoteRequested] = useState(false);

  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ from: "user" | "rep"; text: string }[]>([
    { from: "rep", text: `Hi ${user.name.split(" ")[0]}! I'm Kavindi, your dedicated travel specialist. How can I help with your trip?` },
  ]);
  const [chatInput, setChatInput] = useState("");

  const firstName = user.name.split(" ")[0];

  // Date helpers
  const arrDate = new Date(arrivalDate + "T00:00:00");
  const depDate = new Date(departureDate + "T00:00:00");
  const nights = Math.max(0, Math.round((depDate.getTime() - arrDate.getTime()) / 86400000));
  const fmtDay = (d: Date) => d.getDate();
  const fmtMonth = (d: Date) => d.toLocaleString("en", { month: "short" });
  const fmtYear = (d: Date) => d.getFullYear();
  const datesValid = arrivalDate && departureDate && depDate > arrDate;
  const EXCURSION_CAP = getExcursionCap(nights || tripInfo.days);

  // Price calculation
  const transportAddon = transport === "super-luxury" ? 400 : 0;
  const excursionTotal = selectedExcursionIds.reduce((sum, id) => {
    const exc = allExcursions.find((e) => e.id === id);
    return sum + (exc?.price ?? 0);
  }, 0);
  const mealAddon = mealPlan === "Full Board" ? 0 : mealPlan === "Half Board" ? -80 : -150;
  const perPersonPrice = tripInfo.basePrice + transportAddon + excursionTotal + mealAddon;
  const totalPrice = perPersonPrice * guests;
  const guestsValid = guests >= tripInfo.minGuests && guests <= tripInfo.maxGuests;

  // Completion tracking
  const configured: Record<string, boolean> = {
    itinerary: true,
    excursions: selectedExcursionIds.length === EXCURSION_CAP,
    transport: true,
    dining: true,
  };
  const configuredCount = Object.values(configured).filter(Boolean).length;
  const totalSections = Object.keys(configured).length;

  function toggleExcursion(id: string) {
    setSelectedExcursionIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= EXCURSION_CAP) return prev;
      return [...prev, id];
    });
  }

  function toggleAllergy(a: string) {
    setAllergies((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  }

  function switchPackage(slug: string) {
    if (slug === selectedPackageSlug) return;
    const pkg = allPackages.find((p) => p.slug === slug);
    if (!pkg) return;
    setSelectedPackageSlug(slug);
    setSelectedExcursionIds([]);
    setGuests((prev) => Math.min(Math.max(prev, pkg.minGuests), pkg.maxGuests));
    setShowPackagePicker(false);
  }

  return (
    <div
      className="min-h-screen pt-24 pb-12 bg-cover bg-center bg-fixed relative"
      style={{ backgroundImage: "url('/Helanka Dashboard BG image.png')" }}
    >
      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm" />
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="hidden md:flex flex-col gap-1 bg-white rounded-2xl p-2.5 shadow-sm h-fit sticky top-28">
            {sidebarTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const isConfigured = tab.id !== "overview" && tab.id !== "review" && configured[tab.id];
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all group ${
                    isActive
                      ? "bg-[#0a0a0a] text-white shadow-md"
                      : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  }`}
                  title={tab.label}
                >
                  {tab.icon}
                  {isConfigured && !isActive && (
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
                  )}
                  {tab.id === "review" && !isActive && (
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#ff9d00] border-2 border-white rounded-full" />
                  )}
                  <span className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                    {tab.label}
                  </span>
                </button>
              );
            })}
            {/* Progress ring */}
            <div className="mt-2 pt-2 border-t border-slate-100 flex justify-center">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeDasharray={`${(configuredCount / totalSections) * 94.25} 94.25`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-[10px] font-bold text-slate-600">
                  {configuredCount}/{totalSections}
                </span>
              </div>
            </div>
          </div>

          {/* Mobile Tab Bar */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 px-2 py-2 flex justify-around">
            {sidebarTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                  activeTab === tab.id ? "text-[#0a0a0a]" : "text-slate-400"
                }`}
              >
                {tab.icon}
                <span className="text-[9px] font-medium">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6 pb-20 md:pb-0">
            {/* Welcome Bar */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {activeTab === "overview"
                    ? `Welcome back, ${firstName}`
                    : sidebarTabs.find((t) => t.id === activeTab)?.label}
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  {activeTab === "overview" && "Your trip at a glance — edit any section before requesting a quote"}
                  {activeTab === "itinerary" && "Your day-by-day plan — review stops and timing"}
                  {activeTab === "excursions" && `Select up to ${EXCURSION_CAP} excursions for your ${nights || tripInfo.days}-day stay`}
                  {activeTab === "transport" && "Choose your vehicle class for the entire trip"}
                  {activeTab === "dining" && "Set your meal plan and dietary requirements"}
                  {activeTab === "review" && "Confirm everything looks right, then request your quote"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Live Price Badge */}
                <div className="hidden sm:flex flex-col items-end bg-white rounded-xl px-4 py-2 shadow-sm border border-slate-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-slate-900">${totalPrice.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400">total</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    ${perPersonPrice.toLocaleString()}/person &times; {guests} guest{guests !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#ff9d00] flex items-center justify-center text-white font-bold text-sm">
                  {user.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                </div>
              </div>
            </div>

            {/* ========== OVERVIEW TAB ========== */}
            {activeTab === "overview" && (
              <>
                {/* Featured Trip Card */}
                <div className="relative bg-white rounded-3xl overflow-hidden shadow-sm">
                  <div className="flex flex-col lg:flex-row">
                    <div className="flex-1 p-8 lg:p-10">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-full">
                          {tripInfo.status}
                        </span>
                        <span className="text-xs text-slate-400">{tripInfo.days} Days</span>
                        <span className="text-xs text-slate-400">&middot;</span>
                        <span className="text-xs text-slate-400">{configuredCount}/{totalSections} configured</span>
                      </div>
                      <h2 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-slate-900 mb-2">
                        {tripInfo.name}
                      </h2>
                      <p className="text-slate-500 mb-6">{tripInfo.tagline}</p>
                      <div className="flex flex-wrap gap-2 mb-8">
                        {tripInfo.destinations.map((d) => (
                          <span key={d} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                            {d}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setActiveTab("review")}
                          className="bg-[#0a0a0a] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
                        >
                          Review &amp; Get Quote
                        </button>
                        <Link
                          href={`/packages/${activePackage.slug}`}
                          className="bg-slate-100 text-slate-700 px-6 py-3 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors"
                        >
                          View Package
                        </Link>
                        <button
                          onClick={() => setShowPackagePicker((v) => !v)}
                          className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
                        >
                          Change Package
                        </button>
                      </div>
                    </div>
                    <div className="relative w-full lg:w-[45%] min-h-[280px]">
                      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${tripInfo.image}')` }} />
                      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/30 to-transparent lg:block hidden" />
                    </div>
                  </div>
                </div>

                {/* Package Picker */}
                {showPackagePicker && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#ff9d00]/20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-slate-900">Choose a Different Package</h3>
                      <button onClick={() => setShowPackagePicker(false)} className="text-xs text-slate-400 hover:text-slate-600">Cancel</button>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {allPackages.map((pkg) => {
                        const isCurrent = pkg.slug === selectedPackageSlug;
                        return (
                          <button
                            key={pkg.slug}
                            onClick={() => switchPackage(pkg.slug)}
                            className={`text-left rounded-xl p-4 transition-all border-2 ${
                              isCurrent
                                ? "border-[#ff9d00] bg-[#ff9d00]/5"
                                : "border-slate-100 hover:border-slate-200 bg-slate-50"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h4 className="text-sm font-semibold text-slate-900 leading-tight">{pkg.name}</h4>
                              {isCurrent && (
                                <span className="px-2 py-0.5 bg-[#ff9d00] text-white text-[9px] font-bold rounded-full flex-shrink-0">Current</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                              <span>{pkg.durationDays} days</span>
                              <span>&middot;</span>
                              <span>{pkg.minGuests}–{pkg.maxGuests} guests</span>
                              <span>&middot;</span>
                              <span className="font-semibold text-slate-600">${pkg.price.toLocaleString()}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-2 line-clamp-2">{pkg.description}</p>
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-slate-400 mt-3 text-center">
                      Switching resets your excursion selections. Transport, dining, dates, and guests carry over.
                    </p>
                  </div>
                )}

                {/* Summary Cards — each with Edit that jumps to tab */}
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Guests */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-slate-900">Guests</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setGuests(Math.max(tripInfo.minGuests, guests - 1))}
                        className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors disabled:opacity-30"
                        disabled={guests <= tripInfo.minGuests}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>
                      </button>
                      <span className="font-[family-name:var(--font-playfair)] text-3xl text-slate-900 w-8 text-center">{guests}</span>
                      <button
                        onClick={() => setGuests(Math.min(tripInfo.maxGuests, guests + 1))}
                        className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors disabled:opacity-30"
                        disabled={guests >= tripInfo.maxGuests}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">{tripInfo.minGuests}–{tripInfo.maxGuests} for this package</p>
                  </div>

                  {/* Itinerary Summary */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-slate-900">Itinerary</h3>
                      <button onClick={() => setActiveTab("itinerary")} className="text-xs text-[#ff9d00] font-semibold hover:underline">Edit</button>
                    </div>
                    <p className="font-[family-name:var(--font-playfair)] text-3xl text-slate-900">{tripInfo.days}</p>
                    <p className="text-xs text-slate-400 mt-1">days &middot; {tripInfo.destinations.length} destinations</p>
                    <div className="mt-3 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-[10px] text-emerald-600 font-medium">Set</span>
                    </div>
                  </div>

                  {/* Excursions Summary */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-slate-900">Excursions</h3>
                      <button onClick={() => setActiveTab("excursions")} className="text-xs text-[#ff9d00] font-semibold hover:underline">Edit</button>
                    </div>
                    <p className="font-[family-name:var(--font-playfair)] text-3xl text-slate-900">
                      {selectedExcursionIds.length}<span className="text-lg text-slate-400">/{EXCURSION_CAP}</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">selected &middot; ${excursionTotal}</p>
                    <div className="mt-3 flex items-center gap-1.5">
                      {selectedExcursionIds.length === EXCURSION_CAP ? (
                        <><span className="w-2 h-2 rounded-full bg-emerald-400" /><span className="text-[10px] text-emerald-600 font-medium">Complete</span></>
                      ) : (
                        <><span className="w-2 h-2 rounded-full bg-amber-400" /><span className="text-[10px] text-amber-600 font-medium">{EXCURSION_CAP - selectedExcursionIds.length} remaining</span></>
                      )}
                    </div>
                  </div>

                  {/* Transport Summary */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-slate-900">Transport</h3>
                      <button onClick={() => setActiveTab("transport")} className="text-xs text-[#ff9d00] font-semibold hover:underline">Edit</button>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      {transport === "super-luxury" ? "Super Luxury" : "Standard"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {transport === "super-luxury" ? "Mercedes V-Class" : "Toyota KDH Van"}
                    </p>
                    <div className="mt-3">
                      {transport === "super-luxury" ? (
                        <span className="inline-block px-2 py-0.5 bg-[#ff9d00]/10 text-[#ff9d00] text-[10px] font-semibold rounded-full">+$400</span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-semibold rounded-full">Included</span>
                      )}
                    </div>
                  </div>

                  {/* Dining Summary */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-slate-900">Dining</h3>
                      <button onClick={() => setActiveTab("dining")} className="text-xs text-[#ff9d00] font-semibold hover:underline">Edit</button>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{mealPlan}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {allergies.length > 0 ? allergies.join(", ") : "No allergies"}
                    </p>
                    <div className="mt-3 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-[10px] text-emerald-600 font-medium">Set</span>
                    </div>
                  </div>
                </div>

                {/* Travel Specialist */}
                <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#ff9d00] to-[#e68d00] flex items-center justify-center text-white font-bold text-lg">KW</div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Kavindi Weerasinghe</p>
                      <p className="text-xs text-slate-400">Your Dedicated Travel Specialist</p>
                      <p className="text-xs text-emerald-500 mt-0.5">Online — typically replies in 10 min</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a href="mailto:kavindi@helanka.co" className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-[#ff9d00]/10 hover:text-[#ff9d00] transition-all">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    </a>
                    <a href="https://wa.me/94771234567" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-emerald-50 hover:text-emerald-500 transition-all">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.75.75 0 00.917.918l4.458-1.495A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.34 0-4.498-.794-6.218-2.128l-.435-.338-3.266 1.095 1.095-3.266-.338-.435A9.956 9.956 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z" />
                      </svg>
                    </a>
                    <button onClick={() => setChatOpen(true)} className="w-10 h-10 rounded-xl bg-[#ff9d00] flex items-center justify-center text-white hover:bg-[#e68d00] transition-all">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Bottom Info Cards */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-900 mb-4">My Dates</h3>
                    {quoteRequested ? (
                      <>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="font-[family-name:var(--font-playfair)] text-5xl text-slate-900">{fmtDay(arrDate)}</p>
                            <p className="text-sm text-slate-400">{fmtMonth(arrDate)}</p>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-8 h-px bg-slate-200" />
                            <span className="text-[10px] text-slate-400">to</span>
                            <div className="w-8 h-px bg-slate-200" />
                          </div>
                          <div className="text-center">
                            <p className="font-[family-name:var(--font-playfair)] text-5xl text-slate-900">{fmtDay(depDate)}</p>
                            <p className="text-sm text-slate-400">{fmtMonth(depDate)}</p>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-4">{fmtYear(arrDate)} &middot; {nights} night{nights !== 1 ? "s" : ""}</p>
                        <div className="mt-2 flex items-center gap-1.5">
                          <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                          <span className="text-[10px] text-slate-400">Locked — quote submitted</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">Arrival</label>
                            <input
                              type="date"
                              value={arrivalDate}
                              onChange={(e) => setArrivalDate(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-300"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">Departure</label>
                            <input
                              type="date"
                              value={departureDate}
                              min={arrivalDate}
                              onChange={(e) => setDepartureDate(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-300"
                            />
                          </div>
                        </div>
                        {datesValid && (
                          <p className="text-xs text-slate-400 mt-3">{nights} night{nights !== 1 ? "s" : ""}</p>
                        )}
                        {arrivalDate && departureDate && !datesValid && (
                          <p className="text-xs text-red-500 mt-3">Departure must be after arrival</p>
                        )}
                      </>
                    )}
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-900 mb-5">Destination</h3>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#ff9d00]/10 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-[#ff9d00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Sri Lanka</p>
                        <p className="text-xs text-slate-400">Hill Country Circuit</p>
                      </div>
                    </div>
                    <div className="mt-5 flex gap-2 overflow-x-auto scrollbar-hide">
                      {tripInfo.destinations.map((place) => (
                        <span key={place} className="px-2.5 py-1 bg-slate-50 text-slate-500 text-[11px] rounded-full whitespace-nowrap flex-shrink-0">{place}</span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-900 mb-5">Trip Status</h3>
                    <div className="space-y-3">
                      {[
                        { label: "Inquiry Submitted", done: true },
                        { label: "Customize Trip", done: configuredCount === totalSections },
                        { label: "Quote Requested", done: quoteRequested },
                        { label: "Confirmation & Payment", done: false },
                      ].map((s) => (
                        <div key={s.label} className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${s.done ? "bg-emerald-500" : "border-2 border-slate-200"}`}>
                            {s.done && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className={`text-sm ${s.done ? "text-slate-900" : "text-slate-400"}`}>{s.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ========== ITINERARY TAB ========== */}
            {activeTab === "itinerary" && (
              <div className="space-y-4">
                {itineraryDays.map((day) => (
                  <div key={day.day} className="bg-white rounded-2xl p-6 shadow-sm flex gap-5">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-slate-600">{day.day}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">{day.title}</h3>
                      <p className="text-sm text-slate-500 mt-1">{day.description}</p>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-slate-400 text-center pt-2">
                  Itinerary is set by your package. Contact Kavindi to request changes.
                </p>
              </div>
            )}

            {/* ========== EXCURSIONS TAB ========== */}
            {activeTab === "excursions" && (
              <div className="space-y-4">
                {/* Counter */}
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Selected excursions</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {selectedExcursionIds.length} <span className="text-base text-slate-400 font-normal">of {EXCURSION_CAP} max</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Excursion total</p>
                      <p className="text-2xl font-bold text-slate-900">${excursionTotal}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-3">
                    Your {nights || tripInfo.days}-day stay allows up to {EXCURSION_CAP} excursions — 1 rest/travel day per arrival + every 4 days.
                    {datesValid && <> Change your dates to adjust the cap.</>}
                  </p>
                  {selectedExcursionIds.length > EXCURSION_CAP && (
                    <div className="mt-3 px-4 py-3 bg-amber-50 rounded-xl flex items-start gap-2">
                      <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                      <p className="text-sm text-amber-700">
                        You have {selectedExcursionIds.length} excursions selected but your dates only allow {EXCURSION_CAP}. Please deselect {selectedExcursionIds.length - EXCURSION_CAP} or extend your trip.
                      </p>
                    </div>
                  )}
                </div>

                {/* Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  {allExcursions.map((exc) => {
                    const picked = selectedExcursionIds.includes(exc.id);
                    const atCap = selectedExcursionIds.length >= EXCURSION_CAP && !picked;
                    return (
                      <button
                        key={exc.id}
                        onClick={() => toggleExcursion(exc.id)}
                        disabled={atCap}
                        className={`text-left bg-white rounded-2xl p-5 shadow-sm transition-all border-2 ${
                          picked
                            ? "border-[#ff9d00] ring-1 ring-[#ff9d00]/20"
                            : atCap
                            ? "border-transparent opacity-40 cursor-not-allowed"
                            : "border-transparent hover:border-slate-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-semibold text-slate-900">{exc.name}</h4>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{exc.description}</p>
                            <div className="flex items-center gap-3 mt-3">
                              <span className="text-[10px] text-slate-400 uppercase tracking-wider">{exc.durationHours}h</span>
                              <span className="text-sm font-semibold text-slate-900">${exc.price}</span>
                            </div>
                          </div>
                          <span className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-colors ${picked ? "bg-[#ff9d00] border-[#ff9d00]" : "border-slate-200"}`}>
                            {picked && (
                              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ========== TRANSPORT TAB ========== */}
            {activeTab === "transport" && (
              <div className="space-y-4">
                {/* Standard Inclusions */}
                <div className="bg-emerald-50 rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-emerald-800 mb-4">Included as Standard</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      { name: "Airport Pickup & Drop-off", desc: "Meet-and-greet at Bandaranaike International Airport" },
                      { name: "Private Chauffeur", desc: "Dedicated English-speaking driver for the entire trip" },
                      { name: "Multilingual National Guide", desc: "Licensed guide fluent in English, French, German, or Mandarin" },
                    ].map((inc) => (
                      <div key={inc.name} className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-emerald-900">{inc.name}</p>
                          <p className="text-xs text-emerald-700/60 mt-0.5">{inc.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tier Cards */}
                <div className="grid md:grid-cols-2 gap-4">
                  {([
                    {
                      tier: "standard" as const,
                      label: "Standard",
                      vehicle: "Toyota KDH Van",
                      price: "Included",
                      priceClass: "text-emerald-600 bg-emerald-50",
                      features: ["Air conditioning", "Ample luggage space", "Bottled water on board", "Phone charging ports"],
                    },
                    {
                      tier: "super-luxury" as const,
                      label: "Super Luxury",
                      vehicle: "Mercedes V-Class",
                      price: "+$400",
                      priceClass: "text-[#ff9d00] bg-[#ff9d00]/10",
                      features: ["Leather reclining seats", "On-board Wi-Fi", "Mini fridge with refreshments", "Noise-cancelling cabin", "Premium sound system", "Tinted privacy glass"],
                    },
                  ]).map((t) => (
                    <button
                      key={t.tier}
                      onClick={() => setTransport(t.tier)}
                      className={`text-left bg-white rounded-2xl p-6 shadow-sm transition-all border-2 ${
                        transport === t.tier
                          ? "border-[#ff9d00] ring-1 ring-[#ff9d00]/20"
                          : "border-transparent hover:border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-slate-900">{t.label}</h4>
                          <p className="text-sm text-slate-400">{t.vehicle}</p>
                        </div>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${t.priceClass}`}>
                          {t.price}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {t.features.map((f) => (
                          <div key={f} className="flex items-center gap-2">
                            <svg className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm text-slate-600">{f}</span>
                          </div>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ========== DINING TAB ========== */}
            {activeTab === "dining" && (
              <div className="space-y-6">
                {/* Meal Plan */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Meal Plan</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      { id: "Full Board", desc: "Breakfast, lunch, and dinner", adj: "Included" },
                      { id: "Half Board", desc: "Breakfast and dinner", adj: "-$80" },
                      { id: "Bed & Breakfast", desc: "Breakfast only", adj: "-$150" },
                    ].map((mp) => (
                      <button
                        key={mp.id}
                        onClick={() => setMealPlan(mp.id)}
                        className={`text-left bg-white rounded-2xl p-5 shadow-sm transition-all border-2 ${
                          mealPlan === mp.id
                            ? "border-[#ff9d00] ring-1 ring-[#ff9d00]/20"
                            : "border-transparent hover:border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${mealPlan === mp.id ? "border-[#ff9d00]" : "border-slate-200"}`}>
                            {mealPlan === mp.id && <span className="w-2 h-2 rounded-full bg-[#ff9d00]" />}
                          </span>
                          <span className="text-sm font-semibold text-slate-900">{mp.id}</span>
                        </div>
                        <p className="text-xs text-slate-500 pl-7">{mp.desc}</p>
                        <p className={`text-xs font-semibold mt-2 pl-7 ${mp.adj === "Included" ? "text-emerald-600" : "text-slate-500"}`}>{mp.adj}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Allergies */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Allergies &amp; Dietary Restrictions</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {["Nuts", "Shellfish", "Dairy", "Gluten", "Eggs", "Soy", "Fish", "Sesame"].map((a) => {
                      const on = allergies.includes(a);
                      return (
                        <button
                          key={a}
                          onClick={() => toggleAllergy(a)}
                          className={`px-3.5 py-1.5 rounded-full text-sm border transition-colors ${
                            on
                              ? "bg-red-50 border-red-200 text-red-600 font-medium"
                              : "bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-200"
                          }`}
                        >
                          {a}
                        </button>
                      );
                    })}
                  </div>
                  <textarea
                    rows={3}
                    value={dietaryNotes}
                    onChange={(e) => setDietaryNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-slate-300 resize-none"
                    placeholder="Any other dietary notes — vegan, halal, kosher, specific preferences..."
                  />
                </div>
              </div>
            )}

            {/* ========== REVIEW TAB ========== */}
            {activeTab === "review" && (
              <div className="space-y-4">
                {quoteRequested ? (
                  <div className="bg-white rounded-3xl p-12 shadow-sm text-center">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h2 className="font-[family-name:var(--font-playfair)] text-3xl text-slate-900 mb-3">Quote Requested</h2>
                    <p className="text-slate-500 max-w-md mx-auto mb-6">
                      Kavindi will review your selections and send a detailed quote within 24 hours. You&apos;ll get an email at {user.email}.
                    </p>
                    <button
                      onClick={() => setActiveTab("overview")}
                      className="bg-slate-100 text-slate-700 px-8 py-3 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors"
                    >
                      Back to Overview
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Travel Dates */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center justify-between">
                      <div>
                        <h4 className="text-xs text-slate-400 uppercase tracking-wider mb-1">Travel Dates</h4>
                        <p className="text-sm font-semibold text-slate-900">
                          {fmtDay(arrDate)} {fmtMonth(arrDate)} – {fmtDay(depDate)} {fmtMonth(depDate)} {fmtYear(depDate)}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">{nights} night{nights !== 1 ? "s" : ""} &middot; {guests} guest{guests !== 1 ? "s" : ""}</p>
                      </div>
                      {!datesValid && (
                        <span className="px-3 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-full">Invalid dates</span>
                      )}
                    </div>

                    {/* Price Breakdown */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                      <h3 className="text-sm font-semibold text-slate-900 mb-4">Price Breakdown</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Guests</span>
                          <span className="text-slate-900 font-medium">{guests} {guests === 1 ? "person" : "people"}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Base package ({tripInfo.days} days)</span>
                          <span className="text-slate-900 font-medium">${tripInfo.basePrice.toLocaleString()} &times; {guests}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Excursions ({selectedExcursionIds.length})</span>
                          <span className="text-slate-900 font-medium">${excursionTotal} &times; {guests}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Transport ({transport === "super-luxury" ? "Super Luxury" : "Standard"})</span>
                          <span className="text-slate-900 font-medium">{transportAddon > 0 ? `+$${transportAddon} × ${guests}` : "Included"}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Meal plan ({mealPlan})</span>
                          <span className="text-slate-900 font-medium">{mealAddon === 0 ? "Included" : `-$${Math.abs(mealAddon)} × ${guests}`}</span>
                        </div>
                        <div className="border-t border-slate-100 pt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-slate-500">Per person</span>
                            <span className="text-sm text-slate-700 font-medium">${perPersonPrice.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-base font-bold text-slate-900">Estimated Total</span>
                            <span className="text-2xl font-bold text-slate-900">${totalPrice.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      {!guestsValid && (
                        <div className="mt-4 px-4 py-3 bg-red-50 rounded-xl">
                          <p className="text-sm text-red-600">
                            This package requires {tripInfo.minGuests}–{tripInfo.maxGuests} guests. Please adjust your group size.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Summary Cards */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs text-slate-400 uppercase tracking-wider">Excursions</h4>
                          <button onClick={() => setActiveTab("excursions")} className="text-xs text-[#ff9d00] font-semibold hover:underline">Change</button>
                        </div>
                        <div className="space-y-2">
                          {selectedExcursionIds.map((id) => {
                            const exc = allExcursions.find((e) => e.id === id);
                            return (
                              <div key={id} className="flex items-center justify-between">
                                <span className="text-sm text-slate-700 truncate">{exc?.name}</span>
                                <span className="text-xs text-slate-400 flex-shrink-0 ml-2">${exc?.price}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="bg-white rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs text-slate-400 uppercase tracking-wider">Dining &amp; Dietary</h4>
                          <button onClick={() => setActiveTab("dining")} className="text-xs text-[#ff9d00] font-semibold hover:underline">Change</button>
                        </div>
                        <p className="text-sm text-slate-700 font-medium">{mealPlan}</p>
                        {allergies.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {allergies.map((a) => (
                              <span key={a} className="px-2 py-0.5 bg-red-50 text-red-600 text-xs rounded-full">{a}</span>
                            ))}
                          </div>
                        )}
                        {dietaryNotes && <p className="text-xs text-slate-500 mt-2">{dietaryNotes}</p>}
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
                      <h3 className="font-[family-name:var(--font-playfair)] text-2xl text-slate-900 mb-2">Ready to go?</h3>
                      <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
                        Kavindi will review your selections and prepare a detailed quotation. No payment required yet.
                      </p>
                      <button
                        onClick={() => setQuoteRequested(true)}
                        disabled={!guestsValid || !datesValid || selectedExcursionIds.length > EXCURSION_CAP}
                        className="bg-[#ff9d00] text-white px-10 py-4 rounded-xl text-base font-bold hover:bg-[#e68d00] transition-colors shadow-lg shadow-[#ff9d00]/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#ff9d00]"
                      >
                        Request My Quote
                      </button>
                      <p className="text-xs text-slate-400 mt-3">Typically responds within 24 hours</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Widget */}
      {chatOpen && (
        <div className="fixed bottom-6 right-6 w-[380px] z-50 flex flex-col bg-white rounded-2xl shadow-2xl shadow-black/15 border border-slate-200 overflow-hidden">
          <div className="bg-[#0a0a0a] px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#ff9d00] to-[#e68d00] flex items-center justify-center text-white font-bold text-xs">KW</div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-[#0a0a0a] rounded-full" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Kavindi</p>
                <p className="text-white/50 text-xs">Travel Specialist</p>
              </div>
            </div>
            <button onClick={() => setChatOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 max-h-[320px] overflow-y-auto p-4 space-y-3">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.from === "user" ? "bg-[#ff9d00] text-[#482900] rounded-br-md" : "bg-slate-100 text-slate-700 rounded-bl-md"}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-100 p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!chatInput.trim()) return;
                setChatMessages((prev) => [
                  ...prev,
                  { from: "user", text: chatInput },
                  { from: "rep", text: "Thanks for your message! Kavindi will respond shortly. In the meantime, feel free to continue customizing your trip." },
                ]);
                setChatInput("");
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-slate-50 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all"
              />
              <button type="submit" className="w-10 h-10 rounded-xl bg-[#ff9d00] flex items-center justify-center text-white hover:bg-[#e68d00] transition-all flex-shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Chat Button */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#ff9d00] text-white shadow-lg shadow-[#ff9d00]/30 flex items-center justify-center hover:bg-[#e68d00] hover:scale-105 transition-all"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
        </button>
      )}
    </div>
  );
}
