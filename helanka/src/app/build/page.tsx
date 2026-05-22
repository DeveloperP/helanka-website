import TripWizard from "./trip-wizard";

export const metadata = {
  title: "Build Your Trip",
};

const DEV_USER = { name: "Traveler", email: "demo@helanka.co" };

export default async function BuildPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  let user = DEV_USER;

  if (process.env.NODE_ENV === "production" || process.env.AUTH_ENABLED === "1") {
    try {
      const { auth } = await import("@/lib/auth");
      const session = await auth();
      if (session?.user) {
        user = {
          name: session.user.name ?? "Traveler",
          email: session.user.email ?? "",
        };
      }
    } catch {
      // DB/auth unavailable — fall through to dev user
    }
  }

  const params = await searchParams;
  const initialDestination = typeof params.destination === "string" ? params.destination : undefined;
  const initialGuests = typeof params.guests === "string" ? params.guests : undefined;
  const initialArrival = typeof params.arrival === "string" ? params.arrival : undefined;

  return (
    <TripWizard
      user={user}
      initialDestination={initialDestination}
      initialGuests={initialGuests}
      initialArrival={initialArrival}
    />
  );
}
