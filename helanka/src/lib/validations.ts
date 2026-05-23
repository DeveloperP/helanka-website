/**
 * Zod v4 validation schemas for Helanka Vacations.
 *
 * Zod v4 ships both z.string().email() and the standalone z.email().
 * We use the method form here for clarity.
 */
import { z } from "zod";

// ---------------------------------------------------------------------------
// Auth schemas
// ---------------------------------------------------------------------------

export const registerSchema = z.object({
  name: z.string().min(2, { error: "Name must be at least 2 characters." }).trim(),
  email: z.string().email({ error: "Please enter a valid email address." }).trim(),
  password: z
    .string()
    .min(8, { error: "Password must be at least 8 characters." })
    .regex(/[A-Z]/, { error: "Password must contain at least one uppercase letter." })
    .regex(/[0-9]/, { error: "Password must contain at least one number." }),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email({ error: "Please enter a valid email address." }).trim(),
  password: z.string().min(1, { error: "Password is required." }),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email({ error: "Please enter a valid email address." }).trim(),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

// ---------------------------------------------------------------------------
// Booking / quote schemas
// ---------------------------------------------------------------------------

export const bookingItemSchema = z.object({
  type: z.enum(["ACCOMMODATION", "ACTIVITY", "TRANSPORT", "ADDON"]),
  destinationId: z.string().optional(),
  description: z.string().min(1, { error: "Description is required." }),
  dates: z.string().optional(),
  nights: z.number().int().nonnegative().optional(),
  tier: z.string().optional(),
  notes: z.string().optional(),
  sortOrder: z.number().int().default(0),
});

export type BookingItemInput = z.infer<typeof bookingItemSchema>;

export const submitQuoteRequestSchema = z.object({
  arrivalDate: z.string().optional(),
  departureDate: z.string().optional(),
  numTravelers: z.number().int().positive().default(1),
  flightNumber: z.string().optional(),
  items: z.array(bookingItemSchema).min(1, { error: "At least one item is required." }),
});

export type SubmitQuoteRequestInput = z.infer<typeof submitQuoteRequestSchema>;

export const priceLineItemSchema = z.object({
  bookingItemId: z.string(),
  estimateMin: z.number().nonnegative(),
  estimateMax: z.number().nonnegative(),
  actualPrice: z.number().nonnegative().optional(),
  notes: z.string().optional(),
});

export type PriceLineItemInput = z.infer<typeof priceLineItemSchema>;

export const sendQuoteSchema = z.object({
  bookingId: z.string(),
  totalPrice: z.number().positive({ error: "Total price must be positive." }),
  deposit: z.number().nonnegative({ error: "Deposit must be non-negative." }),
  validUntil: z.string({ error: "Valid-until date is required." }),
  adminNotes: z.string().optional(),
  lineItems: z.array(priceLineItemSchema),
});

export type SendQuoteInput = z.infer<typeof sendQuoteSchema>;

export const quoteResponseSchema = z.object({
  quoteId: z.string(),
  response: z.enum(["ACCEPTED", "REVISION", "EXPIRED"]),
});

export type QuoteResponseInput = z.infer<typeof quoteResponseSchema>;

// ---------------------------------------------------------------------------
// Rate card schemas
// ---------------------------------------------------------------------------

export const rateCardCreateSchema = z.object({
  itemType: z.enum(["ACCOMMODATION", "ACTIVITY", "TRANSPORT", "ADDON"]),
  tier: z.string().min(1),
  season: z.string().min(1),
  destinationId: z.string().optional(),
  minPrice: z.number().nonnegative(),
  maxPrice: z.number().nonnegative(),
  perKmRate: z.number().nonnegative().optional(),
  currency: z.string().default("USD"),
});

export type RateCardCreateInput = z.infer<typeof rateCardCreateSchema>;

export const rateCardUpdateSchema = z.object({
  minPrice: z.number().nonnegative(),
  maxPrice: z.number().nonnegative(),
  perKmRate: z.number().nonnegative().optional(),
});

export type RateCardUpdateInput = z.infer<typeof rateCardUpdateSchema>;

export const rateCardImportRowSchema = z.object({
  itemType: z.enum(["ACCOMMODATION", "ACTIVITY", "TRANSPORT", "ADDON"]),
  tier: z.string(),
  season: z.string(),
  destination: z.string(),
  minPrice: z.number().nonnegative(),
  maxPrice: z.number().nonnegative(),
  perKmRate: z.number().nonnegative().optional(),
  currency: z.string().default("USD"),
});

export type RateCardImportRow = z.infer<typeof rateCardImportRowSchema>;

export const excursionCreateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  destinationId: z.string(),
  type: z.string().min(1),
  distanceKm: z.number().nonnegative(),
  description: z.string().optional(),
});

export type ExcursionCreateInput = z.infer<typeof excursionCreateSchema>;

export const distanceUpdateSchema = z.object({
  distanceKm: z.number().positive(),
});

export type DistanceUpdateInput = z.infer<typeof distanceUpdateSchema>;

// ---------------------------------------------------------------------------
// Trip session schemas
// ---------------------------------------------------------------------------

export const tripSessionStateSchema = z.object({
  tripType: z.enum(["package", "custom", "mice"]),
  packageSlug: z.string().nullable(),
  destinations: z.array(z.string()),
  excursionIds: z.array(z.string()),
  transport: z.enum(["standard", "super-luxury"]),
  mealPlan: z.string(),
  allergies: z.array(z.string()),
  dietaryNotes: z.string(),
  guests: z.number().int().positive(),
  arrivalDate: z.string(),
  departureDate: z.string(),
  guideLanguage: z.string(),
  accommodation: z.string(),
  miceEventType: z.string(),
  miceGroupSize: z.number().int().nonnegative(),
  miceVenuePrefs: z.array(z.string()),
  miceRequirements: z.string(),
  miceBudgetRange: z.string(),
});

export type TripSessionState = z.infer<typeof tripSessionStateSchema>;

export const createTripSessionSchema = z.object({
  state: tripSessionStateSchema,
  activeTab: z.string().default("overview"),
});

export type CreateTripSessionInput = z.infer<typeof createTripSessionSchema>;

export const updateTripSessionStateSchema = z.object({
  sessionId: z.string(),
  state: tripSessionStateSchema,
  activeTab: z.string().optional(),
});

export type UpdateTripSessionStateInput = z.infer<typeof updateTripSessionStateSchema>;

// ---------------------------------------------------------------------------
// Chat schemas
// ---------------------------------------------------------------------------

export const sendChatMessageSchema = z.object({
  sessionId: z.string(),
  content: z.string().min(1, { error: "Message cannot be empty." }).max(2000),
  messageType: z.enum(["TEXT", "SUGGESTION", "SYSTEM"]).default("TEXT"),
});

export type SendChatMessageInput = z.infer<typeof sendChatMessageSchema>;

export const suggestionDataSchema = z.object({
  type: z.enum(["add_excursion", "add_destination", "change_accommodation", "change_transport"]),
  itemId: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  price: z.number().optional(),
});

export type SuggestionData = z.infer<typeof suggestionDataSchema>;

export const sendSuggestionSchema = z.object({
  sessionId: z.string(),
  content: z.string().min(1),
  suggestionData: suggestionDataSchema,
});

export type SendSuggestionInput = z.infer<typeof sendSuggestionSchema>;

export const respondToSuggestionSchema = z.object({
  messageId: z.string(),
  action: z.enum(["ACCEPTED", "DISMISSED"]),
});

export type RespondToSuggestionInput = z.infer<typeof respondToSuggestionSchema>;
