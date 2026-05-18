/**
 * Type augmentation for next-auth v5 (beta).
 *
 * In Auth.js v5 the canonical way to extend the built-in types is to
 * re-declare the interfaces that `next-auth` re-exports from `@auth/core/types`.
 * We extend `User`, `Session`, and the JWT via `@auth/core/jwt`.
 */

import type { UserRole } from ".prisma/client/enums";

// Augment next-auth's User / Session shapes
declare module "next-auth" {
  interface User {
    id: string;
    role: UserRole;
  }

  interface Session {
    user: {
      id: string;
      role: UserRole;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

// Augment the JWT payload
declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}

export type { UserRole };
