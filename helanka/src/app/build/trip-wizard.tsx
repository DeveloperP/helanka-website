"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { destinations } from "@/lib/destinations";
import {
  packages,
  getExcursionCap,
  getExcursionsForDestination,
  type TransportTier,
  type Excursion,
} from "@/lib/packages";
import { COMMON_ALLERGIES, MEAL_PLANS, type CommonAllergy, type MealPlanId } from "@/lib/dietary";
import { GUIDE_LANGUAGES } from "@/lib/guide-languages";
import { ACCOMMODATION_TIERS } from "@/lib/accommodation";

type TripType = "package" | "custom" | "mice";

interface WizardState {
  tripType: TripType | null;
  packageSlug: string | null;
  destinations: string[];
  excursionIds: string[];
  transport: TransportTier;
  mealPlan: MealPlanId;
  allergies: CommonAllergy[];
  dietaryNotes: string;
  guests: number;
  arrivalDate: string;
  departureDate: string;
  miceEventType: string;
  miceGroupSize: number;
  miceVenuePrefs: string[];
  miceRequirements: string;
  miceBudgetRange: string;
  guideLanguage: string;
  accommodation: string;
}

interface TripWizardProps {
  user: { name: string; email: string };
  initialDestination?: string;
  initialGuests?: string;
  initialArrival?: string;
}

const MICE_EVENT_TYPES = [
  "Conference",
  "Incentive Trip",
  "Team Building",
  "Product Launch",
  "Wedding",
  "Gala Dinner",
] as const;

const MICE_VENUE_PREFS = [
  "Beach Resort",
  "Mountain Lodge",
  "Heritage Hotel",
  "City Conference Center",
  "Tea Estate",
  "National Park Lodge",
] as const;

const MICE_BUDGET_RANGES = [
  "Under $10,000",
  "$10,000 – $25,000",
  "$25,000 – $50,000",
  "$50,000 – $100,000",
  "Over $100,000",
] as const;

const STEP_LABELS = ["Trip Type", "Destination", "Customize", "Review"];

const SvgIcon = ({ d, className = "w-8 h-8" }: { d: string | string[]; className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    {(Array.isArray(d) ? d : [d]).map((path, i) => (
      <path key={i} strokeLinecap="round" strokeLinejoin="round" d={path} />
    ))}
  </svg>
);

const MAP_PATH = "M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z";
const COMPASS_PATH = "M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418";
const USERS_PATH = "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z";

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className ?? "w-4 h-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

export default function TripWizard({ initialDestination, initialGuests, initialArrival }: TripWizardProps) {
  const router = useRouter();

  const initialTripType: TripType | null = initialDestination ? "custom" : null;
  const initialStep = initialDestination ? 2 : 1;

  const [step, setStep] = useState(initialStep);
  const [state, setState] = useState<WizardState>({
    tripType: initialTripType,
    packageSlug: null,
    destinations: initialDestination ? [initialDestination] : [],
    excursionIds: [],
    transport: "standard",
    mealPlan: "full-board",
    allergies: [],
    dietaryNotes: "",
    guests: initialGuests ? parseInt(initialGuests, 10) : 2,
    arrivalDate: initialArrival ?? "",
    departureDate: "",
    miceEventType: "",
    miceGroupSize: 30,
    miceVenuePrefs: [],
    miceRequirements: "",
    miceBudgetRange: "",
    guideLanguage: "english",
    accommodation: "boutique",
  });

  const update = useCallback(<K extends keyof WizardState>(key: K, value: WizardState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const activePackage = state.packageSlug ? packages.find((p) => p.slug === state.packageSlug) ?? null : null;

  const excursionCap = activePackage
    ? getExcursionCap(activePackage.durationDays)
    : state.destinations.length > 0
    ? getExcursionCap(state.destinations.length * 2 + 2)
    : 4;

  const availableExcursions: Excursion[] = activePackage
    ? activePackage.excursions
    : state.destinations.flatMap((slug) => getExcursionsForDestination(slug));

  const excursionsByDestination: Record<string, Excursion[]> = {};
  if (state.tripType === "custom") {
    state.destinations.forEach((slug) => {
      excursionsByDestination[slug] = getExcursionsForDestination(slug);
    });
  }

  function toggleExcursion(id: string) {
    setState((prev) => {
      const has = prev.excursionIds.includes(id);
      if (!has && prev.excursionIds.length >= excursionCap) return prev;
      return {
        ...prev,
        excursionIds: has ? prev.excursionIds.filter((e) => e !== id) : [...prev.excursionIds, id],
      };
    });
  }

  function toggleDestination(slug: string) {
    setState((prev) => {
      const has = prev.destinations.includes(slug);
      if (!has && prev.destinations.length >= 6) return prev;
      return {
        ...prev,
        destinations: has ? prev.destinations.filter((d) => d !== slug) : [...prev.destinations, slug],
        excursionIds: [],
      };
    });
  }

  function toggleAllergy(allergy: CommonAllergy) {
    setState((prev) => {
      const has = prev.allergies.includes(allergy);
      return {
        ...prev,
        allergies: has ? prev.allergies.filter((a) => a !== allergy) : [...prev.allergies, allergy],
      };
    });
  }

  function toggleVenuePref(venue: string) {
    setState((prev) => {
      const has = prev.miceVenuePrefs.includes(venue);
      return {
        ...prev,
        miceVenuePrefs: has ? prev.miceVenuePrefs.filter((v) => v !== venue) : [...prev.miceVenuePrefs, venue],
      };
    });
  }

  function handleSignInContinue() {
    const payload = {
      tripType: state.tripType,
      packageSlug: state.packageSlug,
      destinations: state.destinations,
      excursionIds: state.excursionIds,
      transport: state.transport,
      mealPlan: state.mealPlan,
      allergies: state.allergies,
      dietaryNotes: state.dietaryNotes,
      guests: state.guests,
      arrivalDate: state.arrivalDate,
      departureDate: state.departureDate,
      miceEventType: state.miceEventType,
      miceGroupSize: state.miceGroupSize,
      miceVenuePrefs: state.miceVenuePrefs,
      miceRequirements: state.miceRequirements,
      miceBudgetRange: state.miceBudgetRange,
      guideLanguage: state.guideLanguage,
      accommodation: state.accommodation,
    };
    sessionStorage.setItem("helanka-wizard-state", JSON.stringify(payload));
    router.push("/login?callbackUrl=/dashboard");
  }

  const estimatedPrice = (() => {
    if (state.tripType === "mice") return null;
    const accommodationAddon = ACCOMMODATION_TIERS.find((t) => t.id === state.accommodation)?.priceModifier ?? 0;
    if (state.tripType === "package" && activePackage) {
      const transportExtra = state.transport === "super-luxury" ? 400 : 0;
      const accommodationExtra = accommodationAddon * activePackage.durationDays;
      return (activePackage.price + transportExtra + accommodationExtra) * state.guests;
    }
    if (state.tripType === "custom") {
      const base = state.destinations.length * 350;
      const excExtra = state.excursionIds.length * 40;
      const transportExtra = state.transport === "super-luxury" ? 400 : 0;
      const accommodationExtra = accommodationAddon * (state.destinations.length * 2 + 1);
      return (base + excExtra + transportExtra + accommodationExtra) * state.guests;
    }
    return null;
  })();

  return (
    <div className="min-h-screen bg-background pt-32 pb-20 font-[family-name:var(--font-body)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <ProgressBar currentStep={step} />

        <div className="mt-10">
          {step === 1 && <Step1TripType onSelect={(type) => { update("tripType", type); setStep(2); }} />}

          {step === 2 && state.tripType === "package" && (
            <Step2Packages
              selectedSlug={state.packageSlug}
              onSelect={(slug) => { update("packageSlug", slug); update("excursionIds", []); setStep(3); }}
              onBack={() => setStep(1)}
            />
          )}

          {step === 2 && state.tripType === "custom" && (
            <Step2Destinations
              selected={state.destinations}
              onToggle={toggleDestination}
              onBack={() => setStep(1)}
              onContinue={() => setStep(3)}
            />
          )}

          {step === 2 && state.tripType === "mice" && (
            <Step2Mice
              eventType={state.miceEventType}
              groupSize={state.miceGroupSize}
              onEventType={(v) => update("miceEventType", v)}
              onGroupSize={(v) => update("miceGroupSize", v)}
              onBack={() => setStep(1)}
              onContinue={() => setStep(3)}
            />
          )}

          {step === 3 && state.tripType === "package" && (
            <Step3Package
              pkg={activePackage}
              selectedExcursions={state.excursionIds}
              excursionCap={excursionCap}
              onToggleExcursion={toggleExcursion}
              transport={state.transport}
              mealPlan={state.mealPlan}
              allergies={state.allergies}
              dietaryNotes={state.dietaryNotes}
              onTransport={(v) => update("transport", v)}
              onMealPlan={(v) => update("mealPlan", v)}
              onToggleAllergy={toggleAllergy}
              onDietaryNotes={(v) => update("dietaryNotes", v)}
              accommodation={state.accommodation}
              guideLanguage={state.guideLanguage}
              onAccommodation={(v) => update("accommodation", v)}
              onGuideLanguage={(v) => update("guideLanguage", v)}
              onBack={() => setStep(2)}
              onContinue={() => setStep(4)}
            />
          )}

          {step === 3 && state.tripType === "custom" && (
            <Step3Custom
              excursionsByDestination={excursionsByDestination}
              selectedExcursions={state.excursionIds}
              excursionCap={excursionCap}
              onToggleExcursion={toggleExcursion}
              transport={state.transport}
              mealPlan={state.mealPlan}
              allergies={state.allergies}
              dietaryNotes={state.dietaryNotes}
              onTransport={(v) => update("transport", v)}
              onMealPlan={(v) => update("mealPlan", v)}
              onToggleAllergy={toggleAllergy}
              onDietaryNotes={(v) => update("dietaryNotes", v)}
              accommodation={state.accommodation}
              guideLanguage={state.guideLanguage}
              onAccommodation={(v) => update("accommodation", v)}
              onGuideLanguage={(v) => update("guideLanguage", v)}
              onBack={() => setStep(2)}
              onContinue={() => setStep(4)}
            />
          )}

          {step === 3 && state.tripType === "mice" && (
            <Step3Mice
              venuePrefs={state.miceVenuePrefs}
              requirements={state.miceRequirements}
              budgetRange={state.miceBudgetRange}
              onToggleVenue={toggleVenuePref}
              onRequirements={(v) => update("miceRequirements", v)}
              onBudgetRange={(v) => update("miceBudgetRange", v)}
              onBack={() => setStep(2)}
              onContinue={() => setStep(4)}
            />
          )}

          {step === 4 && (
            <Step4Review
              state={state}
              activePackage={activePackage}
              availableExcursions={availableExcursions}
              estimatedPrice={estimatedPrice}
              onBack={() => setStep(3)}
              onConfirm={handleSignInContinue}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-2">
      {STEP_LABELS.map((label, i) => {
        const stepNum = i + 1;
        const isCompleted = currentStep > stepNum;
        const isCurrent = currentStep === stepNum;
        return (
          <div key={label} className="flex items-center gap-2 flex-1 last:flex-none">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 transition-colors ${
                  isCompleted
                    ? "bg-primary text-on-primary"
                    : isCurrent
                    ? "bg-primary/20 border border-primary text-primary"
                    : "bg-white/10 text-white/40"
                }`}
              >
                {isCompleted ? <CheckIcon className="w-3.5 h-3.5" /> : stepNum}
              </div>
              <span
                className={`text-xs font-medium hidden sm:block truncate transition-colors ${
                  isCurrent ? "text-white" : isCompleted ? "text-white/60" : "text-white/30"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`flex-1 h-px mx-1 transition-colors ${isCompleted ? "bg-primary/40" : "bg-white/10"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function StepHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl text-white">{title}</h1>
      {subtitle && <p className="mt-2 text-white/60 text-base">{subtitle}</p>}
    </div>
  );
}

function StepNav({ onBack, onContinue, continueLabel = "Continue", continueDisabled = false }: {
  onBack: () => void;
  onContinue: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/10">
      <button onClick={onBack} className="bg-white/10 border border-white/20 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-white/15 transition-colors">
        Back
      </button>
      <button
        onClick={onContinue}
        disabled={continueDisabled}
        className="bg-primary text-on-primary px-7 py-2.5 rounded-lg text-sm font-semibold hover:brightness-110 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {continueLabel}
      </button>
    </div>
  );
}

function Step1TripType({ onSelect }: { onSelect: (type: TripType) => void }) {
  const cards = [
    { type: "package" as TripType, title: "Curated Package", description: "Choose from our expert-designed itineraries", icon: MAP_PATH },
    { type: "custom" as TripType, title: "Custom Tour", description: "Pick your own destinations and excursions", icon: COMPASS_PATH },
    { type: "mice" as TripType, title: "MICE & Groups", description: "Corporate events, incentives, and group travel", icon: USERS_PATH },
  ];

  return (
    <div>
      <StepHeading title="What kind of trip?" subtitle="Tell us how you'd like to travel and we'll tailor everything to you." />
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map(({ type, title, description, icon }) => (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className="surface-card p-7 rounded-2xl text-left group hover:border-primary border border-white/10 transition-all hover:ring-1 hover:ring-primary/20"
          >
            <div className="text-primary mb-4 group-hover:scale-110 transition-transform">
              <SvgIcon d={icon} />
            </div>
            <h3 className="font-[family-name:var(--font-display)] text-lg text-white mb-1">{title}</h3>
            <p className="text-white/60 text-sm leading-relaxed">{description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function Step2Packages({
  selectedSlug,
  onSelect,
  onBack,
}: {
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
  onBack: () => void;
}) {
  return (
    <div>
      <StepHeading title="Where to?" subtitle="Choose a curated package designed by our travel experts." />
      <div className="grid gap-4 sm:grid-cols-2">
        {packages.map((pkg) => {
          const isSelected = selectedSlug === pkg.slug;
          return (
            <button
              key={pkg.slug}
              onClick={() => onSelect(pkg.slug)}
              className={`surface-card rounded-2xl overflow-hidden text-left transition-all ${
                isSelected
                  ? "border-primary ring-1 ring-primary/20 border"
                  : "border border-white/10 hover:border-white/25"
              }`}
            >
              <div className="relative h-36 overflow-hidden">
                <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                  <span className="text-white font-semibold text-sm">{pkg.durationDays} days</span>
                  <span className="text-primary font-semibold text-sm">from ${pkg.price.toLocaleString()}</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-[family-name:var(--font-display)] text-white text-base mb-1">{pkg.name}</h3>
                <p className="text-white/60 text-xs leading-relaxed line-clamp-2 mb-3">{pkg.description}</p>
                <div className="flex flex-wrap gap-1">
                  {pkg.excursions.slice(0, 3).map((exc) => (
                    <span key={exc.id} className="bg-white/10 text-white/60 text-xs px-2 py-0.5 rounded-full">
                      {destinations.find((d) => d.slug === exc.destinationSlug)?.name ?? exc.destinationSlug}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <div className="flex justify-start mt-10 pt-6 border-t border-white/10">
        <button onClick={onBack} className="bg-white/10 border border-white/20 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-white/15 transition-colors">
          Back
        </button>
      </div>
    </div>
  );
}

function Step2Destinations({
  selected,
  onToggle,
  onBack,
  onContinue,
}: {
  selected: string[];
  onToggle: (slug: string) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const atMax = selected.length >= 6;
  return (
    <div>
      <StepHeading
        title="Where to?"
        subtitle={`Pick up to 6 destinations. ${selected.length > 0 ? `${selected.length} selected.` : ""}`}
      />
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {destinations.map((dest) => {
          const isSelected = selected.includes(dest.slug);
          const isDisabled = !isSelected && atMax;
          return (
            <button
              key={dest.slug}
              onClick={() => !isDisabled && onToggle(dest.slug)}
              disabled={isDisabled}
              className={`surface-card rounded-2xl overflow-hidden text-left transition-all ${
                isDisabled ? "opacity-40 cursor-not-allowed" : ""
              } ${
                isSelected
                  ? "border-primary ring-1 ring-primary/20 border"
                  : "border border-white/10 hover:border-white/25"
              }`}
            >
              <div className="relative h-28 overflow-hidden">
                <img src={dest.image} alt={dest.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-primary rounded-full w-5 h-5 flex items-center justify-center">
                    <CheckIcon className="w-3 h-3 text-on-primary" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="text-white text-sm font-semibold">{dest.name}</h3>
                <p className="text-white/50 text-xs">{dest.region}</p>
                <p className="text-white/60 text-xs mt-0.5 italic">{dest.tagline}</p>
              </div>
            </button>
          );
        })}
      </div>
      <StepNav onBack={onBack} onContinue={onContinue} continueDisabled={selected.length === 0} />
    </div>
  );
}

function Step2Mice({
  eventType,
  groupSize,
  onEventType,
  onGroupSize,
  onBack,
  onContinue,
}: {
  eventType: string;
  groupSize: number;
  onEventType: (v: string) => void;
  onGroupSize: (v: number) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <div>
      <StepHeading title="Tell us about your event" subtitle="We'll build a proposal around your requirements." />
      <div className="space-y-8">
        <div>
          <p className="text-white/60 text-sm mb-3">Event Type</p>
          <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
            {MICE_EVENT_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => onEventType(type)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  eventType === type
                    ? "bg-primary/20 border border-primary text-primary"
                    : "surface-card border border-white/10 text-white/70 hover:border-white/25"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-white/60 text-sm mb-3">Group Size</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onGroupSize(Math.max(10, groupSize - 10))}
              className="bg-white/10 border border-white/20 text-white w-10 h-10 rounded-lg flex items-center justify-center text-lg hover:bg-white/15 transition-colors"
            >
              −
            </button>
            <span className="text-white text-2xl font-semibold w-16 text-center">{groupSize}</span>
            <button
              onClick={() => onGroupSize(Math.min(500, groupSize + 10))}
              className="bg-white/10 border border-white/20 text-white w-10 h-10 rounded-lg flex items-center justify-center text-lg hover:bg-white/15 transition-colors"
            >
              +
            </button>
            <span className="text-white/40 text-sm">people (10–500)</span>
          </div>
        </div>
      </div>
      <StepNav onBack={onBack} onContinue={onContinue} continueDisabled={!eventType} />
    </div>
  );
}

function ExcursionSection({
  excursions,
  selectedIds,
  cap,
  onToggle,
  groupLabel,
}: {
  excursions: Excursion[];
  selectedIds: string[];
  cap: number;
  onToggle: (id: string) => void;
  groupLabel?: string;
}) {
  return (
    <div>
      {groupLabel && <h4 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">{groupLabel}</h4>}
      <div className="grid gap-2 sm:grid-cols-2">
        {excursions.map((exc) => {
          const isSelected = selectedIds.includes(exc.id);
          const isDisabled = !isSelected && selectedIds.length >= cap;
          return (
            <button
              key={exc.id}
              onClick={() => !isDisabled && onToggle(exc.id)}
              disabled={isDisabled}
              className={`rounded-xl p-3 text-left transition-all ${
                isDisabled ? "opacity-40 cursor-not-allowed" : ""
              } ${
                isSelected
                  ? "bg-primary/10 border border-primary ring-1 ring-primary/10"
                  : "surface-card border border-white/10 hover:border-white/25"
              }`}
            >
              <div className="flex items-start gap-2">
                <div className={`mt-0.5 w-4 h-4 rounded flex-shrink-0 border flex items-center justify-center ${isSelected ? "bg-primary border-primary" : "border-white/30"}`}>
                  {isSelected && <CheckIcon className="w-2.5 h-2.5 text-on-primary" />}
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium leading-tight">{exc.name}</p>
                  <p className="text-white/50 text-xs mt-0.5 leading-relaxed line-clamp-2">{exc.description}</p>
                  <p className="text-white/40 text-xs mt-1">{exc.durationHours}h</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface DietProps {
  transport: TransportTier;
  mealPlan: MealPlanId;
  allergies: CommonAllergy[];
  dietaryNotes: string;
  onTransport: (v: TransportTier) => void;
  onMealPlan: (v: MealPlanId) => void;
  onToggleAllergy: (a: CommonAllergy) => void;
  onDietaryNotes: (v: string) => void;
  accommodation: string;
  guideLanguage: string;
  onAccommodation: (v: string) => void;
  onGuideLanguage: (v: string) => void;
}

function TransportAndDining({
  transport, mealPlan, allergies, dietaryNotes,
  onTransport, onMealPlan, onToggleAllergy, onDietaryNotes,
  accommodation, guideLanguage, onAccommodation, onGuideLanguage,
}: DietProps) {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-white text-sm font-semibold mb-3">Transport</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {(["standard", "super-luxury"] as TransportTier[]).map((tier) => (
            <button
              key={tier}
              onClick={() => onTransport(tier)}
              className={`rounded-xl p-4 text-left transition-all ${
                transport === tier
                  ? "bg-primary/10 border border-primary ring-1 ring-primary/10"
                  : "surface-card border border-white/10 hover:border-white/25"
              }`}
            >
              <p className="text-white text-sm font-semibold">{tier === "standard" ? "Standard" : "Super Luxury"}</p>
              <p className="text-white/50 text-xs mt-1">
                {tier === "standard" ? "Toyota KDH Van — A/C, water, charging" : "Mercedes V-Class — Wi-Fi, leather, fridge"}
              </p>
              {tier === "super-luxury" && <p className="text-primary text-xs mt-1">+$400 per trip</p>}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-white text-sm font-semibold mb-3">Accommodation</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {ACCOMMODATION_TIERS.map((tier) => (
            <button
              key={tier.id}
              onClick={() => onAccommodation(tier.id)}
              className={`rounded-xl p-4 text-left transition-all ${
                accommodation === tier.id
                  ? "bg-primary/10 border border-primary ring-1 ring-primary/20"
                  : "surface-card border border-white/10 hover:border-white/25"
              }`}
            >
              <p className="text-white text-sm font-semibold">{tier.name}</p>
              <p className="text-white/50 text-xs mt-1 leading-relaxed">{tier.description}</p>
              <p className={`text-xs mt-2 font-medium ${tier.priceModifier === 0 ? "text-white/40" : "text-primary"}`}>
                {tier.priceModifier === 0 ? "Included" : `+$${tier.priceModifier}/night`}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-white text-sm font-semibold mb-1">Multilingual Guide</p>
        <p className="text-white/50 text-xs mb-3">Your personal guide speaks your language throughout the trip</p>
        <select
          value={guideLanguage}
          onChange={(e) => onGuideLanguage(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg py-4 px-4 text-on-surface focus:outline-none focus:border-primary/50"
        >
          {GUIDE_LANGUAGES.map((lang) => (
            <option key={lang.id} value={lang.id} className="bg-background text-on-surface">
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="text-white text-sm font-semibold mb-3">Meal Plan</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {MEAL_PLANS.map((plan) => (
            <button
              key={plan.id}
              onClick={() => onMealPlan(plan.id)}
              className={`rounded-xl p-3 text-left transition-all ${
                mealPlan === plan.id
                  ? "bg-primary/10 border border-primary"
                  : "surface-card border border-white/10 hover:border-white/25"
              }`}
            >
              <p className="text-white text-sm font-medium">{plan.label}</p>
              <p className="text-white/50 text-xs mt-0.5">{plan.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-white text-sm font-semibold mb-3">Dietary Restrictions</p>
        <div className="flex flex-wrap gap-2">
          {COMMON_ALLERGIES.map((allergy) => (
            <button
              key={allergy}
              onClick={() => onToggleAllergy(allergy)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                allergies.includes(allergy)
                  ? "bg-primary/20 border border-primary text-primary"
                  : "bg-white/10 border border-white/20 text-white/60 hover:border-white/35"
              }`}
            >
              {allergy}
            </button>
          ))}
        </div>
        <textarea
          value={dietaryNotes}
          onChange={(e) => onDietaryNotes(e.target.value)}
          placeholder="Any other dietary notes..."
          rows={2}
          className="mt-3 w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white/80 text-sm placeholder:text-white/30 focus:outline-none focus:border-primary/50 resize-none"
        />
      </div>
    </div>
  );
}

function Step3Package({
  pkg, selectedExcursions, excursionCap, onToggleExcursion, onBack, onContinue, ...dietProps
}: DietProps & {
  pkg: typeof packages[number] | null;
  selectedExcursions: string[];
  excursionCap: number;
  onToggleExcursion: (id: string) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  if (!pkg) return null;

  return (
    <div>
      <StepHeading
        title="Customize your trip"
        subtitle={`Select up to ${excursionCap} excursions for ${pkg.name}.`}
      />
      <div className="space-y-8">
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-white text-sm font-semibold">Excursions</p>
            <span className="text-white/40 text-xs">{selectedExcursions.length} / {excursionCap} selected</span>
          </div>
          <ExcursionSection excursions={pkg.excursions} selectedIds={selectedExcursions} cap={excursionCap} onToggle={onToggleExcursion} />
        </div>
        <TransportAndDining {...dietProps} />
      </div>
      <StepNav onBack={onBack} onContinue={onContinue} />
    </div>
  );
}

function Step3Custom({
  excursionsByDestination, selectedExcursions, excursionCap, onToggleExcursion, onBack, onContinue, ...dietProps
}: DietProps & {
  excursionsByDestination: Record<string, Excursion[]>;
  selectedExcursions: string[];
  excursionCap: number;
  onToggleExcursion: (id: string) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <div>
      <StepHeading title="Customize your trip" subtitle={`Select up to ${excursionCap} excursions across your destinations.`} />
      <div className="space-y-8">
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-white text-sm font-semibold">Excursions</p>
            <span className="text-white/40 text-xs">{selectedExcursions.length} / {excursionCap} selected</span>
          </div>
          <div className="space-y-6">
            {Object.entries(excursionsByDestination).map(([slug, excursions]) => {
              const dest = destinations.find((d) => d.slug === slug);
              return (
                <ExcursionSection
                  key={slug}
                  excursions={excursions}
                  selectedIds={selectedExcursions}
                  cap={excursionCap}
                  onToggle={onToggleExcursion}
                  groupLabel={dest?.name ?? slug}
                />
              );
            })}
          </div>
        </div>
        <TransportAndDining {...dietProps} />
      </div>
      <StepNav onBack={onBack} onContinue={onContinue} />
    </div>
  );
}

function Step3Mice({
  venuePrefs,
  requirements,
  budgetRange,
  onToggleVenue,
  onRequirements,
  onBudgetRange,
  onBack,
  onContinue,
}: {
  venuePrefs: string[];
  requirements: string;
  budgetRange: string;
  onToggleVenue: (v: string) => void;
  onRequirements: (v: string) => void;
  onBudgetRange: (v: string) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <div>
      <StepHeading title="Venue & Requirements" subtitle="Help us match you with the right spaces and partners." />
      <div className="space-y-8">
        <div>
          <p className="text-white text-sm font-semibold mb-3">Venue Preferences</p>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
            {MICE_VENUE_PREFS.map((venue) => (
              <button
                key={venue}
                onClick={() => onToggleVenue(venue)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                  venuePrefs.includes(venue)
                    ? "bg-primary/10 border border-primary text-primary"
                    : "surface-card border border-white/10 text-white/70 hover:border-white/25"
                }`}
              >
                {venue}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-white text-sm font-semibold mb-3">Budget Range</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {MICE_BUDGET_RANGES.map((range) => (
              <button
                key={range}
                onClick={() => onBudgetRange(range)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                  budgetRange === range
                    ? "bg-primary/10 border border-primary text-primary"
                    : "surface-card border border-white/10 text-white/70 hover:border-white/25"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-white text-sm font-semibold mb-3">Special Requirements</p>
          <textarea
            value={requirements}
            onChange={(e) => onRequirements(e.target.value)}
            placeholder="AV equipment, accessibility needs, themed décor, catering preferences..."
            rows={4}
            className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white/80 text-sm placeholder:text-white/30 focus:outline-none focus:border-primary/50 resize-none"
          />
        </div>
      </div>
      <StepNav onBack={onBack} onContinue={onContinue} />
    </div>
  );
}

function Step4Review({
  state,
  activePackage,
  availableExcursions,
  estimatedPrice,
  onBack,
  onConfirm,
}: {
  state: WizardState;
  activePackage: typeof packages[number] | null;
  availableExcursions: Excursion[];
  estimatedPrice: number | null;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const selectedExcursionNames = availableExcursions
    .filter((e) => state.excursionIds.includes(e.id))
    .map((e) => e.name);

  const selectedDestinationNames = destinations
    .filter((d) => state.destinations.includes(d.slug))
    .map((d) => d.name);

  const mealPlanLabel = MEAL_PLANS.find((m) => m.id === state.mealPlan)?.label ?? state.mealPlan;
  const accommodationTier = ACCOMMODATION_TIERS.find((t) => t.id === state.accommodation);
  const guideLanguageLabel = GUIDE_LANGUAGES.find((l) => l.id === state.guideLanguage)?.label ?? state.guideLanguage;

  const tripTypeBadge: Record<string, string> = {
    package: "Curated Package",
    custom: "Custom Tour",
    mice: "MICE & Groups",
  };

  return (
    <div>
      <StepHeading title="Review your trip" subtitle="Everything looks right? Sign in to receive your quote." />

      <div className="surface-card border border-white/10 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <span className="bg-primary/20 text-primary text-xs font-semibold px-3 py-1 rounded-full">
            {tripTypeBadge[state.tripType ?? "package"]}
          </span>
        </div>

        {state.tripType !== "mice" && (
          <>
            <ReviewRow label={state.tripType === "package" ? "Package" : "Destinations"}>
              {state.tripType === "package" && activePackage ? (
                <span className="text-white">{activePackage.name}</span>
              ) : (
                <span className="text-white">{selectedDestinationNames.join(", ") || "—"}</span>
              )}
            </ReviewRow>

            {selectedExcursionNames.length > 0 && (
              <ReviewRow label="Excursions">
                <div className="flex flex-wrap gap-1.5">
                  {selectedExcursionNames.map((name) => (
                    <span key={name} className="bg-white/10 text-white/80 text-xs px-2 py-0.5 rounded-full">{name}</span>
                  ))}
                </div>
              </ReviewRow>
            )}

            <ReviewRow label="Transport">
              <span className="text-white">{state.transport === "super-luxury" ? "Super Luxury (Mercedes V-Class)" : "Standard (Toyota KDH Van)"}</span>
            </ReviewRow>

            <ReviewRow label="Accommodation">
              <span className="text-white">
                {accommodationTier?.name ?? state.accommodation}
                {accommodationTier && accommodationTier.priceModifier > 0 && (
                  <span className="text-primary ml-2 text-xs">+${accommodationTier.priceModifier}/night</span>
                )}
              </span>
            </ReviewRow>

            <ReviewRow label="Guide Language">
              <span className="text-white">{guideLanguageLabel}</span>
            </ReviewRow>

            <ReviewRow label="Meal Plan">
              <span className="text-white">{mealPlanLabel}</span>
            </ReviewRow>

            {state.allergies.length > 0 && (
              <ReviewRow label="Dietary Restrictions">
                <span className="text-white">{state.allergies.join(", ")}</span>
              </ReviewRow>
            )}
          </>
        )}

        {state.tripType === "mice" && (
          <>
            <ReviewRow label="Event Type">
              <span className="text-white">{state.miceEventType || "—"}</span>
            </ReviewRow>
            <ReviewRow label="Group Size">
              <span className="text-white">{state.miceGroupSize} people</span>
            </ReviewRow>
            {state.miceVenuePrefs.length > 0 && (
              <ReviewRow label="Venue Preferences">
                <span className="text-white">{state.miceVenuePrefs.join(", ")}</span>
              </ReviewRow>
            )}
            {state.miceBudgetRange && (
              <ReviewRow label="Budget Range">
                <span className="text-white">{state.miceBudgetRange}</span>
              </ReviewRow>
            )}
            {state.miceRequirements && (
              <ReviewRow label="Special Requirements">
                <span className="text-white/80 text-sm">{state.miceRequirements}</span>
              </ReviewRow>
            )}
          </>
        )}

        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-white/60 text-sm">Estimated Price</span>
          {estimatedPrice !== null ? (
            <span className="font-[family-name:var(--font-display)] text-2xl text-primary">
              ${estimatedPrice.toLocaleString()}
            </span>
          ) : (
            <span className="text-white/60 italic text-sm">Custom quote</span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
        <button onClick={onBack} className="bg-white/10 border border-white/20 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-white/15 transition-colors">
          Back
        </button>
        <button
          onClick={onConfirm}
          className="bg-primary text-on-primary px-8 py-3 rounded-lg text-sm font-bold hover:brightness-110 transition-colors"
        >
          Get My Quote — Sign In to Continue
        </button>
      </div>
    </div>
  );
}

function ReviewRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <span className="text-white/40 text-sm w-36 flex-shrink-0">{label}</span>
      <div className="flex-1 text-sm">{children}</div>
    </div>
  );
}
