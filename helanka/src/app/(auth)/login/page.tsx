import type { Metadata } from "next";
import Link from "next/link";
import { loginUser } from "@/actions/auth-actions";
import { signIn } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign In — Helanka Vacations",
};

export default function LoginPage() {
  async function handleGoogleSignIn() {
    "use server";
    await signIn("google", { redirectTo: "/dashboard" });
  }

  async function handleLoginUser(formData: FormData) {
    "use server";
    await loginUser(formData);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: "url('/Helanka Auth page background.png')" }}
    >
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/10 border border-white/60 px-8 py-10">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-md flex items-center justify-center">
              <span className="font-[family-name:var(--font-playfair)] text-2xl font-black text-[#0a0a0a]">
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
          <form action={handleLoginUser} className="space-y-4">
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Email"
                className="block w-full rounded-xl bg-slate-100/80 border-0 pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20 transition-all"
              />
            </div>

            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Password"
                className="block w-full rounded-xl bg-slate-100/80 border-0 pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20 transition-all"
              />
            </div>

            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 active:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            >
              Get Started
            </button>
          </form>

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
            <button
              type="button"
              disabled
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition-colors hover:bg-slate-50 opacity-50 cursor-not-allowed"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-[#1877F2]">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </button>
            <button
              type="button"
              disabled
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition-colors hover:bg-slate-50 opacity-50 cursor-not-allowed"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-black">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
            </button>
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
