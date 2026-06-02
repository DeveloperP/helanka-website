import type { Metadata } from "next";
import Link from "next/link";
import RegisterForm from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create Account — Helanka Vacations",
};

export default function RegisterPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: "url('/images/bg-auth-page.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />

      <div className="relative z-10 w-full max-w-md">
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
            <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
            <p className="mt-2 text-sm text-slate-500">
              Start planning your Sri Lanka adventure.
              <br />
              It only takes a moment.
            </p>
          </div>

          <RegisterForm />

          {/* Footer link */}
          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-slate-900 hover:text-slate-700"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
