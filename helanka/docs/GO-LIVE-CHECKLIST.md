# Go-Live Checklist

## Vercel Environment Variables

- [ ] Replace Cloudflare Turnstile **test keys** with real production keys from the Cloudflare dashboard
  - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (currently set to always-pass test key `1x00000000000000000000AA`)
  - `TURNSTILE_SECRET_KEY` (currently set to always-pass test key `1x0000000000000000000000000000000AA`)
  - Get real keys at: https://dash.cloudflare.com → Turnstile → Add site → helanka.vercel.app
- [ ] Verify `AUTH_URL` is set to the final production domain (currently `https://helanka.vercel.app`)
- [ ] Verify `AUTH_TRUST_HOST=true` is set
- [ ] Remove the bundled `.env` file from deployments or add it to `.vercelignore` to prevent localhost overrides
