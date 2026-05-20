import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Reset Password — Helanka Vacations",
};

export default function ForgotPasswordPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: "url('/Helanka Auth page background.png')" }}
    >
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/10 border border-white/60 px-8 py-10">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-md flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-slate-900">Reset your password</h1>
            <p className="mt-2 text-sm text-slate-500">
              Enter your email and we&apos;ll send
              <br />
              you a reset link.
            </p>
          </div>

          {/* Reset form */}
          <form className="space-y-4">
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

            <button
              type="submit"
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 active:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            >
              Send Reset Link
            </button>
          </form>

          {/* Footer link */}
          <p className="mt-6 text-center text-sm text-slate-500">
            Remembered your password?{" "}
            <Link
              href="/login"
              className="font-medium text-slate-900 hover:text-slate-700"
            >
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
