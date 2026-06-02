"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { verifyTurnstile } from "@/lib/turnstile";

export interface ResetResult {
  success: boolean;
  error?: string;
}

export async function requestPasswordReset(formData: FormData): Promise<ResetResult> {
  const turnstileToken = formData.get("cf-turnstile-response") as string | null;
  const turnstileValid = await verifyTurnstile(turnstileToken);
  if (!turnstileValid) {
    return { success: false, error: "Verification failed. Please try again." };
  }

  const email = (formData.get("email") as string | null)?.trim().toLowerCase();
  if (!email) return { success: false, error: "Email is required." };

  const user = await db.user.findUnique({ where: { email } });

  // Always return success to prevent email enumeration
  if (!user) return { success: true };

  // Delete any existing tokens for this user
  await db.verificationToken.deleteMany({ where: { identifier: email } });

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await db.verificationToken.create({
    data: { identifier: email, token, expires },
  });

  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  await sendEmail({
    to: email,
    subject: "Reset Your Password — Helanka Vacations",
    html: `
      <div style="max-width:480px;margin:0 auto;font-family:sans-serif;">
        <h2 style="color:#1e293b;">Reset Your Password</h2>
        <p style="color:#475569;">Hi ${user.name ?? "there"},</p>
        <p style="color:#475569;">We received a request to reset your password. Click the button below to choose a new one:</p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${resetUrl}" style="display:inline-block;background:#1e293b;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;">
            Reset Password
          </a>
        </div>
        <p style="color:#94a3b8;font-size:14px;">This link expires in 1 hour. If you didn't request a reset, you can safely ignore this email.</p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
        <p style="color:#94a3b8;font-size:12px;">Helanka Vacations · Colombo, Sri Lanka</p>
      </div>
    `,
  });

  return { success: true };
}

export async function resetPassword(formData: FormData): Promise<ResetResult> {
  const turnstileToken = formData.get("cf-turnstile-response") as string | null;
  const turnstileValid = await verifyTurnstile(turnstileToken);
  if (!turnstileValid) {
    return { success: false, error: "Verification failed. Please try again." };
  }

  const token = formData.get("token") as string | null;
  const email = (formData.get("email") as string | null)?.trim().toLowerCase();
  const password = formData.get("password") as string | null;

  if (!token || !email || !password) {
    return { success: false, error: "Missing required fields." };
  }

  if (password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters." };
  }

  const record = await db.verificationToken.findFirst({
    where: { identifier: email, token },
  });

  if (!record || record.expires < new Date()) {
    return { success: false, error: "This reset link is invalid or has expired. Please request a new one." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await db.user.update({
    where: { email },
    data: { passwordHash },
  });

  await db.verificationToken.deleteMany({ where: { identifier: email } });

  return { success: true };
}
