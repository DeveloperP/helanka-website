"use client";

import { useEffect, useRef } from "react";
import { useTripSessionStore } from "@/stores/trip-session-store";

const DEBOUNCE_MS = 1500;
const STORAGE_KEY = "helanka-wizard-state";

export function useSessionSync() {
  const store = useTripSessionStore();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) {
        tryRestoreFromServer();
        return;
      }
      sessionStorage.removeItem(STORAGE_KEY);
      const w = JSON.parse(raw);

      store.hydrate({
        tripType: w.tripType ?? null,
        selectedPackageSlug: w.packageSlug ?? "hill-country-explorer",
        selectedDestinationSlugs: w.destinations ?? [],
        selectedExcursionIds: w.excursionIds ?? [],
        transport: w.transport ?? "standard",
        mealPlan: w.mealPlan ?? "Full Board",
        allergies: w.allergies ?? [],
        dietaryNotes: w.dietaryNotes ?? "",
        guests: w.guests ?? 2,
        arrivalDate: w.arrivalDate ?? "",
        departureDate: w.departureDate ?? "",
        guideLanguage: w.guideLanguage ?? "english",
        accommodation: w.accommodation ?? "boutique",
        miceEventType: w.miceEventType ?? "",
        miceGroupSize: w.miceGroupSize ?? 30,
        miceVenuePrefs: w.miceVenuePrefs ?? [],
        miceRequirements: w.miceRequirements ?? "",
        miceBudgetRange: w.miceBudgetRange ?? "$5k–$15k",
      });

      if (w.tripType) {
        store.set("activeTab", "overview");
      }

      createServerSession();
    } catch {
      // sessionStorage unavailable or malformed — continue in memory-only mode
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!store.sessionId) return;

    const unsub = useTripSessionStore.subscribe((state, prev) => {
      const stateChanged =
        state.tripType !== prev.tripType ||
        state.selectedPackageSlug !== prev.selectedPackageSlug ||
        state.selectedDestinationSlugs !== prev.selectedDestinationSlugs ||
        state.selectedExcursionIds !== prev.selectedExcursionIds ||
        state.transport !== prev.transport ||
        state.guests !== prev.guests ||
        state.arrivalDate !== prev.arrivalDate ||
        state.departureDate !== prev.departureDate ||
        state.mealPlan !== prev.mealPlan ||
        state.allergies !== prev.allergies ||
        state.guideLanguage !== prev.guideLanguage ||
        state.accommodation !== prev.accommodation ||
        state.miceEventType !== prev.miceEventType ||
        state.activeTab !== prev.activeTab;

      if (!stateChanged) return;

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        syncToServer(state);
      }, DEBOUNCE_MS);
    });

    return () => {
      unsub();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [store.sessionId]);

  return {
    sessionId: store.sessionId,
    isLoading: false,
  };
}

function storeStateToServerState(s: ReturnType<typeof useTripSessionStore.getState>) {
  return {
    tripType: s.tripType as "package" | "custom" | "mice",
    packageSlug: s.selectedPackageSlug,
    destinations: s.selectedDestinationSlugs,
    excursionIds: s.selectedExcursionIds,
    transport: s.transport,
    mealPlan: s.mealPlan,
    allergies: s.allergies,
    dietaryNotes: s.dietaryNotes,
    guests: s.guests,
    arrivalDate: s.arrivalDate,
    departureDate: s.departureDate,
    guideLanguage: s.guideLanguage,
    accommodation: s.accommodation,
    miceEventType: s.miceEventType,
    miceGroupSize: s.miceGroupSize,
    miceVenuePrefs: s.miceVenuePrefs,
    miceRequirements: s.miceRequirements,
    miceBudgetRange: s.miceBudgetRange,
  };
}

async function createServerSession() {
  try {
    const { createTripSession } = await import("@/actions/session-actions");
    const store = useTripSessionStore.getState();
    if (!store.tripType) return;
    const state = storeStateToServerState(store);
    const result = await createTripSession({ state, activeTab: "overview" });
    if (result?.sessionId) {
      useTripSessionStore.getState().setSessionId(result.sessionId);
    }
  } catch {
    // DB unavailable — continue in memory-only mode
  }
}

async function tryRestoreFromServer() {
  try {
    const { getActiveTripSession } = await import("@/actions/session-actions");
    const session = await getActiveTripSession();
    if (!session) return;
    const state = session.state as Record<string, unknown>;
    useTripSessionStore.getState().hydrate({
      sessionId: session.id,
      tripType: (state.tripType as "package" | "custom" | "mice") ?? null,
      selectedPackageSlug: (state.selectedPackageSlug as string) ?? "hill-country-explorer",
      selectedDestinationSlugs: (state.selectedDestinationSlugs as string[]) ?? [],
      selectedExcursionIds: (state.selectedExcursionIds as string[]) ?? [],
      transport: (state.transport as "standard" | "super-luxury") ?? "standard",
      mealPlan: (state.mealPlan as string) ?? "Full Board",
      allergies: (state.allergies as string[]) ?? [],
      dietaryNotes: (state.dietaryNotes as string) ?? "",
      guests: (state.guests as number) ?? 2,
      arrivalDate: (state.arrivalDate as string) ?? "",
      departureDate: (state.departureDate as string) ?? "",
      guideLanguage: (state.guideLanguage as string) ?? "english",
      accommodation: (state.accommodation as string) ?? "boutique",
      miceEventType: (state.miceEventType as string) ?? "",
      miceGroupSize: (state.miceGroupSize as number) ?? 30,
      miceVenuePrefs: (state.miceVenuePrefs as string[]) ?? [],
      miceRequirements: (state.miceRequirements as string) ?? "",
      miceBudgetRange: (state.miceBudgetRange as string) ?? "$5k–$15k",
    });
  } catch {
    // DB unavailable — continue in memory-only mode
  }
}

async function syncToServer(storeState: ReturnType<typeof useTripSessionStore.getState>) {
  try {
    const { updateTripSessionState } = await import("@/actions/session-actions");
    const state = storeStateToServerState(storeState);
    await updateTripSessionState({
      sessionId: storeState.sessionId!,
      state,
      activeTab: storeState.activeTab,
    });
  } catch {
    // Sync failed — state preserved in memory, will retry on next change
  }
}
