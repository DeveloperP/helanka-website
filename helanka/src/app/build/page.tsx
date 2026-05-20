import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import TripWizard from "./trip-wizard";

export const metadata = {
  title: "Build Your Trip",
};

export default async function BuildPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/build");
  }

  return (
    <TripWizard
      user={{
        name: session.user.name ?? "",
        email: session.user.email ?? "",
      }}
    />
  );
}
