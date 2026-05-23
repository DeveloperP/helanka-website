import { auth } from "@/lib/auth";
import { HeaderClient } from "./header-client";

export default async function Header() {
  let session = null;
  try {
    session = await auth();
  } catch {}

  const user = session?.user
    ? {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: session.user.role ?? "CUSTOMER",
      }
    : null;

  return <HeaderClient user={user} />;
}
