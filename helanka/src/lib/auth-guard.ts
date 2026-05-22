/**
 * Auth guard helpers for use inside Server Components and Server Actions.
 *
 * `auth()` from next-auth v5 can be called without arguments inside
 * server-side code to retrieve the current session (or null).
 */
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { Session } from "next-auth";

/**
 * Asserts that a session exists.
 * Redirects to /login if the user is not authenticated.
 *
 * @returns The active Session object.
 */
export async function requireAuth(): Promise<Session> {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }
  return session;
}

/**
 * Asserts that the user is an ADMIN.
 * Redirects to /login if not authenticated.
 * Redirects to /dashboard if authenticated but not an ADMIN.
 *
 * @returns The active Session object (user is guaranteed to be ADMIN).
 */
export async function requireAdmin(): Promise<Session> {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  return session;
}

export async function requireAdminOrSpecialist(): Promise<Session> {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }
  if (session.user.role !== "ADMIN" && session.user.role !== "SPECIALIST") {
    redirect("/dashboard");
  }
  return session;
}

/**
 * Returns the current session or null without any redirects.
 * Safe to call in public Server Components.
 */
export async function getOptionalSession(): Promise<Session | null> {
  return auth();
}
