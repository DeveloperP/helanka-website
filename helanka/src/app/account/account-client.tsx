"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { updateProfile, changePassword } from "@/actions/account-actions";

interface UserData {
  name: string | null;
  email: string;
  phone: string | null;
  country: string | null;
  image: string | null;
  role: string;
  createdAt: string;
  lastLogin: string | null;
  hasPassword: boolean;
}

interface TripSummary {
  id: string;
  tripType: string;
  status: string;
  createdAt: string;
  specialistName: string | null;
  destinations: string[];
  arrivalDate: string | null;
  departureDate: string | null;
}

const tabs = ["Profile", "My Trips", "Security"] as const;
type Tab = (typeof tabs)[number];

const tripTypeLabels: Record<string, string> = {
  package: "Package Tour",
  custom: "Custom Tour",
  mice: "MICE & Events",
};

const statusColors: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  IDLE: "bg-amber-100 text-amber-700",
  QUOTE_REQUESTED: "bg-blue-100 text-blue-700",
  CLOSED: "bg-slate-100 text-slate-500",
};

export function AccountClient({ user, trips }: { user: UserData; trips: TripSummary[] }) {
  const [activeTab, setActiveTab] = useState<Tab>("Profile");

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-16">
      <div className="max-w-3xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#ff9d00] to-[#e68d00] flex items-center justify-center text-white text-xl font-bold">
            {getInitials(user.name, user.email)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{user.name ?? "Your Account"}</h1>
            <p className="text-sm text-slate-500">{user.email}</p>
          </div>
        </div>

        <div className="flex gap-1 mb-6 bg-slate-100 rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 text-sm font-medium py-2.5 rounded-lg transition-all ${
                activeTab === tab
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Profile" && <ProfileTab user={user} />}
        {activeTab === "My Trips" && <TripsTab trips={trips} />}
        {activeTab === "Security" && <SecurityTab hasPassword={user.hasPassword} />}
      </div>
    </div>
  );
}

function ProfileTab({ user }: { user: UserData }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function handleSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await updateProfile(formData);
      setMessage(
        result.success
          ? { type: "success", text: "Profile updated." }
          : { type: "error", text: result.error ?? "Failed to save." }
      );
    });
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="text-lg font-bold text-slate-900 mb-5">Profile Information</h2>
      <form action={handleSubmit} className="space-y-4">
        <Field label="Full Name" name="name" type="text" defaultValue={user.name ?? ""} required />
        <Field label="Email" name="email" type="email" defaultValue={user.email} disabled />
        <Field label="Phone" name="phone" type="tel" defaultValue={user.phone ?? ""} placeholder="+94 77 123 4567" />
        <Field label="Country" name="country" type="text" defaultValue={user.country ?? ""} placeholder="Sri Lanka" />

        {message && (
          <p className={`text-sm ${message.type === "success" ? "text-emerald-600" : "text-red-600"}`}>
            {message.text}
          </p>
        )}

        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-400">
            Member since {new Date(user.createdAt).toLocaleDateString("en", { month: "long", year: "numeric" })}
            {user.lastLogin && ` · Last login ${new Date(user.lastLogin).toLocaleDateString()}`}
          </p>
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 transition-all"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

function TripsTab({ trips }: { trips: TripSummary[] }) {
  if (trips.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
        <p className="text-slate-400">No trips yet.</p>
        <Link
          href="/build"
          className="inline-block mt-3 text-sm font-semibold text-[#ff9d00] hover:text-[#e68d00] transition-colors"
        >
          Start planning your first trip →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {trips.map((trip) => {
        const isActive = trip.status === "ACTIVE" || trip.status === "IDLE";
        return (
          <Link
            key={trip.id}
            href={isActive ? "/dashboard" : "#"}
            className="block bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {tripTypeLabels[trip.tripType] ?? trip.tripType}
                </p>
                {trip.destinations.length > 0 && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    {trip.destinations.join(", ")}
                  </p>
                )}
                {trip.arrivalDate && trip.departureDate && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    {trip.arrivalDate} → {trip.departureDate}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {trip.specialistName && (
                  <span className="text-xs text-slate-400">with {trip.specialistName}</span>
                )}
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColors[trip.status] ?? "bg-slate-100 text-slate-500"}`}>
                  {trip.status.replace("_", " ")}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function SecurityTab({ hasPassword }: { hasPassword: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function handleSubmit(formData: FormData) {
    setMessage(null);
    if (formData.get("newPassword") !== formData.get("confirmPassword")) {
      setMessage({ type: "error", text: "New passwords don't match." });
      return;
    }
    startTransition(async () => {
      const result = await changePassword(formData);
      setMessage(
        result.success
          ? { type: "success", text: "Password changed successfully." }
          : { type: "error", text: result.error ?? "Failed to change password." }
      );
    });
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-5">Change Password</h2>
        {hasPassword ? (
          <form action={handleSubmit} className="space-y-4">
            <Field label="Current Password" name="currentPassword" type="password" required />
            <Field label="New Password" name="newPassword" type="password" required />
            <Field label="Confirm New Password" name="confirmPassword" type="password" required />

            {message && (
              <p className={`text-sm ${message.type === "success" ? "text-emerald-600" : "text-red-600"}`}>
                {message.text}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 transition-all"
            >
              {isPending ? "Updating..." : "Update Password"}
            </button>
          </form>
        ) : (
          <p className="text-sm text-slate-500">
            Your account uses social login. Password management is not available.
          </p>
        )}
      </div>

      <div className="bg-white rounded-xl border border-red-200 p-6">
        <h2 className="text-lg font-bold text-red-600 mb-2">Danger Zone</h2>
        <p className="text-sm text-slate-500 mb-4">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <button
          disabled
          className="px-5 py-2.5 rounded-xl border border-red-300 text-red-600 text-sm font-semibold opacity-50 cursor-not-allowed"
        >
          Delete Account (Coming Soon)
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type,
  defaultValue,
  placeholder,
  required,
  disabled,
}: {
  label: string;
  name: string;
  type: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="block w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      />
    </div>
  );
}

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return (email?.[0] ?? "?").toUpperCase();
}
