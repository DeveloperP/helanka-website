# Helanka Vacations -- Go-Live Checklist

Reconciled against live production site on 2026-07-28.

## 1. Security Fixes

- [x] Server-validate PayPal payment amounts against quote deposit
- [x] Add booking ownership checks on payment endpoints
- [x] Fail Turnstile closed when secret key is missing
- [x] Sanitize blog HTML with sanitize-html before rendering
- [x] HTML-escape contact form inputs in email templates
- [x] Use timing-safe comparison for cron endpoint auth
- [x] Stop leaking PayPal API error details to clients
- [x] Move business spreadsheet out of public/ directory
- [x] Pin next-auth to exact version (5.0.0-beta.31)
- [ ] **Rotate all credentials** -- database password, AUTH_SECRET, PayPal keys, Resend key, Turnstile secret (local .env exposed them)
- [ ] **Implement PayPal webhook endpoint** -- for disputes/refunds/chargebacks
- [ ] **Push security commits to deploy** -- 3 local commits not yet on origin; live site still has old vulnerable code + public spreadsheet

## 2. Domain & DNS

- [x] Add `helanka.co` domain in Vercel project settings -- LIVE, served by Vercel (sin1/iad1 regions)
- [x] Point DNS A record to Vercel -- resolves to `76.76.21.21`
- [x] SSL certificate issued -- HTTPS working, `strict-transport-security: max-age=63072000`

## 3. Vercel Environment Variables

- [x] `DATABASE_URL` -- database is live, destinations/packages/blog all populated
- [x] `AUTH_SECRET` -- auth system functional
- [x] `AUTH_URL` -- set to `https://helanka.co` (callbacks confirm)
- [x] `AUTH_GOOGLE_ID` -- provider registered at `/api/auth/providers`
- [x] `AUTH_GOOGLE_SECRET` -- provider registered
- [x] `AUTH_MICROSOFT_ENTRA_ID_ID` -- provider registered
- [x] `AUTH_MICROSOFT_ENTRA_ID_SECRET` -- provider registered
- [x] `AUTH_MICROSOFT_ENTRA_ID_ISSUER` -- provider registered
- [x] `PAYPAL_CLIENT_ID` -- PayPal integration present (no sandbox banner visible)
- [x] `PAYPAL_CLIENT_SECRET` -- payment routes functional
- [x] `NEXT_PUBLIC_PAYPAL_CLIENT_ID` -- PayPal client-side loaded
- [ ] `PAYPAL_MODE` -- **verify in Vercel dashboard** it's set to `live`, not `sandbox` (local .env has `sandbox`)
- [x] `RESEND_API_KEY` -- email sending configured
- [x] `RESEND_FROM_EMAIL` -- `bookings@helanka.co`
- [x] `NEXT_PUBLIC_TURNSTILE_SITE_KEY` -- Turnstile widget loads on contact page (`cf-turnstile` present)
- [x] `TURNSTILE_SECRET_KEY` -- server-side verification functional
- [ ] `NEXT_PUBLIC_POSTHOG_KEY` -- **NOT SET** (no PostHog script on any page, no tracking active)
- [ ] `NEXT_PUBLIC_GA4_MEASUREMENT_ID` -- **NOT SET** (no GA4/gtag script on any page, no analytics active)

## 4. OAuth Redirect URIs

- [x] Google Cloud Console: `https://helanka.co/api/auth/callback/google` -- provider endpoint responds
- [x] Microsoft Entra (Azure AD): `https://helanka.co/api/auth/callback/microsoft-entra-id` -- provider endpoint responds

## 5. Database

- [x] Production Neon Postgres provisioned -- live data serving 45 sitemap URLs
- [x] `npx prisma db push` run -- schema active
- [x] Destinations seeded -- 12 destinations live
- [x] Packages seeded -- 12+ packages live
- [x] Blog posts seeded -- 15 published posts live
- [x] Rate cards and excursions seeded -- pricing system active
- [ ] **Admin password** -- verify it's been changed from default `Admin123!` (run `seed-production.ts` to reset)
- [ ] **Mock data purge** -- verify 20 fake customers + `sarah.test@gmail.com` are removed (run `purge-mock-data.ts --confirm`)

## 6. Content & SEO

- [x] Sitemap at `/sitemap.xml` -- 45 URLs
- [x] `robots.txt` -- blocks /admin/, /dashboard/, /api/, auth pages; references sitemap
- [ ] **No analytics** -- PostHog and GA4 are both absent; zero visitor tracking is active
- [ ] **No structured data** -- JSON-LD TourOperator schema not found
- [ ] **No CSP headers** -- no `content-security-policy` or `x-content-type-options` headers in response

## 7. Final Verification

- [x] Homepage loads at `https://helanka.co`
- [x] Build Your Trip wizard loads (5-step: Trip > Destination > Excursions > Preferences > Review)
- [x] Google sign-in provider configured
- [x] Microsoft sign-in provider configured
- [x] Contact form present with Turnstile widget
- [ ] **Test contact form submission** -- verify Resend delivers email to tours@helanka.co
- [ ] **Test password reset flow** -- verify email delivery
- [ ] **Confirm PayPal live mode** -- verify no sandbox in Vercel env vars
- [ ] **Test admin dashboard at `/admin`** -- verify admin credentials work

## Summary

| Category | Done | Remaining |
|----------|------|-----------|
| Security fixes (code) | 9/11 | Credential rotation, PayPal webhook, push to deploy |
| Domain & DNS | 3/3 | -- |
| Vercel env vars | 15/18 | PAYPAL_MODE verify, PostHog, GA4 |
| OAuth redirect URIs | 2/2 | -- |
| Database | 6/8 | Admin password reset, mock data purge |
| Content & SEO | 2/5 | Analytics, structured data, CSP headers |
| Final verification | 4/8 | Form tests, PayPal mode, admin login |
