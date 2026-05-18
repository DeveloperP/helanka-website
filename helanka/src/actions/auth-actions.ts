"use server";

/**
 * Server Actions for authentication (register & login).
 *
 * These are called from client-side forms. They validate input with Zod,
 * interact with the database via Prisma, and invoke Auth.js signIn.
 */
import { signIn } from "@/lib/auth";
import { registerSchema, loginSchema } from "@/lib/validations";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

// ---------------------------------------------------------------------------
// registerUser
// ---------------------------------------------------------------------------

/**
 * Validates, hashes the password, creates the user, then signs them in.
 */
export async function registerUser(formData: FormData): Promise<ActionResult> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as string;
      fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
    }
    return { success: false, fieldErrors };
  }

  const { name, email, password } = parsed.data;

  // Check for duplicate email
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return {
      success: false,
      error: "An account with this email already exists.",
    };
  }

  // Hash password (cost factor 12)
  const passwordHash = await bcrypt.hash(password, 12);

  // Create the user
  await db.user.create({
    data: { name, email, passwordHash },
  });

  // Sign in immediately using the credentials provider
  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (err) {
    if (err instanceof AuthError) {
      return { success: false, error: "Account created but sign-in failed. Please log in." };
    }
    throw err;
  }

  return { success: true };
}

// ---------------------------------------------------------------------------
// loginUser
// ---------------------------------------------------------------------------

/**
 * Validates credentials and signs the user in via the credentials provider.
 */
export async function loginUser(formData: FormData): Promise<ActionResult> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as string;
      fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
    }
    return { success: false, fieldErrors };
  }

  const { email, password } = parsed.data;

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (err) {
    if (err instanceof AuthError) {
      return { success: false, error: "Invalid email or password." };
    }
    throw err;
  }

  return { success: true };
}
