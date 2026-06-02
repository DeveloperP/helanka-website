import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@prisma/client";

import "@/types/index";

/**
 * Edge-compatible auth config (no DB, no bcrypt).
 * Used by middleware for JWT verification and route protection.
 * Full providers are added in auth.ts which runs in Node.js.
 */
export const authConfig: NextAuthConfig = {
  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  providers: [],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
};
