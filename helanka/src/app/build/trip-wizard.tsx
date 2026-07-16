"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitGuestQuoteRequest, type GuestQuoteResult } from "@/actions/guest-actions";
import Turnstile from "@/components/turnstile";
import { destinations } from "@/lib/destinations";
import {
  packages,
  getExcursionsForDestination,
  type TransportTier,
  type Excursion,
} from "@/lib/packages";
import { COMMON_ALLERGIES, DIETARY_PREFERENCES, MEAL_PLANS, type CommonAllergy, type DietaryPreference, type MealPlanId } from "@/lib/dietary";
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
  dietaryPreferences: DietaryPreference[];
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
  isAuthenticated?: boolean;
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

const STEP_LABELS = ["Your Trip", "Destination", "Excursions", "Preferences", "Review"];
const EXCURSIONS_PER_DESTINATION = 2;

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

export default function TripWizard({ isAuthenticated = false, initialDestination, initialGuests, initialArrival }: TripWizardProps) {
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
    dietaryPreferences: [],
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
      if (has) {
        return { ...prev, excursionIds: prev.excursionIds.filter((e) => e !== id) };
      }
      const exc = availableExcursions.find((e) => e.id === id);
      if (!exc) return prev;
      const countForDest = prev.excursionIds.filter((eid) =>
        availableExcursions.find((e) => e.id === eid)?.destinationSlug === exc.destinationSlug
      ).length;
      if (countForDest >= EXCURSIONS_PER_DESTINATION) return prev;
      return { ...prev, excursionIds: [...prev.excursionIds, id] };
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

  function toggleDietaryPref(pref: DietaryPreference) {
    setState((prev) => {
      const has = prev.dietaryPreferences.includes(pref);
      return {
        ...prev,
        dietaryPreferences: has ? prev.dietaryPreferences.filter((p) => p !== pref) : [...prev.dietaryPreferences, pref],
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
      dietaryPreferences: state.dietaryPreferences,
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
    <div className="min-h-screen bg-background pt-24 sm:pt-32 pb-20 font-[family-name:var(--font-body)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <ProgressBar currentStep={step} />

        <div className="mt-10">
          {step === 1 && (
            <Step1TripAndDates
              tripType={state.tripType}
              onTripType={(type) => update("tripType", type)}
              guests={state.guests}
              onGuests={(v) => update("guests", v)}
              arrivalDate={state.arrivalDate}
              onArrivalDate={(v) => update("arrivalDate", v)}
              departureDate={state.departureDate}
              onDepartureDate={(v) => update("departureDate", v)}
              miceGroupSize={state.miceGroupSize}
              onMiceGroupSize={(v) => update("miceGroupSize", v)}
              miceEventType={state.miceEventType}
              onMiceEventType={(v) => update("miceEventType", v)}
              onContinue={() => setStep(2)}
            />
          )}

          {step === 2 && state.tripType === "package" && (
            <Step2Packages
              selectedSlug={state.packageSlug}
              onSelect={(slug) => { update("packageSlug", slug); update("excursionIds", []); }}
              onBack={() => setStep(1)}
              onContinue={() => setStep(3)}
            />
          )}

          {step === 2 && state.tripType === "custom" && (
            <Step2Destinations
              selected={state.destinations}
              arrivalDate={state.arrivalDate}
              departureDate={state.departureDate}
              onToggle={toggleDestination}
              onBack={() => setStep(1)}
              onContinue={() => setStep(3)}
            />
          )}

          {step === 2 && state.tripType === "mice" && (
            <Step3Mice
              venuePrefs={state.miceVenuePrefs}
              requirements={state.miceRequirements}
              budgetRange={state.miceBudgetRange}
              onToggleVenue={toggleVenuePref}
              onRequirements={(v) => update("miceRequirements", v)}
              onBudgetRange={(v) => update("miceBudgetRange", v)}
              onBack={() => setStep(1)}
              onContinue={() => setStep(5)}
            />
          )}

          {step === 3 && state.tripType === "package" && (
            <StepExcursionsPackage
              pkg={activePackage}
              selectedExcursions={state.excursionIds}
              availableExcursions={availableExcursions}
              onToggleExcursion={toggleExcursion}
              onBack={() => setStep(2)}
              onContinue={() => setStep(4)}
            />
          )}

          {step === 3 && state.tripType === "custom" && (
            <StepExcursionsCustom
              excursionsByDestination={excursionsByDestination}
              selectedExcursions={state.excursionIds}
              availableExcursions={availableExcursions}
              onToggleExcursion={toggleExcursion}
              onBack={() => setStep(2)}
              onContinue={() => setStep(4)}
            />
          )}

          {step === 4 && (state.tripType === "package" || state.tripType === "custom") && (
            <StepPreferences
              transport={state.transport}
              mealPlan={state.mealPlan}
              allergies={state.allergies}
              dietaryPreferences={state.dietaryPreferences}
              dietaryNotes={state.dietaryNotes}
              onTransport={(v) => update("transport", v)}
              onMealPlan={(v) => update("mealPlan", v)}
              onToggleAllergy={toggleAllergy}
              onToggleDietaryPref={toggleDietaryPref}
              onDietaryNotes={(v) => update("dietaryNotes", v)}
              accommodation={state.accommodation}
              guideLanguage={state.guideLanguage}
              onAccommodation={(v) => update("accommodation", v)}
              onGuideLanguage={(v) => update("guideLanguage", v)}
              onBack={() => setStep(3)}
              onContinue={() => setStep(5)}
            />
          )}

          {step === 5 && (
            <Step5Review
              state={state}
              activePackage={activePackage}
              availableExcursions={availableExcursions}
              estimatedPrice={estimatedPrice}
              isAuthenticated={isAuthenticated}
              onBack={() => setStep(state.tripType === "mice" ? 2 : 4)}
              onSignIn={handleSignInContinue}
              onArrivalDate={(v) => update("arrivalDate", v)}
              onDepartureDate={(v) => update("departureDate", v)}
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

function Step1TripAndDates({
  tripType, onTripType,
  guests, onGuests,
  arrivalDate, onArrivalDate,
  departureDate, onDepartureDate,
  miceGroupSize, onMiceGroupSize,
  miceEventType, onMiceEventType,
  onContinue,
}: {
  tripType: TripType | null;
  onTripType: (type: TripType) => void;
  guests: number;
  onGuests: (v: number) => void;
  arrivalDate: string;
  onArrivalDate: (v: string) => void;
  departureDate: string;
  onDepartureDate: (v: string) => void;
  miceGroupSize: number;
  onMiceGroupSize: (v: number) => void;
  miceEventType: string;
  onMiceEventType: (v: string) => void;
  onContinue: () => void;
}) {
  const cards = [
    { type: "package" as TripType, title: "Curated Package", description: "Choose from our expert-designed itineraries", icon: MAP_PATH },
    { type: "custom" as TripType, title: "Custom Tour", description: "Pick your own destinations and excursions", icon: COMPASS_PATH },
    { type: "mice" as TripType, title: "MICE & Groups", description: "Corporate events, incentives, and group travel", icon: USERS_PATH },
  ];

  const today = new Date().toISOString().split("T")[0];
  const canContinue = tripType !== null && arrivalDate !== "" && departureDate !== "" && departureDate > arrivalDate
    && (tripType !== "mice" || miceEventType !== "");

  return (
    <div>
      <StepHeading title="Tell us about your trip" subtitle="Choose how you'd like to travel, when, and how many are joining." />

      {/* Trip type cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map(({ type, title, description, icon }) => (
          <button
            key={type}
            onClick={() => onTripType(type)}
            className={`surface-card p-7 rounded-2xl text-left group transition-all ${
              tripType === type
                ? "border-primary ring-1 ring-primary/20 border"
                : "border border-white/10 hover:border-white/25"
            }`}
          >
            <div className={`mb-4 transition-transform group-hover:scale-110 ${tripType === type ? "text-primary" : "text-white/40"}`}>
              <SvgIcon d={icon} />
            </div>
            <h3 className="font-[family-name:var(--font-display)] text-lg text-white mb-1">{title}</h3>
            <p className="text-white/60 text-sm leading-relaxed">{description}</p>
          </button>
        ))}
      </div>

      {/* Dates and travelers - shown after trip type is selected */}
      {tripType && (
        <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* MICE event type */}
          {tripType === "mice" && (
            <div>
              <label className="block text-sm text-white/60 mb-1.5">Event type *</label>
              <select
                value={miceEventType}
                onChange={(e) => onMiceEventType(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-lg py-3 px-4 text-on-surface focus:outline-none focus:border-primary/50"
              >
                <option value="" className="bg-background text-on-surface">Select event type</option>
                {MICE_EVENT_TYPES.map((t) => (
                  <option key={t} value={t} className="bg-background text-on-surface">{t}</option>
                ))}
              </select>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="arrival" className="block text-sm text-white/60 mb-1.5">Arrival date *</label>
              <input
                id="arrival"
                type="date"
                min={today}
                value={arrivalDate}
                onChange={(e) => onArrivalDate(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-lg py-3 px-4 text-on-surface focus:outline-none focus:border-primary/50 [color-scheme:dark]"
              />
            </div>
            <div>
              <label htmlFor="departure" className="block text-sm text-white/60 mb-1.5">Departure date *</label>
              <input
                id="departure"
                type="date"
                min={arrivalDate || today}
                value={departureDate}
                onChange={(e) => onDepartureDate(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-lg py-3 px-4 text-on-surface focus:outline-none focus:border-primary/50 [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Travelers */}
          <div>
            <label className="block text-sm text-white/60 mb-1.5">
              {tripType === "mice" ? "Group size *" : "Number of travelers *"}
            </label>
            {tripType === "mice" ? (
              <input
                type="number"
                min={2}
                max={500}
                value={miceGroupSize}
                onChange={(e) => onMiceGroupSize(Math.max(2, parseInt(e.target.value, 10) || 2))}
                className="w-full sm:w-48 bg-white/5 border border-white/15 rounded-lg py-3 px-4 text-on-surface focus:outline-none focus:border-primary/50"
              />
            ) : (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => onGuests(Math.max(1, guests - 1))}
                  className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white/15 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                  </svg>
                </button>
                <span className="font-[family-name:var(--font-display)] text-2xl text-white w-8 text-center">{guests}</span>
                <button
                  onClick={() => onGuests(Math.min(20, guests + 1))}
                  className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white/15 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
                <span className="text-white/40 text-sm">{guests === 1 ? "traveler" : "travelers"}</span>
              </div>
            )}
          </div>

          {/* Continue */}
          <div className="flex justify-end pt-4 border-t border-white/10">
            <button
              onClick={onContinue}
              disabled={!canContinue}
              className="bg-primary text-on-primary px-8 py-3 rounded-lg text-sm font-bold hover:brightness-110 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Step2Packages({
  selectedSlug,
  onSelect,
  onBack,
  onContinue,
}: {
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
  onBack: () => void;
  onContinue: () => void;
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
      <StepNav onBack={onBack} onContinue={onContinue} continueDisabled={!selectedSlug} />
    </div>
  );
}

function Step2Destinations({
  selected,
  arrivalDate,
  departureDate,
  onToggle,
  onBack,
  onContinue,
}: {
  selected: string[];
  arrivalDate: string;
  departureDate: string;
  onToggle: (slug: string) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const atMax = selected.length >= 6;
  const tripDays = arrivalDate && departureDate
    ? Math.round((new Date(departureDate).getTime() - new Date(arrivalDate).getTime()) / 86400000)
    : 0;
  const minDaysNeeded = selected.length * 2;
  const durationTooShort = selected.length > 0 && tripDays > 0 && tripDays < minDaysNeeded;

  return (
    <div>
      <StepHeading
        title="Where to?"
        subtitle={`Pick up to 6 destinations. ${selected.length > 0 ? `${selected.length} selected.` : ""}`}
      />

      {durationTooShort && (
        <div className="mb-6 flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
          <svg className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          <p className="text-amber-200/80 text-sm">
            Your {tripDays}-day trip may be tight for {selected.length} destinations. We recommend at least {minDaysNeeded} days so you can enjoy 2 excursions per destination.
          </p>
        </div>
      )}

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

function ExcursionSection({
  excursions,
  selectedIds,
  perDestCap,
  destCount,
  allExcursions,
  onToggle,
  groupLabel,
}: {
  excursions: Excursion[];
  selectedIds: string[];
  perDestCap: number;
  destCount: number;
  allExcursions: Excursion[];
  onToggle: (id: string) => void;
  groupLabel?: string;
}) {
  const atDestCap = destCount >= perDestCap;
  return (
    <div className="surface-card border border-white/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        {groupLabel && <h4 className="text-white text-sm font-semibold">{groupLabel}</h4>}
        <span className={`text-xs font-medium ${atDestCap ? "text-primary" : "text-white/40"}`}>{destCount} / {perDestCap}</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {excursions.map((exc) => {
          const isSelected = selectedIds.includes(exc.id);
          const isDisabled = !isSelected && atDestCap;
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
  dietaryPreferences: DietaryPreference[];
  dietaryNotes: string;
  onTransport: (v: TransportTier) => void;
  onMealPlan: (v: MealPlanId) => void;
  onToggleAllergy: (a: CommonAllergy) => void;
  onToggleDietaryPref: (p: DietaryPreference) => void;
  onDietaryNotes: (v: string) => void;
  accommodation: string;
  guideLanguage: string;
  onAccommodation: (v: string) => void;
  onGuideLanguage: (v: string) => void;
}

function TransportAndDining({
  transport, mealPlan, allergies, dietaryPreferences, dietaryNotes,
  onTransport, onMealPlan, onToggleAllergy, onToggleDietaryPref, onDietaryNotes,
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

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-white text-sm font-semibold mb-3">Dietary Preferences</p>
          <div className="flex flex-wrap gap-2">
            {DIETARY_PREFERENCES.map((pref) => (
              <button
                key={pref}
                onClick={() => onToggleDietaryPref(pref)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  dietaryPreferences.includes(pref)
                    ? "bg-primary/20 border border-primary text-primary"
                    : "bg-white/10 border border-white/20 text-white/60 hover:border-white/35"
                }`}
              >
                {pref}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-white text-sm font-semibold mb-3">Allergies & Restrictions</p>
          <div className="flex flex-wrap gap-2">
            {COMMON_ALLERGIES.map((allergy) => (
              <button
                key={allergy}
                onClick={() => onToggleAllergy(allergy)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  allergies.includes(allergy)
                    ? "bg-red-500/20 border border-red-500/60 text-red-400"
                    : "bg-white/10 border border-white/20 text-white/60 hover:border-white/35"
                }`}
              >
                {allergy}
              </button>
            ))}
          </div>
        </div>
      </div>
      <textarea
        value={dietaryNotes}
        onChange={(e) => onDietaryNotes(e.target.value)}
        placeholder="Any other dietary notes..."
        rows={2}
        className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white/80 text-sm placeholder:text-white/30 focus:outline-none focus:border-primary/50 resize-none"
      />
    </div>
  );
}

function StepExcursionsPackage({
  pkg, selectedExcursions, availableExcursions, onToggleExcursion, onBack, onContinue,
}: {
  pkg: typeof packages[number] | null;
  selectedExcursions: string[];
  availableExcursions: Excursion[];
  onToggleExcursion: (id: string) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  if (!pkg) return null;

  const destSlugs = [...new Set(pkg.excursions.map((e) => e.destinationSlug))];

  return (
    <div>
      <StepHeading
        title="Choose your excursions"
        subtitle={`Pick up to ${EXCURSIONS_PER_DESTINATION} per destination for ${pkg.name}.`}
      />
      <div className="space-y-6">
        {destSlugs.map((slug) => {
          const dest = destinations.find((d) => d.slug === slug);
          const excursions = pkg.excursions.filter((e) => e.destinationSlug === slug);
          const countForDest = selectedExcursions.filter((eid) =>
            availableExcursions.find((e) => e.id === eid)?.destinationSlug === slug
          ).length;
          return (
            <ExcursionSection
              key={slug}
              excursions={excursions}
              selectedIds={selectedExcursions}
              perDestCap={EXCURSIONS_PER_DESTINATION}
              destCount={countForDest}
              allExcursions={availableExcursions}
              onToggle={onToggleExcursion}
              groupLabel={dest?.name ?? slug}
            />
          );
        })}
      </div>
      <StepNav onBack={onBack} onContinue={onContinue} />
    </div>
  );
}

function StepExcursionsCustom({
  excursionsByDestination, selectedExcursions, availableExcursions, onToggleExcursion, onBack, onContinue,
}: {
  excursionsByDestination: Record<string, Excursion[]>;
  selectedExcursions: string[];
  availableExcursions: Excursion[];
  onToggleExcursion: (id: string) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <div>
      <StepHeading title="Choose your excursions" subtitle={`Pick up to ${EXCURSIONS_PER_DESTINATION} per destination.`} />
      <div className="space-y-6">
        {Object.entries(excursionsByDestination).map(([slug, excursions]) => {
          const dest = destinations.find((d) => d.slug === slug);
          const countForDest = selectedExcursions.filter((eid) =>
            availableExcursions.find((e) => e.id === eid)?.destinationSlug === slug
          ).length;
          return (
            <ExcursionSection
              key={slug}
              excursions={excursions}
              selectedIds={selectedExcursions}
              perDestCap={EXCURSIONS_PER_DESTINATION}
              destCount={countForDest}
              allExcursions={availableExcursions}
              onToggle={onToggleExcursion}
              groupLabel={dest?.name ?? slug}
            />
          );
        })}
      </div>
      <StepNav onBack={onBack} onContinue={onContinue} />
    </div>
  );
}

function StepPreferences({
  onBack, onContinue, ...dietProps
}: DietProps & {
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <div>
      <StepHeading title="Travel preferences" subtitle="Transport, accommodation, guide, and dining." />
      <TransportAndDining {...dietProps} />
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

function Step5Review({
  state,
  activePackage,
  availableExcursions,
  estimatedPrice,
  isAuthenticated,
  onBack,
  onSignIn,
  onArrivalDate,
  onDepartureDate,
}: {
  state: WizardState;
  activePackage: typeof packages[number] | null;
  availableExcursions: Excursion[];
  estimatedPrice: number | null;
  isAuthenticated: boolean;
  onBack: () => void;
  onSignIn: () => void;
  onArrivalDate: (v: string) => void;
  onDepartureDate: (v: string) => void;
}) {
  const [guestEmail, setGuestEmail] = useState("");
  const [guestName, setGuestName] = useState("");
  const [submitResult, setSubmitResult] = useState<GuestQuoteResult | null>(null);
  const [isPending, startTransition] = useTransition();

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

  function handleGuestSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitResult(null);
    const formData = new FormData(e.currentTarget);
    const turnstileToken = formData.get("cf-turnstile-response") as string ?? "";

    startTransition(async () => {
      const result = await submitGuestQuoteRequest({
        email: guestEmail.trim(),
        name: guestName.trim() || undefined,
        turnstileToken,
        state: {
          tripType: state.tripType as "package" | "custom" | "mice",
          packageSlug: state.packageSlug,
          destinations: state.destinations,
          excursionIds: state.excursionIds,
          transport: state.transport,
          mealPlan: state.mealPlan,
          allergies: state.allergies,
          dietaryPreferences: state.dietaryPreferences,
          dietaryNotes: state.dietaryNotes,
          guests: state.guests,
          arrivalDate: state.arrivalDate,
          departureDate: state.departureDate,
          guideLanguage: state.guideLanguage,
          accommodation: state.accommodation,
          miceEventType: state.miceEventType,
          miceGroupSize: state.miceGroupSize,
          miceVenuePrefs: state.miceVenuePrefs,
          miceRequirements: state.miceRequirements,
          miceBudgetRange: state.miceBudgetRange,
        },
      });
      setSubmitResult(result);
    });
  }

  if (submitResult?.success) {
    return (
      <div>
        <StepHeading title="Quote request sent!" subtitle="We will be in touch soon." />
        <div className="surface-card border border-white/10 rounded-2xl p-8 text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
            <CheckIcon className="w-8 h-8 text-green-400" />
          </div>
          <p className="text-white text-lg font-medium">Thank you!</p>
          <p className="text-white/60 max-w-md mx-auto">
            Check your inbox at <span className="text-white font-medium">{guestEmail}</span>. A travel
            specialist is reviewing your trip and will send you a personalized quote within 24 hours.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <StepHeading
        title="Review your trip"
        subtitle={isAuthenticated ? "Everything looks right? Request your quote." : "Enter your email to receive a personalized quote."}
      />

      <div className="surface-card border border-white/10 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <span className="bg-primary/20 text-primary text-xs font-semibold px-3 py-1 rounded-full">
            {tripTypeBadge[state.tripType ?? "package"]}
          </span>
        </div>

        {state.arrivalDate && state.departureDate && (
          <ReviewRow label="Travel Dates">
            <span className="text-white">{state.arrivalDate} to {state.departureDate}</span>
          </ReviewRow>
        )}

        {state.tripType !== "mice" && state.guests > 0 && (
          <ReviewRow label="Travelers">
            <span className="text-white">{state.guests} {state.guests === 1 ? "guest" : "guests"}</span>
          </ReviewRow>
        )}

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

            {state.dietaryPreferences.length > 0 && (
              <ReviewRow label="Dietary Preferences">
                <span className="text-white">{state.dietaryPreferences.join(", ")}</span>
              </ReviewRow>
            )}

            {state.allergies.length > 0 && (
              <ReviewRow label="Allergies">
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

        {state.tripType === "custom" && state.arrivalDate && state.departureDate && (() => {
          const days = Math.round((new Date(state.departureDate).getTime() - new Date(state.arrivalDate).getTime()) / 86400000);
          const minDays = state.destinations.length * 2;
          return days > 0 && days < minDays ? (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-4 space-y-3">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
                <p className="text-amber-200/80 text-sm">
                  Your {days}-day trip may be tight for {state.destinations.length} destinations. We recommend at least {minDays} days for 2 excursions per destination.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 pl-8">
                <div>
                  <label className="block text-xs text-white/40 mb-1">Arrival</label>
                  <input
                    type="date"
                    value={state.arrivalDate}
                    onChange={(e) => onArrivalDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1">Departure</label>
                  <input
                    type="date"
                    value={state.departureDate}
                    min={state.arrivalDate}
                    onChange={(e) => onDepartureDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>
            </div>
          ) : null;
        })()}

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

      {isAuthenticated ? (
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
          <button onClick={onBack} className="bg-white/10 border border-white/20 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-white/15 transition-colors">
            Back
          </button>
          <button
            onClick={onSignIn}
            className="bg-primary text-on-primary px-8 py-3 rounded-lg text-sm font-bold hover:brightness-110 transition-colors"
          >
            Request My Quote
          </button>
        </div>
      ) : (
        <form onSubmit={handleGuestSubmit} className="mt-8 pt-6 border-t border-white/10 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="guest-email" className="block text-sm text-white/60 mb-1.5">Email address *</label>
              <input
                id="guest-email"
                type="email"
                required
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <div>
              <label htmlFor="guest-name" className="block text-sm text-white/60 mb-1.5">Your name</label>
              <input
                id="guest-name"
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Optional"
                className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          </div>

          <Turnstile className="flex justify-center" />

          {submitResult?.existingAccount && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-sm">
              <p className="text-amber-200">An account with this email already exists.</p>
              <button type="button" onClick={onSignIn} className="text-primary font-medium mt-1 hover:underline">
                Sign in to continue
              </button>
            </div>
          )}

          {submitResult?.error && !submitResult.existingAccount && (
            <p className="text-red-400 text-sm">{submitResult.error}</p>
          )}

          <div className="flex items-center justify-between">
            <button type="button" onClick={onBack} className="bg-white/10 border border-white/20 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-white/15 transition-colors">
              Back
            </button>
            <button
              type="submit"
              disabled={isPending || !guestEmail.trim()}
              className="bg-primary text-on-primary px-8 py-3 rounded-lg text-sm font-bold hover:brightness-110 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Sending..." : "Request My Quote"}
            </button>
          </div>

          <p className="text-center text-white/40 text-xs">
            Already have an account?{" "}
            <button type="button" onClick={onSignIn} className="text-primary hover:underline">Sign in</button>
          </p>
        </form>
      )}
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
