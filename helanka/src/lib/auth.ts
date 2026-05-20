/**
 * Auth.js v5 (next-auth@beta.31) configuration for Helanka Vacations.
 *
 * Key v5 differences from v4:
 *  - Single default export `NextAuth(config)` that returns { handlers, auth, signIn, signOut }
 *  - PrismaAdapter accepts the db instance directly (no wrapping needed)
 *  - Session strategy is "jwt" by default when using Credentials
 *  - JWT / session callbacks receive { token, user, session } objects
 */

import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validations";

// Import side-effect to register type augmentations
import "@/types/index";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
    }),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validate shape with Zod
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // Look up user
        const user = await db.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) return null;

        // Compare password
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        // Update lastLogin (fire-and-forget — don't block sign-in)
        db.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        }).catch(() => void 0);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // `user` is only present on the initial sign-in
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as import("@prisma/client").UserRole;
      }
      return session;
    },
  },
});
