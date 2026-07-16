"use server";

import { guestQuoteRequestSchema, setPasswordSchema } from "@/lib/validations";
import type { GuestQuoteRequestInput } from "@/lib/validations";
import { db } from "@/lib/db";
import { verifyTurnstile } from "@/lib/turnstile";
import { sendEmail } from "@/lib/email";
import { buildGuestConfirmationEmail } from "@/lib/email-templates";
import bcrypt from "bcryptjs";

export interface GuestQuoteResult {
  success: boolean;
  existingAccount?: boolean;
  error?: string;
}

export async function submitGuestQuoteRequest(
  input: GuestQuoteRequestInput,
): Promise<GuestQuoteResult> {
  const parsed = guestQuoteRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid input. Please check your details." };
  }

  const { email, name, turnstileToken, state } = parsed.data;

  const turnstileValid = await verifyTurnstile(turnstileToken);
  if (!turnstileValid) {
    return { success: false, error: "Verification failed. Please try again." };
  }

  const existing = await db.user.findUnique({ where: { email } });

  if (existing && existing.passwordHash !== null) {
    return { success: false, existingAccount: true };
  }

  let userId: string;

  if (existing) {
    userId = existing.id;
    if (name && !existing.name) {
      await db.user.update({ where: { id: existing.id }, data: { name } });
    }
  } else {
    const user = await db.user.create({
      data: { email, name: name || null, role: "CUSTOMER" },
    });
    userId = user.id;
  }

  const specialist = await db.user.findFirst({
    where: { role: "SPECIALIST", specialty: state.tripType },
    select: { id: true },
  });

  await db.tripSession.create({
    data: {
      customerId: userId,
      specialistId: specialist?.id ?? null,
      tripType: state.tripType,
      state: JSON.parse(JSON.stringify(state)),
      activeTab: "overview",
      status: "QUOTE_REQUESTED",
    },
  });

  const tripSummary = buildTripSummary(state);
  await sendEmail({
    to: email,
    subject: "We received your trip request!",
    html: buildGuestConfirmationEmail(name || "Traveler", tripSummary),
  });

  return { success: true };
}

export async function upgradeGuestAccount(input: {
  bookingId: string;
  token: string;
  password: string;
  confirmPassword: string;
}): Promise<{ success: boolean; error?: string }> {
  if (input.password !== input.confirmPassword) {
    return { success: false, error: "Passwords do not match" };
  }

  const parsed = setPasswordSchema.safeParse({ newPassword: input.password });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid password" };
  }

  const tokenRecord = await db.verificationToken.findFirst({
    where: {
      identifier: `quote:${input.bookingId}`,
      token: input.token,
      expires: { gt: new Date() },
    },
  });
  if (!tokenRecord) {
    return { success: false, error: "Invalid or expired link" };
  }

  const booking = await db.booking.findUnique({
    where: { id: input.bookingId },
    select: { userId: true },
  });
  if (!booking) {
    return { success: false, error: "Booking not found" };
  }

  const user = await db.user.findUnique({ where: { id: booking.userId } });
  if (!user || user.passwordHash !== null) {
    return { success: false, error: "This account already has a password" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await db.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return { success: true };
}

function buildTripSummary(state: GuestQuoteRequestInput["state"]): string {
  const parts: string[] = [];
  if (state.tripType === "package") parts.push(`Package: ${state.packageSlug}`);
  if (state.tripType === "custom") parts.push(`Custom trip: ${state.destinations.length} destinations`);
  if (state.tripType === "mice") parts.push(`MICE event: ${state.miceEventType}`);
  parts.push(`${state.guests} travelers`);
  if (state.arrivalDate) parts.push(`${state.arrivalDate} to ${state.departureDate}`);
  return parts.join(" | ");
}
