import * as React from "react";
import type { BookingStatus } from ".prisma/client/enums";
import { cn } from "@/lib/utils";

interface BookingStatusBadgeProps {
  status: BookingStatus;
  className?: string;
}

const statusConfig: Record<
  BookingStatus,
  { label: string; className: string }
> = {
  DRAFT: {
    label: "Draft",
    className: "bg-slate-100 text-slate-600 ring-slate-200",
  },
  QUOTE_REQUESTED: {
    label: "Quote Requested",
    className: "bg-amber-100 text-amber-700 ring-amber-200",
  },
  PRICING_IN_PROGRESS: {
    label: "Pricing in Progress",
    className: "bg-purple-100 text-purple-700 ring-purple-200",
  },
  QUOTE_SENT: {
    label: "Quote Sent",
    className: "bg-blue-100 text-blue-700 ring-blue-200",
  },
  REVISION_REQUESTED: {
    label: "Revision Requested",
    className: "bg-orange-100 text-orange-700 ring-orange-200",
  },
  CONFIRMED: {
    label: "Confirmed",
    className: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  },
  BALANCE_DUE: {
    label: "Balance Due",
    className: "bg-yellow-100 text-yellow-700 ring-yellow-200",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-green-100 text-green-700 ring-green-200",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-red-100 text-red-600 ring-red-200",
  },
  EXPIRED: {
    label: "Expired",
    className: "bg-slate-100 text-slate-500 ring-slate-200",
  },
};

const BookingStatusBadge: React.FC<BookingStatusBadgeProps> = ({
  status,
  className,
}) => {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
};

BookingStatusBadge.displayName = "BookingStatusBadge";

export { BookingStatusBadge };
export type { BookingStatusBadgeProps };
