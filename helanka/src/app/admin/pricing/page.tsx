import { requireAdmin } from "@/lib/auth-guard";
import {
  getRateCards,
  getDestinationsWithDistances,
  getDestinationDistances,
  getExcursions,
} from "@/actions/rate-card-actions";
import { PricingClient } from "./pricing-client";

export default async function AdminPricingPage() {
  await requireAdmin();

  const [rateCards, destinations, distances, excursions] = await Promise.all([
    getRateCards(),
    getDestinationsWithDistances(),
    getDestinationDistances(),
    getExcursions(),
  ]);

  return (
    <PricingClient
      initialRateCards={rateCards}
      destinations={destinations}
      initialDistances={distances}
      initialExcursions={excursions}
    />
  );
}
