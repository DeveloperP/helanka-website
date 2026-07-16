"use client";

import { useEffect, useTransition } from "react";
import Link from "next/link";
import { packages as allPackages, getExcursionsForDestination } from "@/lib/packages";
import { COMMON_ALLERGIES, DIETARY_PREFERENCES } from "@/lib/dietary";
import { destinations as allDestinations } from "@/lib/destinations";
import { GUIDE_LANGUAGES } from "@/lib/guide-languages";
import { ACCOMMODATION_TIERS } from "@/lib/accommodation";
import { useTripSessionStore } from "@/stores/trip-session-store";
import { useSessionSync } from "@/hooks/use-session-sync";
import { useSSE } from "@/hooks/use-sse";
import { sendChatMessage } from "@/actions/chat-actions";
import { requestQuote } from "@/actions/session-actions";
import { SuggestionCard } from "@/components/chat/suggestion-card";

interface DashboardClientProps {
  user: { name: string; email: string; image: string | null };
  bookings: Array<{
    id: string;
    status: string;
    arrivalDate: string | null;
    departureDate: string | null;
    numTravelers: number;
    latestQuoteTotal: number | null;
    latestQuoteStatus: string | null;
    totalPaid: number;
    createdAt: string;
  }>;
}

// --- Trip Type & Tab types from Zustand store ---

import type { TripType, TabId } from "@/stores/trip-session-store";

interface SidebarTab { id: TabId; label: string; icon: React.ReactNode }

const tabIcons: Record<string, React.ReactNode> = {
  overview: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  ),
  itinerary: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
    </svg>
  ),
  excursions: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  ),
  transport: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H6.375c-.621 0-1.125-.504-1.125-1.125V14.25m17.25 0V7.875A1.875 1.875 0 0020.25 6H5.25A1.875 1.875 0 003.375 7.875V14.25" />
    </svg>
  ),
  dining: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.379a48.474 48.474 0 00-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12M16.5 3.75V16.5" />
    </svg>
  ),
  review: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  destinations: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
    </svg>
  ),
  "event-details": (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  ),
  venues: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
    </svg>
  ),
  requirements: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
};

function getTabsForTripType(type: TripType): SidebarTab[] {
  const t = (id: TabId, label: string): SidebarTab => ({ id, label, icon: tabIcons[id] });
  switch (type) {
    case "package":
      return [t("overview", "Overview"), t("itinerary", "Itinerary"), t("excursions", "Excursions"), t("transport", "Transport & Stay"), t("dining", "Dining"), t("review", "Review")];
    case "custom":
      return [t("overview", "Overview"), t("destinations", "Destinations"), t("excursions", "Excursions"), t("transport", "Transport & Stay"), t("dining", "Dining"), t("review", "Review")];
    case "mice":
      return [t("overview", "Overview"), t("event-details", "Event"), t("venues", "Venues"), t("requirements", "Requirements"), t("review", "Review")];
  }
}

function TabNavigation({ tabs, activeTab, onNavigate }: { tabs: SidebarTab[]; activeTab: TabId; onNavigate: (id: TabId) => void }) {
  const idx = tabs.findIndex((t) => t.id === activeTab);
  const prev = idx > 0 ? tabs[idx - 1] : null;
  const next = idx < tabs.length - 1 ? tabs[idx + 1] : null;
  return (
    <div className="flex items-center justify-between pt-6 mt-6">
      {prev ? (
        <button onClick={() => onNavigate(prev.id)} className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors group">
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          {prev.label}
        </button>
      ) : <span />}
      {next ? (
        <button onClick={() => onNavigate(next.id)} className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-primary text-on-primary hover:brightness-110 shadow-sm shadow-primary/20 transition-all group">
          {next.label}
          <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
      ) : <span />}
    </div>
  );
}

const MICE_EVENT_TYPES = ["Conference", "Incentive Trip", "Meeting", "Exhibition", "Team Building", "Gala Dinner", "Product Launch"] as const;

// Static sidebarTabs removed — using getTabsForTripType() instead

// --- Mock Trip Data ---

// Dummy per-excursion price lookup (will come from backend later)
const EXCURSION_PRICES: Record<string, number> = {};
allPackages.forEach((pkg) =>
  pkg.excursions.forEach((exc, i) => {
    EXCURSION_PRICES[exc.id] = [45, 25, 30, 55, 20, 40, 75, 35, 30, 65][i % 10];
  })
);

export default function DashboardClient({ user, bookings }: DashboardClientProps) {
  const store = useTripSessionStore();
  useSessionSync();
  useSSE(store.sessionId);
  const [isSending, startSendTransition] = useTransition();

  const tripType = store.tripType;
  const setTripType = (v: TripType | null) => store.set("tripType", v);
  const activeTab = store.activeTab;
  const setActiveTab = (v: TabId) => store.set("activeTab", v);
  const selectedPackageSlug = store.selectedPackageSlug;
  const setSelectedPackageSlug = (v: string) => store.set("selectedPackageSlug", v);
  const showPackagePicker = store.showPackagePicker;
  const setShowPackagePicker = (v: boolean) => store.set("showPackagePicker", v);

  const selectedDestinationSlugs = store.selectedDestinationSlugs;
  const setSelectedDestinationSlugs = (v: string[]) => store.set("selectedDestinationSlugs", v);

  const miceEventType = store.miceEventType;
  const setMiceEventType = (v: string) => store.set("miceEventType", v);
  const miceGroupSize = store.miceGroupSize;
  const setMiceGroupSize = (v: number) => store.set("miceGroupSize", v);
  const miceVenuePrefs = store.miceVenuePrefs;
  const setMiceVenuePrefs = (v: string[]) => store.set("miceVenuePrefs", v);
  const miceRequirements = store.miceRequirements;
  const setMiceRequirements = (v: string) => store.set("miceRequirements", v);
  const miceBudgetRange = store.miceBudgetRange;
  const setMiceBudgetRange = (v: string) => store.set("miceBudgetRange", v);

  const sidebarTabs = tripType ? getTabsForTripType(tripType) : getTabsForTripType("package");

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

  // Custom tour: excursions from selected destinations
  const customExcursions = selectedDestinationSlugs.flatMap((slug) =>
    getExcursionsForDestination(slug).map((exc) => ({
      ...exc,
      price: EXCURSION_PRICES[exc.id] ?? 35,
    }))
  );
  const activeExcursions = tripType === "custom" ? customExcursions : allExcursions;

  const guests = store.guests;
  const setGuests = (v: number) => store.set("guests", v);
  const arrivalDate = store.arrivalDate;
  const setArrivalDate = (v: string) => store.set("arrivalDate", v);
  const departureDate = store.departureDate;
  const setDepartureDate = (v: string) => store.set("departureDate", v);
  const transport = store.transport;
  const setTransport = (v: "standard" | "super-luxury") => store.set("transport", v);
  const guideLanguage = store.guideLanguage;
  const setGuideLanguage = (v: string) => store.set("guideLanguage", v);
  const accommodation = store.accommodation;
  const setAccommodation = (v: string) => store.set("accommodation", v);
  const selectedExcursionIds = store.selectedExcursionIds;
  const setSelectedExcursionIds = (v: string[]) => store.set("selectedExcursionIds", v);
  const mealPlan = store.mealPlan;
  const setMealPlan = (v: string) => store.set("mealPlan", v);
  const allergies = store.allergies;
  const setAllergies = (v: string[]) => store.set("allergies", v);
  const dietaryPreferences = store.dietaryPreferences;
  const setDietaryPreferences = (v: string[]) => store.set("dietaryPreferences", v);
  const dietaryNotes = store.dietaryNotes;
  const setDietaryNotes = (v: string) => store.set("dietaryNotes", v);
  const quoteRequested = store.quoteRequested;
  const setQuoteRequested = (v: boolean) => store.set("quoteRequested", v);

  const chatOpen = store.chatOpen;
  const setChatOpen = store.setChatOpen;
  const chatMessages = store.chatMessages;
  const setChatMessages = store.setChatMessages;
  const chatInput = store.chatInput;
  const setChatInput = store.setChatInput;

  const firstName = user.name.split(" ")[0];

  // Date helpers
  const arrDate = new Date(arrivalDate + "T00:00:00");
  const depDate = new Date(departureDate + "T00:00:00");
  const nights = Math.max(0, Math.round((depDate.getTime() - arrDate.getTime()) / 86400000));
  const fmtDay = (d: Date) => d.getDate();
  const fmtMonth = (d: Date) => d.toLocaleString("en", { month: "short" });
  const fmtYear = (d: Date) => d.getFullYear();
  const datesValid = arrivalDate && departureDate && depDate > arrDate;
  const effectiveDays = nights || tripInfo.days;
  const EXCURSIONS_PER_DESTINATION = 2;
  const DESTINATION_CAP = Math.max(1, Math.floor(effectiveDays / 2));

  // Price calculation
  const transportAddon = transport === "super-luxury" ? 400 : 0;
  const accommodationAddon = ACCOMMODATION_TIERS.find((t) => t.id === accommodation)?.priceModifier ?? 0;
  const accommodationTotal = accommodationAddon * effectiveDays;
  const excursionTotal = selectedExcursionIds.reduce((sum, id) => {
    const exc = activeExcursions.find((e) => e.id === id);
    return sum + (exc?.price ?? 0);
  }, 0);
  const mealAddon = mealPlan === "Full Board" ? 0 : mealPlan === "Half Board" ? -80 : -150;
  const customBasePrice = selectedDestinationSlugs.length * 200;
  const perPersonPrice = tripType === "custom"
    ? customBasePrice + transportAddon + accommodationTotal + excursionTotal + mealAddon
    : tripInfo.basePrice + transportAddon + accommodationTotal + excursionTotal + mealAddon;
  const totalPrice = tripType === "mice" ? 0 : perPersonPrice * guests;
  const guestsValid = tripType === "custom"
    ? guests >= 1 && guests <= 20
    : tripType === "mice"
    ? miceGroupSize >= 10
    : guests >= tripInfo.minGuests && guests <= tripInfo.maxGuests;

  const specialist = tripType === "mice"
    ? { initials: "RP", name: "Ranjan Perera", title: "MICE & Events Coordinator", email: "ranjan@helanka.co", whatsapp: "94771234568", greeting: `Hi ${firstName}! I'm Ranjan, your dedicated MICE coordinator. I'll help plan every detail of your group event in Sri Lanka.`, autoReply: "Thanks for your message! Ranjan will respond shortly. Feel free to continue configuring your event." }
    : tripType === "custom"
    ? { initials: "NF", name: "Nishadi Fernando", title: "Custom Tour Specialist", email: "nishadi@helanka.co", whatsapp: "94771234569", greeting: `Hi ${firstName}! I'm Nishadi, your custom tour specialist. Let's build your perfect Sri Lanka itinerary together.`, autoReply: "Thanks for your message! Nishadi will respond shortly. In the meantime, feel free to continue customizing your trip." }
    : { initials: "KW", name: "Kavindi Weerasinghe", title: "Your Dedicated Travel Specialist", email: "kavindi@helanka.co", whatsapp: "94771234567", greeting: `Hi ${firstName}! I'm Kavindi, your dedicated travel specialist. How can I help with your trip?`, autoReply: "Thanks for your message! Kavindi will respond shortly. In the meantime, feel free to continue customizing your trip." };

  // Completion tracking — adapts per vertical
  const configured: Record<string, boolean> = tripType === "mice"
    ? {
        "event-details": !!miceEventType,
        venues: miceVenuePrefs.length > 0,
        requirements: !!miceRequirements,
      }
    : tripType === "custom"
    ? {
        destinations: selectedDestinationSlugs.length > 0,
        excursions: selectedExcursionIds.length > 0,
        transport: true,
        dining: true,
      }
    : {
        itinerary: true,
        excursions: selectedExcursionIds.length > 0,
        transport: true,
        dining: true,
      };
  const configuredCount = Object.values(configured).filter(Boolean).length;
  const totalSections = Object.keys(configured).length;

  function toggleExcursion(id: string) {
    const prev = selectedExcursionIds;
    if (prev.includes(id)) {
      setSelectedExcursionIds(prev.filter((x) => x !== id));
    } else {
      const exc = activeExcursions.find((e) => e.id === id);
      if (!exc) return;
      const countForDest = prev.filter((eid) =>
        activeExcursions.find((e) => e.id === eid)?.destinationSlug === exc.destinationSlug
      ).length;
      if (countForDest >= EXCURSIONS_PER_DESTINATION) return;
      setSelectedExcursionIds([...prev, id]);
    }
  }

  function toggleDietaryPref(p: string) {
    setDietaryPreferences(dietaryPreferences.includes(p) ? dietaryPreferences.filter((x) => x !== p) : [...dietaryPreferences, p]);
  }

  function toggleAllergy(a: string) {
    const prev = allergies;
    setAllergies(prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);
  }

  function chooseTripType(type: TripType) {
    setTripType(type);
    setActiveTab("overview");
    setQuoteRequested(false);
    if (type === "custom") {
      setSelectedExcursionIds([]);
    }
  }

  useEffect(() => {
    setChatMessages([{ from: "rep", text: specialist.greeting, messageType: "TEXT" }]);
    setChatOpen(false);
  }, [tripType, specialist.greeting, setChatMessages, setChatOpen]);

  function switchPackage(slug: string) {
    if (slug === selectedPackageSlug) return;
    const pkg = allPackages.find((p) => p.slug === slug);
    if (!pkg) return;
    setSelectedPackageSlug(slug);
    setSelectedExcursionIds([]);
    setGuests(Math.min(Math.max(guests, pkg.minGuests), pkg.maxGuests));
    setShowPackagePicker(false);
  }

  // Trip type selector screen
  if (!tripType) {
    return (
      <div
        className="min-h-screen pt-24 pb-12 bg-cover bg-center bg-fixed relative"
        style={{ backgroundImage: "url('/images/bg-dashboard.jpg')" }}
      >
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm" />
        <div className="relative z-10 max-w-[800px] mx-auto px-4 md:px-8">
          <div className="text-center mb-10">
            <h1 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl text-slate-900 mb-3">
              Welcome, {firstName}
            </h1>
            <p className="text-slate-500 text-lg">How would you like to explore Sri Lanka?</p>
          </div>

          <div className="grid gap-5">
            {([
              {
                type: "package" as TripType,
                title: "Tour Packages",
                subtitle: "Pre-designed itineraries by our experts",
                desc: "Choose from our curated packages — hill country, wildlife, coastal escapes. Customize excursions, transport, and dining to make it yours.",
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                  </svg>
                ),
                badge: `${allPackages.length} packages`,
              },
              {
                type: "custom" as TripType,
                title: "Custom Tour",
                subtitle: "Build your own itinerary from scratch",
                desc: "Pick the destinations you want to visit, select excursions at each stop, and we'll craft a bespoke itinerary just for you.",
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.764m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                  </svg>
                ),
                badge: `${allDestinations.length} destinations`,
              },
              {
                type: "mice" as TripType,
                title: "MICE & Group Services",
                subtitle: "Conferences, incentives, and corporate events",
                desc: "Planning a corporate retreat, conference, or team-building event? Tell us your requirements and we'll handle everything.",
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                ),
                badge: "10–500+ guests",
              },
            ]).map((card) => (
              <button
                key={card.type}
                onClick={() => chooseTripType(card.type)}
                className="text-left bg-white rounded-2xl p-6 md:p-8 shadow-sm border-2 border-transparent hover:border-primary transition-colors group pressable"
              >
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                    {card.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-bold text-slate-900">{card.title}</h2>
                      <span className="px-2.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-semibold rounded-full uppercase tracking-wider">{card.badge}</span>
                    </div>
                    <p className="text-sm font-medium text-primary mb-2">{card.subtitle}</p>
                    <p className="text-sm text-slate-500 leading-relaxed">{card.desc}</p>
                  </div>
                  <svg className="w-5 h-5 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-[color,transform] flex-shrink-0 mt-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pt-24 pb-12 bg-cover bg-center bg-fixed relative"
      style={{ backgroundImage: "url('/images/bg-dashboard.jpg')" }}
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
                  className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-[background-color,color,box-shadow] group ${
                    isActive
                      ? "bg-background text-white shadow-md"
                      : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  }`}
                  title={tab.label}
                >
                  {tab.icon}
                  {isConfigured && !isActive && (
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
                  )}
                  {tab.id === "review" && !isActive && (
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-primary border-2 border-white rounded-full" />
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
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-2 py-2 flex justify-around">
            {sidebarTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                  activeTab === tab.id ? "text-slate-900" : "text-slate-400"
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
                  {activeTab === "overview" && (
                    <>{tripType === "package" ? "Your trip at a glance" : tripType === "custom" ? "Build your perfect Sri Lankan adventure" : "Your corporate event brief"} — <button onClick={() => setTripType(null)} className="text-primary hover:underline">change trip type</button></>
                  )}
                  {activeTab === "itinerary" && "Your day-by-day plan — review stops and timing"}
                  {activeTab === "destinations" && "Select the places you want to visit"}
                  {activeTab === "excursions" && `Pick up to ${EXCURSIONS_PER_DESTINATION} excursions per destination`}
                  {activeTab === "transport" && "Vehicle, accommodation, and guide for your trip"}
                  {activeTab === "dining" && "Set your meal plan and dietary requirements"}
                  {activeTab === "event-details" && "Tell us about your event"}
                  {activeTab === "venues" && "Select preferred venue types"}
                  {activeTab === "requirements" && "Special requirements and additional services"}
                  {activeTab === "review" && "Confirm everything looks right, then request your quote"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Live Price Badge */}
                {tripType !== "mice" ? (
                  <div className="hidden sm:flex flex-col items-end bg-white rounded-xl px-4 py-2 shadow-sm border border-slate-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold text-slate-900">${totalPrice.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-400">total</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      ${perPersonPrice.toLocaleString()}/person &times; {guests} guest{guests !== 1 ? "s" : ""}
                    </span>
                  </div>
                ) : (
                  <div className="hidden sm:flex flex-col items-end bg-white rounded-xl px-4 py-2 shadow-sm border border-slate-100">
                    <span className="text-sm font-semibold text-slate-900">{miceGroupSize} guests</span>
                    <span className="text-[10px] text-slate-400">Custom quote</span>
                  </div>
                )}
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                  {user.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                </div>
              </div>
            </div>

            {/* ========== OVERVIEW TAB ========== */}
            {activeTab === "overview" && (
              <>
                {/* --- Package Overview --- */}
                {tripType === "package" && (<>
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
                      <h2 className="font-[family-name:var(--font-display)] text-3xl lg:text-4xl text-slate-900 mb-2">
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
                          className="bg-background text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
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
                          onClick={() => setShowPackagePicker(!showPackagePicker)}
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
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-primary/20">
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
                            className={`text-left rounded-xl p-4 transition-[border-color,background-color] border-2 ${
                              isCurrent
                                ? "border-primary bg-primary/5"
                                : "border-slate-100 hover:border-slate-200 bg-slate-50"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h4 className="text-sm font-semibold text-slate-900 leading-tight">{pkg.name}</h4>
                              {isCurrent && (
                                <span className="px-2 py-0.5 bg-primary text-white text-[9px] font-bold rounded-full flex-shrink-0">Current</span>
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
                      <span className="font-[family-name:var(--font-display)] text-3xl text-slate-900 w-8 text-center">{guests}</span>
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
                      <button onClick={() => setActiveTab("itinerary")} className="text-xs text-primary font-semibold hover:underline">View</button>
                    </div>
                    <p className="font-[family-name:var(--font-display)] text-3xl text-slate-900">{tripInfo.days}</p>
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
                      <button onClick={() => setActiveTab("excursions")} className="text-xs text-primary font-semibold hover:underline">Edit</button>
                    </div>
                    <p className="font-[family-name:var(--font-display)] text-3xl text-slate-900">
                      {selectedExcursionIds.length}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">selected &middot; ${excursionTotal}</p>
                    <div className="mt-3 flex items-center gap-1.5">
                      {selectedExcursionIds.length > 0 ? (
                        <><span className="w-2 h-2 rounded-full bg-emerald-400" /><span className="text-[10px] text-emerald-600 font-medium">{EXCURSIONS_PER_DESTINATION} per destination</span></>
                      ) : (
                        <><span className="w-2 h-2 rounded-full bg-amber-400" /><span className="text-[10px] text-amber-600 font-medium">None selected</span></>
                      )}
                    </div>
                  </div>

                  {/* Transport Summary */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-slate-900">Transport</h3>
                      <button onClick={() => setActiveTab("transport")} className="text-xs text-primary font-semibold hover:underline">Edit</button>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      {transport === "super-luxury" ? "Super Luxury" : "Standard"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {transport === "super-luxury" ? "Mercedes V-Class" : "Toyota KDH Van"}
                    </p>
                    <div className="mt-3">
                      {transport === "super-luxury" ? (
                        <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-semibold rounded-full">+$400</span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-semibold rounded-full">Included</span>
                      )}
                    </div>
                  </div>

                  {/* Dining Summary */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-slate-900">Dining</h3>
                      <button onClick={() => setActiveTab("dining")} className="text-xs text-primary font-semibold hover:underline">Edit</button>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{mealPlan}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {dietaryPreferences.length > 0 ? dietaryPreferences.join(", ") : ""}
                      {dietaryPreferences.length > 0 && allergies.length > 0 ? " · " : ""}
                      {allergies.length > 0 ? allergies.join(", ") : dietaryPreferences.length === 0 ? "No preferences set" : ""}
                    </p>
                    <div className="mt-3 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-[10px] text-emerald-600 font-medium">Set</span>
                    </div>
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
                            <p className="font-[family-name:var(--font-display)] text-5xl text-slate-900">{fmtDay(arrDate)}</p>
                            <p className="text-sm text-slate-400">{fmtMonth(arrDate)}</p>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-8 h-px bg-slate-200" />
                            <span className="text-[10px] text-slate-400">to</span>
                            <div className="w-8 h-px bg-slate-200" />
                          </div>
                          <div className="text-center">
                            <p className="font-[family-name:var(--font-display)] text-5xl text-slate-900">{fmtDay(depDate)}</p>
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
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
                </>)}

                {/* --- Custom Tour Overview --- */}
                {tripType === "custom" && (<>
                  <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-3 py-1 bg-purple-50 text-purple-600 text-xs font-semibold rounded-full">Custom Tour</span>
                      <span className="text-xs text-slate-400">{selectedDestinationSlugs.length} destination{selectedDestinationSlugs.length !== 1 ? "s" : ""} selected</span>
                    </div>
                    <h2 className="font-[family-name:var(--font-display)] text-3xl lg:text-4xl text-slate-900 mb-2">
                      Your Bespoke Journey
                    </h2>
                    <p className="text-slate-500 mb-6">Pick destinations, choose excursions at each stop, and we&apos;ll craft a personalised itinerary.</p>
                    <div className="flex gap-3">
                      <button onClick={() => setActiveTab("destinations")} className="bg-background text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors">
                        {selectedDestinationSlugs.length > 0 ? "Edit Destinations" : "Choose Destinations"}
                      </button>
                      {selectedDestinationSlugs.length > 0 && (
                        <button onClick={() => setActiveTab("review")} className="bg-slate-100 text-slate-700 px-6 py-3 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors">
                          Review &amp; Get Quote
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Dates + Caps */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl p-5 shadow-sm">
                      <h3 className="text-sm font-semibold text-slate-900 mb-3">Travel Dates</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">Arrival</label>
                          <input type="date" value={arrivalDate} onChange={(e) => setArrivalDate(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-300" />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">Departure</label>
                          <input type="date" value={departureDate} min={arrivalDate} onChange={(e) => setDepartureDate(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-300" />
                        </div>
                      </div>
                      {datesValid && <p className="text-xs text-slate-400 mt-2">{nights} night{nights !== 1 ? "s" : ""}</p>}
                      {arrivalDate && departureDate && !datesValid && <p className="text-xs text-red-500 mt-2">Departure must be after arrival</p>}
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-sm">
                      <h3 className="text-sm font-semibold text-slate-900 mb-3">Trip Budget</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Destinations</span>
                          <span className="text-slate-900 font-medium">{selectedDestinationSlugs.length} / {DESTINATION_CAP} max</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Excursions</span>
                          <span className="text-slate-900 font-medium">{selectedExcursionIds.length} selected ({EXCURSIONS_PER_DESTINATION} per dest.)</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Stay</span>
                          <span className="text-slate-900 font-medium">{effectiveDays} days</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mt-3">~2 days per destination, up to {EXCURSIONS_PER_DESTINATION} excursions each</p>
                    </div>
                  </div>

                  {selectedDestinationSlugs.length > 0 && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedDestinationSlugs.map((slug) => {
                        const dest = allDestinations.find((d) => d.slug === slug);
                        if (!dest) return null;
                        const excCount = getExcursionsForDestination(slug).length;
                        const selectedHere = selectedExcursionIds.filter((id) =>
                          getExcursionsForDestination(slug).some((e) => e.id === id)
                        ).length;
                        return (
                          <div key={slug} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                            <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url('${dest.image}')` }} />
                            <div className="p-4">
                              <h3 className="text-sm font-semibold text-slate-900">{dest.name}</h3>
                              <p className="text-xs text-slate-400 mt-0.5">{dest.region}</p>
                              <div className="flex items-center justify-between mt-3">
                                <span className="text-xs text-slate-500">{selectedHere}/{excCount} excursions</span>
                                <button onClick={() => setActiveTab("excursions")} className="text-xs text-primary font-semibold hover:underline">Pick</button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Summary row */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-slate-900">Transport</h3>
                        <button onClick={() => setActiveTab("transport")} className="text-xs text-primary font-semibold hover:underline">Edit</button>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">{transport === "super-luxury" ? "Super Luxury" : "Standard"}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-slate-900">Dining</h3>
                        <button onClick={() => setActiveTab("dining")} className="text-xs text-primary font-semibold hover:underline">Edit</button>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">{mealPlan}</p>
                      {dietaryPreferences.length > 0 && <p className="text-xs text-slate-400 mt-1">{dietaryPreferences.join(", ")}</p>}
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-sm">
                      <h3 className="text-sm font-semibold text-slate-900 mb-3">Guests</h3>
                      <div className="flex items-center gap-3">
                        <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors" disabled={guests <= 1}>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>
                        </button>
                        <span className="font-[family-name:var(--font-display)] text-3xl text-slate-900 w-8 text-center">{guests}</span>
                        <button onClick={() => setGuests(Math.min(20, guests + 1))} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors" disabled={guests >= 20}>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </>)}

                {/* --- MICE Overview --- */}
                {tripType === "mice" && (<>
                  <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full">MICE &amp; Group</span>
                      <span className="text-xs text-slate-400">{configuredCount}/{totalSections} configured</span>
                    </div>
                    <h2 className="font-[family-name:var(--font-display)] text-3xl lg:text-4xl text-slate-900 mb-2">
                      Corporate Event Brief
                    </h2>
                    <p className="text-slate-500 mb-6">Tell us about your event and we&apos;ll prepare a comprehensive proposal with venue options, logistics, and pricing.</p>
                    <div className="flex gap-3">
                      <button onClick={() => setActiveTab("event-details")} className="bg-background text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors">
                        {miceEventType ? "Edit Event Details" : "Start Event Brief"}
                      </button>
                      {configuredCount === totalSections && (
                        <button onClick={() => setActiveTab("review")} className="bg-slate-100 text-slate-700 px-6 py-3 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors">
                          Review &amp; Submit
                        </button>
                      )}
                    </div>
                  </div>

                  {/* MICE Summary Cards */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl p-5 shadow-sm">
                      <h3 className="text-sm font-semibold text-slate-900 mb-2">Event Type</h3>
                      <p className="text-sm text-slate-600">{miceEventType || "Not set"}</p>
                      <button onClick={() => setActiveTab("event-details")} className="text-xs text-primary font-semibold hover:underline mt-2">Edit</button>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-sm">
                      <h3 className="text-sm font-semibold text-slate-900 mb-2">Group Size</h3>
                      <p className="font-[family-name:var(--font-display)] text-3xl text-slate-900">{miceGroupSize}</p>
                      <button onClick={() => setActiveTab("event-details")} className="text-xs text-primary font-semibold hover:underline mt-2">Edit</button>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-sm">
                      <h3 className="text-sm font-semibold text-slate-900 mb-2">Venues</h3>
                      <p className="text-sm text-slate-600">{miceVenuePrefs.length > 0 ? miceVenuePrefs.join(", ") : "Not set"}</p>
                      <button onClick={() => setActiveTab("venues")} className="text-xs text-primary font-semibold hover:underline mt-2">Edit</button>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-sm">
                      <h3 className="text-sm font-semibold text-slate-900 mb-2">Budget</h3>
                      <p className="text-sm text-slate-600">{miceBudgetRange}</p>
                      <button onClick={() => setActiveTab("event-details")} className="text-xs text-primary font-semibold hover:underline mt-2">Edit</button>
                    </div>
                  </div>
                </>)}

                {/* Travel Specialist — shown for all types */}
                <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white font-bold text-lg">{specialist.initials}</div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{specialist.name}</p>
                      <p className="text-xs text-slate-400">{specialist.title}</p>
                      <p className="text-xs text-emerald-500 mt-0.5">Online — typically replies in 10 min</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a href={`mailto:${specialist.email}`} className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-primary/10 hover:text-primary transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    </a>
                    <a href={`https://wa.me/${specialist.whatsapp}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-emerald-50 hover:text-emerald-500 transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.75.75 0 00.917.918l4.458-1.495A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.34 0-4.498-.794-6.218-2.128l-.435-.338-3.266 1.095 1.095-3.266-.338-.435A9.956 9.956 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z" />
                      </svg>
                    </a>
                    <button onClick={() => setChatOpen(true)} className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white hover:brightness-110 transition-[filter]">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* My Bookings */}
                {bookings.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 mb-4">My Bookings</h3>
                    <div className="space-y-3">
                      {bookings.map((b) => {
                        const statusColors: Record<string, string> = {
                          QUOTE_SENT: "bg-amber-50 text-amber-700 border-amber-200",
                          CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-200",
                          REVISION_REQUESTED: "bg-blue-50 text-blue-700 border-blue-200",
                          BALANCE_DUE: "bg-orange-50 text-orange-700 border-orange-200",
                          COMPLETED: "bg-slate-100 text-slate-600 border-slate-200",
                        };
                        const statusLabels: Record<string, string> = {
                          DRAFT: "Draft",
                          QUOTE_REQUESTED: "Quote Requested",
                          PRICING_IN_PROGRESS: "Preparing Quote",
                          QUOTE_SENT: "Quote Ready",
                          REVISION_REQUESTED: "Revision Requested",
                          CONFIRMED: "Confirmed",
                          BALANCE_DUE: "Balance Due",
                          COMPLETED: "Completed",
                          EXPIRED: "Expired",
                        };
                        const colorClass = statusColors[b.status] ?? "bg-slate-50 text-slate-600 border-slate-200";
                        const dates = b.arrivalDate && b.departureDate
                          ? `${new Date(b.arrivalDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${new Date(b.departureDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                          : "Dates TBD";

                        return (
                          <Link
                            key={b.id}
                            href={b.status === "QUOTE_SENT" || b.status === "CONFIRMED" ? `/dashboard/quotes/${b.id}` : "#"}
                            className={`block rounded-xl border p-4 transition-[border-color,background-color] ${
                              b.status === "QUOTE_SENT" ? "border-amber-200 bg-amber-50/30 hover:border-amber-300" : "border-slate-100 hover:border-slate-200"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${colorClass}`}>
                                    {statusLabels[b.status] ?? b.status}
                                  </span>
                                  <span className="text-xs text-slate-400">{b.numTravelers} traveler{b.numTravelers !== 1 ? "s" : ""}</span>
                                </div>
                                <p className="text-sm text-slate-600">{dates}</p>
                              </div>
                              <div className="text-right shrink-0">
                                {b.latestQuoteTotal != null && (
                                  <p className="text-sm font-bold text-slate-900">${b.latestQuoteTotal.toLocaleString()}</p>
                                )}
                                {b.totalPaid > 0 && (
                                  <p className="text-[10px] text-emerald-600 font-medium">${b.totalPaid.toLocaleString()} paid</p>
                                )}
                              </div>
                            </div>
                            {b.status === "QUOTE_SENT" && (
                              <p className="text-xs text-amber-600 font-medium mt-2">Review your quote →</p>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ========== ITINERARY TAB ========== */}
            {activeTab === "itinerary" && (
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-2xl p-5 flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
                  <div>
                    <p className="text-sm font-medium text-blue-900">Your itinerary is curated by our experts</p>
                    <p className="text-xs text-blue-700/70 mt-1">
                      Want to swap a stop, add a rest day, or rearrange the order? Message {specialist.name.split(" ")[0]} in the chat and we&apos;ll adjust it for you.
                    </p>
                    <button
                      onClick={() => setChatOpen(true)}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.67 1.09-.086 2.17-.208 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>
                      Chat with {specialist.name.split(" ")[0]}
                    </button>
                  </div>
                </div>
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
                <TabNavigation tabs={sidebarTabs} activeTab={activeTab} onNavigate={setActiveTab} />
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
                        {selectedExcursionIds.length}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Excursion total</p>
                      <p className="text-2xl font-bold text-slate-900">${excursionTotal}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-3">
                    Up to {EXCURSIONS_PER_DESTINATION} excursions per destination. Select from each destination below.
                  </p>
                </div>

                {/* Grid — grouped by destination for custom tours, flat for packages */}
                {tripType === "custom" && selectedDestinationSlugs.length > 0 ? (
                  <div className="space-y-6">
                    {selectedDestinationSlugs.map((slug) => {
                      const dest = allDestinations.find((d) => d.slug === slug);
                      const destExcursions = getExcursionsForDestination(slug).map((exc) => ({
                        ...exc,
                        price: EXCURSION_PRICES[exc.id] ?? 35,
                      }));
                      if (destExcursions.length === 0) return null;
                      const destSelectedCount = selectedExcursionIds.filter((eid) =>
                        destExcursions.some((e) => e.id === eid)
                      ).length;
                      return (
                        <div key={slug}>
                          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary" />
                            {dest?.name ?? slug}
                            <span className={`text-xs font-medium ${destSelectedCount >= EXCURSIONS_PER_DESTINATION ? "text-primary" : "text-slate-400"}`}>{destSelectedCount} / {EXCURSIONS_PER_DESTINATION}</span>
                          </h3>
                          <div className="grid md:grid-cols-2 gap-4">
                            {destExcursions.map((exc) => {
                              const picked = selectedExcursionIds.includes(exc.id);
                              const atCap = destSelectedCount >= EXCURSIONS_PER_DESTINATION && !picked;
                              return (
                                <button
                                  key={exc.id}
                                  onClick={() => toggleExcursion(exc.id)}
                                  disabled={atCap}
                                  className={`text-left bg-white rounded-2xl p-5 shadow-sm transition-[border-color,background-color] border-2 ${
                                    picked
                                      ? "border-primary ring-1 ring-primary/20"
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
                                    <span className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-colors ${picked ? "bg-primary border-primary" : "border-slate-200"}`}>
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
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {(() => {
                      const destSlugs = [...new Set(activeExcursions.map((e) => e.destinationSlug))];
                      return destSlugs.map((slug) => {
                        const dest = allDestinations.find((d) => d.slug === slug);
                        const destExcursions = activeExcursions.filter((e) => e.destinationSlug === slug);
                        const destSelectedCount = selectedExcursionIds.filter((eid) =>
                          destExcursions.some((e) => e.id === eid)
                        ).length;
                        return (
                          <div key={slug}>
                            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-primary" />
                              {dest?.name ?? slug}
                              <span className={`text-xs font-medium ${destSelectedCount >= EXCURSIONS_PER_DESTINATION ? "text-primary" : "text-slate-400"}`}>{destSelectedCount} / {EXCURSIONS_PER_DESTINATION}</span>
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                              {destExcursions.map((exc) => {
                                const picked = selectedExcursionIds.includes(exc.id);
                                const atCap = destSelectedCount >= EXCURSIONS_PER_DESTINATION && !picked;
                                return (
                                  <button
                                    key={exc.id}
                                    onClick={() => toggleExcursion(exc.id)}
                                    disabled={atCap}
                                    className={`text-left bg-white rounded-2xl p-5 shadow-sm transition-[border-color,background-color] border-2 ${
                                      picked
                                        ? "border-primary ring-1 ring-primary/20"
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
                                      <span className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-colors ${picked ? "bg-primary border-primary" : "border-slate-200"}`}>
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
                        );
                      });
                    })()}
                  </div>
                )}
                <TabNavigation tabs={sidebarTabs} activeTab={activeTab} onNavigate={setActiveTab} />
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
                      priceClass: "text-primary bg-primary/10",
                      features: ["Leather reclining seats", "On-board Wi-Fi", "Mini fridge with refreshments", "Noise-cancelling cabin", "Premium sound system", "Tinted privacy glass"],
                    },
                  ]).map((t) => (
                    <button
                      key={t.tier}
                      onClick={() => setTransport(t.tier)}
                      className={`text-left bg-white rounded-2xl p-6 shadow-sm transition-[border-color,background-color] border-2 ${
                        transport === t.tier
                          ? "border-primary ring-1 ring-primary/20"
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

                {/* Accommodation Section */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Where You&apos;ll Stay</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {ACCOMMODATION_TIERS.map((tier) => (
                      <button
                        key={tier.id}
                        onClick={() => setAccommodation(tier.id)}
                        className={`text-left rounded-2xl p-5 shadow-sm transition-[border-color,background-color] border-2 ${
                          accommodation === tier.id
                            ? "border-primary ring-1 ring-primary/20 bg-white"
                            : "border-transparent hover:border-slate-200 bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="text-sm font-semibold text-slate-900">{tier.name}</h4>
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full flex-shrink-0 ${
                            tier.priceModifier === 0
                              ? "text-emerald-600 bg-emerald-50"
                              : "text-primary bg-primary/10"
                          }`}>
                            {tier.priceModifier === 0 ? "Included" : `+$${tier.priceModifier}/night`}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">{tier.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Guide Language Section */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-900 mb-1">Your Guide</h3>
                  <p className="text-xs text-slate-400 mb-4">A multilingual guide accompanies you throughout your trip</p>
                  <select
                    value={guideLanguage}
                    onChange={(e) => setGuideLanguage(e.target.value)}
                    className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-300 w-full max-w-xs"
                  >
                    {GUIDE_LANGUAGES.map((lang) => (
                      <option key={lang.id} value={lang.id}>{lang.label}</option>
                    ))}
                  </select>
                </div>
                <TabNavigation tabs={sidebarTabs} activeTab={activeTab} onNavigate={setActiveTab} />
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
                        className={`text-left bg-white rounded-2xl p-5 shadow-sm transition-[border-color,background-color] border-2 ${
                          mealPlan === mp.id
                            ? "border-primary ring-1 ring-primary/20"
                            : "border-transparent hover:border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${mealPlan === mp.id ? "border-primary" : "border-slate-200"}`}>
                            {mealPlan === mp.id && <span className="w-2 h-2 rounded-full bg-primary" />}
                          </span>
                          <span className="text-sm font-semibold text-slate-900">{mp.id}</span>
                        </div>
                        <p className="text-xs text-slate-500 pl-7">{mp.desc}</p>
                        <p className={`text-xs font-semibold mt-2 pl-7 ${mp.adj === "Included" ? "text-emerald-600" : "text-slate-500"}`}>{mp.adj}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dietary Preferences & Allergies */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 mb-3">Dietary Preferences</h3>
                      <div className="flex flex-wrap gap-2">
                        {DIETARY_PREFERENCES.map((p) => {
                          const on = dietaryPreferences.includes(p);
                          return (
                            <button
                              key={p}
                              onClick={() => toggleDietaryPref(p)}
                              className={`px-3.5 py-1.5 rounded-full text-sm border transition-colors ${
                                on
                                  ? "bg-primary/10 border-primary/30 text-primary font-medium"
                                  : "bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-200"
                              }`}
                            >
                              {p}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 mb-3">Allergies &amp; Restrictions</h3>
                      <div className="flex flex-wrap gap-2">
                        {COMMON_ALLERGIES.map((a) => {
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
                    </div>
                  </div>
                  <textarea
                    rows={3}
                    value={dietaryNotes}
                    onChange={(e) => setDietaryNotes(e.target.value)}
                    className="mt-4 w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-slate-300 resize-none"
                    placeholder="Any other dietary notes or specific preferences..."
                  />
                </div>
                <TabNavigation tabs={sidebarTabs} activeTab={activeTab} onNavigate={setActiveTab} />
              </div>
            )}

            {/* ========== DESTINATIONS TAB (Custom Tour) ========== */}
            {activeTab === "destinations" && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                      Select up to <span className="font-semibold text-slate-700">{DESTINATION_CAP}</span> destinations for your {effectiveDays}-day trip (~2 days per stop).
                    </p>
                    <span className="text-sm font-bold text-slate-900">{selectedDestinationSlugs.length}/{DESTINATION_CAP}</span>
                  </div>
                  {selectedDestinationSlugs.length > DESTINATION_CAP && (
                    <div className="mt-3 px-4 py-3 bg-amber-50 rounded-xl flex items-start gap-2">
                      <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                      <p className="text-sm text-amber-700">
                        Too many destinations for {effectiveDays} days. Remove {selectedDestinationSlugs.length - DESTINATION_CAP} or extend your stay below.
                      </p>
                    </div>
                  )}
                  {selectedDestinationSlugs.length >= DESTINATION_CAP && (
                    <div className="mt-3 px-4 py-4 bg-primary/5 rounded-xl border border-primary/20">
                      <p className="text-sm font-medium text-slate-800">Your {effectiveDays}-day stay limits you to {DESTINATION_CAP} destinations</p>
                      <p className="text-xs text-slate-500 mt-1">Extend your departure to visit more places.</p>
                      <div className="flex items-center gap-3 mt-3">
                        <label className="text-xs text-slate-500 flex-shrink-0">Depart</label>
                        <input
                          type="date"
                          value={departureDate}
                          min={arrivalDate}
                          onChange={(e) => setDepartureDate(e.target.value)}
                          className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-primary transition-colors"
                        />
                        {datesValid && (() => {
                          const newCap = Math.max(1, Math.floor((effectiveDays + 1) / 2));
                          return newCap > DESTINATION_CAP ? (
                            <span className="text-[11px] text-slate-400">+1 day → {newCap} destinations</span>
                          ) : null;
                        })()}
                      </div>
                    </div>
                  )}
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allDestinations.map((dest) => {
                    const picked = selectedDestinationSlugs.includes(dest.slug);
                    const atCap = selectedDestinationSlugs.length >= DESTINATION_CAP && !picked;
                    return (
                      <button
                        key={dest.slug}
                        onClick={() => setSelectedDestinationSlugs(
                          picked ? selectedDestinationSlugs.filter((s) => s !== dest.slug) : atCap ? selectedDestinationSlugs : [...selectedDestinationSlugs, dest.slug]
                        )}
                        disabled={atCap}
                        className={`text-left rounded-2xl overflow-hidden shadow-sm transition-[border-color,background-color] border-2 ${
                          picked ? "border-primary ring-1 ring-primary/20" : atCap ? "border-transparent opacity-40 cursor-not-allowed" : "border-transparent hover:border-slate-200"
                        }`}
                      >
                        <div className="relative h-36 bg-cover bg-center" style={{ backgroundImage: `url('${dest.image}')` }}>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          {picked && (
                            <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                          <div className="absolute bottom-3 left-3">
                            <span className="text-[10px] text-white/70 uppercase tracking-wider font-medium">{dest.region}</span>
                          </div>
                        </div>
                        <div className="bg-white p-4">
                          <h3 className="text-sm font-semibold text-slate-900">{dest.name}</h3>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{dest.tagline}</p>
                          <p className="text-xs text-slate-400 mt-2">{getExcursionsForDestination(dest.slug).length} excursions available</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {selectedDestinationSlugs.length > 0 && (
                  <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
                    <p className="text-sm text-slate-600">
                      {selectedDestinationSlugs.length} destination{selectedDestinationSlugs.length !== 1 ? "s" : ""} selected &middot;{" "}
                      {customExcursions.length} excursions available
                    </p>
                  </div>
                )}
                <TabNavigation tabs={sidebarTabs} activeTab={activeTab} onNavigate={setActiveTab} />
              </div>
            )}

            {/* ========== EVENT DETAILS TAB (MICE) ========== */}
            {activeTab === "event-details" && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Event Type</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {MICE_EVENT_TYPES.map((et) => (
                      <button
                        key={et}
                        onClick={() => setMiceEventType(et)}
                        className={`px-4 py-3 rounded-xl text-sm font-medium transition-[border-color,background-color] border-2 ${
                          miceEventType === et
                            ? "border-primary bg-primary/5 text-slate-900"
                            : "border-slate-100 text-slate-600 hover:border-slate-200"
                        }`}
                      >
                        {et}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-900 mb-4">Group Size</h3>
                    <div className="flex items-center gap-4">
                      <button onClick={() => setMiceGroupSize(Math.max(10, miceGroupSize - 10))} className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>
                      </button>
                      <input
                        type="number"
                        value={miceGroupSize}
                        onChange={(e) => setMiceGroupSize(Math.max(10, parseInt(e.target.value) || 10))}
                        className="w-24 text-center bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-lg font-bold text-slate-900 focus:outline-none focus:border-slate-300"
                      />
                      <button onClick={() => setMiceGroupSize(miceGroupSize + 10)} className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Minimum 10 guests for group services</p>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-900 mb-4">Budget Range</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {["$5k–$15k", "$15k–$50k", "$50k–$100k", "$100k+"].map((b) => (
                        <button
                          key={b}
                          onClick={() => setMiceBudgetRange(b)}
                          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-[border-color,background-color] border-2 ${
                            miceBudgetRange === b
                              ? "border-primary bg-primary/5 text-slate-900"
                              : "border-slate-100 text-slate-600 hover:border-slate-200"
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Event Dates</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">Start Date</label>
                      <input type="date" value={arrivalDate} onChange={(e) => setArrivalDate(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-300" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">End Date</label>
                      <input type="date" value={departureDate} min={arrivalDate} onChange={(e) => setDepartureDate(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-300" />
                    </div>
                  </div>
                  {datesValid && <p className="text-xs text-slate-400 mt-2">{nights} day{nights !== 1 ? "s" : ""}</p>}
                </div>
                <TabNavigation tabs={sidebarTabs} activeTab={activeTab} onNavigate={setActiveTab} />
              </div>
            )}

            {/* ========== VENUES TAB (MICE) ========== */}
            {activeTab === "venues" && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <p className="text-sm text-slate-500">Select venue types that suit your event. We&apos;ll match options based on your group size and requirements.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { id: "hotel-ballroom", label: "Hotel Ballroom", desc: "5-star hotel conference facilities with accommodation", capacity: "50–500" },
                    { id: "resort", label: "Beach Resort", desc: "Coastal venues for incentive trips and retreats", capacity: "20–200" },
                    { id: "heritage", label: "Heritage Venue", desc: "Colonial-era estates, tea factories, and cultural sites", capacity: "30–150" },
                    { id: "outdoor", label: "Outdoor Venue", desc: "Gardens, wildlife parks, and adventure settings", capacity: "20–300" },
                    { id: "convention", label: "Convention Centre", desc: "Purpose-built conference and exhibition spaces", capacity: "100–1000" },
                    { id: "boutique", label: "Boutique Property", desc: "Intimate private villas and exclusive-use properties", capacity: "10–50" },
                  ].map((v) => {
                    const picked = miceVenuePrefs.includes(v.id);
                    return (
                      <button
                        key={v.id}
                        onClick={() => setMiceVenuePrefs(
                          picked ? miceVenuePrefs.filter((x) => x !== v.id) : [...miceVenuePrefs, v.id]
                        )}
                        className={`text-left bg-white rounded-2xl p-5 shadow-sm transition-[border-color,background-color] border-2 ${
                          picked ? "border-primary ring-1 ring-primary/20" : "border-transparent hover:border-slate-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="text-sm font-semibold text-slate-900">{v.label}</h4>
                            <p className="text-xs text-slate-500 mt-1">{v.desc}</p>
                            <p className="text-xs text-slate-400 mt-2">Capacity: {v.capacity}</p>
                          </div>
                          <span className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-colors ${picked ? "bg-primary border-primary" : "border-slate-200"}`}>
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
                <TabNavigation tabs={sidebarTabs} activeTab={activeTab} onNavigate={setActiveTab} />
              </div>
            )}

            {/* ========== REQUIREMENTS TAB (MICE) ========== */}
            {activeTab === "requirements" && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Additional Services</h3>
                  <div className="flex flex-wrap gap-2">
                    {["AV Equipment", "Simultaneous Translation", "Team Building Activities", "Gala Dinner", "Airport Transfers", "Branded Materials", "Photography/Video", "Entertainment", "Wellness Program", "Cultural Excursions"].map((svc) => {
                      const on = miceRequirements.includes(svc);
                      return (
                        <button
                          key={svc}
                          onClick={() => setMiceRequirements(
                            on ? miceRequirements.replace(svc, "").replace(/,\s*,/g, ",").replace(/^,\s*|,\s*$/g, "") : miceRequirements ? `${miceRequirements}, ${svc}` : svc
                          )}
                          className={`px-3.5 py-1.5 rounded-full text-sm border transition-colors ${
                            on ? "bg-primary/10 border-primary/30 text-primary font-medium" : "bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-200"
                          }`}
                        >
                          {svc}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Special Requirements &amp; Notes</h3>
                  <textarea
                    rows={5}
                    value={miceRequirements}
                    onChange={(e) => setMiceRequirements(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-slate-300 resize-none"
                    placeholder="Describe any specific requirements — stage setup, dietary needs for the group, branding, accessibility requirements, preferred language for guides..."
                  />
                </div>

                <TabNavigation tabs={sidebarTabs} activeTab={activeTab} onNavigate={setActiveTab} />
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
                    <h2 className="font-[family-name:var(--font-display)] text-3xl text-slate-900 mb-3">Quote Requested</h2>
                    <p className="text-slate-500 max-w-md mx-auto mb-6">
                      {specialist.name.split(" ")[0]} will review your selections and send a detailed quote within 24 hours. You&apos;ll get an email at {user.email}.
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
                    {/* Travel Dates — all types */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center justify-between">
                      <div>
                        <h4 className="text-xs text-slate-400 uppercase tracking-wider mb-1">{tripType === "mice" ? "Event Dates" : "Travel Dates"}</h4>
                        <p className="text-sm font-semibold text-slate-900">
                          {fmtDay(arrDate)} {fmtMonth(arrDate)} – {fmtDay(depDate)} {fmtMonth(depDate)} {fmtYear(depDate)}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {nights} {tripType === "mice" ? "day" : "night"}{nights !== 1 ? "s" : ""}
                          {tripType !== "mice" && <> &middot; {guests} guest{guests !== 1 ? "s" : ""}</>}
                          {tripType === "mice" && <> &middot; {miceGroupSize} attendees</>}
                        </p>
                      </div>
                      {!datesValid && (
                        <span className="px-3 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-full">Invalid dates</span>
                      )}
                    </div>

                    {/* MICE Review Summary */}
                    {tripType === "mice" && (
                      <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <h3 className="text-sm font-semibold text-slate-900 mb-4">Event Brief Summary</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Event Type</span>
                            <span className="text-slate-900 font-medium">{miceEventType || "Not specified"}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Group Size</span>
                            <span className="text-slate-900 font-medium">{miceGroupSize} attendees</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Budget Range</span>
                            <span className="text-slate-900 font-medium">{miceBudgetRange}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Venue Preferences</span>
                            <span className="text-slate-900 font-medium">{miceVenuePrefs.length > 0 ? miceVenuePrefs.length + " selected" : "None"}</span>
                          </div>
                          {miceRequirements && (
                            <div className="border-t border-slate-100 pt-3">
                              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Requirements</p>
                              <p className="text-sm text-slate-700">{miceRequirements}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Package/Custom Price Breakdown */}
                    {tripType !== "mice" && (
                      <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <h3 className="text-sm font-semibold text-slate-900 mb-4">Price Breakdown</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Guests</span>
                            <span className="text-slate-900 font-medium">{guests} {guests === 1 ? "person" : "people"}</span>
                          </div>
                          {tripType === "package" && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-500">Base package ({tripInfo.days} days)</span>
                              <span className="text-slate-900 font-medium">${tripInfo.basePrice.toLocaleString()} &times; {guests}</span>
                            </div>
                          )}
                          {tripType === "custom" && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-500">Destinations ({selectedDestinationSlugs.length})</span>
                              <span className="text-slate-900 font-medium">${customBasePrice.toLocaleString()} &times; {guests}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Excursions ({selectedExcursionIds.length})</span>
                            <span className="text-slate-900 font-medium">${excursionTotal} &times; {guests}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Transport ({transport === "super-luxury" ? "Super Luxury" : "Standard"})</span>
                            <span className="text-slate-900 font-medium">{transportAddon > 0 ? `+$${transportAddon} × ${guests}` : "Included"}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Accommodation ({ACCOMMODATION_TIERS.find((t) => t.id === accommodation)?.name ?? accommodation})</span>
                            <span className="text-slate-900 font-medium">{accommodationTotal > 0 ? `+$${accommodationTotal} × ${guests}` : "Included"}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Guide language</span>
                            <span className="text-slate-900 font-medium">{GUIDE_LANGUAGES.find((l) => l.id === guideLanguage)?.label ?? guideLanguage}</span>
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
                              {tripType === "package"
                                ? `This package requires ${tripInfo.minGuests}–${tripInfo.maxGuests} guests. Please adjust your group size.`
                                : "Please set a valid number of guests."}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Trip Summary Card */}
                    {tripType === "package" && (
                      <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs text-slate-400 uppercase tracking-wider">Your Package</h4>
                          <button onClick={() => setShowPackagePicker(true)} className="text-xs text-primary font-semibold hover:underline">Change</button>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">{activePackage.name}</h3>
                        <p className="text-sm text-slate-500 mb-3">{activePackage.durationDays} days &middot; {activePackage.itinerary.length} stops</p>
                        <div className="flex flex-wrap gap-1.5">
                          {activePackage.itinerary.map((day) => (
                            <span key={day.title} className="px-2.5 py-1 bg-slate-50 text-slate-600 text-xs rounded-full">{day.title}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {tripType === "custom" && (
                      <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs text-slate-400 uppercase tracking-wider">Your Destinations</h4>
                          <button onClick={() => setActiveTab("destinations")} className="text-xs text-primary font-semibold hover:underline">Change</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedDestinationSlugs.map((slug) => {
                            const d = allDestinations.find((dest) => dest.slug === slug);
                            return (
                              <span key={slug} className="px-3 py-1.5 bg-slate-50 text-slate-700 text-sm font-medium rounded-full">{d?.name ?? slug}</span>
                            );
                          })}
                          {selectedDestinationSlugs.length === 0 && <p className="text-sm text-slate-400">No destinations selected</p>}
                        </div>
                      </div>
                    )}

                    {/* Summary Cards */}
                    {tripType !== "mice" && (
                      <>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="bg-white rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-xs text-slate-400 uppercase tracking-wider">Excursions ({selectedExcursionIds.length})</h4>
                              <button onClick={() => setActiveTab("excursions")} className="text-xs text-primary font-semibold hover:underline">Change</button>
                            </div>
                            {selectedExcursionIds.length > 0 ? (
                              <div className="space-y-2">
                                {selectedExcursionIds.map((id) => {
                                  const exc = activeExcursions.find((e) => e.id === id);
                                  return (
                                    <div key={id} className="flex items-center justify-between">
                                      <span className="text-sm text-slate-700 truncate">{exc?.name ?? id}</span>
                                      <span className="text-xs text-slate-400 flex-shrink-0 ml-2">${exc?.price ?? 0}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-sm text-slate-400">None selected yet</p>
                            )}
                          </div>

                          <div className="bg-white rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-xs text-slate-400 uppercase tracking-wider">Dining &amp; Dietary</h4>
                              <button onClick={() => setActiveTab("dining")} className="text-xs text-primary font-semibold hover:underline">Change</button>
                            </div>
                            <p className="text-sm text-slate-700 font-medium">{mealPlan}</p>
                            {dietaryPreferences.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {dietaryPreferences.map((p) => (
                                  <span key={p} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">{p}</span>
                                ))}
                              </div>
                            )}
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

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="bg-white rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-xs text-slate-400 uppercase tracking-wider">Transport &amp; Stay</h4>
                              <button onClick={() => setActiveTab("transport")} className="text-xs text-primary font-semibold hover:underline">Change</button>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-500">Vehicle</span>
                                <span className="text-sm text-slate-700 font-medium">{transport === "super-luxury" ? "Super Luxury" : "Standard"}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-500">Accommodation</span>
                                <span className="text-sm text-slate-700 font-medium">{ACCOMMODATION_TIERS.find((t) => t.id === accommodation)?.name ?? accommodation}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-500">Guide</span>
                                <span className="text-sm text-slate-700 font-medium">{GUIDE_LANGUAGES.find((l) => l.id === guideLanguage)?.label ?? guideLanguage}-speaking</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white rounded-2xl p-5 shadow-sm">
                            <h4 className="text-xs text-slate-400 uppercase tracking-wider mb-3">Included as Standard</h4>
                            <div className="space-y-2">
                              {["Airport pickup & drop-off", "Private chauffeur throughout", "24/7 on-ground support"].map((item) => (
                                <div key={item} className="flex items-center gap-2 text-sm text-slate-700">
                                  <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                  {item}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* MICE venue preferences */}
                    {tripType === "mice" && miceVenuePrefs.length > 0 && (
                      <div className="bg-white rounded-2xl p-5 shadow-sm">
                        <h4 className="text-xs text-slate-400 uppercase tracking-wider mb-3">Venue Preferences</h4>
                        <div className="flex flex-wrap gap-2">
                          {miceVenuePrefs.map((v) => (
                            <span key={v} className="px-3 py-1.5 bg-slate-50 text-slate-700 text-sm font-medium rounded-full">{v}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CTA */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
                      <h3 className="font-[family-name:var(--font-display)] text-2xl text-slate-900 mb-2">
                        {tripType === "mice" ? "Ready to submit?" : "Ready to go?"}
                      </h3>
                      <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
                        {tripType === "mice"
                          ? "Our MICE team will review your brief and prepare a comprehensive proposal within 48 hours."
                          : `${specialist.name.split(" ")[0]} will review your selections and prepare a detailed quotation. No payment required yet.`}
                      </p>
                      <button
                        onClick={async () => {
                          setQuoteRequested(true);
                          if (store.sessionId) {
                            await requestQuote(store.sessionId);
                          }
                        }}
                        disabled={tripType === "mice" ? !miceEventType || !datesValid : !guestsValid || !datesValid}
                        className="bg-primary text-on-primary px-10 py-4 rounded-xl text-base font-bold hover:brightness-110 transition-colors shadow-lg shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed pressable"
                      >
                        {tripType === "mice" ? "Submit Event Inquiry" : "Request My Quote"}
                      </button>
                      <p className="text-xs text-slate-400 mt-3">
                        {tripType === "mice" ? "Typically responds within 48 hours" : "Typically responds within 24 hours"}
                      </p>
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
          <div className="bg-background px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white font-bold text-xs">{specialist.initials}</div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-background rounded-full" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">{specialist.name.split(" ")[0]}</p>
                <p className="text-white/50 text-xs">{specialist.title}</p>
              </div>
            </div>
            <button onClick={() => setChatOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 max-h-[320px] overflow-y-auto p-4 space-y-3">
            {chatMessages.map((msg, i) => {
              if (msg.messageType === "SYSTEM") {
                return (
                  <div key={msg.id ?? i} className="flex justify-center">
                    <p className="text-xs text-slate-400 italic">{msg.text}</p>
                  </div>
                );
              }
              if (msg.messageType === "SUGGESTION" && msg.id && msg.suggestionData) {
                return (
                  <div key={msg.id} className="flex justify-start">
                    <SuggestionCard
                      messageId={msg.id}
                      suggestion={msg.suggestionData as { type: string; itemId?: string; title?: string; description?: string; price?: number }}
                      status={msg.suggestionStatus ?? null}
                    />
                  </div>
                );
              }
              return (
                <div key={msg.id ?? i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.from === "user" ? "bg-primary text-on-primary rounded-br-md" : "bg-slate-100 text-slate-700 rounded-bl-md"}`}>
                    {msg.text}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="border-t border-slate-100 p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!chatInput.trim() || isSending) return;
                const text = chatInput.trim();
                setChatMessages((prev) => [...prev, { from: "user", text, messageType: "TEXT" }]);
                setChatInput("");
                startSendTransition(async () => {
                  if (store.sessionId) {
                    await sendChatMessage({ sessionId: store.sessionId, content: text });
                  }
                });
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-slate-50 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-shadow"
              />
              <button type="submit" className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary hover:brightness-110 transition-colors flex-shrink-0 pressable">
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
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-on-primary shadow-lg shadow-primary/30 flex items-center justify-center hover:brightness-110 hover:scale-105 transition-[transform,filter] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] pressable"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
        </button>
      )}
    </div>
  );
}
