import type { NextAuthConfig } from "next-auth";

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        session.user.role = token.role as any;
      }
      return session;
    },
  },
};
