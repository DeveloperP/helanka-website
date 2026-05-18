# Helanka Vacations Website Revamp — Design Spec

## Overview

Complete rebuild of helanka.co from a compromised WordPress site to a modern, secure travel platform. The core product is a trip builder wizard where customers configure their Sri Lanka vacation from airport arrival to departure, submit for a quote, and the Helanka team prices each line item before the customer confirms and pays a deposit.

**Client:** Helanka Vacations Pvt Ltd (helanka.co)
**Partner:** Ingress (ops@ingress.lk) — maintains site, manages content, develops AI social content
**Goal:** Replace referral-only model with organic + social traffic. Track every conversion by channel to prove ROI.

## Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 14+ (App Router, Server Components, Server Actions) | Full-stack in one framework, SSR for SEO, Vercel-native |
| Auth | Auth.js (NextAuth v5) — Email/Password + Google OAuth | Self-owned, no vendor lock-in, moves with DB migration |
| Database | Neon Postgres (serverless) + Prisma ORM | Standard Postgres, portable via pg_dump, scales to zero on idle |
| Payments | WebXPay XGATEWAY | Sri Lanka local payment gateway — cards, LankaQR, FriMi, mCash, EzCash |
| Analytics | PostHog + Google Analytics 4 | PostHog for product funnels/recordings, GA4 for SEO keyword data |
| Email | Resend | Transactional emails — quote notifications, booking confirmations, password resets |
| Hosting | Vercel (beta) → dedicated infrastructure (production) | Beta validates the model, migrate when traffic justifies it |
| Validation | Zod | Runtime type checking on all API inputs |
| Styling | Tailwind CSS | Utility-first, no runtime overhead, responsive by default |

## Site Map

### Public Pages
- `/` — Homepage: hero, featured packages, destinations, testimonials, trust signals
- `/destinations` — All destinations grid with filters (region, activity type)
- `/destinations/[slug]` — Destination detail (description, photos, activities available, related packages)
- `/packages` — Pre-built packages with filters (budget tier, duration, activity type)
- `/packages/[slug]` — Package detail (day-by-day itinerary, photos, reviews). CTA: "Customize This Trip" → feeds into builder
- `/build` — Package Builder wizard (7 steps)
- `/group-experiences` — Group travel, corporate retreats, weddings, MICE events, incentive travel
- `/about` — Company story, team, certifications, awards
- `/reviews` — Customer testimonials and reviews
- `/blog` — SEO content hub (travel guides, destination deep-dives, seasonal tips)
- `/blog/[slug]` — Individual blog post
- `/partner` — B2B partner inquiry page
- `/terms` — Terms & conditions, privacy policy

### Auth Pages
- `/login` — Email/password + Google OAuth sign-in
- `/register` — New account creation with email verification
- `/forgot-password` — Password reset flow

### Customer Dashboard (authenticated)
- `/dashboard` — My bookings overview with status indicators
- `/dashboard/bookings/[id]` — Booking detail: itinerary, quote status, line-item pricing, payment status, documents
- `/dashboard/profile` — Account settings, preferences

### Admin Panel (Ingress only, role-gated)
- `/admin` — Dashboard: pending quotes (with SLA warnings), revenue summary, booking pipeline
- `/admin/packages` — CRUD for packages, pricing estimate ranges, availability
- `/admin/destinations` — CRUD for destinations, photos, descriptions, activities
- `/admin/bookings` — All bookings, status management, quote pricing interface
- `/admin/bookings/[id]` — Line-item pricing interface: input exact price per item, add notes, send quote
- `/admin/users` — Customer account management
- `/admin/blog` — Blog post editor (markdown or rich text)
- `/admin/analytics` — Revenue by channel, conversion funnels, quote response times

### Removed from old site
- Golf Sri Lanka page (never launched, removed)
- Egypt destination page (placeholder, removed)
- WooCommerce shop (irrelevant merchandise, removed)
- All WordPress code, themes, plugins (security breach, complete clean break)

## Core Feature: Package Builder Wizard

### 7-Step Flow

1. **Arrival** — Date, flight number (optional), number of travelers, airport
2. **Destinations** — Select from available destinations, set nights per stop, drag to reorder route
3. **Accommodation** — Per destination: choose tier (3★ / 4★ / 5★ / Boutique). Show estimate range per tier.
4. **Activities** — Per destination: select from available activities. Show estimate range per activity.
5. **Transport & Add-ons** — Vehicle class (standard / premium / luxury). Add-ons: airport pickup, SIM card, travel insurance, photographer, etc.
6. **Departure** — Date, airport transfer preference
7. **Review & Submit** — Full trip summary with estimate ranges per line item. Estimated total range. "Request Quote" button (requires sign-in).

### Builder Behavior
- Running estimate range visible at every step (bottom bar)
- Draft auto-saved to database — user can close browser and resume later
- Each step transition fires a PostHog event for funnel analytics
- "Customize This Trip" from a pre-built package pre-fills the builder with that package's defaults
- Estimate ranges come from admin-maintained rate card tables (seasonal bands by region, star rating, activity type)

## Core Feature: Loopback Quotation System

### Flow

```
Customer builds trip (DRAFT)
    ↓
Customer submits "Request Quote" (QUOTE_REQUESTED)
    ↓ email: "We've received your trip request"
Helanka team prices line items in admin (PRICING_IN_PROGRESS)
    ↓
Helanka sends quote (QUOTE_SENT)
    ↓ email: "Your quote is ready — review it in your dashboard"
Customer reviews line-by-line pricing
    ├── Accepts → pays deposit via WebXPay (CONFIRMED)
    └── Requests changes → loops back to Helanka (REVISION_REQUESTED)
         ↓
         Helanka reprices modified items → resends (QUOTE_SENT)
         (can loop multiple times)
```

### Booking Statuses
- `DRAFT` — Customer is building, not yet submitted
- `QUOTE_REQUESTED` — Submitted, awaiting Helanka pricing
- `PRICING_IN_PROGRESS` — Helanka team is working on it
- `QUOTE_SENT` — Quote sent to customer, awaiting response
- `REVISION_REQUESTED` — Customer wants changes, back to Helanka
- `CONFIRMED` — Customer accepted, deposit paid
- `BALANCE_DUE` — Trip upcoming, balance payment pending
- `COMPLETED` — Trip finished
- `CANCELLED` — Booking cancelled
- `EXPIRED` — Quote expired (7-day auto-expiry)

### Admin Pricing Interface
- List view of pending quote requests, sorted by age (oldest first)
- SLA warning indicators: yellow at 12h, red at 24h, flashing at 48h
- Per-booking: table of line items with estimate range column and editable "actual price" column
- Notes field per line item (e.g., "hotel upgraded due to availability")
- Global notes field for the quote
- "Send Quote" button triggers email + dashboard notification to customer
- Quote history: every version stored, viewable as audit trail

### Safeguards
- Quotes auto-expire after 7 days (configurable). Customer sees "Quote expired — request a fresh quote" with one click.
- Revision loop flag: after 3 round-trips, admin dashboard highlights the booking for direct phone follow-up.
- Response time tracking: admin dashboard shows average quote turnaround time as a KPI.

## Payment Flow (WebXPay)

- Deposit only for beta launch (30% of confirmed quote total)
- Integration via WebXPay XGATEWAY API
- Supported methods: cards (Visa/MC/Amex), LankaQR, FriMi, mCash, EzCash, JustPay
- No customer payment data stored in our database — WebXPay handles PCI compliance
- Payment reference stored in bookings table for reconciliation
- Balance payment handled offline (bank transfer or on-arrival)
- Phase 2: XSPLIT installment plans for luxury packages

## Conversion Tracking Architecture

### PostHog Events
- `page_view` — every page, with UTM params
- `package_view` — specific package detail page
- `builder_start` — wizard step 1 loaded
- `builder_step_N` — each wizard step (1-7)
- `quote_requested` — builder submitted
- `quote_viewed` — customer opened their quote
- `quote_accepted` — customer clicked accept
- `deposit_paid` — WebXPay payment confirmed
- `revision_requested` — customer asked for changes

### GA4 Integration
- Standard pageview tracking
- Google Search Console linked — keyword performance data
- UTM parameter passthrough for campaign attribution

### UTM Strategy for AI Social Content
- Every social post links to a specific package or destination page
- Format: `?utm_source=instagram&utm_medium=social&utm_campaign=ai-content-jun2026&utm_content=ella-hill-country`
- PostHog captures full UTM params on first visit, carries through to booking
- Revenue attribution in admin: "This booking originated from Instagram post about Ella"

### Attribution Storage
Every booking record stores:
- `source_channel` — organic / social / referral / direct
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`
- `referral_code` (if from referral program, Phase 2)

Admin analytics dashboard shows: revenue per channel, bookings per channel, average quote value per channel, conversion rate per channel.

## Security Architecture

### Authentication
- Auth.js with bcrypt password hashing (cost factor 12)
- CSRF tokens on all state-changing forms and API routes
- Rate limiting on login (5 attempts per 15 minutes per IP), register (3 per hour per IP)
- Email verification required before account activation
- Secure session cookies: httpOnly, sameSite=lax, secure=true
- Session expiry: 30 days, sliding window

### Data Protection
- Prisma parameterized queries — SQL injection prevention by design
- Zod validation on every API route input — reject malformed data at the boundary
- No customer payment card data stored — WebXPay tokenization handles PCI
- Role-based access control: `customer` and `admin` roles enforced in middleware
- Admin routes require `admin` role — checked server-side, not just UI-hidden

### Infrastructure
- Zero code from WordPress — complete clean break, new repo
- Neon Postgres with SSL-only connections enforced
- All secrets in environment variables (Vercel env, never in code)
- Vercel's DDoS protection and global edge network
- HTTPS enforced (Vercel default)

### Content Security
- Content Security Policy headers (script-src, style-src, img-src restricted)
- XSS prevention via React's built-in output escaping
- Image uploads validated (file type, size limit) and served from a separate domain/CDN
- Admin routes behind authentication middleware — no public access

## Database Schema (High Level)

### Core Tables
- `users` — id, email, name, phone, country, role (customer/admin), email_verified, auth_provider, created_at, last_login
- `sessions` — Auth.js managed session table
- `bookings` — id, user_id, status, arrival_date, departure_date, num_travelers, source_channel, utm_source/medium/campaign/content, created_at, updated_at
- `booking_items` — id, booking_id, type (accommodation/activity/transport/addon), destination, description, dates, estimate_min, estimate_max, actual_price (null until Helanka prices it), notes
- `quotes` — id, booking_id, version, total_price, deposit_amount, valid_until, sent_at, responded_at, response (accepted/revision/expired), admin_notes
- `payments` — id, booking_id, quote_id, amount, method, webxpay_reference, status, paid_at

### Content Tables
- `destinations` — id, name, slug, region, description, photos, activities_available, is_active
- `packages` — id, name, slug, description, duration_days, highlights, difficulty, region, is_active
- `package_items` — id, package_id, type, destination_id, description, order (for pre-filling the builder)
- `rate_cards` — id, item_type, region, tier, season, min_price, max_price, updated_at (admin-maintained estimate ranges)
- `blog_posts` — id, title, slug, content, author, published_at, is_published, meta_title, meta_description
- `reviews` — id, user_id, booking_id, rating, title, body, is_published, created_at

### Analytics Table
- `analytics_events` — id, session_id, user_id (nullable), event_type, event_data (jsonb), source_channel, utm_params (jsonb), created_at

## Email Notifications (via Resend)

| Trigger | Recipient | Content |
|---|---|---|
| Account created | Customer | Welcome + verify email link |
| Quote requested | Customer | "We received your trip request, we'll have your quote within 24h" |
| Quote requested | Admin | "New quote request from [name] — [destinations] — [dates]" |
| Quote sent | Customer | "Your personalized quote is ready — review it in your dashboard" |
| Quote expiring (day 6) | Customer | "Your quote expires tomorrow — review it before rates change" |
| Quote expired | Customer | "Your quote has expired — request a fresh quote with one click" |
| Deposit paid | Customer | Booking confirmation with itinerary summary |
| Deposit paid | Admin | "Booking confirmed — [name] paid deposit for [trip]" |
| Revision requested | Admin | "Customer requested changes to quote #[id]" |
| SLA warning (24h+) | Admin | "Quote request from [name] is waiting 24+ hours" |

## Timeline

| Week | Deliverables |
|---|---|
| 1 | Project scaffold, auth system (Auth.js), database schema (Prisma + Neon), seed data |
| 2-3 | Public pages: homepage, destinations, packages (with "Customize This Trip" CTA), about, reviews |
| 3-4 | Package Builder wizard (7 steps), estimate engine with rate cards, draft saving |
| 5 | Loopback quotation system: admin pricing interface, quote send/review/accept/revise flow |
| 6 | WebXPay deposit integration, booking confirmation flow, email notifications (Resend) |
| 7 | Customer dashboard (bookings, quote status, profile), admin dashboard (pending quotes, SLA tracking) |
| 8 | PostHog + GA4 integration, UTM tracking, conversion funnels, admin analytics view |
| 9 | Blog/content section, SEO foundation (meta tags, structured data, sitemap, robots.txt) |
| 10 | Group Experiences page, testing, security hardening, performance optimization, beta launch |

## Phase 2 (Post-Beta)

- AI social content pipeline and influencer automation
- Referral program with tracking codes and rewards
- Post-trip automated review request system
- WhatsApp Business integration (floating button, pre-filled messages, tracked)
- Desktop single-page builder (hybrid wizard + overview for power users)
- WebXPay XSPLIT installment plans for luxury packages
- Database migration from Neon to dedicated production server
