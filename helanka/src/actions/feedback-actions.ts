"use server";

import { requireAuth, requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import {
  submitDailyFeedbackSchema,
  submitTripSurveySchema,
  type SubmitDailyFeedbackInput,
  type SubmitTripSurveyInput,
} from "@/lib/validations";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DailyFeedbackData {
  id: string;
  dayNumber: number;
  overallRating: number;
  transportRating: number | null;
  foodRating: number | null;
  guideRating: number | null;
  accommodationRating: number | null;
  comment: string | null;
  submittedAt: string;
}

export interface TripSurveyData {
  rating: number;
  body: string;
  wouldRecommend: boolean | null;
  referralSource: string | null;
  socialMediaConsent: boolean;
  createdAt: string;
}

export interface TripFeedbackSummary {
  bookingId: string;
  totalDays: number;
  feedbackByDay: DailyFeedbackData[];
  survey: TripSurveyData | null;
  averages: {
    overall: number | null;
    transport: number | null;
    food: number | null;
    guide: number | null;
    accommodation: number | null;
  };
}

// ---------------------------------------------------------------------------
// Customer: get active trips (confirmed bookings with items)
// ---------------------------------------------------------------------------

export interface ActiveTripData {
  id: string;
  status: string;
  arrivalDate: string;
  departureDate: string;
  numTravelers: number;
  items: Array<{
    type: string;
    description: string;
    destinationName: string | null;
    nights: number | null;
  }>;
}

export async function getActiveTrips(): Promise<ActiveTripData[]> {
  const session = await requireAuth();
  if (!db) return [];

  const bookings = await db.booking.findMany({
    where: {
      userId: session.user.id,
      status: { in: ["CONFIRMED", "BALANCE_DUE", "COMPLETED"] },
      arrivalDate: { not: null },
      departureDate: { not: null },
    },
    include: {
      items: {
        select: {
          type: true,
          description: true,
          destination: { select: { name: true } },
          nights: true,
        },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { arrivalDate: "desc" },
  });

  return bookings
    .filter((b) => b.arrivalDate && b.departureDate)
    .map((b) => ({
      id: b.id,
      status: b.status,
      arrivalDate: b.arrivalDate!.toISOString(),
      departureDate: b.departureDate!.toISOString(),
      numTravelers: b.numTravelers,
      items: b.items.map((i) => ({
        type: i.type,
        description: i.description,
        destinationName: i.destination?.name ?? null,
        nights: i.nights,
      })),
    }));
}

// ---------------------------------------------------------------------------
// Customer: submit daily feedback
// ---------------------------------------------------------------------------

export async function submitDailyFeedback(
  input: SubmitDailyFeedbackInput
): Promise<{ success: boolean; error?: string }> {
  const session = await requireAuth();
  if (!db) return { success: false, error: "Database not connected." };

  const parsed = submitDailyFeedbackSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid input." };
  }

  const { bookingId, dayNumber, ...ratings } = parsed.data;

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    select: {
      userId: true,
      status: true,
      arrivalDate: true,
      departureDate: true,
    },
  });

  if (!booking) return { success: false, error: "Booking not found." };
  if (booking.userId !== session.user.id) {
    return { success: false, error: "Not authorized." };
  }

  const activeStatuses = ["CONFIRMED", "BALANCE_DUE", "COMPLETED"];
  if (!activeStatuses.includes(booking.status)) {
    return { success: false, error: "Feedback not available for this booking status." };
  }

  if (!booking.arrivalDate || !booking.departureDate) {
    return { success: false, error: "Booking dates not set." };
  }

  const totalDays = Math.max(
    1,
    Math.round(
      (booking.departureDate.getTime() - booking.arrivalDate.getTime()) / 86400000
    )
  );

  if (dayNumber < 1 || dayNumber > totalDays) {
    return { success: false, error: "Invalid day number." };
  }

  // Gating: all prior days must have feedback
  if (dayNumber > 1) {
    const priorCount = await db.dailyFeedback.count({
      where: { bookingId, dayNumber: { lt: dayNumber } },
    });
    if (priorCount < dayNumber - 1) {
      return { success: false, error: "Complete previous days first." };
    }
  }

  await db.dailyFeedback.upsert({
    where: { bookingId_dayNumber: { bookingId, dayNumber } },
    create: {
      bookingId,
      userId: session.user.id,
      dayNumber,
      ...ratings,
    },
    update: ratings,
  });

  return { success: true };
}

// ---------------------------------------------------------------------------
// Customer: submit end-of-trip survey
// ---------------------------------------------------------------------------

export async function submitTripSurvey(
  input: SubmitTripSurveyInput
): Promise<{ success: boolean; error?: string }> {
  const session = await requireAuth();
  if (!db) return { success: false, error: "Database not connected." };

  const parsed = submitTripSurveySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid input." };
  }

  const { bookingId, rating, body, wouldRecommend, referralSource, socialMediaConsent } =
    parsed.data;

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    select: { userId: true, arrivalDate: true, departureDate: true },
  });

  if (!booking) return { success: false, error: "Booking not found." };
  if (booking.userId !== session.user.id) {
    return { success: false, error: "Not authorized." };
  }

  if (!booking.arrivalDate || !booking.departureDate) {
    return { success: false, error: "Booking dates not set." };
  }

  const totalDays = Math.max(
    1,
    Math.round(
      (booking.departureDate.getTime() - booking.arrivalDate.getTime()) / 86400000
    )
  );

  const feedbackCount = await db.dailyFeedback.count({ where: { bookingId } });
  if (feedbackCount < totalDays) {
    return { success: false, error: "Complete all daily feedback first." };
  }

  await db.review.upsert({
    where: { bookingId },
    create: {
      userId: session.user.id,
      bookingId,
      rating,
      body,
      wouldRecommend,
      referralSource,
      socialMediaConsent,
    },
    update: {
      rating,
      body,
      wouldRecommend,
      referralSource,
      socialMediaConsent,
    },
  });

  return { success: true };
}

// ---------------------------------------------------------------------------
// Customer: get feedback data for a booking
// ---------------------------------------------------------------------------

export async function getMyTripFeedback(
  bookingId: string
): Promise<TripFeedbackSummary | null> {
  const session = await requireAuth();
  if (!db) return null;

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      userId: true,
      arrivalDate: true,
      departureDate: true,
      status: true,
    },
  });

  if (!booking || booking.userId !== session.user.id) return null;
  if (!booking.arrivalDate || !booking.departureDate) return null;

  const totalDays = Math.max(
    1,
    Math.round(
      (booking.departureDate.getTime() - booking.arrivalDate.getTime()) / 86400000
    )
  );

  const feedback = await db.dailyFeedback.findMany({
    where: { bookingId },
    orderBy: { dayNumber: "asc" },
  });

  const survey = await db.review.findUnique({
    where: { bookingId },
    select: {
      rating: true,
      body: true,
      wouldRecommend: true,
      referralSource: true,
      socialMediaConsent: true,
      createdAt: true,
    },
  });

  const avg = (vals: (number | null)[]) => {
    const nums = vals.filter((v): v is number => v !== null);
    return nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
  };

  return {
    bookingId,
    totalDays,
    feedbackByDay: feedback.map((f) => ({
      id: f.id,
      dayNumber: f.dayNumber,
      overallRating: f.overallRating,
      transportRating: f.transportRating,
      foodRating: f.foodRating,
      guideRating: f.guideRating,
      accommodationRating: f.accommodationRating,
      comment: f.comment,
      submittedAt: f.submittedAt.toISOString(),
    })),
    survey: survey
      ? {
          rating: survey.rating,
          body: survey.body,
          wouldRecommend: survey.wouldRecommend,
          referralSource: survey.referralSource,
          socialMediaConsent: survey.socialMediaConsent,
          createdAt: survey.createdAt.toISOString(),
        }
      : null,
    averages: {
      overall: avg(feedback.map((f) => f.overallRating)),
      transport: avg(feedback.map((f) => f.transportRating)),
      food: avg(feedback.map((f) => f.foodRating)),
      guide: avg(feedback.map((f) => f.guideRating)),
      accommodation: avg(feedback.map((f) => f.accommodationRating)),
    },
  };
}

// ---------------------------------------------------------------------------
// Admin: get feedback for a booking
// ---------------------------------------------------------------------------

export async function getBookingFeedback(
  bookingId: string
): Promise<TripFeedbackSummary | null> {
  await requireAdmin();
  if (!db) return null;

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      arrivalDate: true,
      departureDate: true,
    },
  });

  if (!booking || !booking.arrivalDate || !booking.departureDate) return null;

  const totalDays = Math.max(
    1,
    Math.round(
      (booking.departureDate.getTime() - booking.arrivalDate.getTime()) / 86400000
    )
  );

  const feedback = await db.dailyFeedback.findMany({
    where: { bookingId },
    orderBy: { dayNumber: "asc" },
  });

  const survey = await db.review.findUnique({
    where: { bookingId },
    select: {
      rating: true,
      body: true,
      wouldRecommend: true,
      referralSource: true,
      socialMediaConsent: true,
      createdAt: true,
    },
  });

  const avg = (vals: (number | null)[]) => {
    const nums = vals.filter((v): v is number => v !== null);
    return nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
  };

  return {
    bookingId,
    totalDays,
    feedbackByDay: feedback.map((f) => ({
      id: f.id,
      dayNumber: f.dayNumber,
      overallRating: f.overallRating,
      transportRating: f.transportRating,
      foodRating: f.foodRating,
      guideRating: f.guideRating,
      accommodationRating: f.accommodationRating,
      comment: f.comment,
      submittedAt: f.submittedAt.toISOString(),
    })),
    survey: survey
      ? {
          rating: survey.rating,
          body: survey.body,
          wouldRecommend: survey.wouldRecommend,
          referralSource: survey.referralSource,
          socialMediaConsent: survey.socialMediaConsent,
          createdAt: survey.createdAt.toISOString(),
        }
      : null,
    averages: {
      overall: avg(feedback.map((f) => f.overallRating)),
      transport: avg(feedback.map((f) => f.transportRating)),
      food: avg(feedback.map((f) => f.foodRating)),
      guide: avg(feedback.map((f) => f.guideRating)),
      accommodation: avg(feedback.map((f) => f.accommodationRating)),
    },
  };
}

// ---------------------------------------------------------------------------
// Admin: aggregate feedback report
// ---------------------------------------------------------------------------

export interface FeedbackReportItem {
  bookingId: string;
  customerName: string | null;
  customerEmail: string;
  arrivalDate: string | null;
  totalDays: number;
  feedbackCount: number;
  avgOverall: number | null;
  avgTransport: number | null;
  avgFood: number | null;
  avgGuide: number | null;
  avgAccommodation: number | null;
  hasSurvey: boolean;
  wouldRecommend: boolean | null;
}

export async function getFeedbackReport(): Promise<FeedbackReportItem[]> {
  await requireAdmin();
  if (!db) return [];

  const bookings = await db.booking.findMany({
    where: {
      dailyFeedback: { some: {} },
    },
    select: {
      id: true,
      arrivalDate: true,
      departureDate: true,
      user: { select: { name: true, email: true } },
      dailyFeedback: {
        select: {
          overallRating: true,
          transportRating: true,
          foodRating: true,
          guideRating: true,
          accommodationRating: true,
        },
      },
      reviews: {
        select: { wouldRecommend: true },
        take: 1,
      },
    },
    orderBy: { arrivalDate: "desc" },
    take: 200,
  });

  const avg = (vals: (number | null)[]) => {
    const nums = vals.filter((v): v is number => v !== null);
    return nums.length > 0
      ? Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10
      : null;
  };

  return bookings.map((b) => {
    const totalDays =
      b.arrivalDate && b.departureDate
        ? Math.max(
            1,
            Math.round(
              (b.departureDate.getTime() - b.arrivalDate.getTime()) / 86400000
            )
          )
        : 0;

    return {
      bookingId: b.id,
      customerName: b.user.name,
      customerEmail: b.user.email,
      arrivalDate: b.arrivalDate?.toISOString() ?? null,
      totalDays,
      feedbackCount: b.dailyFeedback.length,
      avgOverall: avg(b.dailyFeedback.map((f) => f.overallRating)),
      avgTransport: avg(b.dailyFeedback.map((f) => f.transportRating)),
      avgFood: avg(b.dailyFeedback.map((f) => f.foodRating)),
      avgGuide: avg(b.dailyFeedback.map((f) => f.guideRating)),
      avgAccommodation: avg(b.dailyFeedback.map((f) => f.accommodationRating)),
      hasSurvey: b.reviews.length > 0,
      wouldRecommend: b.reviews[0]?.wouldRecommend ?? null,
    };
  });
}

// ---------------------------------------------------------------------------
// Admin: export feedback CSV for a booking
// ---------------------------------------------------------------------------

export async function exportBookingFeedbackCSV(
  bookingId: string
): Promise<string | null> {
  await requireAdmin();
  if (!db) return null;

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    select: {
      user: { select: { name: true, email: true } },
      arrivalDate: true,
      departureDate: true,
      dailyFeedback: { orderBy: { dayNumber: "asc" } },
      reviews: { take: 1 },
    },
  });

  if (!booking) return null;

  const headers = [
    "Day",
    "Date",
    "Overall",
    "Transport",
    "Food",
    "Guide",
    "Accommodation",
    "Comment",
    "Submitted At",
  ];

  const rows = booking.dailyFeedback.map((f) => {
    const dayDate = booking.arrivalDate
      ? new Date(
          booking.arrivalDate.getTime() + (f.dayNumber - 1) * 86400000
        ).toISOString().split("T")[0]
      : "";
    return [
      f.dayNumber,
      dayDate,
      f.overallRating,
      f.transportRating ?? "",
      f.foodRating ?? "",
      f.guideRating ?? "",
      f.accommodationRating ?? "",
      `"${(f.comment ?? "").replace(/"/g, '""')}"`,
      f.submittedAt.toISOString(),
    ].join(",");
  });

  const meta = [
    `Customer,${booking.user.name ?? ""},${booking.user.email}`,
    `Arrival,${booking.arrivalDate?.toISOString().split("T")[0] ?? ""}`,
    `Departure,${booking.departureDate?.toISOString().split("T")[0] ?? ""}`,
    "",
  ];

  return [...meta, headers.join(","), ...rows].join("\n");
}
