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

export const setPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, { error: "Password must be at least 8 characters." })
    .regex(/[A-Z]/, { error: "Password must contain at least one uppercase letter." })
    .regex(/[0-9]/, { error: "Password must contain at least one number." }),
});

export type SetPasswordInput = z.infer<typeof setPasswordSchema>;

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

export const accommodationDetailSchema = z.object({
  hotelName: z.string().min(1),
  starRating: z.string().nullable().optional(),
  roomType: z.string().nullable().optional(),
  mealPlan: z.string().nullable().optional(),
  sglRooms: z.number().int().nonnegative().default(0),
  sglRate: z.number().nonnegative().default(0),
  dblRooms: z.number().int().nonnegative().default(0),
  dblRate: z.number().nonnegative().default(0),
  twnRooms: z.number().int().nonnegative().default(0),
  twnRate: z.number().nonnegative().default(0),
  tplRooms: z.number().int().nonnegative().default(0),
  tplRate: z.number().nonnegative().default(0),
  extraAdultQty: z.number().int().nonnegative().default(0),
  extraAdultRate: z.number().nonnegative().default(0),
  childSharingQty: z.number().int().nonnegative().default(0),
  childSharingRate: z.number().nonnegative().default(0),
  childWithBedQty: z.number().int().nonnegative().default(0),
  childWithBedRate: z.number().nonnegative().default(0),
  marginType: z.string().default("fixed"),
  marginValue: z.number().nonnegative().default(0),
  rateCode: z.string().nullable().optional(),
  remarks: z.string().nullable().optional(),
});

export const transportDetailSchema = z.object({
  vehicleType: z.string().min(1),
  ratePerKm: z.number().nonnegative().default(0),
  vehicleUnits: z.number().int().positive().default(1),
  distanceKm: z.number().nonnegative().default(0),
  isGroupTransfer: z.boolean().default(false),
  pickupLocation: z.string().nullable().optional(),
  dropoffLocation: z.string().nullable().optional(),
  overridePrice: z.boolean().default(false),
  driverGuideType: z.string().nullable().optional(),
  driverRatePerDay: z.number().nonnegative().default(0),
  driverAccommodation: z.boolean().default(false),
  driverFee: z.number().nonnegative().default(0),
  remarks: z.string().nullable().optional(),
});

export const excursionDetailSchema = z.object({
  excursionName: z.string().min(1),
  sequence: z.number().int().nonnegative().default(0),
  costPerPerson: z.number().nonnegative().default(0),
  adultCount: z.number().int().nonnegative().default(0),
  childRate: z.number().nonnegative().default(0),
  childCount: z.number().int().nonnegative().default(0),
  overridePrice: z.boolean().default(false),
  remarks: z.string().nullable().optional(),
});

export const otherChargeDetailSchema = z.object({
  costItem: z.string().min(1),
  description: z.string().nullable().optional(),
  costPerUnit: z.number().nonnegative().default(0),
  units: z.number().int().nonnegative().default(0),
  overridePrice: z.boolean().default(false),
  remarks: z.string().nullable().optional(),
});

export const priceLineItemSchema = z.object({
  bookingItemId: z.string(),
  estimateMin: z.number().nonnegative(),
  estimateMax: z.number().nonnegative(),
  actualPrice: z.number().nonnegative().optional(),
  notes: z.string().optional(),
  accommodationDetail: accommodationDetailSchema.optional(),
  transportDetail: transportDetailSchema.optional(),
  excursionDetail: excursionDetailSchema.optional(),
  otherChargeDetail: otherChargeDetailSchema.optional(),
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
