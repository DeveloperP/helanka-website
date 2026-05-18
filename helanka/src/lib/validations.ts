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
