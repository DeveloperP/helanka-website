# Helanka Vacations -- Go-Live Checklist

Complete these items before pointing `helanka.co` to the Vercel deployment.

## Domain & DNS

- [ ] Add `helanka.co` domain in Vercel project settings (mendisones-projects/helanka)
- [ ] Point DNS A record (`76.76.21.21`) or CNAME to Vercel
- [ ] Verify SSL certificate is issued

## Vercel Environment Variables

Set all of these in the Vercel dashboard (Settings > Environment Variables). Remove the `.env` file from the deployment once Vercel env vars are configured.

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

## OAuth Redirect URIs

Register these callback URLs in each provider's console:

- [ ] Google Cloud Console: `https://helanka.co/api/auth/callback/google`
- [ ] Microsoft Entra (Azure AD): `https://helanka.co/api/auth/callback/microsoft-entra-id`

## Database

- [ ] Provision fresh Neon Postgres database for production
- [ ] Run `npx prisma db push` against the new database
- [ ] Seed admin user with a strong password (change the default `Admin123!`)
- [ ] Purge all mock data from dev database (20 fake customers, test bookings, test traveler `sarah.test@gmail.com`)

## Final Verification

- [ ] Visit `https://helanka.co` and confirm homepage loads
- [ ] Test Build Your Trip wizard end-to-end
- [ ] Test Google sign-in flow
- [ ] Test Microsoft sign-in flow
- [ ] Test contact form (Turnstile + Resend email delivery)
- [ ] Test password reset flow (email delivery)
- [ ] Confirm PayPal is in live mode (no sandbox banner)
- [ ] Check admin dashboard loads at `/admin`
