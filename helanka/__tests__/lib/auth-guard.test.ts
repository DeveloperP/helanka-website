/**
 * Unit tests for src/lib/auth-guard.ts
 *
 * Strategy:
 *  - Mock `@/lib/auth` so `auth()` returns a controllable value.
 *  - Mock `next/navigation` so `redirect()` can be observed without throwing.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks (must be declared before the dynamic import below)
// ---------------------------------------------------------------------------

const mockAuth = vi.fn();

vi.mock("@/lib/auth", () => ({
  auth: mockAuth,
  handlers: { GET: vi.fn(), POST: vi.fn() },
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

// next/navigation redirect throws a special error in Next.js internals.
// We replace it with a jest-style spy that just throws a plain Error so we
// can assert it was called without needing the full Next.js runtime.
const mockRedirect = vi.fn((path: string): never => {
  throw new Error(`REDIRECT:${path}`);
});

vi.mock("next/navigation", () => ({
  redirect: mockRedirect,
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSession(role: "CUSTOMER" | "ADMIN" = "CUSTOMER") {
  return {
    user: { id: "user-1", email: "test@example.com", name: "Test", role },
    expires: new Date(Date.now() + 3_600_000).toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

// Dynamically import AFTER mocks are hoisted
const { requireAuth, requireAdmin, getOptionalSession } = await import(
  "@/lib/auth-guard"
);

describe("requireAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to /login when there is no session", async () => {
    mockAuth.mockResolvedValueOnce(null);

    await expect(requireAuth()).rejects.toThrow("REDIRECT:/login");
    expect(mockRedirect).toHaveBeenCalledWith("/login");
  });

  it("returns the session when the user is authenticated", async () => {
    const session = makeSession("CUSTOMER");
    mockAuth.mockResolvedValueOnce(session);

    const result = await requireAuth();
    expect(result).toBe(session);
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});

describe("requireAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to /login when there is no session", async () => {
    mockAuth.mockResolvedValueOnce(null);

    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/login");
    expect(mockRedirect).toHaveBeenCalledWith("/login");
  });

  it("redirects to /dashboard when user is authenticated but not ADMIN", async () => {
    const session = makeSession("CUSTOMER");
    mockAuth.mockResolvedValueOnce(session);

    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/dashboard");
    expect(mockRedirect).toHaveBeenCalledWith("/dashboard");
  });

  it("returns the session when the user is an ADMIN", async () => {
    const session = makeSession("ADMIN");
    mockAuth.mockResolvedValueOnce(session);

    const result = await requireAdmin();
    expect(result).toBe(session);
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});

describe("getOptionalSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when there is no session", async () => {
    mockAuth.mockResolvedValueOnce(null);

    const result = await getOptionalSession();
    expect(result).toBeNull();
  });

  it("returns the session when authenticated", async () => {
    const session = makeSession("CUSTOMER");
    mockAuth.mockResolvedValueOnce(session);

    const result = await getOptionalSession();
    expect(result).toBe(session);
  });
});
