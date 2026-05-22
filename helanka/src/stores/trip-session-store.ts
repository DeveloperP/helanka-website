import { create } from "zustand";

export type TripType = "package" | "custom" | "mice";
export type TransportTier = "standard" | "super-luxury";
export type TabId = "overview" | "itinerary" | "excursions" | "transport" | "dining" | "review" | "destinations" | "event-details" | "venues" | "requirements";

export interface ChatMessage {
  id?: string;
  from: "user" | "rep";
  text: string;
  messageType?: "TEXT" | "SUGGESTION" | "SYSTEM";
  suggestionData?: Record<string, unknown> | null;
  suggestionStatus?: "PENDING" | "ACCEPTED" | "DISMISSED" | null;
}

export interface TripSessionState {
  tripType: TripType | null;
  activeTab: TabId;
  selectedPackageSlug: string;
  showPackagePicker: boolean;
  selectedDestinationSlugs: string[];
  selectedExcursionIds: string[];
  transport: TransportTier;
  guideLanguage: string;
  accommodation: string;
  guests: number;
  arrivalDate: string;
  departureDate: string;
  mealPlan: string;
  allergies: string[];
  dietaryNotes: string;
  quoteRequested: boolean;
  miceEventType: string;
  miceGroupSize: number;
  miceVenuePrefs: string[];
  miceRequirements: string;
  miceBudgetRange: string;
}

interface ChatState {
  chatOpen: boolean;
  chatMessages: ChatMessage[];
  chatInput: string;
}

interface SessionMeta {
  sessionId: string | null;
  syncing: boolean;
  lastSyncedAt: number | null;
}

export interface TripSessionStore extends TripSessionState, ChatState, SessionMeta {
  set: <K extends keyof TripSessionState>(key: K, value: TripSessionState[K]) => void;
  setChatOpen: (open: boolean) => void;
  setChatMessages: (msgs: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
  setChatInput: (input: string) => void;
  setSessionId: (id: string | null) => void;
  setSyncing: (syncing: boolean) => void;
  hydrate: (state: Partial<TripSessionState> & { sessionId?: string }) => void;
  reset: () => void;
  getSerializableState: () => TripSessionState;
}

const DEFAULT_STATE: TripSessionState = {
  tripType: null,
  activeTab: "overview",
  selectedPackageSlug: "hill-country-explorer",
  showPackagePicker: false,
  selectedDestinationSlugs: [],
  selectedExcursionIds: ["hce-1", "hce-3", "hce-5", "hce-7"],
  transport: "standard",
  guideLanguage: "english",
  accommodation: "boutique",
  guests: 2,
  arrivalDate: "2026-12-15",
  departureDate: "2026-12-20",
  mealPlan: "Full Board",
  allergies: ["Nuts"],
  dietaryNotes: "",
  quoteRequested: false,
  miceEventType: "",
  miceGroupSize: 30,
  miceVenuePrefs: [],
  miceRequirements: "",
  miceBudgetRange: "$5k–$15k",
};

const DEFAULT_CHAT: ChatState = {
  chatOpen: false,
  chatMessages: [],
  chatInput: "",
};

const DEFAULT_META: SessionMeta = {
  sessionId: null,
  syncing: false,
  lastSyncedAt: null,
};

export const useTripSessionStore = create<TripSessionStore>((set, get) => ({
  ...DEFAULT_STATE,
  ...DEFAULT_CHAT,
  ...DEFAULT_META,

  set: (key, value) => set({ [key]: value }),

  setChatOpen: (open) => set({ chatOpen: open }),
  setChatMessages: (msgs) =>
    set((s) => ({
      chatMessages: typeof msgs === "function" ? msgs(s.chatMessages) : msgs,
    })),
  setChatInput: (input) => set({ chatInput: input }),

  setSessionId: (id) => set({ sessionId: id }),
  setSyncing: (syncing) => set({ syncing }),

  hydrate: (incoming) => {
    const patch: Partial<TripSessionStore> = {};
    for (const [k, v] of Object.entries(incoming)) {
      if (v !== undefined && v !== null) {
        (patch as Record<string, unknown>)[k] = v;
      }
    }
    set(patch);
  },

  reset: () => set({ ...DEFAULT_STATE, ...DEFAULT_CHAT, ...DEFAULT_META }),

  getSerializableState: () => {
    const s = get();
    return {
      tripType: s.tripType,
      activeTab: s.activeTab,
      selectedPackageSlug: s.selectedPackageSlug,
      showPackagePicker: s.showPackagePicker,
      selectedDestinationSlugs: s.selectedDestinationSlugs,
      selectedExcursionIds: s.selectedExcursionIds,
      transport: s.transport,
      guideLanguage: s.guideLanguage,
      accommodation: s.accommodation,
      guests: s.guests,
      arrivalDate: s.arrivalDate,
      departureDate: s.departureDate,
      mealPlan: s.mealPlan,
      allergies: s.allergies,
      dietaryNotes: s.dietaryNotes,
      quoteRequested: s.quoteRequested,
      miceEventType: s.miceEventType,
      miceGroupSize: s.miceGroupSize,
      miceVenuePrefs: s.miceVenuePrefs,
      miceRequirements: s.miceRequirements,
      miceBudgetRange: s.miceBudgetRange,
    };
  },
}));
