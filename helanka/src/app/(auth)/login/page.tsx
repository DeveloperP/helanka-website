import type { Metadata } from "next";
import Link from "next/link";
import { signIn, auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign In — Helanka Vacations",
};

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    const role = session.user.role;
    if (role === "ADMIN" || role === "SPECIALIST") {
      redirect("/admin/sessions");
    }
    redirect("/dashboard");
  }

  async function handleGoogleSignIn() {
    "use server";
    await signIn("google", { redirectTo: "/dashboard" });
  }

  async function handleMicrosoftSignIn() {
    "use server";
    await signIn("microsoft-entra-id", { redirectTo: "/dashboard" });
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: "url('/images/bg-auth-page.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/10 border border-white/60 px-8 py-10">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-md flex items-center justify-center">
              <span className="font-[family-name:var(--font-display)] text-2xl font-black text-slate-950">
                H
              </span>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-slate-900">Sign in with email</h1>
            <p className="mt-2 text-sm text-slate-500">
              Welcome back to Helanka Vacations.
              <br />
              Plan your next adventure.
            </p>
          </div>

          {/* Credentials form */}
          <LoginForm />

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 border-t border-dashed border-slate-300" />
            <span className="text-xs text-slate-400">Or sign in with</span>
            <div className="flex-1 border-t border-dashed border-slate-300" />
          </div>

          {/* Social buttons */}
          <div className="flex gap-3">
            <form action={handleGoogleSignIn} className="flex-1">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition-colors hover:bg-slate-50 active:bg-slate-100"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              </button>
            </form>
            <form action={handleMicrosoftSignIn} className="flex-1">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition-colors hover:bg-slate-50 active:bg-slate-100"
              >
                <svg aria-hidden="true" viewBox="0 0 23 23" className="h-4 w-4 shrink-0">
                  <path fill="#f35325" d="M1 1h10v10H1z" />
                  <path fill="#81bc06" d="M12 1h10v10H12z" />
                  <path fill="#05a6f0" d="M1 12h10v10H1z" />
                  <path fill="#ffba08" d="M12 12h10v10H12z" />
                </svg>
              </button>
            </form>
          </div>

          {/* Footer link */}
          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-slate-900 hover:text-slate-700"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
