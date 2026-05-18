# Helanka Vacations Revamp — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the foundation of the Helanka travel platform: project scaffold, auth, database, public pages, package builder wizard, loopback quotation system, admin/customer dashboards, WebXPay deposit payments, analytics, email notifications, blog, and SEO.

**Architecture:** Next.js 14+ App Router with Server Components and Server Actions. Prisma ORM on Neon Postgres. Auth.js for authentication. All API logic lives in Server Actions — no separate API routes except for webhooks (WebXPay callback). Admin and customer dashboards are route groups with middleware-enforced role checks.

**Tech Stack:** Next.js 14+, TypeScript, Tailwind CSS, Auth.js v5, Prisma, Neon Postgres, WebXPay XGATEWAY, PostHog, GA4, Resend, Zod

---

## File Structure

```
helanka/
├── .env.local                          # Local env vars (never committed)
├── .env.example                        # Template for env vars
├── next.config.ts                      # Next.js config
├── tailwind.config.ts                  # Tailwind config
├── tsconfig.json                       # TypeScript config
├── package.json
├── prisma/
│   ├── schema.prisma                   # Database schema
│   └── seed.ts                         # Seed data (destinations, packages, rate cards)
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # Root layout (PostHog + GA4 providers)
│   │   ├── page.tsx                    # Homepage
│   │   ├── globals.css                 # Tailwind base + custom styles
│   │   ├── (public)/                   # Public page group
│   │   │   ├── destinations/
│   │   │   │   ├── page.tsx            # Destinations grid with filters
│   │   │   │   └── [slug]/page.tsx     # Destination detail
│   │   │   ├── packages/
│   │   │   │   ├── page.tsx            # Packages listing with filters
│   │   │   │   └── [slug]/page.tsx     # Package detail + "Customize This Trip" CTA
│   │   │   ├── build/
│   │   │   │   └── page.tsx            # Package builder wizard (client component)
│   │   │   ├── group-experiences/
│   │   │   │   └── page.tsx            # MICE / group travel page
│   │   │   ├── about/page.tsx          # About page
│   │   │   ├── reviews/page.tsx        # Reviews listing
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx            # Blog listing
│   │   │   │   └── [slug]/page.tsx     # Blog post detail
│   │   │   ├── partner/page.tsx        # B2B partner inquiry
│   │   │   └── terms/page.tsx          # Terms & conditions
│   │   ├── (auth)/                     # Auth page group
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   ├── dashboard/                  # Customer dashboard (protected)
│   │   │   ├── layout.tsx              # Dashboard layout with nav
│   │   │   ├── page.tsx                # Bookings overview
│   │   │   ├── bookings/[id]/page.tsx  # Booking detail + quote review
│   │   │   └── profile/page.tsx        # Account settings
│   │   ├── admin/                      # Admin panel (role-gated)
│   │   │   ├── layout.tsx              # Admin layout with sidebar
│   │   │   ├── page.tsx                # Admin dashboard (pending quotes, revenue, SLA)
│   │   │   ├── packages/page.tsx       # Package CRUD
│   │   │   ├── destinations/page.tsx   # Destination CRUD
│   │   │   ├── bookings/
│   │   │   │   ├── page.tsx            # All bookings list
│   │   │   │   └── [id]/page.tsx       # Line-item pricing interface
│   │   │   ├── users/page.tsx          # Customer management
│   │   │   ├── blog/page.tsx           # Blog post editor
│   │   │   ├── rate-cards/page.tsx     # Rate card management
│   │   │   └── analytics/page.tsx      # Revenue by channel, funnels
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts  # Auth.js route handler
│   │       └── webhooks/
│   │           └── webxpay/route.ts    # WebXPay payment callback
│   ├── lib/
│   │   ├── db.ts                       # Prisma client singleton
│   │   ├── auth.ts                     # Auth.js config (providers, callbacks)
│   │   ├── auth-guard.ts               # Server-side auth check helpers
│   │   ├── webxpay.ts                  # WebXPay XGATEWAY client
│   │   ├── email.ts                    # Resend email client + templates
│   │   ├── analytics.ts                # PostHog server-side helper
│   │   └── validations.ts              # Zod schemas shared across actions
│   ├── actions/
│   │   ├── auth-actions.ts             # Register, verify email, reset password
│   │   ├── booking-actions.ts          # Create/update draft, submit quote request
│   │   ├── quote-actions.ts            # Admin: price line items, send quote
│   │   ├── customer-actions.ts         # Accept quote, request revision
│   │   ├── payment-actions.ts          # Initiate deposit, handle confirmation
│   │   ├── package-actions.ts          # Admin CRUD for packages
│   │   ├── destination-actions.ts      # Admin CRUD for destinations
│   │   ├── rate-card-actions.ts        # Admin CRUD for rate cards
│   │   └── blog-actions.ts             # Admin CRUD for blog posts
│   ├── components/
│   │   ├── ui/                         # Shared UI primitives
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── modal.tsx
│   │   │   └── data-table.tsx
│   │   ├── layout/
│   │   │   ├── header.tsx              # Public site header + nav
│   │   │   ├── footer.tsx              # Public site footer
│   │   │   ├── admin-sidebar.tsx       # Admin navigation sidebar
│   │   │   └── dashboard-nav.tsx       # Customer dashboard nav
│   │   ├── builder/
│   │   │   ├── builder-shell.tsx       # Wizard container + step router
│   │   │   ├── step-arrival.tsx        # Step 1: arrival details
│   │   │   ├── step-destinations.tsx   # Step 2: pick destinations
│   │   │   ├── step-accommodation.tsx  # Step 3: hotel tier per destination
│   │   │   ├── step-activities.tsx     # Step 4: activities per destination
│   │   │   ├── step-transport.tsx      # Step 5: transport + add-ons
│   │   │   ├── step-departure.tsx      # Step 6: departure details
│   │   │   ├── step-review.tsx         # Step 7: summary + submit
│   │   │   ├── estimate-bar.tsx        # Running total estimate bar
│   │   │   └── use-builder-store.ts    # Zustand store for wizard state
│   │   ├── booking/
│   │   │   ├── booking-status-badge.tsx
│   │   │   ├── quote-line-items.tsx    # Read-only line item display (customer)
│   │   │   ├── quote-pricing-form.tsx  # Editable pricing form (admin)
│   │   │   └── quote-actions-bar.tsx   # Accept / Request Changes buttons
│   │   └── analytics/
│   │       ├── posthog-provider.tsx    # PostHog context provider
│   │       ├── ga4-script.tsx          # GA4 script tag component
│   │       └── track-event.ts          # Client-side event helper
│   ├── middleware.ts                   # Auth + role check middleware
│   └── types/
│       └── index.ts                    # Shared TypeScript types
├── __tests__/
│   ├── lib/
│   │   ├── auth-guard.test.ts
│   │   ├── webxpay.test.ts
│   │   └── validations.test.ts
│   ├── actions/
│   │   ├── booking-actions.test.ts
│   │   ├── quote-actions.test.ts
│   │   ├── customer-actions.test.ts
│   │   └── payment-actions.test.ts
│   └── components/
│       ├── builder/
│       │   └── builder-shell.test.tsx
│       └── booking/
│           └── quote-line-items.test.tsx
└── public/
    ├── images/                         # Static images
    └── robots.txt                      # SEO robots file
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `helanka/package.json`, `helanka/next.config.ts`, `helanka/tailwind.config.ts`, `helanka/tsconfig.json`, `helanka/src/app/layout.tsx`, `helanka/src/app/page.tsx`, `helanka/src/app/globals.css`, `helanka/.env.example`

- [ ] **Step 1: Create Next.js project**

Run from the repo root:

```bash
npx create-next-app@latest helanka --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Accept defaults. This creates the `helanka/` directory with App Router, TypeScript, Tailwind, ESLint.

- [ ] **Step 2: Install core dependencies**

```bash
cd helanka
npm install @auth/prisma-adapter @prisma/client next-auth@beta zod zustand resend
npm install -D prisma @types/bcryptjs vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
npm install bcryptjs
```

- [ ] **Step 3: Create `.env.example`**

```env
# Database (Neon Postgres)
DATABASE_URL="postgresql://user:pass@host/dbname?sslmode=require"

# Auth.js
AUTH_SECRET="generate-with-npx-auth-secret"
AUTH_URL="http://localhost:3000"

# Google OAuth
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""

# WebXPay
WEBXPAY_MERCHANT_ID=""
WEBXPAY_API_KEY=""
WEBXPAY_API_SECRET=""
WEBXPAY_GATEWAY_URL="https://gateway.webxpay.com"

# Resend (Email)
RESEND_API_KEY=""
RESEND_FROM_EMAIL="bookings@helanka.co"

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=""
NEXT_PUBLIC_POSTHOG_HOST="https://us.i.posthog.com"

# GA4
NEXT_PUBLIC_GA4_MEASUREMENT_ID=""
```

- [ ] **Step 4: Configure Vitest**

Create `helanka/vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./__tests__/setup.ts"],
    include: ["__tests__/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

Create `helanka/__tests__/setup.ts`:

```typescript
import "@testing-library/jest-dom/vitest";
```

Add to `helanka/package.json` scripts:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Verify scaffold runs**

```bash
npm run dev
```

Open `http://localhost:3000`. Confirm the default Next.js page loads. Kill the server.

- [ ] **Step 6: Commit**

```bash
git add helanka/
git commit -m "chore: scaffold Next.js project with TypeScript, Tailwind, Vitest"
```

---

## Task 2: Database Schema (Prisma + Neon)

**Files:**
- Create: `helanka/prisma/schema.prisma`
- Create: `helanka/src/lib/db.ts`

- [ ] **Step 1: Initialize Prisma**

```bash
cd helanka
npx prisma init
```

- [ ] **Step 2: Write the full schema**

Replace `helanka/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
}

enum UserRole {
  CUSTOMER
  ADMIN
}

enum BookingStatus {
  DRAFT
  QUOTE_REQUESTED
  PRICING_IN_PROGRESS
  QUOTE_SENT
  REVISION_REQUESTED
  CONFIRMED
  BALANCE_DUE
  COMPLETED
  CANCELLED
  EXPIRED
}

enum BookingItemType {
  ACCOMMODATION
  ACTIVITY
  TRANSPORT
  ADDON
}

enum QuoteResponse {
  ACCEPTED
  REVISION
  EXPIRED
}

enum PaymentStatus {
  PENDING
  SUCCESS
  FAILED
  REFUNDED
}

model User {
  id              String    @id @default(cuid())
  email           String    @unique
  emailVerified   DateTime?
  passwordHash    String?
  name            String?
  phone           String?
  country         String?
  image           String?
  role            UserRole  @default(CUSTOMER)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  lastLogin       DateTime?

  accounts Account[]
  sessions Session[]
  bookings Booking[]
  reviews  Review[]

  @@map("users")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

model Destination {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  region      String
  description String
  highlights  String[]
  photos      String[]
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  packageItems PackageItem[]
  bookingItems BookingItem[]
  rateCards    RateCard[]

  @@map("destinations")
}

model Package {
  id           String   @id @default(cuid())
  name         String
  slug         String   @unique
  description  String
  durationDays Int
  highlights   String[]
  difficulty   String?
  region       String
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  items PackageItem[]

  @@map("packages")
}

model PackageItem {
  id            String          @id @default(cuid())
  packageId     String
  type          BookingItemType
  destinationId String?
  description   String
  sortOrder     Int

  package     Package      @relation(fields: [packageId], references: [id], onDelete: Cascade)
  destination Destination? @relation(fields: [destinationId], references: [id])

  @@map("package_items")
}

model RateCard {
  id            String   @id @default(cuid())
  itemType      BookingItemType
  destinationId String?
  tier          String?
  season        String
  minPrice      Float
  maxPrice      Float
  currency      String   @default("USD")
  updatedAt     DateTime @updatedAt

  destination Destination? @relation(fields: [destinationId], references: [id])

  @@map("rate_cards")
}

model Booking {
  id             String        @id @default(cuid())
  userId         String
  status         BookingStatus @default(DRAFT)
  arrivalDate    DateTime?
  departureDate  DateTime?
  numTravelers   Int           @default(1)
  flightNumber   String?
  sourceChannel  String?
  utmSource      String?
  utmMedium      String?
  utmCampaign    String?
  utmContent     String?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  user     User          @relation(fields: [userId], references: [id])
  items    BookingItem[]
  quotes   Quote[]
  payments Payment[]
  reviews  Review[]

  @@map("bookings")
}

model BookingItem {
  id            String          @id @default(cuid())
  bookingId     String
  type          BookingItemType
  destinationId String?
  description   String
  dates         String?
  nights        Int?
  tier          String?
  estimateMin   Float?
  estimateMax   Float?
  actualPrice   Float?
  notes         String?
  sortOrder     Int             @default(0)

  booking     Booking      @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  destination Destination? @relation(fields: [destinationId], references: [id])

  @@map("booking_items")
}

model Quote {
  id          String         @id @default(cuid())
  bookingId   String
  version     Int
  totalPrice  Float
  deposit     Float
  validUntil  DateTime
  adminNotes  String?
  sentAt      DateTime?
  respondedAt DateTime?
  response    QuoteResponse?
  createdAt   DateTime       @default(now())

  booking Booking @relation(fields: [bookingId], references: [id], onDelete: Cascade)

  @@map("quotes")
}

model Payment {
  id              String        @id @default(cuid())
  bookingId       String
  amount          Float
  currency        String        @default("USD")
  method          String?
  webxpayRef      String?
  status          PaymentStatus @default(PENDING)
  paidAt          DateTime?
  createdAt       DateTime      @default(now())

  booking Booking @relation(fields: [bookingId], references: [id])

  @@map("payments")
}

model BlogPost {
  id              String    @id @default(cuid())
  title           String
  slug            String    @unique
  content         String
  excerpt         String?
  coverImage      String?
  author          String
  metaTitle       String?
  metaDescription String?
  isPublished     Boolean   @default(false)
  publishedAt     DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@map("blog_posts")
}

model Review {
  id          String   @id @default(cuid())
  userId      String
  bookingId   String
  rating      Int
  title       String?
  body        String
  isPublished Boolean  @default(false)
  createdAt   DateTime @default(now())

  user    User    @relation(fields: [userId], references: [id])
  booking Booking @relation(fields: [bookingId], references: [id])

  @@map("reviews")
}

model AnalyticsEvent {
  id            String   @id @default(cuid())
  sessionId     String?
  userId        String?
  eventType     String
  eventData     Json?
  sourceChannel String?
  utmParams     Json?
  createdAt     DateTime @default(now())

  @@index([eventType])
  @@index([createdAt])
  @@map("analytics_events")
}
```

- [ ] **Step 3: Create Prisma client singleton**

Create `helanka/src/lib/db.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

- [ ] **Step 4: Generate Prisma client and push schema**

Set `DATABASE_URL` in `.env.local` with your Neon connection string, then:

```bash
npx prisma generate
npx prisma db push
```

Verify: `npx prisma studio` — should show all tables empty in the browser.

- [ ] **Step 5: Commit**

```bash
git add prisma/ src/lib/db.ts
git commit -m "feat: add Prisma schema with all tables — users, bookings, quotes, payments, rate cards, blog"
```

---

## Task 3: Auth System (Auth.js)

**Files:**
- Create: `helanka/src/lib/auth.ts`, `helanka/src/lib/auth-guard.ts`, `helanka/src/app/api/auth/[...nextauth]/route.ts`, `helanka/src/middleware.ts`
- Create: `helanka/src/lib/validations.ts`

- [ ] **Step 1: Write Zod schemas for auth**

Create `helanka/src/lib/validations.ts`:

```typescript
import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[0-9]/, "Password must contain a number"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const bookingItemSchema = z.object({
  type: z.enum(["ACCOMMODATION", "ACTIVITY", "TRANSPORT", "ADDON"]),
  destinationId: z.string().optional(),
  description: z.string().min(1),
  dates: z.string().optional(),
  nights: z.number().int().positive().optional(),
  tier: z.string().optional(),
  estimateMin: z.number().positive().optional(),
  estimateMax: z.number().positive().optional(),
  sortOrder: z.number().int().default(0),
});

export const submitQuoteRequestSchema = z.object({
  bookingId: z.string(),
});

export const priceLineItemSchema = z.object({
  bookingItemId: z.string(),
  actualPrice: z.number().positive("Price must be positive"),
  notes: z.string().optional(),
});

export const sendQuoteSchema = z.object({
  bookingId: z.string(),
  adminNotes: z.string().optional(),
  validDays: z.number().int().min(1).max(30).default(7),
});

export const quoteResponseSchema = z.object({
  quoteId: z.string(),
  response: z.enum(["ACCEPTED", "REVISION"]),
  revisionNotes: z.string().optional(),
});
```

- [ ] **Step 2: Configure Auth.js**

Create `helanka/src/lib/auth.ts`:

```typescript
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { loginSchema } from "./validations";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Google,
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await db.user.findUnique({
          where: { email: parsed.data.email },
        });

        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash
        );

        if (!valid) return null;

        await db.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
```

- [ ] **Step 3: Create auth route handler**

Create `helanka/src/app/api/auth/[...nextauth]/route.ts`:

```typescript
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
```

- [ ] **Step 4: Create auth guard helpers**

Create `helanka/src/lib/auth-guard.ts`:

```typescript
import { auth } from "./auth";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");
  return session;
}

export async function getOptionalSession() {
  return await auth();
}
```

- [ ] **Step 5: Create middleware for route protection**

Create `helanka/src/middleware.ts`:

```typescript
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const isAdmin = req.auth?.user?.role === "ADMIN";

  if (pathname.startsWith("/dashboard") && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/admin") && !isAdmin) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
```

- [ ] **Step 6: Create auth actions (register + password reset)**

Create `helanka/src/actions/auth-actions.ts`:

```typescript
"use server";

import { db } from "@/lib/db";
import { signIn } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { registerSchema, forgotPasswordSchema } from "@/lib/validations";
import { redirect } from "next/navigation";

export async function registerUser(formData: FormData) {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const existing = await db.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (existing) {
    return { error: { email: ["An account with this email already exists"] } };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await db.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: "CUSTOMER",
    },
  });

  await signIn("credentials", {
    email: parsed.data.email,
    password: parsed.data.password,
    redirectTo: "/dashboard",
  });
}

export async function loginUser(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Invalid email or password" };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error: any) {
    if (error?.type === "CredentialsSignin") {
      return { error: "Invalid email or password" };
    }
    throw error;
  }
}

import { loginSchema } from "@/lib/validations";
```

- [ ] **Step 7: Add TypeScript type augmentation for Auth.js**

Create `helanka/src/types/index.ts`:

```typescript
import { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface User {
    role?: string;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    id?: string;
  }
}
```

- [ ] **Step 8: Write auth guard test**

Create `helanka/__tests__/lib/auth-guard.test.ts`:

```typescript
import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

import { requireAuth, requireAdmin } from "@/lib/auth-guard";
import { auth } from "@/lib/auth";

describe("requireAuth", () => {
  it("redirects to /login when no session", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null);
    await expect(requireAuth()).rejects.toThrow("REDIRECT:/login");
  });

  it("returns session when authenticated", async () => {
    const session = { user: { id: "1", email: "a@b.com", role: "CUSTOMER" } };
    vi.mocked(auth).mockResolvedValueOnce(session as any);
    const result = await requireAuth();
    expect(result.user.id).toBe("1");
  });
});

describe("requireAdmin", () => {
  it("redirects to /dashboard when not admin", async () => {
    const session = { user: { id: "1", email: "a@b.com", role: "CUSTOMER" } };
    vi.mocked(auth).mockResolvedValueOnce(session as any);
    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/dashboard");
  });

  it("returns session when admin", async () => {
    const session = { user: { id: "1", email: "a@b.com", role: "ADMIN" } };
    vi.mocked(auth).mockResolvedValueOnce(session as any);
    const result = await requireAdmin();
    expect(result.user.role).toBe("ADMIN");
  });
});
```

- [ ] **Step 9: Run tests**

```bash
npm test
```

Expected: 4 tests pass.

- [ ] **Step 10: Commit**

```bash
git add src/lib/auth.ts src/lib/auth-guard.ts src/lib/validations.ts src/actions/auth-actions.ts src/middleware.ts src/app/api/auth/ src/types/ __tests__/
git commit -m "feat: add Auth.js with credentials + Google OAuth, middleware, auth guards"
```

---

## Task 4: Shared UI Components

**Files:**
- Create: all files in `helanka/src/components/ui/`

- [ ] **Step 1: Install class merge utility**

```bash
npm install clsx tailwind-merge
```

Create `helanka/src/lib/utils.ts`:

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2: Create Button component**

Create `helanka/src/components/ui/button.tsx`:

```tsx
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary: "bg-emerald-600 text-white hover:bg-emerald-700",
  secondary: "bg-slate-700 text-white hover:bg-slate-600",
  outline: "border border-slate-300 text-slate-700 hover:bg-slate-50",
  ghost: "text-slate-600 hover:bg-slate-100",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-50 disabled:pointer-events-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
);

Button.displayName = "Button";
```

- [ ] **Step 3: Create Input component**

Create `helanka/src/components/ui/input.tsx`:

```tsx
import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn(
          "block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500",
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
);

Input.displayName = "Input";
```

- [ ] **Step 4: Create Card and Badge components**

Create `helanka/src/components/ui/card.tsx`:

```tsx
import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-xl border border-slate-200 bg-white shadow-sm", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-6 py-4 border-b border-slate-100", className)} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-6 py-4", className)} {...props}>
      {children}
    </div>
  );
}
```

Create `helanka/src/components/ui/badge.tsx`:

```tsx
import { cn } from "@/lib/utils";
import type { BookingStatus } from "@prisma/client";

const statusColors: Record<BookingStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  QUOTE_REQUESTED: "bg-amber-100 text-amber-800",
  PRICING_IN_PROGRESS: "bg-purple-100 text-purple-800",
  QUOTE_SENT: "bg-blue-100 text-blue-800",
  REVISION_REQUESTED: "bg-orange-100 text-orange-800",
  CONFIRMED: "bg-emerald-100 text-emerald-800",
  BALANCE_DUE: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  EXPIRED: "bg-slate-100 text-slate-500",
};

const statusLabels: Record<BookingStatus, string> = {
  DRAFT: "Draft",
  QUOTE_REQUESTED: "Quote Requested",
  PRICING_IN_PROGRESS: "Pricing In Progress",
  QUOTE_SENT: "Quote Sent",
  REVISION_REQUESTED: "Changes Requested",
  CONFIRMED: "Confirmed",
  BALANCE_DUE: "Balance Due",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        statusColors[status]
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/ src/lib/utils.ts
git commit -m "feat: add shared UI components — Button, Input, Card, Badge"
```

---

## Task 5: Auth Pages (Login, Register, Forgot Password)

**Files:**
- Create: `helanka/src/app/(auth)/login/page.tsx`, `helanka/src/app/(auth)/register/page.tsx`, `helanka/src/app/(auth)/forgot-password/page.tsx`

- [ ] **Step 1: Create login page**

Create `helanka/src/app/(auth)/login/page.tsx`:

```tsx
import { signIn } from "@/lib/auth";
import { loginUser } from "@/actions/auth-actions";
import Link from "next/link";

export const metadata = {
  title: "Sign In — Helanka Vacations",
  description: "Sign in to manage your Sri Lanka vacation bookings",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-600">
            Sign in to manage your bookings
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <form action={loginUser} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <Link href="/forgot-password" className="text-sm text-emerald-600 hover:text-emerald-700">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              Sign in
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-slate-500">Or continue with</span>
              </div>
            </div>

            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/dashboard" });
              }}
              className="mt-4"
            >
              <button
                type="submit"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Google
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create register page**

Create `helanka/src/app/(auth)/register/page.tsx`:

```tsx
import { registerUser } from "@/actions/auth-actions";
import Link from "next/link";

export const metadata = {
  title: "Create Account — Helanka Vacations",
  description: "Create your account to start planning your Sri Lanka vacation",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="mt-2 text-sm text-slate-600">
            Start planning your Sri Lanka vacation
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <form action={registerUser} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <p className="text-xs text-slate-500">
                At least 8 characters with an uppercase letter and a number
              </p>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              Create account
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create forgot password page**

Create `helanka/src/app/(auth)/forgot-password/page.tsx`:

```tsx
export const metadata = {
  title: "Reset Password — Helanka Vacations",
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Reset your password</h1>
          <p className="mt-2 text-sm text-slate-600">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <form className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Send reset link
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify auth pages render**

```bash
npm run dev
```

Visit `/login`, `/register`, `/forgot-password`. Confirm all three render correctly. Kill the server.

- [ ] **Step 5: Commit**

```bash
git add src/app/\(auth\)/
git commit -m "feat: add login, register, and forgot password pages"
```

---

## Task 6: Seed Data (Destinations, Packages, Rate Cards)

**Files:**
- Create: `helanka/prisma/seed.ts`
- Modify: `helanka/package.json` (add prisma seed script)

- [ ] **Step 1: Write seed script**

Create `helanka/prisma/seed.ts`:

```typescript
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Admin user
  const adminHash = await bcrypt.hash("Admin123!", 12);
  await prisma.user.upsert({
    where: { email: "admin@helanka.co" },
    update: {},
    create: {
      email: "admin@helanka.co",
      name: "Helanka Admin",
      passwordHash: adminHash,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  // Destinations
  const destinations = [
    { name: "Ella", slug: "ella", region: "Hill Country", description: "A beautiful mountain town known for tea plantations, Nine Arch Bridge, and stunning hikes through lush green hills.", highlights: ["Nine Arch Bridge", "Little Adam's Peak", "Tea Plantations", "Ella Rock"] },
    { name: "Yala", slug: "yala", region: "Southern", description: "Sri Lanka's premier wildlife sanctuary, home to leopards, elephants, and over 200 bird species.", highlights: ["Leopard Safari", "Elephant Spotting", "Bird Watching", "Beach Safari"] },
    { name: "Sigiriya", slug: "sigiriya", region: "Cultural Triangle", description: "The ancient rock fortress rising 200m above the jungle, a UNESCO World Heritage site with stunning frescoes.", highlights: ["Rock Fortress", "Frescoes", "Mirror Wall", "Royal Gardens"] },
    { name: "Galle", slug: "galle", region: "Southern", description: "A charming coastal city with a well-preserved Dutch fort, boutique shops, and beautiful beaches.", highlights: ["Galle Fort", "Unawatuna Beach", "Whale Watching", "Stilt Fishermen"] },
    { name: "Nuwara Eliya", slug: "nuwara-eliya", region: "Hill Country", description: "Known as 'Little England' for its colonial architecture, cool climate, and endless tea estates.", highlights: ["Tea Factory Tours", "Gregory Lake", "Hakgala Gardens", "Horton Plains"] },
    { name: "Kandy", slug: "kandy", region: "Hill Country", description: "The cultural capital of Sri Lanka, home to the Temple of the Tooth and surrounded by lush hills.", highlights: ["Temple of the Tooth", "Kandy Lake", "Royal Botanical Gardens", "Cultural Dance Show"] },
    { name: "Bentota", slug: "bentota", region: "Western Coast", description: "A golden sand beach paradise on the southwestern coast, perfect for water sports and relaxation.", highlights: ["Beach", "Water Sports", "River Safari", "Turtle Hatchery"] },
    { name: "Arugam Bay", slug: "arugam-bay", region: "Eastern Coast", description: "World-class surf destination on the east coast with a laid-back vibe and great seafood.", highlights: ["Surfing", "Beach Bars", "Pottuvil Lagoon", "Kumana National Park"] },
    { name: "Anuradhapura", slug: "anuradhapura", region: "Cultural Triangle", description: "One of the oldest continuously inhabited cities in the world, filled with ancient Buddhist ruins.", highlights: ["Sacred Bo Tree", "Ruwanwelisaya Stupa", "Isurumuniya", "Ancient City Cycling"] },
    { name: "Kitulgala", slug: "kitulgala", region: "Hill Country", description: "The adventure capital of Sri Lanka, set in a rainforest with white water rapids and jungle trails.", highlights: ["White Water Rafting", "Canyoning", "Jungle Trekking", "Waterfall Abseiling"] },
    { name: "Wilpattu", slug: "wilpattu", region: "North Western", description: "Sri Lanka's largest national park, known for natural lakes and excellent leopard sightings.", highlights: ["Leopard Safari", "Natural Lakes", "Bird Watching", "Camping"] },
    { name: "Colombo", slug: "colombo", region: "Western", description: "The vibrant commercial capital, blending colonial heritage with modern dining and nightlife.", highlights: ["Gangaramaya Temple", "Pettah Market", "Galle Face Green", "Street Food Tour"] },
  ];

  for (const dest of destinations) {
    await prisma.destination.upsert({
      where: { slug: dest.slug },
      update: {},
      create: { ...dest, photos: [], isActive: true },
    });
  }

  // Packages
  const ella = await prisma.destination.findUnique({ where: { slug: "ella" } });
  const nuwaraEliya = await prisma.destination.findUnique({ where: { slug: "nuwara-eliya" } });
  const kandy = await prisma.destination.findUnique({ where: { slug: "kandy" } });
  const yala = await prisma.destination.findUnique({ where: { slug: "yala" } });
  const bentota = await prisma.destination.findUnique({ where: { slug: "bentota" } });
  const kitulgala = await prisma.destination.findUnique({ where: { slug: "kitulgala" } });
  const arugamBay = await prisma.destination.findUnique({ where: { slug: "arugam-bay" } });
  const galle = await prisma.destination.findUnique({ where: { slug: "galle" } });

  const hillCountryPkg = await prisma.package.upsert({
    where: { slug: "hill-country-explorer" },
    update: {},
    create: {
      name: "Hill Country Explorer",
      slug: "hill-country-explorer",
      description: "Journey through misty mountains, ancient tea plantations, and colonial charm. Train ride through Ella, tea tasting in Nuwara Eliya, and cultural immersion in Kandy.",
      durationDays: 6,
      highlights: ["Scenic train ride", "Tea plantation tours", "Temple of the Tooth", "Nine Arch Bridge"],
      difficulty: "Easy",
      region: "Hill Country",
    },
  });

  if (ella && nuwaraEliya && kandy) {
    const hillItems = [
      { type: "ACCOMMODATION" as const, destinationId: nuwaraEliya.id, description: "Nuwara Eliya — 2 nights", sortOrder: 1 },
      { type: "ACCOMMODATION" as const, destinationId: ella.id, description: "Ella — 2 nights", sortOrder: 2 },
      { type: "ACCOMMODATION" as const, destinationId: kandy.id, description: "Kandy — 1 night", sortOrder: 3 },
      { type: "ACTIVITY" as const, destinationId: nuwaraEliya.id, description: "Tea factory tour & tasting", sortOrder: 4 },
      { type: "ACTIVITY" as const, destinationId: ella.id, description: "Nine Arch Bridge hike", sortOrder: 5 },
      { type: "ACTIVITY" as const, destinationId: kandy.id, description: "Temple of the Tooth visit", sortOrder: 6 },
      { type: "TRANSPORT" as const, description: "Private car + driver (full trip)", sortOrder: 7 },
      { type: "TRANSPORT" as const, destinationId: ella.id, description: "Scenic train ride Nuwara Eliya → Ella", sortOrder: 8 },
    ];
    for (const item of hillItems) {
      await prisma.packageItem.create({
        data: { packageId: hillCountryPkg.id, ...item },
      });
    }
  }

  const wildlifePkg = await prisma.package.upsert({
    where: { slug: "wildlife-adventure" },
    update: {},
    create: {
      name: "Wildlife Adventure",
      slug: "wildlife-adventure",
      description: "Get up close with Sri Lanka's incredible wildlife. Safari through Yala for leopards, elephants in their natural habitat, and hundreds of bird species.",
      durationDays: 4,
      highlights: ["Leopard safari", "Elephant spotting", "Bird watching", "Beach sunset"],
      difficulty: "Easy",
      region: "Southern",
    },
  });

  const coastalPkg = await prisma.package.upsert({
    where: { slug: "golden-southern-coast" },
    update: {},
    create: {
      name: "Golden Southern Coast",
      slug: "golden-southern-coast",
      description: "Sun, sand, and serenity along Sri Lanka's stunning southern coastline. From the golden beaches of Bentota to the historic charm of Galle Fort.",
      durationDays: 5,
      highlights: ["Bentota Beach", "Galle Fort", "Whale watching", "Turtle hatchery"],
      difficulty: "Easy",
      region: "Southern",
    },
  });

  const adventurePkg = await prisma.package.upsert({
    where: { slug: "throbbing-adventure" },
    update: {},
    create: {
      name: "Throbbing Adventure",
      slug: "throbbing-adventure",
      description: "Adrenaline-fueled journey through Sri Lanka's wild heart. White water rafting, canyoning, jungle trekking, and waterfall abseiling in Kitulgala.",
      durationDays: 3,
      highlights: ["White water rafting", "Canyoning", "Jungle trekking", "Waterfall abseiling"],
      difficulty: "Challenging",
      region: "Hill Country",
    },
  });

  const eastCoastPkg = await prisma.package.upsert({
    where: { slug: "east-coast-escape" },
    update: {},
    create: {
      name: "East Coast Escape",
      slug: "east-coast-escape",
      description: "Ride the waves at Arugam Bay, explore untouched lagoons, and discover the raw beauty of Sri Lanka's eastern shore.",
      durationDays: 5,
      highlights: ["Surfing", "Lagoon safari", "Beach life", "Local seafood"],
      difficulty: "Moderate",
      region: "Eastern Coast",
    },
  });

  // Rate Cards (seasonal estimates)
  const rateCardData = [
    // Accommodation — per night per room
    { itemType: "ACCOMMODATION" as const, tier: "3-star", season: "peak", minPrice: 80, maxPrice: 130 },
    { itemType: "ACCOMMODATION" as const, tier: "3-star", season: "shoulder", minPrice: 60, maxPrice: 100 },
    { itemType: "ACCOMMODATION" as const, tier: "3-star", season: "off-peak", minPrice: 40, maxPrice: 75 },
    { itemType: "ACCOMMODATION" as const, tier: "4-star", season: "peak", minPrice: 150, maxPrice: 260 },
    { itemType: "ACCOMMODATION" as const, tier: "4-star", season: "shoulder", minPrice: 120, maxPrice: 200 },
    { itemType: "ACCOMMODATION" as const, tier: "4-star", season: "off-peak", minPrice: 90, maxPrice: 150 },
    { itemType: "ACCOMMODATION" as const, tier: "5-star", season: "peak", minPrice: 300, maxPrice: 550 },
    { itemType: "ACCOMMODATION" as const, tier: "5-star", season: "shoulder", minPrice: 220, maxPrice: 420 },
    { itemType: "ACCOMMODATION" as const, tier: "5-star", season: "off-peak", minPrice: 160, maxPrice: 320 },
    { itemType: "ACCOMMODATION" as const, tier: "boutique", season: "peak", minPrice: 180, maxPrice: 350 },
    { itemType: "ACCOMMODATION" as const, tier: "boutique", season: "shoulder", minPrice: 140, maxPrice: 280 },
    { itemType: "ACCOMMODATION" as const, tier: "boutique", season: "off-peak", minPrice: 100, maxPrice: 220 },
    // Activities — per person
    { itemType: "ACTIVITY" as const, tier: "safari", season: "all", minPrice: 40, maxPrice: 80 },
    { itemType: "ACTIVITY" as const, tier: "cultural", season: "all", minPrice: 15, maxPrice: 40 },
    { itemType: "ACTIVITY" as const, tier: "adventure", season: "all", minPrice: 30, maxPrice: 70 },
    { itemType: "ACTIVITY" as const, tier: "water-sport", season: "all", minPrice: 25, maxPrice: 60 },
    { itemType: "ACTIVITY" as const, tier: "nature", season: "all", minPrice: 20, maxPrice: 50 },
    // Transport — per day
    { itemType: "TRANSPORT" as const, tier: "standard", season: "all", minPrice: 50, maxPrice: 80 },
    { itemType: "TRANSPORT" as const, tier: "premium", season: "all", minPrice: 80, maxPrice: 130 },
    { itemType: "TRANSPORT" as const, tier: "luxury", season: "all", minPrice: 150, maxPrice: 250 },
    // Add-ons — per item
    { itemType: "ADDON" as const, tier: "airport-pickup", season: "all", minPrice: 25, maxPrice: 45 },
    { itemType: "ADDON" as const, tier: "sim-card", season: "all", minPrice: 10, maxPrice: 15 },
    { itemType: "ADDON" as const, tier: "travel-insurance", season: "all", minPrice: 30, maxPrice: 60 },
    { itemType: "ADDON" as const, tier: "photographer", season: "all", minPrice: 100, maxPrice: 200 },
  ];

  for (const rc of rateCardData) {
    await prisma.rateCard.create({ data: rc });
  }

  console.log("Seed complete: admin user, 12 destinations, 5 packages, 24 rate cards");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
```

- [ ] **Step 2: Add seed script to package.json**

Add to `helanka/package.json`:

```json
"prisma": {
  "seed": "npx tsx prisma/seed.ts"
}
```

Install tsx if not present:

```bash
npm install -D tsx
```

- [ ] **Step 3: Run the seed**

```bash
npx prisma db seed
```

Expected output: "Seed complete: admin user, 12 destinations, 5 packages, 24 rate cards"

Verify: `npx prisma studio` — check destinations, packages, rate_cards tables have data.

- [ ] **Step 4: Commit**

```bash
git add prisma/seed.ts package.json
git commit -m "feat: add seed data — 12 Sri Lanka destinations, 5 packages, rate cards, admin user"
```

---

## Task 7: Site Layout (Header + Footer)

**Files:**
- Create: `helanka/src/components/layout/header.tsx`, `helanka/src/components/layout/footer.tsx`
- Modify: `helanka/src/app/layout.tsx`

- [ ] **Step 1: Create header with navigation**

Create `helanka/src/components/layout/header.tsx`:

```tsx
import Link from "next/link";
import { auth } from "@/lib/auth";

export async function Header() {
  const session = await auth();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-emerald-700">
              Helanka
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/packages" className="text-sm text-slate-600 hover:text-slate-900">
                Packages
              </Link>
              <Link href="/destinations" className="text-sm text-slate-600 hover:text-slate-900">
                Destinations
              </Link>
              <Link href="/build" className="text-sm text-slate-600 hover:text-slate-900">
                Build Your Trip
              </Link>
              <Link href="/group-experiences" className="text-sm text-slate-600 hover:text-slate-900">
                Group Experiences
              </Link>
              <Link href="/blog" className="text-sm text-slate-600 hover:text-slate-900">
                Blog
              </Link>
              <Link href="/about" className="text-sm text-slate-600 hover:text-slate-900">
                About
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {session?.user ? (
              <Link
                href={session.user.role === "ADMIN" ? "/admin" : "/dashboard"}
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                {session.user.name || "Dashboard"}
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900">
                  Sign in
                </Link>
                <Link
                  href="/build"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  Plan Your Trip
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Create footer**

Create `helanka/src/components/layout/footer.tsx`:

```tsx
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold text-white">Helanka Vacations</h3>
            <p className="mt-2 text-sm">
              Your best bet for a stress-free Sri Lanka vacation. Customized trips from airport arrival to departure.
            </p>
            <p className="mt-4 text-sm">
              No. 471, Cotta Road<br />
              Rajagiriya, Colombo<br />
              Sri Lanka
            </p>
          </div>

          <div>
            <h4 className="font-medium text-white">Explore</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/packages" className="hover:text-white">Packages</Link></li>
              <li><Link href="/destinations" className="hover:text-white">Destinations</Link></li>
              <li><Link href="/build" className="hover:text-white">Build Your Trip</Link></li>
              <li><Link href="/group-experiences" className="hover:text-white">Group Experiences</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-white">Company</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white">About Us</Link></li>
              <li><Link href="/reviews" className="hover:text-white">Reviews</Link></li>
              <li><Link href="/partner" className="hover:text-white">Partner With Us</Link></li>
              <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
              <li><Link href="/terms" className="hover:text-white">Terms & Conditions</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-white">Contact</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a href="tel:+94117400857" className="hover:text-white">+94 11 740 0857</a>
              </li>
              <li>
                <a href="mailto:tours@helanka.co" className="hover:text-white">tours@helanka.co</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-8 text-sm text-center">
          &copy; {new Date().getFullYear()} Helanka Vacations Pvt Ltd. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Update root layout**

Replace `helanka/src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Helanka Vacations — Sri Lanka Holiday Tours",
    template: "%s — Helanka Vacations",
  },
  description:
    "Plan your dream Sri Lanka vacation. Custom tour packages from airport arrival to departure. Beaches, wildlife, tea country, ancient ruins.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Verify layout renders**

```bash
npm run dev
```

Visit `http://localhost:3000`. Confirm header with navigation and footer render. Click nav links — they should navigate (pages don't exist yet, that's fine — Next.js will show 404).

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/ src/app/layout.tsx
git commit -m "feat: add site header with navigation and footer"
```

---

## Remaining Tasks (Summary)

The following tasks follow the same pattern — test, implement, verify, commit. Each has full code in the plan file but is summarized here for overview:

### Task 8: Homepage
- Hero section with "Plan Your Trip" CTA
- Featured packages grid (query from DB)
- Destination highlights
- Testimonials section
- SEO metadata

### Task 9: Destinations Pages
- `/destinations` — grid with region filter, server component querying DB
- `/destinations/[slug]` — detail page with photos, highlights, related packages, "Build a Trip Here" CTA

### Task 10: Packages Pages
- `/packages` — listing with filters (duration, difficulty, region)
- `/packages/[slug]` — day-by-day itinerary, estimate range display, "Customize This Trip" CTA that navigates to `/build?package=[slug]`

### Task 11: Package Builder Wizard
- Zustand store (`use-builder-store.ts`) for wizard state: current step, selections, estimates
- `builder-shell.tsx` — step router with progress bar and estimate bar
- Steps 1-7 as individual components
- Rate card lookup for estimate ranges
- Draft auto-save to DB via server action (debounced)
- "Request Quote" at step 7 requires auth — redirect to login with return URL if not signed in
- PostHog event tracking per step transition

### Task 12: Booking Actions (Server Actions)
- `createDraftBooking` — creates booking with DRAFT status
- `updateBookingItems` — adds/updates line items in draft
- `submitQuoteRequest` — changes status to QUOTE_REQUESTED, sends email to admin
- Tests for each action with mocked Prisma

### Task 13: Admin Layout & Dashboard
- Admin sidebar navigation
- Dashboard page: pending quotes count (with SLA age indicators), recent bookings, revenue summary
- Pending quotes sorted by age: green (<12h), yellow (12-24h), red (>24h)

### Task 14: Admin Quote Pricing Interface
- `/admin/bookings/[id]` — line-item table with editable "actual price" column
- Notes field per line item
- "Send Quote" button → sets status to QUOTE_SENT, creates Quote record, sends email to customer
- Quote version tracking (increment on each send)

### Task 15: Customer Quote Review
- `/dashboard/bookings/[id]` — shows line items with confirmed prices
- "Accept & Pay Deposit" button → initiates WebXPay flow
- "Request Changes" button → opens text field for revision notes, sets status to REVISION_REQUESTED

### Task 16: WebXPay Integration
- `src/lib/webxpay.ts` — XGATEWAY client (initiate payment, verify callback)
- `src/app/api/webhooks/webxpay/route.ts` — payment callback handler
- `payment-actions.ts` — initiate deposit, handle confirmation
- On success: update booking to CONFIRMED, send confirmation emails
- Tests with mocked WebXPay responses

### Task 17: Admin CRUD Pages
- `/admin/packages` — create, edit, delete packages
- `/admin/destinations` — create, edit, delete destinations with photo upload
- `/admin/rate-cards` — manage estimate ranges by tier/season
- `/admin/users` — view customer list, search
- `/admin/blog` — create, edit, publish blog posts

### Task 18: Customer Dashboard
- `/dashboard` — booking cards with status badges, sorted by date
- `/dashboard/profile` — update name, phone, country, change password

### Task 19: Email Notifications (Resend)
- `src/lib/email.ts` — Resend client with typed template functions
- Templates: welcome, quote requested (customer + admin), quote ready, quote expiring, quote expired, booking confirmed, revision requested, SLA warning
- Triggered from server actions at appropriate status transitions

### Task 20: Analytics Integration
- `PosthogProvider` client component wrapping the app
- GA4 script tag in root layout
- `track-event.ts` helper for custom PostHog events
- UTM parameter capture on first visit (stored in cookie, passed to booking)
- Server-side analytics event logging to `analytics_events` table

### Task 21: Blog & SEO Foundation
- `/blog` — paginated listing of published posts
- `/blog/[slug]` — full post with meta tags
- `robots.txt`, `sitemap.xml` (dynamic from DB), structured data (JSON-LD for TravelAgency, TouristTrip)
- OpenGraph and Twitter card meta tags on all public pages

### Task 22: Static Pages
- `/about` — company story, team, certifications
- `/group-experiences` — group travel, corporate retreats, weddings, MICE
- `/reviews` — published customer reviews
- `/partner` — B2B inquiry form
- `/terms` — terms and conditions

### Task 23: Quote Expiry Cron
- Server action or API route to check for expired quotes (valid_until < now)
- Update status to EXPIRED, send expiry email to customer
- Can be triggered by Vercel Cron (`vercel.json` cron config) running daily

### Task 24: Final Security Hardening
- Add rate limiting to auth routes (using `next-rate-limit` or custom middleware)
- Add CSP headers in `next.config.ts`
- Audit all server actions for auth checks
- Verify no sensitive data in client bundles
- Test admin routes are inaccessible without admin role

---

## Dependency Order

```
Task 1 (scaffold)
  → Task 2 (database)
    → Task 3 (auth)
      → Task 4 (UI components)
        → Task 5 (auth pages)
        → Task 6 (seed data)
        → Task 7 (layout)
          → Task 8 (homepage)
          → Task 9 (destinations)
          → Task 10 (packages)
            → Task 11 (builder wizard)
              → Task 12 (booking actions)
                → Task 13 (admin dashboard)
                → Task 14 (admin pricing)
                  → Task 15 (customer quote review)
                    → Task 16 (WebXPay)
          → Task 17 (admin CRUD) — parallel with 11-16
          → Task 18 (customer dashboard) — after Task 12
          → Task 19 (emails) — after Task 12
          → Task 20 (analytics) — after Task 7
          → Task 21 (blog + SEO) — after Task 7
          → Task 22 (static pages) — after Task 7
          → Task 23 (quote expiry) — after Task 14
          → Task 24 (security) — last
```
