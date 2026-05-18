# Helanka Vacations (helanka.co) - Site Audit & Revamp Proposal

## Current State Assessment

### Company Profile
- **Name:** Helanka Vacations Pvt Ltd
- **Location:** No. 471, Cotta Road, Rajagiriya, Colombo, Sri Lanka
- **Phone:** +94 11 7400857
- **Email:** tours@helanka.co (general), coo@helanka.co (partnerships)
- **Socials:** Instagram @helankavacations, Facebook HVSriLanka, LinkedIn
- **Hours:** Mon-Sun 9AM-7PM
- **TripAdvisor:** 5.0 stars (only 1 review - major problem)

### What They Offer
1. **5 Pre-built Tour Packages:**
   - Golden Sands of Southern Coast (Bentota)
   - Throbbing Adventure Tour (Kitulgala)
   - Sri Lanka Hill Country Tours (Nuwara Eliya, 6D/5N)
   - Warm Waters of East Coast (Kalpitiya)
   - Wildlife Adventure Tours (Udawalawa)
2. **Custom Vacations** - tailored to interests, timeframes, budgets
3. **MICE Services** - Meetings, Incentives, Conferences, Exhibitions
4. **Golf Tourism** - dedicated Golf Sri Lanka section
5. **B2B Partnerships** - agent/canvassing partnerships
6. **Merchandise Shop** - flip flops, slippers, pads ($15-$205) - barely functional

### 10 Destinations Featured
Arugambay, Anuradhapura, Yala, Knuckles, Wilpattu, Colombo, Koggala, Galle, Kitulgala, Nuwara Eliya, Sigiriya

---

## CRITICAL ISSUES FOUND

### 1. SECURITY BREACH - Services Page Compromised
The `/helanka-services/` page has been **hijacked by gambling spam** (Slot777, Paristogel, "Slot Gacor"). This is an SEO poison pill - Google will penalize the entire domain. This alone could explain poor organic traffic. The page redirects to gambling content with links to `helanka-amp.pages.dev`.

**Impact:** Google may have flagged the entire domain as compromised. This is priority zero.

### 2. Orphan/Placeholder Pages Live in Production
- `/destinations/egypt/` - Lorem Ipsum placeholder content
- `/elements/google-maps/` - exposed template element page
- Multiple WooCommerce shop pages with placeholder products

These tell Google the site is unmaintained and low-quality.

### 3. Zero SEO Foundation
- No visible meta titles or descriptions
- No structured data (Schema.org for TourOperator, TravelAgency, TouristTrip)
- No blog/content marketing
- No keyword targeting
- Images lack alt text
- Only 1 TripAdvisor review (competitors have hundreds)

### 4. No Conversion Funnel
- "Rates on request" on every package - massive friction
- No online booking capability
- No package builder/customizer
- Registration is disabled ("You don't have permission to register")
- Single CTA is a vague "GO!" button
- No lead capture forms, no email signup, no WhatsApp widget

### 5. Poor User Experience
- WordPress theme template, not customized for travel
- Shop selling random merchandise dilutes the travel brand
- No mobile optimization evidence
- No search functionality for packages
- No filters (budget, duration, activity type)

### 6. No Trust Signals for Organic Visitors
- Awards/certifications shown but not prominently
- Only 1 TripAdvisor review
- No Google Reviews presence
- No user-generated content
- No social proof beyond 3 testimonials on homepage

---

## COMPETITIVE LANDSCAPE

Sri Lanka travel market online is dominated by:
- **Intrepid Travel** - strong SEO, transparent pricing, online booking
- **G Adventures** - content-heavy, social proof, instant booking
- **Local competitors** (Jetwing, Walkers Tours) - established brands with full digital presence

Helanka is invisible in this space. They survive purely on referrals, which confirms the problem.

---

## PROPOSED REVAMP ARCHITECTURE

### Tech Stack (Beta on Vercel, Production on dedicated DB later)
```
Frontend:  Next.js 14+ (App Router, Server Components)
Backend:   Next.js API Routes + Server Actions
Database:  Vercel Postgres (beta) → migrate to dedicated DB (production)
Auth:      NextAuth.js (customer accounts)
CMS:       Sanity or Payload CMS (content management for Helanka team)
Payments:  Stripe (deposits/full payments)
Analytics: PostHog (conversion tracking, funnels, A/B testing)
Email:     Resend (transactional) + Loops (marketing)
Hosting:   Vercel (beta) → evaluate for production
```

### Core Features - Phase 1 (MVP)

#### A. Package Builder (Airport-to-Departure)
Customers build their trip step by step:
1. **Arrival Details** - date, flight, number of travelers
2. **Accommodation Tier** - 3★ / 4★ / 5★ / Boutique (with real pricing)
3. **Destinations** - pick from map or list, drag to reorder
4. **Activities** - per destination (wildlife safari, beach, cultural, adventure)
5. **Transport** - standard / premium / luxury vehicle
6. **Add-ons** - airport pickup, SIM card, travel insurance, photographer
7. **Departure** - date, airport transfer
8. **Instant Quote** - calculated in real-time, not "rates on request"
9. **Book / Inquire** - pay deposit online or request callback

#### B. Pre-Built Packages (Quick Buy)
- Redesigned package cards with: duration, price range, highlights, difficulty level
- Filter by: budget, duration, activity type, region
- Each package has a detailed page with day-by-day itinerary, photos, reviews
- "Customize This Package" button feeds into the Package Builder

#### C. Customer Accounts
- Sign up / Sign in (email + Google OAuth)
- Dashboard: bookings, itinerary, documents, chat with travel designer
- Trip status tracking (confirmed, deposit paid, fully paid, in-progress)
- Post-trip: leave review, share photos, refer friends

#### D. Conversion Tracking System
Every touchpoint tracked:
- **UTM parameters** on all inbound links
- **Event tracking:** page views, package views, builder starts, builder completions, inquiries, bookings
- **Attribution:** which channel (organic, social, referral, paid) drove each conversion
- **Funnel visualization:** visitor → package view → builder start → quote → booking
- **Revenue attribution:** tie each booking back to acquisition channel
- **A/B testing:** test headlines, CTAs, pricing display, layout variations
- **Goal:** prove ROI of the new site + AI content strategy vs. old referral-only model

### Core Features - Phase 2 (Growth)

#### E. Content Engine (SEO + Social)
- Blog with Sri Lanka travel guides, destination deep-dives, seasonal tips
- AI-generated social content (the influencer angle Ingress is providing)
- Integration: social posts link back to relevant packages
- Each piece of content has conversion CTAs embedded

#### F. Review & Social Proof System
- Post-trip automated review requests
- Display reviews per package and per destination
- TripAdvisor/Google Review integration
- Photo gallery from real travelers

#### G. Referral Program
- Existing clients get a referral code
- Track referral → booking conversion
- Reward structure (discount on next trip or cash)

#### H. WhatsApp Business Integration
- Floating WhatsApp button on every page
- Pre-filled messages per package
- Chat-to-booking funnel tracked

---

## CONVERSION TRACKING ARCHITECTURE

```
┌─────────────────────────────────────────────────────┐
│                    TRAFFIC SOURCES                    │
├──────────┬──────────┬───────────┬───────────────────┤
│ Organic  │ Social   │ Referral  │ Paid (future)     │
│ (SEO)    │ (AI      │ (current  │                   │
│          │ content) │ clients)  │                   │
└────┬─────┴────┬─────┴─────┬─────┴─────┬─────────────┘
     │          │           │           │
     ▼          ▼           ▼           ▼
┌─────────────────────────────────────────────────────┐
│              PostHog Analytics Layer                  │
│  UTM tracking · Session recording · Feature flags    │
│  Custom events · Funnels · Cohorts · A/B tests       │
└────────────────────┬────────────────────────────────┘
                     │
     ┌───────────────┼───────────────┐
     ▼               ▼               ▼
┌─────────┐   ┌───────────┐   ┌──────────┐
│ Funnel  │   │ Revenue   │   │ Channel  │
│ Events  │   │ Events    │   │ Compare  │
│         │   │           │   │          │
│ view    │   │ quote_gen │   │ organic  │
│ search  │   │ deposit   │   │ vs       │
│ build   │   │ full_pay  │   │ social   │
│ quote   │   │ upsell    │   │ vs       │
│ inquiry │   │           │   │ referral │
│ book    │   │           │   │          │
└─────────┘   └───────────┘   └──────────┘
```

This gives you a clear dashboard showing:
- "X visitors came from AI social content this month"
- "Y of those started building a package"
- "Z converted to bookings worth $N"
- Direct comparison: new channels vs. existing referrals

---

## DATABASE DESIGN (HIGH LEVEL)

```
users
├── id, email, name, phone, country
├── auth_provider (email/google)
└── created_at, last_login

bookings
├── id, user_id, status (draft/quoted/deposited/paid/active/completed)
├── arrival_date, departure_date
├── total_price, deposit_paid, balance
├── source_channel (organic/social/referral/direct)
├── utm_source, utm_medium, utm_campaign
└── created_at

booking_items
├── id, booking_id
├── type (accommodation/transport/activity/addon)
├── destination, date, details
└── price

packages (pre-built templates)
├── id, name, slug, description
├── duration_days, price_from
├── difficulty, region, highlights
└── is_active

reviews
├── id, user_id, booking_id
├── rating, title, body, photos
└── is_published

analytics_events
├── id, session_id, user_id (nullable)
├── event_type, event_data (jsonb)
├── source_channel, utm_params
└── created_at

referrals
├── id, referrer_user_id, code
├── referred_user_id, booking_id
├── status (sent/clicked/converted)
└── reward_status
```

---

## RECOMMENDED PATH

### Immediate (Week 1)
1. **Fix the security breach** - clean the compromised services page, audit all WordPress pages for injected content, change all admin passwords
2. **Remove placeholder pages** - Egypt, Google Maps element, broken shop
3. **Set up the new Next.js project on Vercel** - start building while cleanup happens

### Phase 1 - Beta (Weeks 2-6)
4. Build the package browser + package builder
5. Customer auth + accounts
6. PostHog analytics integration
7. Basic CMS for Helanka team to manage content
8. Deploy beta on Vercel

### Phase 2 - Launch (Weeks 7-10)
9. SEO foundation (meta tags, structured data, sitemap, robots.txt)
10. Blog/content section
11. WhatsApp integration
12. Review system
13. Payment processing (Stripe)
14. Migrate from old WordPress site

### Phase 3 - Growth (Ongoing)
15. AI social content pipeline (the influencer strategy)
16. Referral program
17. A/B testing optimization
18. Database migration to dedicated server when traffic justifies it

---

## KEY METRICS TO TRACK FROM DAY 1

| Metric | Current (estimated) | Target (6 months) |
|--------|--------------------|--------------------|
| Monthly organic visitors | ~50-100 | 2,000+ |
| Organic booking inquiries | 0 | 30+/month |
| Conversion rate (visit → inquiry) | N/A | 3-5% |
| Conversion rate (inquiry → booking) | Unknown | 20-30% |
| Social-driven traffic | 0 | 500+/month |
| Average booking value | Unknown | Track from day 1 |
| Customer acquisition cost by channel | Unknown | Track from day 1 |
| TripAdvisor reviews | 1 | 25+ |

---

## BUDGET CONSIDERATIONS

### Vercel (Beta)
- Free tier covers beta testing easily
- Pro plan ($20/mo) when traffic grows
- Vercel Postgres included

### Production Migration (Later)
- Dedicated PostgreSQL (Supabase, Neon, or self-hosted)
- Cost depends on scale - cross that bridge when beta proves the model

### Third-Party Services
- PostHog: Free tier (1M events/mo)
- Resend: Free tier (100 emails/day)
- Stripe: 2.9% + $0.30 per transaction
- Sanity CMS: Free tier (generous)
