import type { Metadata } from "next";
import CancellationContent from "./cancellation-content";

export const metadata: Metadata = {
  title: "Cancellation Policy",
  description:
    "Cancellation fees and refund policy for Helanka Vacations bookings. Covers notice periods, refund processing, modifications, and travel insurance.",
};

export default function CancellationPolicyPage() {
  return <CancellationContent />;
}
