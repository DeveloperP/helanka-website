"use client";

import { Turnstile as TurnstileWidget } from "@marsidev/react-turnstile";

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

export default function Turnstile({ className }: { className?: string }) {
  if (!siteKey) return null;

  return (
    <div className={className}>
      <TurnstileWidget siteKey={siteKey} options={{ theme: "light", size: "flexible" }} />
    </div>
  );
}
