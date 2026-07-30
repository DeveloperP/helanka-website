import type { Metadata } from "next";
import TermsContent from "./terms-content";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms and conditions for booking with Helanka Vacations. Covers payment, cancellation, liability, travel documentation, and governing law.",
};

export default function TermsPage() {
  return <TermsContent />;
}
