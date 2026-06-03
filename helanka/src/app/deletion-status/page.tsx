import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Deletion — Helanka Vacations",
};

export default async function DeletionStatusPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 px-8 py-10 text-center">
        <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Data Deleted</h1>
        <p className="text-sm text-slate-500 mb-6">
          Your account data has been permanently removed from Helanka Vacations.
        </p>
        {code && (
          <p className="text-xs text-slate-400">
            Confirmation code: <span className="font-mono">{code}</span>
          </p>
        )}
      </div>
    </div>
  );
}
