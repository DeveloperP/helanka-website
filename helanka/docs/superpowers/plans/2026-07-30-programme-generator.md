# Travel Programme Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a system that generates polished, template-driven travel itinerary documents from confirmed bookings, served as a branded web page with PDF download.

**Architecture:** A deterministic pipeline resolves booking data (items, destinations, excursions, distances) into a self-contained JSON structure stored in a new `Programme` Prisma model. A React server component renders this JSON as a branded client-facing page at `/programme/[token]`. Puppeteer converts the same page to PDF on demand. Specialists edit the draft via a split-panel admin page before publishing.

**Tech Stack:** Next.js 14+ App Router, Prisma + PostgreSQL (Neon), Puppeteer + @sparticuz/chromium, Tailwind CSS v4, Vitest

## Global Constraints

- Next.js App Router with async server components; `params` is a `Promise` (await it)
- Check `node_modules/next/dist/docs/` before writing any Next.js code (per AGENTS.md)
- Prisma uses `PrismaPg` adapter with `pg` Pool; `db` import from `@/lib/db` can be `null`
- Auth guards: `requireAdmin()`, `requireAdminOrSpecialist()` from `@/lib/auth-guard`
- Server actions start with `"use server";` and call auth guard as first line
- All dates serialized to ISO strings before passing to client components
- UI is hand-rolled (no shadcn); use existing `Button`, `Card`, `Input` from `@/components/ui/`
- Class merging via `cn()` from `@/lib/utils`
- Tests in `__tests__/` mirroring `src/` structure, vitest + @testing-library/react
- No em dashes in any copy

---

### Task 1: Prisma Schema + Migration

**Files:**
- Modify: `prisma/schema.prisma`

**Interfaces:**
- Produces: `Programme` model, `ProgrammeStatus` enum, reverse relations on `Booking` and `User`

- [ ] **Step 1: Add ProgrammeStatus enum and Programme model to schema**

Add before the closing of the schema file, after the `ChatMessage` model:

```prisma
enum ProgrammeStatus {
  DRAFT
  PUBLISHED
}

model Programme {
  id          String           @id @default(cuid())
  bookingId   String           @unique
  booking     Booking          @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  token       String           @unique
  content     Json
  status      ProgrammeStatus  @default(DRAFT)
  publishedAt DateTime?
  createdById String
  createdBy   User             @relation(fields: [createdById], references: [id])
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  @@map("programmes")
}
```

- [ ] **Step 2: Add reverse relations to Booking and User models**

In the `Booking` model, add after the `dailyFeedback` relation:

```prisma
  programme     Programme?
```

In the `User` model, add after the `chatMessages` relation:

```prisma
  programmes    Programme[]
```

- [ ] **Step 3: Run migration**

```bash
cd "/Users/trevor/Documents/Ingress/Ingress Pipeline/Helanka Website/helanka"
npx prisma migrate dev --name add-programme-model
```

Verify the migration SQL creates the `programmes` table with the correct columns and foreign keys.

- [ ] **Step 4: Generate Prisma client**

```bash
npx prisma generate
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add Programme model and migration"
```

---

### Task 2: Programme Content Types

**Files:**
- Create: `src/lib/programme-types.ts`

**Interfaces:**
- Produces: `ProgrammeContent`, `ProgrammeDay`, `ProgrammeDayItem` TypeScript interfaces used by Tasks 3, 4, 5, 6

- [ ] **Step 1: Create the type definitions file**

```typescript
export interface ProgrammeContent {
  clientName: string;
  arrivalDate: string;
  departureDate: string;
  numTravelers: number;
  tripTitle: string;
  specialistName: string;
  specialistEmail: string;
  days: ProgrammeDay[];
  totalDistanceKm: number;
  inclusions: string[];
  exclusions: string[];
  notes: string;
}

export interface ProgrammeDay {
  dayNumber: number;
  date: string;
  title: string;
  destination: ProgrammeDestination;
  items: ProgrammeDayItem[];
  overnightAt: string | null;
}

export interface ProgrammeDestination {
  name: string;
  slug: string;
  region: string;
  description: string;
  heroImage: string;
  highlights: string[];
  facts: { label: string; value: string }[];
}

export interface ProgrammeDayItem {
  type: "ACCOMMODATION" | "TRANSPORT" | "ACTIVITY" | "ADDON";
  description: string;
  time: string | null;
  durationHours: number | null;
  distanceKm: number | null;
  notes: string | null;
  hotelName: string | null;
}

export const DEFAULT_INCLUSIONS = [
  "Airport pickup and drop-off",
  "Private air-conditioned vehicle throughout",
  "English-speaking chauffeur guide",
  "Accommodation as per itinerary",
  "Daily breakfast at all hotels",
  "All entrance fees mentioned in the itinerary",
  "Government taxes and service charges",
];

export const DEFAULT_EXCLUSIONS = [
  "International flights",
  "Travel insurance",
  "Visa fees",
  "Meals not mentioned",
  "Personal expenses and tipping",
  "Camera and video permits at sites",
];
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/programme-types.ts
git commit -m "feat: add programme content type definitions"
```

---

### Task 3: Programme Generation Pipeline

**Files:**
- Create: `src/lib/programme-generator.ts`
- Test: `__tests__/lib/programme-generator.test.ts`

**Interfaces:**
- Consumes: `ProgrammeContent`, `ProgrammeDay`, `ProgrammeDayItem`, `DEFAULT_INCLUSIONS`, `DEFAULT_EXCLUSIONS` from `@/lib/programme-types`
- Consumes: `db` from `@/lib/db`, static `destinations` from `@/lib/destinations`, `ALL_EXCURSIONS` from `@/lib/packages`
- Produces: `buildProgrammeContent(bookingId: string, specialistId: string): Promise<ProgrammeContent>` used by Task 4

- [ ] **Step 1: Write failing test for day structure generation**

Create `__tests__/lib/programme-generator.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { buildDayTitle, distributeNights, resolveDestination } from "@/lib/programme-generator";

describe("buildDayTitle", () => {
  it("returns arrival title for day 1", () => {
    expect(buildDayTitle(1, "Colombo", null, 7)).toBe("Arrival in Colombo");
  });

  it("returns transition title when destination changes", () => {
    expect(buildDayTitle(3, "Ella", "Kandy", 7)).toBe("Kandy to Ella");
  });

  it("returns day-at title when staying at same destination", () => {
    expect(buildDayTitle(4, "Ella", "Ella", 7)).toBe("Exploring Ella");
  });

  it("returns departure title for last day", () => {
    expect(buildDayTitle(7, "Colombo", "Galle", 7)).toBe("Departure from Colombo");
  });
});

describe("distributeNights", () => {
  it("distributes nights evenly across destinations", () => {
    const result = distributeNights(
      ["ella", "kandy", "galle"],
      6,
    );
    expect(result).toEqual([
      { slug: "ella", nights: 2 },
      { slug: "kandy", nights: 2 },
      { slug: "galle", nights: 2 },
    ]);
  });

  it("allocates remainder nights to earlier destinations", () => {
    const result = distributeNights(
      ["ella", "kandy"],
      5,
    );
    expect(result).toEqual([
      { slug: "ella", nights: 3 },
      { slug: "kandy", nights: 2 },
    ]);
  });
});

describe("resolveDestination", () => {
  it("resolves a destination from static data", () => {
    const dest = resolveDestination("ella");
    expect(dest.name).toBe("Ella");
    expect(dest.heroImage).toContain("dest-ella");
    expect(dest.highlights.length).toBeGreaterThan(0);
  });

  it("returns a placeholder for unknown slugs", () => {
    const dest = resolveDestination("nonexistent-place");
    expect(dest.name).toBe("Nonexistent Place");
    expect(dest.heroImage).toContain("placeholder");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run __tests__/lib/programme-generator.test.ts
```

Expected: FAIL with "cannot find module" or "is not a function"

- [ ] **Step 3: Implement the generator module**

Create `src/lib/programme-generator.ts`:

```typescript
import { db } from "@/lib/db";
import { destinations as staticDestinations } from "@/lib/destinations";
import { ALL_EXCURSIONS } from "@/lib/packages";
import type {
  ProgrammeContent,
  ProgrammeDay,
  ProgrammeDayItem,
  ProgrammeDestination,
} from "@/lib/programme-types";
import { DEFAULT_INCLUSIONS, DEFAULT_EXCLUSIONS } from "@/lib/programme-types";

export function buildDayTitle(
  dayNumber: number,
  currentDest: string,
  previousDest: string | null,
  totalDays: number,
): string {
  if (dayNumber === 1) return `Arrival in ${currentDest}`;
  if (dayNumber === totalDays) return `Departure from ${currentDest}`;
  if (previousDest && previousDest !== currentDest) return `${previousDest} to ${currentDest}`;
  return `Exploring ${currentDest}`;
}

export function distributeNights(
  destinationSlugs: string[],
  totalNights: number,
): { slug: string; nights: number }[] {
  const count = destinationSlugs.length;
  if (count === 0) return [];
  const base = Math.floor(totalNights / count);
  let remainder = totalNights % count;
  return destinationSlugs.map((slug) => {
    const nights = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder--;
    return { slug, nights };
  });
}

export function resolveDestination(slug: string): ProgrammeDestination {
  const staticDest = staticDestinations.find((d) => d.slug === slug);
  if (staticDest) {
    return {
      name: staticDest.name,
      slug: staticDest.slug,
      region: staticDest.region,
      description: staticDest.description,
      heroImage: staticDest.image,
      highlights: staticDest.highlights,
      facts: staticDest.facts,
    };
  }
  const titleCase = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return {
    name: titleCase,
    slug,
    region: "Sri Lanka",
    description: "",
    heroImage: "/images/destinations/placeholder.webp",
    highlights: [],
    facts: [],
  };
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export async function buildProgrammeContent(
  bookingId: string,
  specialistId: string,
): Promise<ProgrammeContent> {
  if (!db) throw new Error("Database not available");

  const booking = await db.booking.findUniqueOrThrow({
    where: { id: bookingId },
    include: {
      user: { select: { name: true } },
      items: {
        include: {
          accommodationDetail: true,
          transportDetail: true,
          excursionDetail: true,
          otherChargeDetail: true,
          destination: { select: { slug: true, name: true } },
        },
        orderBy: { sortOrder: "asc" },
      },
      tripSessions: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: { state: true },
      },
    },
  });

  const specialist = await db.user.findUniqueOrThrow({
    where: { id: specialistId },
    select: { name: true, email: true },
  });

  const arrivalDate = booking.arrivalDate?.toISOString().split("T")[0] ?? "";
  const departureDate = booking.departureDate?.toISOString().split("T")[0] ?? "";

  const tripDays = booking.arrivalDate && booking.departureDate
    ? Math.max(1, Math.ceil(
        (booking.departureDate.getTime() - booking.arrivalDate.getTime()) /
          (1000 * 60 * 60 * 24),
      ))
    : 7;

  // Extract destination slugs from booking items or trip session state
  const sessionState = booking.tripSessions[0]?.state as Record<string, unknown> | undefined;
  let destinationSlugs: string[] = [];

  const itemDestSlugs = booking.items
    .filter((item) => item.destination?.slug)
    .map((item) => item.destination!.slug);
  const uniqueItemSlugs = [...new Set(itemDestSlugs)];

  if (uniqueItemSlugs.length > 0) {
    destinationSlugs = uniqueItemSlugs;
  } else if (sessionState?.destinations && Array.isArray(sessionState.destinations)) {
    destinationSlugs = sessionState.destinations as string[];
  }

  // Distribute nights across destinations
  const nightsDistribution = distributeNights(destinationSlugs, tripDays);

  // Build day-by-day structure
  const days: ProgrammeDay[] = [];
  let currentDay = 1;
  let totalDistanceKm = 0;

  for (const { slug, nights } of nightsDistribution) {
    const dest = resolveDestination(slug);

    // Find booking items for this destination
    const destItems = booking.items.filter(
      (item) => item.destination?.slug === slug,
    );

    for (let n = 0; n < nights; n++) {
      const dayDate = arrivalDate ? addDays(arrivalDate, currentDay - 1) : "";
      const previousDest = days.length > 0 ? days[days.length - 1].destination.name : null;

      const items: ProgrammeDayItem[] = [];

      // Add transport on transition days (first day at a new destination)
      if (n === 0 && currentDay > 1) {
        const transportItem = destItems.find((i) => i.type === "TRANSPORT");
        const distKm = transportItem?.transportDetail?.distanceKm ?? null;
        if (distKm) totalDistanceKm += distKm;
        items.push({
          type: "TRANSPORT",
          description: transportItem?.description ?? `Transfer to ${dest.name}`,
          time: "08:00",
          durationHours: distKm ? Math.round((distKm / 50) * 10) / 10 : null,
          distanceKm: distKm,
          notes: null,
          hotelName: null,
        });
      }

      // Add activities spread across stay days
      const activities = destItems.filter((i) => i.type === "ACTIVITY");
      const activitiesPerDay = Math.ceil(activities.length / nights);
      const dayActivities = activities.slice(
        n * activitiesPerDay,
        (n + 1) * activitiesPerDay,
      );

      for (const act of dayActivities) {
        const excursion = ALL_EXCURSIONS.find(
          (e) =>
            e.destinationSlug === slug &&
            (act.description.toLowerCase().includes(e.name.toLowerCase()) ||
              e.name.toLowerCase().includes(act.description.toLowerCase().split(" ").slice(0, 3).join(" "))),
        );
        const excDetail = act.excursionDetail;
        const distKm = excDetail ? null : null;
        items.push({
          type: "ACTIVITY",
          description: act.description,
          time: null,
          durationHours: excursion?.durationHours ?? null,
          distanceKm: distKm,
          notes: act.notes,
          hotelName: null,
        });
      }

      // Add accommodation on non-departure days
      const accomItem = destItems.find((i) => i.type === "ACCOMMODATION");
      const hotelName =
        accomItem?.accommodationDetail?.hotelName ?? null;

      if (currentDay < tripDays) {
        items.push({
          type: "ACCOMMODATION",
          description: accomItem?.description ?? `Overnight in ${dest.name}`,
          time: null,
          durationHours: null,
          distanceKm: null,
          notes: null,
          hotelName,
        });
      }

      // Add any addons
      const addons = destItems.filter((i) => i.type === "ADDON");
      if (n === 0) {
        for (const addon of addons) {
          items.push({
            type: "ADDON",
            description: addon.description,
            time: null,
            durationHours: null,
            distanceKm: null,
            notes: addon.notes,
            hotelName: null,
          });
        }
      }

      days.push({
        dayNumber: currentDay,
        date: dayDate,
        title: buildDayTitle(currentDay, dest.name, previousDest, tripDays),
        destination: dest,
        items,
        overnightAt: currentDay < tripDays ? (hotelName ?? dest.name) : null,
      });

      currentDay++;
    }
  }

  // Determine trip title from session state or package
  let tripTitle = "Custom Sri Lanka Tour";
  if (sessionState?.tripType === "package" && sessionState.packageSlug) {
    const slugStr = sessionState.packageSlug as string;
    tripTitle = slugStr
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }

  return {
    clientName: booking.user.name ?? "Valued Guest",
    arrivalDate,
    departureDate,
    numTravelers: booking.numTravelers,
    tripTitle,
    specialistName: specialist.name ?? "Helanka Team",
    specialistEmail: specialist.email,
    days,
    totalDistanceKm: Math.round(totalDistanceKm),
    inclusions: [...DEFAULT_INCLUSIONS],
    exclusions: [...DEFAULT_EXCLUSIONS],
    notes: "",
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run __tests__/lib/programme-generator.test.ts
```

Expected: All 7 tests PASS

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/programme-generator.ts __tests__/lib/programme-generator.test.ts
git commit -m "feat: programme generation pipeline with tests"
```

---

### Task 4: Programme Server Actions

**Files:**
- Create: `src/actions/programme-actions.ts`

**Interfaces:**
- Consumes: `buildProgrammeContent` from `@/lib/programme-generator`
- Consumes: `ProgrammeContent` from `@/lib/programme-types`
- Consumes: `requireAdminOrSpecialist` from `@/lib/auth-guard`, `auth` from `@/lib/auth`, `db` from `@/lib/db`
- Produces: `generateProgramme(bookingId)`, `updateProgrammeContent(programmeId, content)`, `publishProgramme(programmeId)`, `unpublishProgramme(programmeId)`, `getProgrammeByBookingId(bookingId)`, `getProgrammeByToken(token)` used by Tasks 5, 6, 7

- [ ] **Step 1: Create the server actions file**

```typescript
"use server";

import crypto from "crypto";
import { requireAdminOrSpecialist } from "@/lib/auth-guard";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildProgrammeContent } from "@/lib/programme-generator";
import type { ProgrammeContent } from "@/lib/programme-types";
import type { ProgrammeStatus } from "@prisma/client";

export interface ProgrammeSummary {
  id: string;
  bookingId: string;
  token: string;
  status: ProgrammeStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProgrammeData extends ProgrammeSummary {
  content: ProgrammeContent;
  createdBy: { name: string | null; email: string };
}

export async function generateProgramme(
  bookingId: string,
): Promise<{ programmeId: string; token: string } | null> {
  const session = await requireAdminOrSpecialist();
  if (!db) return null;

  const existing = await db.programme.findUnique({
    where: { bookingId },
    select: { id: true, token: true },
  });
  if (existing) return { programmeId: existing.id, token: existing.token };

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    select: { status: true },
  });
  if (!booking) return null;

  const confirmedStatuses = ["CONFIRMED", "BALANCE_DUE", "COMPLETED"];
  if (!confirmedStatuses.includes(booking.status)) return null;

  const content = await buildProgrammeContent(bookingId, session.user.id);
  const token = crypto.randomBytes(24).toString("base64url");

  const programme = await db.programme.create({
    data: {
      bookingId,
      token,
      content: content as unknown as Record<string, unknown>,
      status: "DRAFT",
      createdById: session.user.id,
    },
  });

  return { programmeId: programme.id, token: programme.token };
}

export async function updateProgrammeContent(
  programmeId: string,
  content: ProgrammeContent,
): Promise<void> {
  await requireAdminOrSpecialist();
  if (!db) return;

  await db.programme.update({
    where: { id: programmeId },
    data: { content: content as unknown as Record<string, unknown> },
  });
}

export async function publishProgramme(programmeId: string): Promise<void> {
  await requireAdminOrSpecialist();
  if (!db) return;

  await db.programme.update({
    where: { id: programmeId },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  });
}

export async function unpublishProgramme(programmeId: string): Promise<void> {
  await requireAdminOrSpecialist();
  if (!db) return;

  await db.programme.update({
    where: { id: programmeId },
    data: { status: "DRAFT", publishedAt: null },
  });
}

export async function getProgrammeByBookingId(
  bookingId: string,
): Promise<ProgrammeData | null> {
  await requireAdminOrSpecialist();
  if (!db) return null;

  const programme = await db.programme.findUnique({
    where: { bookingId },
    include: { createdBy: { select: { name: true, email: true } } },
  });
  if (!programme) return null;

  return {
    id: programme.id,
    bookingId: programme.bookingId,
    token: programme.token,
    status: programme.status,
    publishedAt: programme.publishedAt?.toISOString() ?? null,
    createdAt: programme.createdAt.toISOString(),
    updatedAt: programme.updatedAt.toISOString(),
    content: programme.content as unknown as ProgrammeContent,
    createdBy: programme.createdBy,
  };
}

export async function getProgrammeByToken(
  token: string,
): Promise<ProgrammeData | null> {
  if (!db) return null;

  const programme = await db.programme.findUnique({
    where: { token },
    include: { createdBy: { select: { name: true, email: true } } },
  });
  if (!programme) return null;

  return {
    id: programme.id,
    bookingId: programme.bookingId,
    token: programme.token,
    status: programme.status,
    publishedAt: programme.publishedAt?.toISOString() ?? null,
    createdAt: programme.createdAt.toISOString(),
    updatedAt: programme.updatedAt.toISOString(),
    content: programme.content as unknown as ProgrammeContent,
    createdBy: programme.createdBy,
  };
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/actions/programme-actions.ts
git commit -m "feat: programme CRUD server actions"
```

---

### Task 5: Client-Facing Programme Web Page

**Files:**
- Create: `src/app/programme/[token]/page.tsx`
- Create: `src/app/programme/[token]/layout.tsx`
- Create: `src/components/programme/programme-view.tsx`

**Interfaces:**
- Consumes: `getProgrammeByToken` from `@/actions/programme-actions`
- Consumes: `ProgrammeContent`, `ProgrammeDay`, `ProgrammeDayItem` from `@/lib/programme-types`

- [ ] **Step 1: Create the programme layout (standalone, no site nav)**

Create `src/app/programme/[token]/layout.tsx`:

```typescript
export default function ProgrammeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Create the ProgrammeView client component**

Create `src/components/programme/programme-view.tsx`:

This is the main rendering component. It takes `ProgrammeContent` as a prop and renders the full itinerary. Build it with:

- **Header section**: Helanka logo (inline SVG or `/images/logo.png`), trip title in large display type (`font-[family-name:var(--font-display)]`), client name, dates formatted as "15 Aug - 22 Aug 2026", traveler count, specialist contact. A "Download PDF" link pointing to `/api/programme/{token}/pdf`. Use `searchParams` or pass `token` as a prop.

- **Day cards**: One full-width section per day. Each card contains:
  - Day number badge (small accent circle) and formatted date
  - Destination hero image at full width, 16:9 aspect, `object-cover`, loaded from `day.destination.heroImage`
  - Destination name (large) and region (small accent label)
  - Description paragraph
  - Highlights as a grid of pill/chip elements
  - Timeline of items: vertical left-border timeline. Each item shows an icon by type (car for TRANSPORT, compass for ACTIVITY, bed for ACCOMMODATION, tag for ADDON), the description, and metadata (duration, distance, time) in muted text
  - "Overnight at {location}" footer bar

- **Summary section**: Total distance, inclusions (checkmark list), exclusions (x-mark list)

- **Footer**: Specialist notes (if any), Helanka contact, "Crafted by Helanka Vacations" tagline

- **Print styles**: Include a `<style>` block or tailwind `print:` variants:
  - `print:bg-white print:text-black` on the root
  - `print:break-before-page` on each day card
  - `print:hidden` on the download button
  - Hero images sized to fit A4 width

```typescript
"use client";

import type { ProgrammeContent } from "@/lib/programme-types";
import { cn } from "@/lib/utils";

interface ProgrammeViewProps {
  content: ProgrammeContent;
  token: string;
  isDraft: boolean;
}

export function ProgrammeView({ content, token, isDraft }: ProgrammeViewProps) {
  const formatDate = (iso: string) => {
    if (!iso) return "";
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDuration = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)} min`;
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 print:max-w-none print:px-10 print:py-6 print:bg-white print:text-gray-900">
      {isDraft && (
        <div className="bg-amber-600/20 border border-amber-500/40 text-amber-200 text-center text-sm py-2 px-4 rounded-lg mb-8 print:hidden">
          DRAFT - NOT YET PUBLISHED
        </div>
      )}

      {/* Header */}
      <header className="mb-16 print:mb-10">
        <div className="flex items-center justify-between mb-8">
          <img
            src="/images/logo.png"
            alt="Helanka Vacations"
            className="h-10 print:h-8"
          />
          <a
            href={`/api/programme/${token}/pdf`}
            className="text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors print:hidden"
          >
            Download PDF
          </a>
        </div>
        <h1 className="font-[family-name:var(--font-display)] text-4xl md:text-6xl uppercase tracking-tight mb-4 print:text-3xl">
          {content.tripTitle}
        </h1>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/60 print:text-gray-500">
          <span>Prepared for {content.clientName}</span>
          <span>{formatDate(content.arrivalDate)} - {formatDate(content.departureDate)}</span>
          <span>{content.numTravelers} {content.numTravelers === 1 ? "traveler" : "travelers"}</span>
        </div>
        <div className="mt-4 text-sm text-white/40 print:text-gray-400">
          Your specialist: {content.specialistName} ({content.specialistEmail})
        </div>
      </header>

      {/* Day Cards */}
      {content.days.map((day) => (
        <section
          key={day.dayNumber}
          className="mb-16 print:break-before-page print:mb-10"
        >
          {/* Day badge + date */}
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-sm font-bold print:bg-emerald-700 print:text-white">
              {day.dayNumber}
            </span>
            <div>
              <span className="text-lg font-semibold">{day.title}</span>
              {day.date && (
                <span className="block text-sm text-white/50 print:text-gray-400">
                  {formatDate(day.date)}
                </span>
              )}
            </div>
          </div>

          {/* Hero image */}
          {day.destination.heroImage && !day.destination.heroImage.includes("placeholder") && (
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-6 print:rounded-none print:aspect-[3/1]">
              <img
                src={day.destination.heroImage}
                alt={day.destination.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-4 left-6">
                <span className="text-xs uppercase tracking-widest text-white/70">
                  {day.destination.region}
                </span>
                <h2 className="font-[family-name:var(--font-display)] text-3xl text-white print:text-2xl">
                  {day.destination.name}
                </h2>
              </div>
            </div>
          )}

          {/* Description */}
          {day.destination.description && (
            <p className="text-white/70 leading-relaxed mb-6 print:text-gray-600">
              {day.destination.description}
            </p>
          )}

          {/* Highlights */}
          {day.destination.highlights.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {day.destination.highlights.map((h) => (
                <span
                  key={h}
                  className="text-xs bg-white/5 text-white/60 px-3 py-1 rounded-full print:bg-gray-100 print:text-gray-600"
                >
                  {h}
                </span>
              ))}
            </div>
          )}

          {/* Timeline */}
          {day.items.length > 0 && (
            <div className="border-l-2 border-white/10 pl-6 space-y-5 print:border-gray-200">
              {day.items.map((item, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#0a0f1a] border-2 border-white/20 print:bg-white print:border-gray-300" />
                  <div className="flex items-start gap-3">
                    <span className="text-lg mt-0.5">
                      {item.type === "TRANSPORT" && "🚐"}
                      {item.type === "ACTIVITY" && "🧭"}
                      {item.type === "ACCOMMODATION" && "🛏️"}
                      {item.type === "ADDON" && "🏷️"}
                    </span>
                    <div>
                      <p className="font-medium">
                        {item.hotelName ?? item.description}
                      </p>
                      {item.hotelName && (
                        <p className="text-sm text-white/50 print:text-gray-400">
                          {item.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/40 mt-1 print:text-gray-400">
                        {item.time && <span>{item.time}</span>}
                        {item.durationHours && (
                          <span>{formatDuration(item.durationHours)}</span>
                        )}
                        {item.distanceKm && <span>{item.distanceKm} km</span>}
                      </div>
                      {item.notes && (
                        <p className="text-sm text-white/40 mt-1 italic print:text-gray-400">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Overnight */}
          {day.overnightAt && (
            <div className="mt-6 py-3 px-4 bg-white/5 rounded-lg text-sm text-white/60 print:bg-gray-50 print:text-gray-500">
              Overnight at {day.overnightAt}
            </div>
          )}
        </section>
      ))}

      {/* Summary */}
      <section className="border-t border-white/10 pt-12 print:border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h3 className="text-xs uppercase tracking-widest text-emerald-500 mb-4 font-semibold">
              Inclusions
            </h3>
            <ul className="space-y-2">
              {content.inclusions.map((inc) => (
                <li key={inc} className="flex items-start gap-2 text-sm text-white/70 print:text-gray-600">
                  <span className="text-emerald-500 mt-0.5">&#10003;</span>
                  {inc}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-widest text-red-400 mb-4 font-semibold">
              Exclusions
            </h3>
            <ul className="space-y-2">
              {content.exclusions.map((exc) => (
                <li key={exc} className="flex items-start gap-2 text-sm text-white/70 print:text-gray-600">
                  <span className="text-red-400 mt-0.5">&#10007;</span>
                  {exc}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {content.totalDistanceKm > 0 && (
          <p className="mt-8 text-sm text-white/40 print:text-gray-400">
            Total travel distance: approximately {content.totalDistanceKm.toLocaleString()} km
          </p>
        )}
      </section>

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-white/10 text-center print:border-gray-200">
        {content.notes && (
          <div className="mb-8 text-left bg-white/5 rounded-lg p-6 print:bg-gray-50">
            <h3 className="text-xs uppercase tracking-widest text-white/40 mb-3 font-semibold print:text-gray-400">
              Notes from your specialist
            </h3>
            <p className="text-sm text-white/70 whitespace-pre-wrap print:text-gray-600">
              {content.notes}
            </p>
          </div>
        )}
        <img
          src="/images/logo.png"
          alt="Helanka Vacations"
          className="h-8 mx-auto mb-3 opacity-40 print:opacity-60"
        />
        <p className="text-xs text-white/30 print:text-gray-400">
          Crafted by Helanka Vacations &middot; helanka.co &middot; info@helanka.co
        </p>
      </footer>
    </div>
  );
}
```

- [ ] **Step 3: Create the programme page (server component)**

Create `src/app/programme/[token]/page.tsx`:

```typescript
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProgrammeByToken } from "@/actions/programme-actions";
import { ProgrammeView } from "@/components/programme/programme-view";

interface Props {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const programme = await getProgrammeByToken(token);
  if (!programme) return { title: "Not Found" };
  return {
    title: `${programme.content.tripTitle} - Helanka Vacations`,
    description: `Travel programme for ${programme.content.clientName}`,
    robots: { index: false, follow: false },
  };
}

export default async function ProgrammePage({ params }: Props) {
  const { token } = await params;
  const programme = await getProgrammeByToken(token);
  if (!programme) notFound();

  return (
    <ProgrammeView
      content={programme.content}
      token={token}
      isDraft={programme.status === "DRAFT"}
    />
  );
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Manual test**

Start the dev server (`npm run dev`) and verify:
- `/programme/invalid-token` returns 404
- The component renders without errors when loaded with valid data (will need a programme record; can test after Task 6 wires the generate button)

- [ ] **Step 6: Commit**

```bash
git add src/app/programme/ src/components/programme/
git commit -m "feat: client-facing programme web page"
```

---

### Task 6: Admin Programme Editor Page

**Files:**
- Create: `src/app/admin/bookings/[bookingId]/programme/page.tsx`
- Create: `src/components/admin/programme-editor.tsx`
- Modify: `src/app/admin/bookings/[bookingId]/page.tsx` (add programme button)

**Interfaces:**
- Consumes: `generateProgramme`, `getProgrammeByBookingId`, `updateProgrammeContent`, `publishProgramme`, `unpublishProgramme` from `@/actions/programme-actions`
- Consumes: `ProgrammeView` from `@/components/programme/programme-view`
- Consumes: `ProgrammeContent` from `@/lib/programme-types`

- [ ] **Step 1: Create the ProgrammeEditor client component**

Create `src/components/admin/programme-editor.tsx`:

This is a `"use client"` component with a split-panel layout.

**Props:**
```typescript
interface ProgrammeEditorProps {
  programmeId: string;
  token: string;
  initialContent: ProgrammeContent;
  initialStatus: "DRAFT" | "PUBLISHED";
}
```

**State:** `content` (ProgrammeContent), `status`, `saving` (boolean), `dirty` (boolean)

**Left panel (editor):** Scrollable form, ~50% width on desktop, full width on mobile.
- Trip header: `tripTitle` (text input), client name (read-only), dates (read-only)
- Notes textarea for `content.notes`
- Collapsible day sections (one per day):
  - Day title (text input targeting `content.days[i].title`)
  - Overnight at (text input targeting `content.days[i].overnightAt`)
  - Items list: each item has editable fields:
    - Description (text input)
    - Time (time input, `type="time"`)
    - Duration hours (number input, step 0.5)
    - Distance km (number input)
    - Notes (text input)
    - Hotel name (text input, shown only for ACCOMMODATION type)
- Inclusions: list with per-item text input and remove button, plus "Add inclusion" button
- Exclusions: same pattern

**Right panel (preview):** Scrollable, renders `<ProgrammeView content={content} token={token} isDraft={status === "DRAFT"} />` which updates live as the editor state changes. Use a debounced version of content (300ms) to avoid re-rendering on every keystroke.

**Action buttons** (sticky bottom bar):
- "Save Draft" (calls `updateProgrammeContent(programmeId, content)`, resets dirty flag)
- "Preview as Client" (opens `/programme/${token}` in new tab via `window.open`)
- "Publish" / "Unpublish" toggle (calls `publishProgramme` / `unpublishProgramme`, updates status)

**Auto-save:** Debounced auto-save (5 seconds after last edit) so no work is lost. Show a small "Saved" / "Unsaved changes" indicator.

- [ ] **Step 2: Create the admin programme page (server component)**

Create `src/app/admin/bookings/[bookingId]/programme/page.tsx`:

```typescript
import { redirect } from "next/navigation";
import { requireAdminOrSpecialist } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { generateProgramme, getProgrammeByBookingId } from "@/actions/programme-actions";
import { ProgrammeEditor } from "@/components/admin/programme-editor";

interface Props {
  params: Promise<{ bookingId: string }>;
}

export default async function AdminProgrammePage({ params }: Props) {
  const { bookingId } = await params;
  await requireAdminOrSpecialist();
  if (!db) return <p className="p-8 text-gray-500">Database unavailable.</p>;

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    select: { status: true },
  });
  if (!booking) redirect("/admin/bookings");

  const confirmedStatuses = ["CONFIRMED", "BALANCE_DUE", "COMPLETED"];
  if (!confirmedStatuses.includes(booking.status)) {
    redirect(`/admin/bookings/${bookingId}`);
  }

  let programme = await getProgrammeByBookingId(bookingId);

  if (!programme) {
    const result = await generateProgramme(bookingId);
    if (!result) redirect(`/admin/bookings/${bookingId}`);
    programme = await getProgrammeByBookingId(bookingId);
    if (!programme) redirect(`/admin/bookings/${bookingId}`);
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <a
            href={`/admin/bookings/${bookingId}`}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            &larr; Back to Booking
          </a>
          <span className="text-sm font-medium">
            Travel Programme
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <ProgrammeEditor
          programmeId={programme.id}
          token={programme.token}
          initialContent={programme.content}
          initialStatus={programme.status}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Add programme button to booking detail page**

Modify `src/app/admin/bookings/[bookingId]/page.tsx`:

After the existing content, add a conditional link. Find where the booking status is displayed and add nearby:

```typescript
// Add import at top
import Link from "next/link";

// Add in the JSX, near the booking status/actions area:
{["CONFIRMED", "BALANCE_DUE", "COMPLETED"].includes(booking.status) && (
  <Link
    href={`/admin/bookings/${bookingId}/programme`}
    className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
  >
    Travel Programme
  </Link>
)}
```

The exact insertion point depends on the current page layout. Read the file and find the appropriate location near the status badge or action buttons area.

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Manual test**

Start the dev server and verify:
- Navigate to a booking detail page with CONFIRMED status
- "Travel Programme" button appears
- Clicking it navigates to the programme editor
- Editor loads with generated content
- Editing a field updates the preview
- Save Draft persists changes
- Publish makes the public URL accessible

- [ ] **Step 6: Commit**

```bash
git add src/app/admin/bookings/[bookingId]/programme/ src/components/admin/programme-editor.tsx src/app/admin/bookings/[bookingId]/page.tsx
git commit -m "feat: admin programme editor with live preview"
```

---

### Task 7: PDF Generation API Route

**Files:**
- Create: `src/app/api/programme/[token]/pdf/route.ts`

**Interfaces:**
- Consumes: `getProgrammeByToken` from `@/actions/programme-actions`

- [ ] **Step 1: Install dependencies**

```bash
cd "/Users/trevor/Documents/Ingress/Ingress Pipeline/Helanka Website/helanka"
npm install puppeteer-core @sparticuz/chromium
```

- [ ] **Step 2: Create the PDF route handler**

Create `src/app/api/programme/[token]/pdf/route.ts`:

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getProgrammeByToken } from "@/actions/programme-actions";

export const maxDuration = 30;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const programme = await getProgrammeByToken(token);

  if (!programme || programme.status !== "PUBLISHED") {
    return NextResponse.json(
      { error: "Programme not found" },
      { status: 404 },
    );
  }

  try {
    let browser;

    if (process.env.NODE_ENV === "production") {
      const chromium = await import("@sparticuz/chromium");
      const puppeteer = await import("puppeteer-core");
      browser = await puppeteer.default.launch({
        args: chromium.default.args,
        defaultViewport: { width: 1200, height: 800 },
        executablePath: await chromium.default.executablePath(),
        headless: true,
      });
    } else {
      const puppeteer = await import("puppeteer-core");
      browser = await puppeteer.default.launch({
        channel: "chrome",
        headless: true,
        defaultViewport: { width: 1200, height: 800 },
      });
    }

    const page = await browser.newPage();

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ??
      process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";

    await page.goto(`${baseUrl}/programme/${token}?print=true`, {
      waitUntil: "networkidle0",
      timeout: 20000,
    });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
    });

    await browser.close();

    const clientName = programme.content.clientName
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .replace(/\s+/g, "-");

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Helanka-Programme-${clientName}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation failed:", error);
    return NextResponse.json(
      { error: "PDF generation failed" },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 3: Add print query param handling to ProgrammeView**

In `src/components/programme/programme-view.tsx`, update the component to detect `?print=true` and apply print-optimized styles immediately (white bg, no interactive elements):

Add to the component props and logic:

```typescript
// In the ProgrammeView component, add useSearchParams:
import { useSearchParams } from "next/navigation";

// Inside the component:
const searchParams = useSearchParams();
const isPrintMode = searchParams.get("print") === "true";
```

Then conditionally apply `bg-white text-gray-900` and hide the download button when `isPrintMode` is true, in addition to the existing `print:` variants.

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Manual test**

Test locally:
- Publish a programme via the admin editor
- Visit `/api/programme/{token}/pdf`
- Verify a PDF downloads with the correct filename
- Open the PDF and check: page breaks between days, images rendered, white background, no download button visible

- [ ] **Step 6: Commit**

```bash
git add src/app/api/programme/[token]/pdf/ src/components/programme/programme-view.tsx
git commit -m "feat: PDF generation via Puppeteer"
```

---

### Task 8: Destination Placeholder Image

**Files:**
- Create: `public/images/destinations/placeholder.webp`

**Interfaces:**
- Consumed by: `resolveDestination()` in `src/lib/programme-generator.ts` for destinations without hero images

- [ ] **Step 1: Create a simple placeholder image**

Generate or create a minimal placeholder image (a dark gradient with "Helanka Vacations" text or a generic Sri Lanka landscape). Save as `public/images/destinations/placeholder.webp`.

For now, create a simple dark gradient placeholder. A proper set of 20 destination-specific images can be generated separately using Higgsfield as a follow-up task.

- [ ] **Step 2: Commit**

```bash
git add public/images/destinations/placeholder.webp
git commit -m "feat: add destination placeholder image"
```

---

## Task Dependency Order

```
Task 1 (Schema)
  └─> Task 2 (Types)
        └─> Task 3 (Generator) ──> Task 4 (Actions) ──> Task 5 (Web Page)
                                                    └──> Task 6 (Editor)
                                                    └──> Task 7 (PDF)
Task 8 (Placeholder) can run in parallel with any task
```

## Verification Checklist

After all tasks complete:

- [ ] Programme generates from a confirmed booking with correct day structure
- [ ] Admin editor loads with pre-populated content from the booking
- [ ] Editing fields updates the live preview
- [ ] Save Draft persists without publishing
- [ ] Publish makes the public URL accessible
- [ ] Unpublish reverts to draft
- [ ] Public page returns 404 for invalid tokens
- [ ] Draft programmes show watermark banner
- [ ] PDF downloads with correct formatting and page breaks
- [ ] Programme button only appears on confirmed bookings
- [ ] Destinations with images show hero images; others show placeholder
- [ ] All TypeScript compiles cleanly (`npx tsc --noEmit`)
- [ ] Existing tests still pass (`npx vitest run`)
