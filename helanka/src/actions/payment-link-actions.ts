"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createPaymentLink(data: {
  invoiceNumber: string;
  customerName: string;
  amount: number;
  currency: string;
  description: string;
  cybersourceUrl: string;
  notifyEmails: string[];
}) {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "FINANCE")) {
    return { success: false, error: "Unauthorized" };
  }

  if (!data.invoiceNumber || !data.customerName || !data.amount || !data.cybersourceUrl) {
    return { success: false, error: "Missing required fields" };
  }

  const existing = await db.paymentLink.findUnique({
    where: { invoiceNumber: data.invoiceNumber },
  });
  if (existing) {
    return { success: false, error: "A payment link with this invoice number already exists" };
  }

  const link = await db.paymentLink.create({
    data: {
      invoiceNumber: data.invoiceNumber,
      customerName: data.customerName,
      amount: data.amount,
      currency: data.currency || "USD",
      description: data.description || "",
      cybersourceUrl: data.cybersourceUrl,
      notifyEmails: data.notifyEmails,
      createdBy: session.user.id,
    },
  });

  revalidatePath("/admin/payments");
  return { success: true, id: link.id, invoiceNumber: link.invoiceNumber };
}

export async function getPaymentLinks() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "FINANCE")) {
    return [];
  }

  return db.paymentLink.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      invoiceNumber: true,
      customerName: true,
      amount: true,
      currency: true,
      description: true,
      createdAt: true,
      paidAt: true,
    },
  });
}
