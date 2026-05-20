"use client";

import { useState } from "react";
import { destinations } from "@/lib/destinations";
import {
  packages,
  STANDARD_INCLUSIONS,
  getExcursionCap,
  type TransportTier,
  type Excursion,
} from "@/lib/packages";
import {
  COMMON_ALLERGIES,
  MEAL_PLANS,
  type CommonAllergy,
  type MealPlanId,
} from "@/lib/dietary";

const STEP_DESTINATIONS = 1;
const STEP_EXPERIENCES = 2;
const STEP_CUSTOMIZE = 3;
const STEP_DETAILS = 4;
const STEP_REVIEW = 5;

const steps = [
  { id: STEP_DESTINATIONS, label: "Destinations" },
  { id: STEP_EXPERIENCES, label: "Experiences" },
  { id: STEP_CUSTOMIZE, label: "Customize" },
  { id: STEP_DETAILS, label: "Details" },
  { id: STEP_REVIEW, label: "Review" },
];

const experiences = [
  "Cultural & Heritage Sites",
  "Wildlife Safaris",
  "Hiking & Trekking",
  "Beach & Coastal",
  "Tea Plantation Tours",
  "Ayurveda & Wellness",
  "Food & Cooking Classes",
  "Train Journeys",
  "Water Sports & Diving",
  "Photography Tours",
];

interface TripWizardProps {
  user: { name: string; email: string };
}

export default function TripWizard({ user }: TripWizardProps) {
  const [step, setStep] = useState(STEP_DESTINATIONS);
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  const [selectedExperiences, setSelectedExperiences] = useState<string[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const [transportTier, setTransportTier] = useState<TransportTier>("standard");
  const [selectedExcursionIds, setSelectedExcursionIds] = useState<string[]>([]);
  const [mealPlan, setMealPlan] = useState<MealPlanId>("full-board");
  const [allergies, setAllergies] = useState<CommonAllergy[]>([]);
  const [dietaryNotes, setDietaryNotes] = useState("");

  const [details, setDetails] = useState({
    name: user.name,
    email: user.email,
    phone: "",
    travelers: "",
    dates: "",
    duration: "",
    budget: "",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const activePackage = selectedPackage
    ? packages.find((p) => p.slug === selectedPackage) ?? null
    : null;

  function toggleDestination(slug: string) {
    setSelectedDestinations((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }

  function toggleExperience(exp: string) {
    setSelectedExperiences((prev) =>
      prev.includes(exp) ? prev.filter((e) => e !== exp) : [...prev, exp]
    );
  }

  function toggleExcursion(id: string) {
    setSelectedExcursionIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      const cap = activePackage ? getExcursionCap(activePackage.durationDays) : 4;
      if (prev.length >= cap) return prev;
      return [...prev, id];
    });
  }

  function toggleAllergy(a: CommonAllergy) {
    setAllergies((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  }

  function handleSubmit() {
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <>
        <section className="relative min-h-screen flex items-center justify-center bg-[#020617] pt-32 pb-20">
          <div className="max-w-lg mx-auto px-8 text-center">
            <div className="w-20 h-20 bg-[#ff9d00] rounded-full flex items-center justify-center mx-auto mb-8">
              <svg className="w-10 h-10 text-[#482900]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="font-[family-name:var(--font-playfair)] text-4xl text-white mb-4">
              Your Trip Is Being Crafted
            </h1>
            <p className="text-white/60 mb-8">
              A Helanka travel specialist will review your selections and reach out
              within 24 hours with a personalized itinerary and quote.
            </p>
            <a
              href="/"
              className="inline-block bg-[#ff9d00] text-[#482900] px-8 py-3 rounded-lg text-base font-semibold hover:bg-[#e68d00] transition-colors"
            >
              Back to Home
            </a>
          </div>
        </section>
      </>
    );
  }

  const excursionCap = activePackage ? getExcursionCap(activePackage.durationDays) : 4;

  return (
    <>
      {/* Hero — compact */}
      <section className="relative bg-[#020617] pt-32 pb-8">
        <div className="max-w-[1440px] mx-auto px-8 md:px-24 lg:px-32">
          <span className="inline-block bg-[#ff9d00] text-[#482900] text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
            Trip Builder
          </span>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-5xl text-white mb-3">
            Build Your Dream Trip
          </h1>
          <p className="text-white/50 max-w-lg">
            Choose your destinations, pick experiences, and tell us your
            preferences. We&apos;ll handle the rest.
          </p>
        </div>
      </section>

      {/* Progress Bar */}
      <section className="bg-[#020617] sticky top-0 z-40 border-b border-white/5">
        <div className="max-w-[1440px] mx-auto px-8 md:px-24 lg:px-32 py-4">
          <div className="flex items-center gap-2 md:gap-4">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2 md:gap-4">
                <button
                  onClick={() => {
                    if (s.id < step) setStep(s.id);
                  }}
                  className={`flex items-center gap-2 transition-colors ${
                    s.id === step
                      ? "text-[#ff9d00]"
                      : s.id < step
                      ? "text-white/80 cursor-pointer hover:text-[#ff9d00]"
                      : "text-white/30 cursor-default"
                  }`}
                >
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border transition-colors ${
                      s.id === step
                        ? "bg-[#ff9d00] text-[#482900] border-[#ff9d00]"
                        : s.id < step
                        ? "bg-[#ff9d00]/20 border-[#ff9d00]/40 text-[#ff9d00]"
                        : "border-white/20 text-white/30"
                    }`}
                  >
                    {s.id < step ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      s.id
                    )}
                  </span>
                  <span className="hidden md:inline text-sm">{s.label}</span>
                </button>
                {i < steps.length - 1 && (
                  <div
                    className={`w-8 md:w-16 h-px ${
                      s.id < step ? "bg-[#ff9d00]/40" : "bg-white/10"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Step Content */}
      <section className="bg-[#020617] py-12 min-h-[60vh]">
        <div className="max-w-[1440px] mx-auto px-8 md:px-24 lg:px-32">
          {/* Step 1 — Destinations */}
          {step === STEP_DESTINATIONS && (
            <div>
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl text-white mb-2">
                Where Do You Want to Go?
              </h2>
              <p className="text-white/50 text-sm mb-8">
                Select one or more destinations for your trip.
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {destinations.map((d) => {
                  const selected = selectedDestinations.includes(d.slug);
                  return (
                    <button
                      key={d.slug}
                      onClick={() => toggleDestination(d.slug)}
                      className={`relative h-48 rounded-2xl overflow-hidden text-left group transition-all ${
                        selected
                          ? "ring-2 ring-[#ff9d00] ring-offset-2 ring-offset-[#020617]"
                          : "hover:ring-1 hover:ring-white/20"
                      }`}
                    >
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                        style={{ backgroundImage: `url('${d.image}')` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      {selected && (
                        <div className="absolute top-3 right-3 w-7 h-7 bg-[#ff9d00] rounded-full flex items-center justify-center z-10">
                          <svg className="w-4 h-4 text-[#482900]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                        <p className="text-[#ff9d00] text-xs font-medium tracking-wider uppercase mb-1">
                          {d.region}
                        </p>
                        <h3 className="font-[family-name:var(--font-playfair)] text-xl text-white">
                          {d.name}
                        </h3>
                        <p className="text-white/50 text-sm mt-1">{d.tagline}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Suggested Packages */}
              {selectedDestinations.length > 0 && (
                <div className="mt-12">
                  <h3 className="font-[family-name:var(--font-playfair)] text-xl text-white mb-4">
                    Suggested Packages
                  </h3>
                  <p className="text-white/50 text-sm mb-6">
                    Based on your destinations. Select one to pre-fill your trip,
                    or skip to fully customize.
                  </p>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {packages.map((pkg) => (
                      <button
                        key={pkg.slug}
                        onClick={() => {
                          setSelectedPackage(
                            selectedPackage === pkg.slug ? null : pkg.slug
                          );
                          setSelectedExcursionIds([]);
                        }}
                        className={`text-left rounded-2xl border p-5 transition-all ${
                          selectedPackage === pkg.slug
                            ? "bg-[#ff9d00]/10 border-[#ff9d00]/40"
                            : "bg-white/5 border-white/10 hover:border-white/20"
                        }`}
                      >
                        <p className="text-[#ff9d00] text-xs font-medium tracking-wider uppercase mb-1">
                          {pkg.durationDays} Days &middot; {pkg.minGuests}–{pkg.maxGuests} Guests &middot; {pkg.region}
                        </p>
                        <h4 className="font-[family-name:var(--font-playfair)] text-lg text-white mb-2">
                          {pkg.name}
                        </h4>
                        <p className="text-white/40 text-sm line-clamp-2">
                          {pkg.description}
                        </p>
                        <p className="text-[#ff9d00] font-semibold mt-3">
                          From ${pkg.price.toLocaleString()}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2 — Experiences */}
          {step === STEP_EXPERIENCES && (
            <div>
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl text-white mb-2">
                What Experiences Interest You?
              </h2>
              <p className="text-white/50 text-sm mb-8">
                Pick as many as you like — we&apos;ll weave them into your
                itinerary.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {experiences.map((exp) => {
                  const selected = selectedExperiences.includes(exp);
                  return (
                    <button
                      key={exp}
                      onClick={() => toggleExperience(exp)}
                      className={`text-left rounded-2xl border p-6 transition-all flex items-center gap-4 ${
                        selected
                          ? "bg-[#ff9d00]/10 border-[#ff9d00]/40"
                          : "bg-white/5 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          selected
                            ? "bg-[#ff9d00] border-[#ff9d00]"
                            : "border-white/20"
                        }`}
                      >
                        {selected && (
                          <svg className="w-3.5 h-3.5 text-[#482900]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                      <span className={`text-base ${selected ? "text-white" : "text-white/60"}`}>
                        {exp}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3 — Customize */}
          {step === STEP_CUSTOMIZE && (
            <div>
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl text-white mb-2">
                Customize Your Package
              </h2>
              <p className="text-white/50 text-sm mb-10">
                Tailor your transport, excursions, and dining preferences.
              </p>

              {/* Standard Inclusions Banner */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 mb-10">
                <h3 className="text-emerald-400 text-sm font-semibold uppercase tracking-wider mb-4">
                  Included as Standard
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {STANDARD_INCLUSIONS.map((inc) => (
                    <div key={inc.name} className="flex items-start gap-3">
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <div>
                        <p className="text-white text-sm font-medium">{inc.name}</p>
                        <p className="text-white/40 text-xs mt-0.5">{inc.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transport Tier */}
              <div className="mb-10">
                <h3 className="font-[family-name:var(--font-playfair)] text-xl text-white mb-2">
                  Transport Tier
                </h3>
                <p className="text-white/50 text-sm mb-6">
                  Choose your vehicle class for the entire trip.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {(activePackage?.transportTiers ?? [
                    {
                      tier: "standard" as TransportTier,
                      label: "Standard",
                      description: "Comfortable air-conditioned transport for your journey.",
                      vehicleType: "Toyota KDH Van",
                      features: ["Air conditioning", "Ample luggage space", "Bottled water on board", "Phone charging ports"],
                      priceModifier: 0,
                    },
                    {
                      tier: "super-luxury" as TransportTier,
                      label: "Super Luxury",
                      description: "Premium vehicle with luxury amenities for a first-class experience.",
                      vehicleType: "Mercedes V-Class",
                      features: ["Leather reclining seats", "On-board Wi-Fi", "Mini fridge with refreshments", "Noise-cancelling cabin", "Premium sound system", "Tinted privacy glass"],
                      priceModifier: 400,
                    },
                  ]).map((t) => (
                    <button
                      key={t.tier}
                      onClick={() => setTransportTier(t.tier)}
                      className={`text-left rounded-2xl border p-6 transition-all ${
                        transportTier === t.tier
                          ? "bg-[#ff9d00]/10 border-[#ff9d00]/40 ring-1 ring-[#ff9d00]/30"
                          : "bg-white/5 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-[family-name:var(--font-playfair)] text-lg text-white">
                          {t.label}
                        </h4>
                        {t.priceModifier > 0 ? (
                          <span className="text-[#ff9d00] text-sm font-semibold">
                            +${t.priceModifier}
                          </span>
                        ) : (
                          <span className="text-emerald-400 text-sm font-semibold">
                            Included
                          </span>
                        )}
                      </div>
                      <p className="text-white/50 text-sm mb-1">{t.vehicleType}</p>
                      <p className="text-white/40 text-xs mb-4">{t.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {t.features.map((f) => (
                          <span
                            key={f}
                            className="px-2.5 py-1 bg-white/5 rounded-full text-xs text-white/60"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Excursion Picker */}
              {activePackage && (
                <div className="mb-10">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-[family-name:var(--font-playfair)] text-xl text-white">
                      Choose Your Excursions
                    </h3>
                    <span
                      className={`text-sm font-semibold px-3 py-1 rounded-full ${
                        selectedExcursionIds.length === excursionCap
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-[#ff9d00]/20 text-[#ff9d00]"
                      }`}
                    >
                      {selectedExcursionIds.length} / {excursionCap} selected
                    </span>
                  </div>
                  <p className="text-white/50 text-sm mb-6">
                    Pick {excursionCap} excursion{excursionCap !== 1 ? "s" : ""} from
                    the {activePackage.excursions.length} available with {activePackage.name}.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {activePackage.excursions.map((exc: Excursion) => {
                      const picked = selectedExcursionIds.includes(exc.id);
                      const atCap =
                        selectedExcursionIds.length >= excursionCap && !picked;
                      return (
                        <button
                          key={exc.id}
                          onClick={() => toggleExcursion(exc.id)}
                          disabled={atCap}
                          className={`text-left rounded-2xl border p-5 transition-all ${
                            picked
                              ? "bg-[#ff9d00]/10 border-[#ff9d00]/40"
                              : atCap
                              ? "bg-white/[0.02] border-white/5 opacity-40 cursor-not-allowed"
                              : "bg-white/5 border-white/10 hover:border-white/20"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                picked
                                  ? "bg-[#ff9d00] border-[#ff9d00]"
                                  : "border-white/20"
                              }`}
                            >
                              {picked && (
                                <svg className="w-3 h-3 text-[#482900]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </span>
                            <div className="min-w-0">
                              <h4 className="text-white text-sm font-medium">
                                {exc.name}
                              </h4>
                              <p className="text-white/40 text-xs mt-1 line-clamp-2">
                                {exc.description}
                              </p>
                              <span className="inline-block mt-2 text-[10px] text-white/30 uppercase tracking-wider">
                                {exc.durationHours}h
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {!activePackage && (
                <div className="mb-10 bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                  <p className="text-white/40 text-sm">
                    Select a package in Step 1 to choose excursions, or skip to
                    let our team curate your trip.
                  </p>
                </div>
              )}

              {/* Meal & Dietary Preferences */}
              <div>
                <h3 className="font-[family-name:var(--font-playfair)] text-xl text-white mb-2">
                  Meal &amp; Dietary Preferences
                </h3>
                <p className="text-white/50 text-sm mb-6">
                  Let us know how you&apos;d like your meals arranged and any dietary needs.
                </p>

                {/* Meal Plan Radios */}
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {MEAL_PLANS.map((mp) => (
                    <button
                      key={mp.id}
                      onClick={() => setMealPlan(mp.id)}
                      className={`text-left rounded-2xl border p-5 transition-all ${
                        mealPlan === mp.id
                          ? "bg-[#ff9d00]/10 border-[#ff9d00]/40 ring-1 ring-[#ff9d00]/30"
                          : "bg-white/5 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            mealPlan === mp.id
                              ? "border-[#ff9d00]"
                              : "border-white/20"
                          }`}
                        >
                          {mealPlan === mp.id && (
                            <span className="w-2 h-2 rounded-full bg-[#ff9d00]" />
                          )}
                        </span>
                        <span className="text-white text-sm font-medium">
                          {mp.label}
                        </span>
                      </div>
                      <p className="text-white/40 text-xs pl-7">
                        {mp.description}
                      </p>
                    </button>
                  ))}
                </div>

                {/* Allergy Checkboxes */}
                <p className="text-white/60 text-sm mb-3">Allergies</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {COMMON_ALLERGIES.map((a) => {
                    const on = allergies.includes(a);
                    return (
                      <button
                        key={a}
                        onClick={() => toggleAllergy(a)}
                        className={`px-3.5 py-1.5 rounded-full text-sm border transition-colors ${
                          on
                            ? "bg-red-500/15 border-red-500/40 text-red-300"
                            : "bg-white/5 border-white/10 text-white/50 hover:border-white/20"
                        }`}
                      >
                        {a}
                      </button>
                    );
                  })}
                </div>

                {/* Free Text */}
                <textarea
                  rows={3}
                  value={dietaryNotes}
                  onChange={(e) => setDietaryNotes(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff9d00]/50 transition-colors resize-none text-sm"
                  placeholder="Any other dietary notes — vegan, halal, kosher, specific brand preferences..."
                />
              </div>
            </div>
          )}

          {/* Step 4 — Details */}
          {step === STEP_DETAILS && (
            <div className="max-w-2xl">
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl text-white mb-2">
                Tell Us About Your Trip
              </h2>
              <p className="text-white/50 text-sm mb-8">
                The more we know, the better we can tailor your experience.
              </p>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-white/70 mb-2">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={details.name}
                      onChange={(e) => setDetails({ ...details, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff9d00]/50 transition-colors"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/70 mb-2">Email *</label>
                    <input
                      type="email"
                      required
                      value={details.email}
                      onChange={(e) => setDetails({ ...details, email: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff9d00]/50 transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-white/70 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={details.phone}
                      onChange={(e) => setDetails({ ...details, phone: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff9d00]/50 transition-colors"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/70 mb-2">
                      Number of Travelers
                      {activePackage && (
                        <span className="text-white/40 ml-1">
                          ({activePackage.minGuests}–{activePackage.maxGuests} for this package)
                        </span>
                      )}
                    </label>
                    <input
                      type="number"
                      min={activePackage?.minGuests ?? 1}
                      max={activePackage?.maxGuests ?? 50}
                      value={details.travelers}
                      onChange={(e) => setDetails({ ...details, travelers: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff9d00]/50 transition-colors"
                      placeholder={activePackage ? String(activePackage.minGuests) : "2"}
                    />
                    {activePackage && details.travelers && (
                      Number(details.travelers) < activePackage.minGuests ? (
                        <p className="text-red-400 text-xs mt-1.5">
                          Minimum {activePackage.minGuests} guests required for {activePackage.name}
                        </p>
                      ) : Number(details.travelers) > activePackage.maxGuests ? (
                        <p className="text-red-400 text-xs mt-1.5">
                          Maximum {activePackage.maxGuests} guests for {activePackage.name}. Contact us for larger groups.
                        </p>
                      ) : null
                    )}
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-white/70 mb-2">Preferred Travel Dates</label>
                    <input
                      type="text"
                      value={details.dates}
                      onChange={(e) => setDetails({ ...details, dates: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff9d00]/50 transition-colors"
                      placeholder="e.g. Dec 2026, flexible"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/70 mb-2">Trip Duration</label>
                    <select
                      value={details.duration}
                      onChange={(e) => setDetails({ ...details, duration: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff9d00]/50 transition-colors appearance-none"
                    >
                      <option value="" className="bg-[#020617]">Select duration</option>
                      <option value="3-5" className="bg-[#020617]">3–5 days</option>
                      <option value="6-8" className="bg-[#020617]">6–8 days</option>
                      <option value="9-12" className="bg-[#020617]">9–12 days</option>
                      <option value="13+" className="bg-[#020617]">13+ days</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-2">Budget Range (per person)</label>
                  <select
                    value={details.budget}
                    onChange={(e) => setDetails({ ...details, budget: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff9d00]/50 transition-colors appearance-none"
                  >
                    <option value="" className="bg-[#020617]">Select budget range</option>
                    <option value="under-1000" className="bg-[#020617]">Under $1,000</option>
                    <option value="1000-2000" className="bg-[#020617]">$1,000 – $2,000</option>
                    <option value="2000-3500" className="bg-[#020617]">$2,000 – $3,500</option>
                    <option value="3500-5000" className="bg-[#020617]">$3,500 – $5,000</option>
                    <option value="5000+" className="bg-[#020617]">$5,000+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-2">Anything Else?</label>
                  <textarea
                    rows={4}
                    value={details.notes}
                    onChange={(e) => setDetails({ ...details, notes: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff9d00]/50 transition-colors resize-none"
                    placeholder="Special requests, accessibility requirements, must-see spots..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5 — Review */}
          {step === STEP_REVIEW && (
            <div className="max-w-2xl">
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl text-white mb-2">
                Review Your Trip
              </h2>
              <p className="text-white/50 text-sm mb-8">
                Here&apos;s a summary of your selections. Hit submit and we&apos;ll
                start building your itinerary.
              </p>
              <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h3 className="text-sm text-white/50 uppercase tracking-wider mb-3">Destinations</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDestinations.length > 0 ? (
                      selectedDestinations.map((slug) => {
                        const d = destinations.find((x) => x.slug === slug);
                        return (
                          <span
                            key={slug}
                            className="px-3 py-1.5 bg-[#ff9d00]/10 border border-[#ff9d00]/30 rounded-full text-sm text-[#ff9d00]"
                          >
                            {d?.name ?? slug}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-white/30 text-sm">No destinations selected</span>
                    )}
                  </div>
                </div>

                {selectedPackage && (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-sm text-white/50 uppercase tracking-wider mb-3">Selected Package</h3>
                    <p className="text-white font-medium">
                      {packages.find((p) => p.slug === selectedPackage)?.name}
                    </p>
                  </div>
                )}

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h3 className="text-sm text-white/50 uppercase tracking-wider mb-3">Experiences</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedExperiences.length > 0 ? (
                      selectedExperiences.map((exp) => (
                        <span
                          key={exp}
                          className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm text-white/70"
                        >
                          {exp}
                        </span>
                      ))
                    ) : (
                      <span className="text-white/30 text-sm">No experiences selected</span>
                    )}
                  </div>
                </div>

                {/* Customization Summary */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h3 className="text-sm text-white/50 uppercase tracking-wider mb-3">Customization</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Transport</p>
                      <p className="text-white text-sm">
                        {transportTier === "super-luxury" ? "Super Luxury — Mercedes V-Class" : "Standard — Toyota KDH Van"}
                        {transportTier === "super-luxury" && (
                          <span className="ml-2 text-[#ff9d00] text-xs font-semibold">+$400</span>
                        )}
                      </p>
                    </div>
                    {selectedExcursionIds.length > 0 && activePackage && (
                      <div>
                        <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Excursions</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedExcursionIds.map((id) => {
                            const exc = activePackage.excursions.find((e: Excursion) => e.id === id);
                            return (
                              <span
                                key={id}
                                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm text-white/70"
                              >
                                {exc?.name ?? id}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Meal Plan</p>
                      <p className="text-white text-sm">
                        {MEAL_PLANS.find((m) => m.id === mealPlan)?.label}
                      </p>
                    </div>
                    {allergies.length > 0 && (
                      <div>
                        <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Allergies</p>
                        <div className="flex flex-wrap gap-2">
                          {allergies.map((a) => (
                            <span
                              key={a}
                              className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-full text-sm text-red-300"
                            >
                              {a}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {dietaryNotes && (
                      <div>
                        <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Dietary Notes</p>
                        <p className="text-white/70 text-sm">{dietaryNotes}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h3 className="text-sm text-white/50 uppercase tracking-wider mb-3">Trip Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {details.name && (
                      <div>
                        <p className="text-white/40">Name</p>
                        <p className="text-white">{details.name}</p>
                      </div>
                    )}
                    {details.email && (
                      <div>
                        <p className="text-white/40">Email</p>
                        <p className="text-white">{details.email}</p>
                      </div>
                    )}
                    {details.phone && (
                      <div>
                        <p className="text-white/40">Phone</p>
                        <p className="text-white">{details.phone}</p>
                      </div>
                    )}
                    {details.travelers && (
                      <div>
                        <p className="text-white/40">Travelers</p>
                        <p className="text-white">{details.travelers}</p>
                      </div>
                    )}
                    {details.dates && (
                      <div>
                        <p className="text-white/40">Dates</p>
                        <p className="text-white">{details.dates}</p>
                      </div>
                    )}
                    {details.duration && (
                      <div>
                        <p className="text-white/40">Duration</p>
                        <p className="text-white">{details.duration} days</p>
                      </div>
                    )}
                    {details.budget && (
                      <div>
                        <p className="text-white/40">Budget</p>
                        <p className="text-white">{details.budget}</p>
                      </div>
                    )}
                  </div>
                  {details.notes && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-white/40 text-sm">Notes</p>
                      <p className="text-white/70 text-sm mt-1">{details.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-white/10">
            {step > STEP_DESTINATIONS ? (
              <button
                onClick={() => setStep(step - 1)}
                className="text-white/60 hover:text-white transition-colors text-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            ) : (
              <div />
            )}
            {step < STEP_REVIEW ? (
              <button
                onClick={() => setStep(step + 1)}
                className="bg-[#ff9d00] text-[#482900] px-8 py-3 rounded-lg text-base font-semibold hover:bg-[#e68d00] transition-colors flex items-center gap-2"
              >
                Continue
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="bg-[#ff9d00] text-[#482900] px-8 py-3 rounded-lg text-base font-semibold hover:bg-[#e68d00] transition-colors"
              >
                Submit My Trip
              </button>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
