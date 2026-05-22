import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const specialistAllowed = ["/admin/sessions", "/admin/customers", "/admin/account"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // /account — redirect ADMIN/SPECIALIST to /admin/account, require auth for customers
  if (pathname.startsWith("/account")) {
    if (!session) {
      const loginUrl = new URL("/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.user?.role === "ADMIN" || session.user?.role === "SPECIALIST") {
      return NextResponse.redirect(new URL("/admin/account", req.nextUrl.origin));
    }
    return NextResponse.next();
  }

  // /admin/* — role-based access
  if (pathname.startsWith("/admin")) {
    if (!session) {
      const loginUrl = new URL("/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const role = session.user?.role;
    if (role === "ADMIN") return NextResponse.next();

    if (role === "SPECIALIST") {
      const isAllowed =
        pathname === "/admin" ||
        specialistAllowed.some((prefix) => pathname.startsWith(prefix));
      if (isAllowed) return NextResponse.next();
      return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
    }

    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
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
  matcher: ["/admin/:path*", "/dashboard/:path*", "/build/:path*", "/account/:path*"],
};
