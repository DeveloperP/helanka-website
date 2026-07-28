# Helanka Vacations -- Go-Live Checklist

Complete these items before pointing `helanka.co` to the Vercel deployment.

## 1. Security Fixes (DONE)

- [x] Server-validate PayPal payment amounts against quote deposit
- [x] Add booking ownership checks on payment endpoints
- [x] Fail Turnstile closed when secret key is missing
- [x] Sanitize blog HTML with sanitize-html before rendering
- [x] HTML-escape contact form inputs in email templates
- [x] Use timing-safe comparison for cron endpoint auth
- [x] Stop leaking PayPal API error details to clients
- [x] Move business spreadsheet out of public/ directory
- [x] Pin next-auth to exact version (5.0.0-beta.31)
- [ ] Rotate all credentials (database password, AUTH_SECRET, PayPal keys, Resend key, Turnstile secret)
- [ ] Implement PayPal webhook endpoint for disputes/refunds/chargebacks

## 2. Domain & DNS

- [ ] Add `helanka.co` domain in Vercel project settings (mendisones-projects/helanka)
- [ ] Point DNS A record (`76.76.21.21`) or CNAME to Vercel
- [ ] Verify SSL certificate is issued

## 3. Vercel Environment Variables

Set all of these in the Vercel dashboard (Settings > Environment Variables).

- [ ] `DATABASE_URL` -- fresh production Neon database connection string
- [ ] `AUTH_SECRET` -- generate with `npx auth secret`
- [ ] `AUTH_URL` -- `https://helanka.co`
- [ ] `AUTH_GOOGLE_ID` -- production Google OAuth client ID
- [ ] `AUTH_GOOGLE_SECRET` -- production Google OAuth secret
- [ ] `AUTH_MICROSOFT_ENTRA_ID_ID` -- production Microsoft Entra ID client ID
- [ ] `AUTH_MICROSOFT_ENTRA_ID_SECRET` -- production Microsoft Entra ID secret
- [ ] `AUTH_MICROSOFT_ENTRA_ID_ISSUER` -- `https://login.microsoftonline.com/common/v2.0`
- [ ] `PAYPAL_CLIENT_ID` -- live PayPal client ID
- [ ] `PAYPAL_CLIENT_SECRET` -- live PayPal secret
- [ ] `NEXT_PUBLIC_PAYPAL_CLIENT_ID` -- same live PayPal client ID
- [ ] `PAYPAL_MODE` -- `live`
- [ ] `RESEND_API_KEY` -- production Resend key
- [ ] `RESEND_FROM_EMAIL` -- `bookings@helanka.co`
- [ ] `NEXT_PUBLIC_TURNSTILE_SITE_KEY` -- real Cloudflare Turnstile site key
- [ ] `TURNSTILE_SECRET_KEY` -- real Cloudflare Turnstile secret
- [ ] `NEXT_PUBLIC_POSTHOG_KEY` -- PostHog project key (optional)
- [ ] `NEXT_PUBLIC_GA4_MEASUREMENT_ID` -- Google Analytics 4 ID (optional)

## 4. OAuth Redirect URIs

Register these callback URLs in each provider's console:

- [ ] Google Cloud Console: `https://helanka.co/api/auth/callback/google`
- [ ] Microsoft Entra (Azure AD): `https://helanka.co/api/auth/callback/microsoft-entra-id`

## 5. Database

- [ ] Provision fresh Neon Postgres database for production
- [ ] Run `npx prisma db push` against the new database
- [ ] Run `npx tsx prisma/seed.ts` to seed destinations, packages, rate cards, excursions, and blog posts
- [ ] Run `npx tsx prisma/seed-production.ts --force` to create admin with a strong random password
- [ ] Run `npx tsx prisma/purge-mock-data.ts --confirm` to delete all 21 mock users and their data

## 6. Final Verification

- [ ] Visit `https://helanka.co` and confirm homepage loads
- [ ] Test Build Your Trip wizard end-to-end
- [ ] Test Google sign-in flow
- [ ] Test Microsoft sign-in flow
- [ ] Test contact form (Turnstile + Resend email delivery)
- [ ] Test password reset flow (email delivery)
- [ ] Confirm PayPal is in live mode (no sandbox banner)
- [ ] Check admin dashboard loads at `/admin`
