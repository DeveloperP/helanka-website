/**
 * Next.js App Router catch-all route handler for Auth.js v5.
 *
 * The `handlers` object returned by NextAuth() exposes GET and POST
 * functions that handle all Auth.js internal routes under /api/auth/*.
 */
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
