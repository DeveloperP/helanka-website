/**
 * Next.js middleware for route-level auth protection.
 *
 * Auth.js v5: wrap your own middleware with `auth` so `req.auth` is available,
 * or export `auth` directly as middleware for simple allow/deny logic.
 *
 * Protected routes:
 *  /dashboard/* — requires any authenticated user
 *  /admin/*     — requires ADMIN role
 */
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // /admin/* — must be authenticated AND be ADMIN
  if (pathname.startsWith("/admin")) {
    if (!session) {
      const loginUrl = new URL("/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
    }
  }

  // /dashboard/*, /build — must be authenticated
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/build")) {
    if (!session) {
      const loginUrl = new URL("/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  // Run on /dashboard and /admin paths; skip static assets and internal Next.js paths
  // TODO: restore "/dashboard/:path*" and "/build/:path*" when DB is wired
  matcher: ["/admin/:path*"],
};
