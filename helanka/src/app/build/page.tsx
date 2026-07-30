import TripWizard from "./trip-wizard";

export const metadata = {
  title: "Build Your Trip",
  description:
    "Design your custom Sri Lanka itinerary. Choose destinations, activities, accommodation tier, and travel dates. Connect with a specialist for a personalized quote.",
};

const DEV_USER = { name: "Traveler", email: "demo@helanka.co" };

export default async function BuildPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  let user = DEV_USER;
  let isAuthenticated = false;

  try {
    const { auth } = await import("@/lib/auth");
    const session = await auth();
    if (session?.user) {
      user = {
        name: session.user.name ?? "Traveler",
        email: session.user.email ?? "",
      };
      isAuthenticated = true;
    }
  } catch {
    // DB/auth unavailable — fall through to dev user
  }

  const params = await searchParams;
  const initialDestination = typeof params.destination === "string" ? params.destination : undefined;
  const initialGuests = typeof params.guests === "string" ? params.guests : undefined;
  const initialArrival = typeof params.arrival === "string" ? params.arrival : undefined;

  return (
    <TripWizard
      user={user}
      isAuthenticated={isAuthenticated}
      initialDestination={initialDestination}
      initialGuests={initialGuests}
      initialArrival={initialArrival}
    />
  );
}
