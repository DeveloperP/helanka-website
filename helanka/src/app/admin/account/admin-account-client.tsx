"use client";

import { useState, useTransition } from "react";
import { updateAdminProfile } from "@/actions/admin-account-actions";
import { changePassword } from "@/actions/account-actions";

interface UserData {
  name: string | null;
  email: string;
  role: string;
  specialty: string | null;
  image: string | null;
  createdAt: string;
  lastLogin: string | null;
  hasPassword: boolean;
}

const tabs = ["Profile", "Security"] as const;
type Tab = (typeof tabs)[number];

export function AdminAccountClient({ user }: { user: UserData }) {
  const [activeTab, setActiveTab] = useState<Tab>("Profile");

  const initials = user.name
    ? user.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#ff9d00] to-[#e68d00] flex items-center justify-center text-white text-xl font-bold">
          {initials}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{user.name ?? "Account"}</h1>
          <p className="text-sm text-slate-500">
            {user.email} · {user.role === "SPECIALIST" ? `Specialist — ${user.specialty ?? "General"}` : "Administrator"}
          </p>
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
      {activeTab === "Security" && <SecurityTab hasPassword={user.hasPassword} />}
    </div>
  );
}

function ProfileTab({ user }: { user: UserData }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function handleSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await updateAdminProfile(formData);
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
        {user.role === "SPECIALIST" && (
          <Field label="Specialty" name="specialty" type="text" defaultValue={user.specialty ?? ""} disabled />
        )}

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
  );
}

function Field({
  label,
  name,
  type,
  defaultValue,
  required,
  disabled,
}: {
  label: string;
  name: string;
  type: string;
  defaultValue?: string;
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
        required={required}
        disabled={disabled}
        className="block w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      />
    </div>
  );
}
