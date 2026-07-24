"use client";

import { Suspense, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "@/actions/password-reset-actions";
import Turnstile from "@/components/turnstile";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!token || !email) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4 py-12 bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: "url('/images/bg-auth-page.webp')" }}
      >
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
        <div className="relative z-10 w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/10 border border-white/60 px-8 py-10 text-center">
            <p className="text-sm text-slate-600 mb-4">This reset link is invalid or has expired.</p>
            <Link href="/forgot-password" className="text-sm font-medium text-slate-900 underline hover:text-slate-700">
              Request a new link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("token", token!);
    formData.set("email", email!);

    const password = formData.get("password") as string;
    const confirm = formData.get("confirm") as string;
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    startTransition(async () => {
      const result = await resetPassword(formData);
      if (result.success) {
        setDone(true);
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: "url('/images/bg-auth-page.webp')" }}
    >
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/10 border border-white/60 px-8 py-10">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-md flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
          </div>

          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-slate-900">Choose a new password</h1>
            <p className="mt-2 text-sm text-slate-500">
              Enter your new password below.
            </p>
          </div>

          {done ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-slate-700 font-medium">Password updated</p>
              <p className="text-sm text-slate-500">You can now sign in with your new password.</p>
              <Link
                href="/login"
                className="inline-block mt-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
              >
                Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  placeholder="New password"
                  className="block w-full rounded-xl bg-slate-100/80 border-0 pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20 transition-all"
                />
              </div>

              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <input
                  name="confirm"
                  type="password"
                  required
                  minLength={8}
                  placeholder="Confirm new password"
                  className="block w-full rounded-xl bg-slate-100/80 border-0 pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20 transition-all"
                />
              </div>

              <Turnstile className="flex justify-center" />

              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 active:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? "Updating..." : "Reset Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
