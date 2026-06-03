"use client";

import { useState, useTransition } from "react";
import { updateAdminProfile } from "@/actions/admin-account-actions";
import { changePassword, setPassword, deleteAccount } from "@/actions/account-actions";

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
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-xl font-bold">
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
            className={`flex-1 text-sm font-medium py-2.5 rounded-lg transition-colors ${
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
      {activeTab === "Security" && <SecurityTab hasPassword={user.hasPassword} email={user.email} role={user.role} />}
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
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

function SecurityTab({ hasPassword, email, role }: { hasPassword: boolean; email: string; role: string }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [hasPass, setHasPass] = useState(hasPassword);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  function handleChangePassword(formData: FormData) {
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

  function handleSetPassword(formData: FormData) {
    setMessage(null);
    if (formData.get("newPassword") !== formData.get("confirmPassword")) {
      setMessage({ type: "error", text: "Passwords don't match." });
      return;
    }
    startTransition(async () => {
      const result = await setPassword(formData);
      if (result.success) {
        setHasPass(true);
        setMessage({ type: "success", text: "Backup password set. You can now sign in with your email and password." });
      } else {
        setMessage({ type: "error", text: result.error ?? "Failed to set password." });
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        {hasPass ? (
          <>
            <h2 className="text-lg font-bold text-slate-900 mb-5">Change Password</h2>
            <form action={handleChangePassword} className="space-y-4">
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
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 transition-colors"
              >
                {isPending ? "Updating..." : "Update Password"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Set Backup Password</h2>
            <p className="text-sm text-slate-500 mb-5">
              Your account uses Google sign-in. Set a backup password so you can still access your account with email and password if you ever lose access to your Google account.
            </p>
            <form action={handleSetPassword} className="space-y-4">
              <Field label="New Password" name="newPassword" type="password" required />
              <Field label="Confirm Password" name="confirmPassword" type="password" required />

              {message && (
                <p className={`text-sm ${message.type === "success" ? "text-emerald-600" : "text-red-600"}`}>
                  {message.text}
                </p>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 transition-colors"
              >
                {isPending ? "Setting password..." : "Set Password"}
              </button>
            </form>
          </>
        )}
      </div>

      <div className="bg-white rounded-xl border border-red-200 p-6">
        <h2 className="text-lg font-bold text-red-600 mb-2">Danger Zone</h2>
        {role === "ADMIN" ? (
          <p className="text-sm text-slate-500">
            Admin accounts cannot be self-deleted. Contact another administrator to remove this account.
          </p>
        ) : showDeleteConfirm ? (
          <form
            action={(formData) => {
              setDeleteError(null);
              startDeleteTransition(async () => {
                const result = await deleteAccount(formData);
                if (result && !result.success) {
                  setDeleteError(result.error ?? "Failed to delete account.");
                }
              });
            }}
            className="space-y-3"
          >
            <p className="text-sm text-slate-500 mb-3">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <p className="text-sm text-slate-700">
              Type <span className="font-semibold">{email}</span> to confirm:
            </p>
            <input
              name="confirmEmail"
              type="email"
              required
              placeholder="your@email.com"
              className="block w-full rounded-xl bg-slate-50 border border-red-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />
            {deleteError && <p className="text-sm text-red-600">{deleteError}</p>}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isDeleting ? "Deleting..." : "Permanently Delete"}
              </button>
              <button
                type="button"
                onClick={() => { setShowDeleteConfirm(false); setDeleteError(null); }}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-5 py-2.5 rounded-xl border border-red-300 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors"
            >
              Delete Account
            </button>
          </>
        )}
      </div>
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
        className="block w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 disabled:opacity-50 disabled:cursor-not-allowed transition-shadow"
      />
    </div>
  );
}
