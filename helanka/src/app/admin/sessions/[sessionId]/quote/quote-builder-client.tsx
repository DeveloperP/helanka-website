"use client";

import { useState, useTransition, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import {
  priceBookingItems,
  sendQuote,
  getSessionForQuoting,
  addBookingItem,
  removeBookingItem,
} from "@/actions/quote-actions";
import type {
  QuotingSessionData,
  QuotingItemData,
  TransportBreakdown,
} from "@/actions/quote-actions";

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmt(v: number) {
  return v.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

function p(s: string): number {
  return parseFloat(s) || 0;
}

function defaultValidUntil() {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().split("T")[0];
}

// ─── Icons ──────────────────────────────────────────────────────────────────

function ArrowLeftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

// ─── Badges ─────────────────────────────────────────────────────────────────

const quoteStatusClasses: Record<string, string> = {
  SENT: "bg-blue-50 text-blue-700",
  ACCEPTED: "bg-emerald-50 text-emerald-700",
  REVISION: "bg-amber-50 text-amber-700",
  EXPIRED: "bg-slate-100 text-slate-500",
};

function QuoteStatusBadge({ status }: { status: string | null }) {
  const label = status ?? "SENT";
  return (
    <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${quoteStatusClasses[label] ?? "bg-slate-100 text-slate-500"}`}>
      {label}
    </span>
  );
}

// ─── Shared form field ──────────────────────────────────────────────────────

const inputCls = "w-full rounded-lg border border-slate-200 bg-white/80 px-2.5 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-800/20 focus:border-slate-400 outline-none";
const labelCls = "text-[11px] font-medium text-slate-500 uppercase tracking-wide";
const selectCls = "w-full rounded-lg border border-slate-200 bg-white/80 px-2.5 py-1.5 text-sm text-slate-900 focus:ring-2 focus:ring-slate-800/20 focus:border-slate-400 outline-none appearance-none";

// ─── Detail state types ─────────────────────────────────────────────────────

interface AccomState {
  hotelId: string | null;
  hotelName: string;
  starRating: string;
  mealPlan: string;
  roomType: string;
  overrideRate: boolean;
  sglRooms: string; sglRate: string;
  dblRooms: string; dblRate: string;
  twnRooms: string; twnRate: string;
  tplRooms: string; tplRate: string;
  extraAdultQty: string; extraAdultRate: string;
  childSharingQty: string; childSharingRate: string;
  childWithBedQty: string; childWithBedRate: string;
  marginType: string;
  marginValue: string;
  remarks: string;
}

interface ExcursionState {
  excursionName: string;
  costPerPerson: string;
  adultCount: string;
  childRate: string;
  childCount: string;
  remarks: string;
}

interface TransportState {
  vehicleType: string;
  ratePerKm: string;
  vehicleUnits: string;
  distanceKm: string;
  pickupLocation: string;
  dropoffLocation: string;
  isGroupTransfer: boolean;
  driverGuideType: string;
  driverRatePerDay: string;
  driverAccommodation: boolean;
  driverFee: string;
  remarks: string;
}

interface OtherChargeState {
  costItem: string;
  description: string;
  costPerUnit: string;
  units: string;
  remarks: string;
}

interface SummaryState {
  handlingFeeType: string;
  handlingFeeAmt: string;
  taxRate: string;
  taxInclusive: boolean;
  discountAmt: string;
}

interface DetailStates {
  accommodations: Record<string, AccomState>;
  excursions: Record<string, ExcursionState>;
  transports: Record<string, TransportState>;
  otherCharges: Record<string, OtherChargeState>;
}

// ─── Init helpers ───────────────────────────────────────────────────────────

function initAccom(item: QuotingItemData, numTravelers: number): AccomState {
  const d = item.accommodationDetail;
  return {
    hotelId: d?.hotelId ?? null,
    hotelName: d?.hotelName ?? item.description,
    starRating: d?.starRating ?? "",
    mealPlan: d?.mealPlan ?? "BB",
    roomType: d ? (p(String(d.sglRooms)) > 0 ? "sgl" : p(String(d.twnRooms)) > 0 ? "twn" : p(String(d.tplRooms)) > 0 ? "tpl" : "dbl") : "dbl",
    overrideRate: false,
    sglRooms: String(d?.sglRooms ?? 0),
    sglRate: String(d?.sglRate ?? 0),
    dblRooms: String(d?.dblRooms ?? Math.ceil(numTravelers / 2)),
    dblRate: String(d?.dblRate ?? 0),
    twnRooms: String(d?.twnRooms ?? 0),
    twnRate: String(d?.twnRate ?? 0),
    tplRooms: String(d?.tplRooms ?? 0),
    tplRate: String(d?.tplRate ?? 0),
    extraAdultQty: String(d?.extraAdultQty ?? 0),
    extraAdultRate: String(d?.extraAdultRate ?? 0),
    childSharingQty: String(d?.childSharingQty ?? 0),
    childSharingRate: String(d?.childSharingRate ?? 0),
    childWithBedQty: String(d?.childWithBedQty ?? 0),
    childWithBedRate: String(d?.childWithBedRate ?? 0),
    marginType: d?.marginType ?? "fixed",
    marginValue: String(d?.marginValue ?? 0),
    remarks: d?.remarks ?? "",
  };
}

function initExcursion(item: QuotingItemData, numTravelers: number): ExcursionState {
  const d = item.excursionDetail;
  return {
    excursionName: d?.excursionName ?? item.description,
    costPerPerson: String(d?.costPerPerson ?? 0),
    adultCount: String(d?.adultCount ?? numTravelers),
    childRate: String(d?.childRate ?? 0),
    childCount: String(d?.childCount ?? 0),
    remarks: d?.remarks ?? "",
  };
}

function initTransport(item: QuotingItemData, breakdown: TransportBreakdown | null, dailyBufferRate?: number): TransportState {
  const d = item.transportDetail;
  return {
    vehicleType: d?.vehicleType ?? item.tier ?? "car",
    ratePerKm: String(d?.ratePerKm ?? breakdown?.perKmRate ?? 0),
    vehicleUnits: String(d?.vehicleUnits ?? 1),
    distanceKm: String(d?.distanceKm ?? breakdown?.totalKm ?? 0),
    pickupLocation: d?.pickupLocation ?? "",
    dropoffLocation: d?.dropoffLocation ?? "",
    isGroupTransfer: d?.isGroupTransfer ?? false,
    driverGuideType: d?.driverGuideType ?? "chauffeur",
    driverRatePerDay: String(d?.driverRatePerDay ?? breakdown?.dailyRate ?? dailyBufferRate ?? 0),
    driverAccommodation: d?.driverAccommodation ?? false,
    driverFee: String(d?.driverFee ?? 0),
    remarks: d?.remarks ?? "",
  };
}

function initOtherCharge(item: QuotingItemData): OtherChargeState {
  const d = item.otherChargeDetail;
  return {
    costItem: d?.costItem ?? item.description,
    description: d?.description ?? "",
    costPerUnit: String(d?.costPerUnit ?? item.actualPrice ?? 0),
    units: String(d?.units ?? 1),
    remarks: d?.remarks ?? "",
  };
}

// ─── Compute subtotals ──────────────────────────────────────────────────────

function accomTotal(s: AccomState, nights: number) {
  const roomCost = p(s.sglRooms) * p(s.sglRate) + p(s.dblRooms) * p(s.dblRate) + p(s.twnRooms) * p(s.twnRate) + p(s.tplRooms) * p(s.tplRate);
  const extrasCost = p(s.extraAdultQty) * p(s.extraAdultRate) + p(s.childSharingQty) * p(s.childSharingRate) + p(s.childWithBedQty) * p(s.childWithBedRate);
  const buying = (roomCost + extrasCost) * Math.max(nights, 1);
  const margin = s.marginType === "percentage" ? buying * p(s.marginValue) / 100 : p(s.marginValue);
  return { buying, margin, selling: buying + margin };
}

function excursionTotal(s: ExcursionState) {
  return p(s.costPerPerson) * p(s.adultCount) + p(s.childRate) * p(s.childCount);
}

function transportTotal(s: TransportState, tripDays: number) {
  const vehicleCost = p(s.ratePerKm) * p(s.distanceKm) * p(s.vehicleUnits);
  const driverCost = p(s.driverFee) > 0 ? p(s.driverFee) : p(s.driverRatePerDay) * tripDays;
  return vehicleCost + driverCost;
}

function otherChargeTotal(s: OtherChargeState) {
  return p(s.costPerUnit) * p(s.units);
}

// ─── Main component ─────────────────────────────────────────────────────────

interface QuoteBuilderClientProps {
  data: QuotingSessionData;
}

export function QuoteBuilderClient({ data: initialData }: QuoteBuilderClientProps) {
  const [data, setData] = useState<QuotingSessionData>(initialData);
  const [isPending, startTransition] = useTransition();

  const { booking, session, items, transportBreakdown, existingQuotes, hotelsByDestination, excursionsByDestination, transportRateCards, dailyBufferRate } = data;
  const accommodations = items.filter((i) => i.type === "ACCOMMODATION");
  const excursions = items.filter((i) => i.type === "ACTIVITY");
  const transports = items.filter((i) => i.type === "TRANSPORT");
  const addons = items.filter((i) => i.type === "ADDON");

  const tripDays = booking.arrivalDate && booking.departureDate
    ? Math.max(1, Math.round((new Date(booking.departureDate).getTime() - new Date(booking.arrivalDate).getTime()) / 86400000))
    : 1;

  // ─── Detail states ──────────────────────────────────────────────────────
  const [details, setDetails] = useState<DetailStates>(() => {
    const acc: Record<string, AccomState> = {};
    for (const item of accommodations) acc[item.id] = initAccom(item, booking.numTravelers);
    const exc: Record<string, ExcursionState> = {};
    for (const item of excursions) exc[item.id] = initExcursion(item, booking.numTravelers);
    const trn: Record<string, TransportState> = {};
    for (const item of transports) trn[item.id] = initTransport(item, transportBreakdown, dailyBufferRate);
    const oth: Record<string, OtherChargeState> = {};
    for (const item of addons) oth[item.id] = initOtherCharge(item);
    return { accommodations: acc, excursions: exc, transports: trn, otherCharges: oth };
  });

  const [summary, setSummary] = useState<SummaryState>({
    handlingFeeType: "fixed",
    handlingFeeAmt: "0",
    taxRate: "0",
    taxInclusive: true,
    discountAmt: "0",
  });

  useEffect(() => {
    setDetails((prev) => {
      const acc = { ...prev.accommodations };
      const exc = { ...prev.excursions };
      const trn = { ...prev.transports };
      const oth = { ...prev.otherCharges };
      let changed = false;
      for (const item of items.filter((i) => i.type === "ACCOMMODATION")) {
        if (!acc[item.id]) { acc[item.id] = initAccom(item, booking.numTravelers); changed = true; }
      }
      for (const item of items.filter((i) => i.type === "ACTIVITY")) {
        if (!exc[item.id]) { exc[item.id] = initExcursion(item, booking.numTravelers); changed = true; }
      }
      for (const item of items.filter((i) => i.type === "TRANSPORT")) {
        if (!trn[item.id]) { trn[item.id] = initTransport(item, transportBreakdown, dailyBufferRate); changed = true; }
      }
      for (const item of items.filter((i) => i.type === "ADDON")) {
        if (!oth[item.id]) { oth[item.id] = initOtherCharge(item); changed = true; }
      }
      return changed ? { accommodations: acc, excursions: exc, transports: trn, otherCharges: oth } : prev;
    });
  }, [items, booking.numTravelers, transportBreakdown, dailyBufferRate]);

  const [deposit, setDeposit] = useState<string>("0");
  const [validUntil, setValidUntil] = useState<string>(defaultValidUntil);
  const [adminNotes, setAdminNotes] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [quoteSent, setQuoteSent] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    accommodation: true,
    excursions: true,
    transport: true,
    other: true,
  });
  const topRef = useRef<HTMLDivElement>(null);

  // ─── Updaters ───────────────────────────────────────────────────────────
  function updateAccom(id: string, field: keyof AccomState, value: string) {
    setDetails((prev) => ({
      ...prev,
      accommodations: { ...prev.accommodations, [id]: { ...prev.accommodations[id], [field]: value } },
    }));
  }
  function updateAccomFromHotel(id: string, hotelId: string, destinationId: string | null) {
    const hotels = destinationId ? (hotelsByDestination[destinationId] ?? []) : [];
    const hotel = hotels.find((h) => h.id === hotelId);
    if (!hotel) return;
    setDetails((prev) => ({
      ...prev,
      accommodations: {
        ...prev.accommodations,
        [id]: {
          ...prev.accommodations[id],
          hotelId: hotel.id,
          hotelName: hotel.name,
          starRating: hotel.tier,
          dblRate: String(hotel.doubleRate),
          sglRate: String(hotel.singleRate),
          tplRate: String(hotel.tripleRate),
          twnRate: String(hotel.doubleRate),
        },
      },
    }));
  }
  function updateExcursion(id: string, field: keyof ExcursionState, value: string) {
    setDetails((prev) => ({
      ...prev,
      excursions: { ...prev.excursions, [id]: { ...prev.excursions[id], [field]: value } },
    }));
  }
  function updateTransport(id: string, field: keyof TransportState, value: string | boolean) {
    setDetails((prev) => ({
      ...prev,
      transports: { ...prev.transports, [id]: { ...prev.transports[id], [field]: value } },
    }));
  }
  function updateOtherCharge(id: string, field: keyof OtherChargeState, value: string) {
    setDetails((prev) => ({
      ...prev,
      otherCharges: { ...prev.otherCharges, [id]: { ...prev.otherCharges[id], [field]: value } },
    }));
  }

  // ─── Compute totals ────────────────────────────────────────────────────
  const accomSubtotal = accommodations.reduce((sum, item) => {
    const s = details.accommodations[item.id];
    return sum + (s ? accomTotal(s, item.nights ?? 1).selling : 0);
  }, 0);

  const excursionSubtotal = excursions.reduce((sum, item) => {
    const s = details.excursions[item.id];
    return sum + (s ? excursionTotal(s) : 0);
  }, 0);

  const transportSubtotal = transports.reduce((sum, item) => {
    const s = details.transports[item.id];
    return sum + (s ? transportTotal(s, tripDays) : 0);
  }, 0);

  const otherSubtotal = addons.reduce((sum, item) => {
    const s = details.otherCharges[item.id];
    return sum + (s ? otherChargeTotal(s) : 0);
  }, 0);

  const subtotal = accomSubtotal + excursionSubtotal + transportSubtotal + otherSubtotal;
  const handlingFee = summary.handlingFeeType === "percentage" ? subtotal * p(summary.handlingFeeAmt) / 100 : p(summary.handlingFeeAmt);
  const discount = p(summary.discountAmt);
  const taxableAmt = subtotal + handlingFee - discount;
  const tax = summary.taxInclusive ? 0 : taxableAmt * p(summary.taxRate) / 100;
  const grandTotal = taxableAmt + tax;

  // ─── Build payload ──────────────────────────────────────────────────────
  function buildPayload() {
    return items.map((item) => {
      const base = {
        bookingItemId: item.id,
        estimateMin: item.rateCardMin ?? 0,
        estimateMax: item.rateCardMax ?? 0,
        notes: undefined as string | undefined,
      };

      if (item.type === "ACCOMMODATION") {
        const s = details.accommodations[item.id];
        const t = s ? accomTotal(s, item.nights ?? 1) : { selling: 0 };
        return {
          ...base,
          actualPrice: t.selling,
          accommodationDetail: s ? {
            hotelId: s.hotelId ?? null,
            hotelName: s.hotelName,
            starRating: s.starRating || null,
            roomType: null,
            mealPlan: s.mealPlan || null,
            sglRooms: p(s.sglRooms), sglRate: p(s.sglRate),
            dblRooms: p(s.dblRooms), dblRate: p(s.dblRate),
            twnRooms: p(s.twnRooms), twnRate: p(s.twnRate),
            tplRooms: p(s.tplRooms), tplRate: p(s.tplRate),
            extraAdultQty: p(s.extraAdultQty), extraAdultRate: p(s.extraAdultRate),
            childSharingQty: p(s.childSharingQty), childSharingRate: p(s.childSharingRate),
            childWithBedQty: p(s.childWithBedQty), childWithBedRate: p(s.childWithBedRate),
            marginType: s.marginType,
            marginValue: p(s.marginValue),
            rateCode: null,
            remarks: s.remarks || null,
          } : undefined,
        };
      }

      if (item.type === "ACTIVITY") {
        const s = details.excursions[item.id];
        const t = s ? excursionTotal(s) : 0;
        return {
          ...base,
          actualPrice: t,
          excursionDetail: s ? {
            excursionName: s.excursionName,
            sequence: 0,
            costPerPerson: p(s.costPerPerson),
            adultCount: p(s.adultCount),
            childRate: p(s.childRate),
            childCount: p(s.childCount),
            overridePrice: false,
            remarks: s.remarks || null,
          } : undefined,
        };
      }

      if (item.type === "TRANSPORT") {
        const s = details.transports[item.id];
        const t = s ? transportTotal(s, tripDays) : 0;
        return {
          ...base,
          actualPrice: t,
          transportDetail: s ? {
            vehicleType: s.vehicleType,
            ratePerKm: p(s.ratePerKm),
            vehicleUnits: p(s.vehicleUnits),
            distanceKm: p(s.distanceKm),
            isGroupTransfer: s.isGroupTransfer,
            pickupLocation: s.pickupLocation || null,
            dropoffLocation: s.dropoffLocation || null,
            overridePrice: false,
            driverGuideType: s.driverGuideType || null,
            driverRatePerDay: p(s.driverRatePerDay),
            driverAccommodation: s.driverAccommodation,
            driverFee: p(s.driverFee),
            remarks: s.remarks || null,
          } : undefined,
        };
      }

      // ADDON
      const s = details.otherCharges[item.id];
      const t = s ? otherChargeTotal(s) : 0;
      return {
        ...base,
        actualPrice: t,
        otherChargeDetail: s ? {
          costItem: s.costItem,
          description: s.description || null,
          costPerUnit: p(s.costPerUnit),
          units: p(s.units),
          overridePrice: false,
          remarks: s.remarks || null,
        } : undefined,
      };
    });
  }

  // ─── Handlers ───────────────────────────────────────────────────────────
  const handleSaveDraft = useCallback(() => {
    setSuccessMessage(null);
    setErrorMessage(null);
    startTransition(async () => {
      const result = await priceBookingItems(data.booking.id, buildPayload());
      if (result.success) {
        setSuccessMessage("Draft saved successfully.");
      } else {
        setErrorMessage(result.error ?? "Failed to save draft.");
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.booking.id, details, items]);

  const handleSendQuote = useCallback(() => {
    setSuccessMessage(null);
    setErrorMessage(null);
    startTransition(async () => {
      const depositNum = p(deposit);
      const payload = buildPayload();
      const result = await sendQuote({
        bookingId: data.booking.id,
        totalPrice: grandTotal,
        deposit: depositNum,
        validUntil,
        adminNotes: adminNotes || undefined,
        lineItems: payload,
        taxRate: p(summary.taxRate),
        taxInclusive: summary.taxInclusive,
        handlingFeeType: summary.handlingFeeType,
        handlingFeeAmt: handlingFee,
        discountAmt: discount,
      } as Parameters<typeof sendQuote>[0]);
      if (result.success) {
        const version = (data.existingQuotes[0]?.version ?? 0) + 1;
        setSuccessMessage(`Quote v${version} sent successfully! The customer can now review it in their dashboard.`);
        setQuoteSent(true);
        topRef.current?.scrollIntoView({ behavior: "smooth" });
        const refreshed = await getSessionForQuoting(data.session.id);
        if (refreshed) setData(refreshed);
      } else {
        setErrorMessage(result.error ?? "Failed to send quote.");
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, details, summary, grandTotal, deposit, validUntil, adminNotes]);

  function toggleSection(key: string) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function set30PctDeposit() {
    setDeposit(String(Math.round(grandTotal * 0.3 * 100) / 100));
  }

  function handleRemoveItem(itemId: string) {
    startTransition(async () => {
      const result = await removeBookingItem(itemId);
      if ("success" in result) {
        const refreshed = await getSessionForQuoting(data.session.id);
        if (refreshed) setData(refreshed);
      }
    });
  }

  function handleAddItem(type: "ACCOMMODATION" | "ACTIVITY" | "TRANSPORT" | "ADDON", description: string, destId: string | null, nights?: number) {
    startTransition(async () => {
      const result = await addBookingItem(booking.id, type, destId, description, nights);
      if ("id" in result) {
        const refreshed = await getSessionForQuoting(data.session.id);
        if (refreshed) setData(refreshed);
      }
    });
  }

  const sessionId = data.session.id;

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <div ref={topRef} className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href={`/admin/sessions/${sessionId}`}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors"
      >
        <ArrowLeftIcon /> Back to session
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Quote Builder</h1>
        <p className="text-sm text-slate-400 mt-0.5">Structured DMC costing — price each category and send to the customer.</p>
      </div>

      {successMessage && (
        <div className="mb-5 flex items-center gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-emerald-700 text-sm">
          <CheckCircleIcon /> {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">{errorMessage}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Left column (Trip Summary + Quote History) ── */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/80 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Trip Summary</h2>
            <div className="mb-4">
              <p className="text-base font-semibold text-slate-800 leading-snug">{session.customer.name ?? "Unknown customer"}</p>
              {session.customer.email && <p className="text-xs text-slate-400 mt-0.5">{session.customer.email}</p>}
            </div>
            <div className="mb-4">
              <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 capitalize">{session.tripType}</span>
            </div>
            <div className="flex items-start gap-2 mb-3 text-sm text-slate-600">
              <span className="mt-0.5 text-slate-400 shrink-0"><CalendarIcon /></span>
              <span>{fmtDate(booking.arrivalDate)}<span className="mx-1.5 text-slate-300">→</span>{fmtDate(booking.departureDate)}</span>
            </div>
            <div className="flex items-center gap-2 mb-4 text-sm text-slate-600">
              <span className="text-slate-400"><UsersIcon /></span>
              {booking.numTravelers} traveler{booking.numTravelers !== 1 ? "s" : ""} · {tripDays} day{tripDays !== 1 ? "s" : ""}
            </div>
            {accommodations.length > 0 && (
              <div className="mb-3">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Destinations</p>
                <ul className="space-y-1">
                  {accommodations.map((item) => (
                    <li key={item.id} className="flex items-center gap-1.5 text-sm text-slate-600">
                      <span className="text-slate-400 shrink-0"><MapPinIcon /></span>
                      {item.destinationName ?? item.description}
                      {item.nights != null && <span className="text-slate-400 text-xs ml-auto">{item.nights}n</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {transports.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-slate-600 pt-2 border-t border-slate-100">
                <span className="text-slate-400"><TruckIcon /></span>
                Transport:&nbsp;<span className="capitalize font-medium text-slate-700">{transports[0].tier ?? "Standard"}</span>
              </div>
            )}
          </div>

          <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/80 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Quote History</h2>
            {existingQuotes.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No quotes sent yet.</p>
            ) : (
              <ul className="space-y-3">
                {existingQuotes.map((q) => (
                  <li key={q.id} className="rounded-xl bg-white/70 border border-slate-100 px-3.5 py-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-slate-600">Version {q.version}</span>
                      <QuoteStatusBadge status={q.response} />
                    </div>
                    <div className="flex items-baseline gap-1 mb-0.5">
                      <span className="text-sm font-semibold text-slate-800">{fmt(q.totalPrice)}</span>
                      <span className="text-xs text-slate-400">total</span>
                    </div>
                    <div className="text-xs text-slate-400">Deposit: {fmt(q.deposit)}</div>
                    <div className="text-xs text-slate-400 mt-1">{q.sentAt ? `Sent ${fmtDate(q.sentAt)}` : `Created ${fmtDate(q.createdAt)}`}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ── Right column (Category sections) ── */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* ─── ACCOMMODATION ─── */}
          {accommodations.length > 0 && (
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/80 shadow-sm overflow-hidden">
              <button type="button" onClick={() => toggleSection("accommodation")} className="w-full flex items-center justify-between px-6 py-4 border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 rounded-full bg-blue-500" />
                  <h2 className="text-sm font-semibold text-slate-800">Accommodation</h2>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{accommodations.length}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-700">{fmt(accomSubtotal)}</span>
                  <ChevronIcon open={openSections.accommodation} />
                </div>
              </button>
              {openSections.accommodation && (
                <div className="divide-y divide-slate-100">
                  {accommodations.map((item) => {
                    const s = details.accommodations[item.id];
                    if (!s) return null;
                    const t = accomTotal(s, item.nights ?? 1);
                    const stayIndex = accommodations.indexOf(item) + 1;
                    const destinationHotels = item.destinationId ? (hotelsByDestination[item.destinationId] ?? []) : [];
                    const tierOrder = ["4-star", "5-star", "boutique", "luxury-boutique"];
                    const hotelsByTier = tierOrder.reduce<Record<string, typeof destinationHotels>>((acc, tier) => {
                      const group = destinationHotels.filter((h) => h.tier === tier);
                      if (group.length > 0) acc[tier] = group;
                      return acc;
                    }, {});
                    const ungroupedHotels = destinationHotels.filter((h) => !tierOrder.includes(h.tier));
                    return (
                      <div key={item.id} className="px-6 py-5 space-y-4">
                        {/* Day grouping header */}
                        <div className="flex items-center justify-between gap-2 -mx-6 px-6 py-2.5 bg-blue-50/60 border-b border-blue-100">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                            <span className="text-xs font-semibold text-blue-700">
                              Stay {stayIndex}: {item.destinationName ?? "Destination"}
                              {item.nights != null && <span className="font-normal text-blue-500 ml-1">— {item.nights} night{item.nights !== 1 ? "s" : ""}</span>}
                            </span>
                          </div>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-[10px] font-medium text-red-400 hover:text-red-600 transition-colors"
                          >
                            Remove
                          </button>
                        </div>

                        {/* Hotel dropdown */}
                        {destinationHotels.length > 0 && (
                          <div className="flex flex-col gap-1">
                            <label className={labelCls}>Select hotel</label>
                            <select
                              className={selectCls}
                              value={s.hotelId ?? ""}
                              onChange={(e) => {
                                if (e.target.value) {
                                  updateAccomFromHotel(item.id, e.target.value, item.destinationId ?? null);
                                } else {
                                  updateAccom(item.id, "hotelId" as keyof AccomState, "");
                                }
                              }}
                            >
                              <option value="">— Select a hotel —</option>
                              {Object.entries(hotelsByTier).map(([tier, hotels]) => (
                                <optgroup key={tier} label={tier.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}>
                                  {hotels.map((hotel) => (
                                    <option key={hotel.id} value={hotel.id}>
                                      {hotel.name} — ${hotel.doubleRate}/night ({hotel.tier})
                                    </option>
                                  ))}
                                </optgroup>
                              ))}
                              {ungroupedHotels.length > 0 && (
                                <optgroup label="Other">
                                  {ungroupedHotels.map((hotel) => (
                                    <option key={hotel.id} value={hotel.id}>
                                      {hotel.name} — ${hotel.doubleRate}/night ({hotel.tier})
                                    </option>
                                  ))}
                                </optgroup>
                              )}
                            </select>
                          </div>
                        )}

                        {/* Meal plan */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className={labelCls}>Meal plan</label>
                            <select className={selectCls} value={s.mealPlan} onChange={(e) => updateAccom(item.id, "mealPlan", e.target.value)}>
                              <option value="RO">Room Only</option>
                              <option value="BB">Bed & Breakfast</option>
                              <option value="HB">Half Board</option>
                              <option value="FB">Full Board</option>
                              <option value="AI">All Inclusive</option>
                            </select>
                          </div>
                        </div>

                        {/* Room type selector */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className={labelCls}>Room configuration (per night)</p>
                            <label className="flex items-center gap-1.5 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={s.overrideRate}
                                onChange={(e) => setDetails((d) => ({
                                  ...d,
                                  accommodations: { ...d.accommodations, [item.id]: { ...d.accommodations[item.id], overrideRate: e.target.checked } },
                                }))}
                                className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-[10px] font-medium text-slate-500">Override rate</span>
                            </label>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                            <div className="flex flex-col gap-1">
                              <label className={labelCls}>Room type</label>
                              <select
                                className={selectCls}
                                value={s.roomType}
                                onChange={(e) => {
                                  const rt = e.target.value;
                                  const prev = s.roomType;
                                  const prevRoomsKey = `${prev}Rooms` as keyof AccomState;
                                  const prevRooms = s[prevRoomsKey] as string;
                                  const newRoomsKey = `${rt}Rooms` as keyof AccomState;
                                  const newRateKey = `${rt}Rate` as keyof AccomState;
                                  setDetails((d) => ({
                                    ...d,
                                    accommodations: {
                                      ...d.accommodations,
                                      [item.id]: {
                                        ...d.accommodations[item.id],
                                        roomType: rt,
                                        [prevRoomsKey]: "0",
                                        [newRoomsKey]: prevRooms !== "0" ? prevRooms : String(Math.ceil(booking.numTravelers / (rt === "tpl" ? 3 : rt === "sgl" ? 1 : 2))),
                                        [newRateKey]: d.accommodations[item.id][newRateKey] || "0",
                                      },
                                    },
                                  }));
                                }}
                              >
                                <option value="sgl">Single (90% of double rate)</option>
                                <option value="dbl">Double</option>
                                <option value="twn">Twin (same as double rate)</option>
                                <option value="tpl">Triple (130% of double rate)</option>
                              </select>
                            </div>
                            {(() => {
                              const rt = s.roomType || "dbl";
                              const roomsKey = `${rt}Rooms` as keyof AccomState;
                              const rateKey = `${rt}Rate` as keyof AccomState;
                              const rateLabel = rt === "sgl" ? "Single rate $" : rt === "tpl" ? "Triple rate $" : rt === "twn" ? "Twin rate $" : "Double rate $";
                              return (
                                <>
                                  <div className="flex flex-col gap-1">
                                    <label className={labelCls}>No. of rooms</label>
                                    <input type="number" min="0" className={inputCls} value={String(s[roomsKey] ?? "")} onChange={(e) => updateAccom(item.id, roomsKey, e.target.value)} />
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <label className={labelCls}>{rateLabel}{!s.overrideRate && " (locked)"}</label>
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      className={`${inputCls} ${!s.overrideRate ? "bg-slate-50 text-slate-500 cursor-not-allowed" : ""}`}
                                      value={String(s[rateKey] ?? "")}
                                      readOnly={!s.overrideRate}
                                      onChange={s.overrideRate ? (e) => updateAccom(item.id, rateKey, e.target.value) : undefined}
                                    />
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Extras */}
                        <div>
                          <p className={`${labelCls} mb-2`}>Extras (per night)</p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {([
                              { label: "Extra Adult", qtyKey: "extraAdultQty" as const, rateKey: "extraAdultRate" as const },
                              { label: "Child Sharing", qtyKey: "childSharingQty" as const, rateKey: "childSharingRate" as const },
                              { label: "Child With Bed", qtyKey: "childWithBedQty" as const, rateKey: "childWithBedRate" as const },
                            ]).map(({ label, qtyKey, rateKey }) => (
                              <div key={qtyKey} className="rounded-lg border border-slate-150 bg-slate-50/50 p-2.5">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">{label}</p>
                                <div className="flex gap-1.5">
                                  <div className="flex-1">
                                    <p className="text-[9px] text-slate-400 mb-0.5">Qty</p>
                                    <input type="number" min="0" className={`${inputCls} text-center !px-1.5`} value={s[qtyKey]} onChange={(e) => updateAccom(item.id, qtyKey, e.target.value)} />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-[9px] text-slate-400 mb-0.5">Rate $</p>
                                    <input type="number" min="0" step="0.01" className={`${inputCls} text-center !px-1.5`} value={s[rateKey]} onChange={(e) => updateAccom(item.id, rateKey, e.target.value)} />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Margin + remarks */}
                        <div className="flex flex-wrap items-end gap-3">
                          <div className="flex flex-col gap-1">
                            <label className={labelCls}>Margin type</label>
                            <select className={`${selectCls} w-36`} value={s.marginType} onChange={(e) => updateAccom(item.id, "marginType", e.target.value)}>
                              <option value="fixed">Fixed amount ($)</option>
                              <option value="percentage">Percentage (%)</option>
                            </select>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className={labelCls}>{s.marginType === "percentage" ? "Margin %" : "Margin $"}</label>
                            <input type="number" min="0" step={s.marginType === "percentage" ? "1" : "0.01"} className={`${inputCls} w-28`} value={s.marginValue} onChange={(e) => updateAccom(item.id, "marginValue", e.target.value)} placeholder={s.marginType === "percentage" ? "e.g. 15" : "e.g. 100"} />
                          </div>
                          {s.marginType === "percentage" && p(s.marginValue) > 0 && (
                            <div className="flex flex-col gap-1">
                              <label className={labelCls}>Calculated margin</label>
                              <div className={`${inputCls} w-28 bg-slate-50 text-slate-600 flex items-center`}>{fmt(t.margin)}</div>
                            </div>
                          )}
                          <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
                            <label className={labelCls}>Remarks</label>
                            <input className={inputCls} value={s.remarks} onChange={(e) => updateAccom(item.id, "remarks", e.target.value)} placeholder="Optional..." />
                          </div>
                        </div>

                        {/* Computed subtotal */}
                        <div className="rounded-lg bg-blue-50/50 border border-blue-100 px-3 py-2 flex items-center justify-between text-sm">
                          <div className="space-x-3 text-xs text-slate-500">
                            <span>Buying: <strong className="text-slate-700">{fmt(t.buying)}</strong></span>
                            <span>Margin{s.marginType === "percentage" && p(s.marginValue) > 0 ? ` (${p(s.marginValue)}%)` : ""}: <strong className="text-slate-700">{fmt(t.margin)}</strong></span>
                          </div>
                          <span className="font-semibold text-blue-800">Selling: {fmt(t.selling)}</span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add accommodation button */}
                  <div className="px-6 py-4 border-t border-slate-100">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleAddItem("ACCOMMODATION", "Additional accommodation", accommodations[0]?.destinationId ?? null, 1)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-dashed border-slate-200 text-sm font-medium text-slate-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/30 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                      Add Accommodation
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── EXCURSIONS ─── */}
          {(() => {
            const totalNights = accommodations.reduce((sum, a) => sum + (a.nights ?? 0), 0);
            const excursionLimit = Math.max(totalNights, 1);
            const isOverLimit = excursions.length > excursionLimit;
            const itineraryDestIds = new Set(accommodations.map((a) => a.destinationId).filter(Boolean));
            const filteredExcursions = Object.fromEntries(
              Object.entries(excursionsByDestination).filter(([destId]) => itineraryDestIds.has(destId))
            );
            return (
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/80 shadow-sm overflow-hidden" data-excursion-limit={excursionLimit}>
              <button type="button" onClick={() => toggleSection("excursions")} className="w-full flex items-center justify-between px-6 py-4 border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 rounded-full bg-green-500" />
                  <h2 className="text-sm font-semibold text-slate-800">Excursions</h2>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${isOverLimit ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"}`}>{excursions.length} / {excursionLimit}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-700">{fmt(excursionSubtotal)}</span>
                  <ChevronIcon open={openSections.excursions} />
                </div>
              </button>
              {openSections.excursions && (
                <div className="divide-y divide-slate-100">
                  {isOverLimit && (
                    <div className="mx-6 mt-4 mb-2 flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-amber-800 text-xs">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
                      <span>This trip has <strong>{totalNights} nights</strong> across {accommodations.length} destination{accommodations.length !== 1 ? "s" : ""}. You have <strong>{excursions.length} excursions</strong> which exceeds the recommended 1 per night. Additional excursions may affect pricing and scheduling.</span>
                    </div>
                  )}
                  {excursions.map((item) => {
                    const s = details.excursions[item.id];
                    if (!s) return null;
                    const t = excursionTotal(s);
                    return (
                      <div key={item.id} className="px-6 py-4 space-y-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-green-700">{item.destinationName ?? item.description}</span>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-[10px] font-medium text-red-400 hover:text-red-600 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                        {/* Excursion dropdown - filtered to itinerary destinations */}
                        <div className="flex flex-col gap-1">
                          <label className={labelCls}>Select excursion</label>
                          <select
                            className={selectCls}
                            value={s.excursionName}
                            onChange={(e) => updateExcursion(item.id, "excursionName", e.target.value)}
                          >
                            <option value="">— Select an excursion —</option>
                            {Object.entries(filteredExcursions).map(([destId, excs]) => {
                              const destName = accommodations.find((a) => a.destinationId === destId)?.destinationName || destId;
                              return (
                                <optgroup key={destId} label={destName}>
                                  {excs.map((exc) => (
                                    <option key={exc.id} value={exc.name}>{exc.name}</option>
                                  ))}
                                </optgroup>
                              );
                            })}
                          </select>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className={labelCls}>Cost/person $</label>
                            <input type="number" min="0" step="0.01" className={inputCls} value={s.costPerPerson} onChange={(e) => updateExcursion(item.id, "costPerPerson", e.target.value)} />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className={labelCls}>Adults</label>
                            <input type="number" min="0" className={inputCls} value={s.adultCount} onChange={(e) => updateExcursion(item.id, "adultCount", e.target.value)} />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className={labelCls}>Child rate $</label>
                            <input type="number" min="0" step="0.01" className={inputCls} value={s.childRate} onChange={(e) => updateExcursion(item.id, "childRate", e.target.value)} />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className={labelCls}>Children</label>
                            <input type="number" min="0" className={inputCls} value={s.childCount} onChange={(e) => updateExcursion(item.id, "childCount", e.target.value)} />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <input className={`${inputCls} flex-1 max-w-xs`} value={s.remarks} onChange={(e) => updateExcursion(item.id, "remarks", e.target.value)} placeholder="Remarks..." />
                          <span className="text-sm font-semibold text-green-800 ml-3">{fmt(t)}</span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add excursion button */}
                  <div className="px-6 py-4 border-t border-slate-100">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleAddItem("ACTIVITY", "Additional excursion", accommodations[0]?.destinationId ?? null)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-dashed border-slate-200 text-sm font-medium text-slate-500 hover:border-green-300 hover:text-green-600 hover:bg-green-50/30 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                      Add Excursion
                    </button>
                  </div>
                </div>
              )}
          </div>
            );
          })()}

          {/* ─── TRANSPORT ─── */}
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/80 shadow-sm overflow-hidden">
              <button type="button" onClick={() => toggleSection("transport")} className="w-full flex items-center justify-between px-6 py-4 border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 rounded-full bg-amber-500" />
                  <h2 className="text-sm font-semibold text-slate-800">Transport</h2>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">{transports.length}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-700">{fmt(transportSubtotal)}</span>
                  <ChevronIcon open={openSections.transport} />
                </div>
              </button>
              {openSections.transport && (
                <div className="divide-y divide-slate-100">
                  {transports.map((item) => {
                    const s = details.transports[item.id];
                    if (!s) return null;
                    const t = transportTotal(s, tripDays);
                    return (
                      <div key={item.id} className="px-6 py-5 space-y-4">
                        {/* Vehicle row */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className={labelCls}>Vehicle type</label>
                            {transportRateCards.length > 0 ? (
                              <select
                                className={selectCls}
                                value={s.vehicleType}
                                onChange={(e) => {
                                  const selected = transportRateCards.find((rc) => rc.tier === e.target.value);
                                  updateTransport(item.id, "vehicleType", e.target.value);
                                  if (selected) updateTransport(item.id, "ratePerKm", String(selected.perKmRate));
                                }}
                              >
                                <option value="">— Select vehicle —</option>
                                {transportRateCards.map((rc) => (
                                  <option key={rc.tier} value={rc.tier}>{rc.label}</option>
                                ))}
                              </select>
                            ) : (
                              <select className={selectCls} value={s.vehicleType} onChange={(e) => updateTransport(item.id, "vehicleType", e.target.value)}>
                                <option value="car">Car</option>
                                <option value="van">Van (6-8 pax)</option>
                                <option value="minibus">Minibus (12-15 pax)</option>
                                <option value="bus">Bus (30+ pax)</option>
                                <option value="suv">SUV / Jeep</option>
                              </select>
                            )}
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className={labelCls}>Rate / km ($)</label>
                            <input type="number" min="0" step="0.01" className={inputCls} value={s.ratePerKm} onChange={(e) => updateTransport(item.id, "ratePerKm", e.target.value)} />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className={labelCls}>Vehicles</label>
                            <input type="number" min="1" className={inputCls} value={s.vehicleUnits} onChange={(e) => updateTransport(item.id, "vehicleUnits", e.target.value)} />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className={labelCls}>Distance (km)</label>
                            <input type="number" min="0" className={inputCls} value={s.distanceKm} onChange={(e) => updateTransport(item.id, "distanceKm", e.target.value)} />
                          </div>
                        </div>

                        {/* Pickup / Dropoff */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className={labelCls}>Pickup location</label>
                            <input className={inputCls} value={s.pickupLocation} onChange={(e) => updateTransport(item.id, "pickupLocation", e.target.value)} placeholder="Airport / Hotel..." />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className={labelCls}>Dropoff location</label>
                            <input className={inputCls} value={s.dropoffLocation} onChange={(e) => updateTransport(item.id, "dropoffLocation", e.target.value)} placeholder="Airport / Hotel..." />
                          </div>
                        </div>

                        {/* Driver section */}
                        <div>
                          <p className={`${labelCls} mb-2`}>Driver / Guide</p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="flex flex-col gap-1">
                              <label className={labelCls}>Guide type</label>
                              <select className={selectCls} value={s.driverGuideType} onChange={(e) => updateTransport(item.id, "driverGuideType", e.target.value)}>
                                <option value="chauffeur">Chauffeur</option>
                                <option value="chauffeur-guide">Chauffeur Guide</option>
                                <option value="national-guide">National Guide</option>
                              </select>
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className={labelCls}>Daily rate ($)</label>
                              <input type="number" min="0" step="0.01" className={inputCls} value={s.driverRatePerDay} onChange={(e) => updateTransport(item.id, "driverRatePerDay", e.target.value)} />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className={labelCls}>Driver accom.</label>
                              <label className="flex items-center gap-2 py-1.5 cursor-pointer">
                                <input type="checkbox" checked={s.driverAccommodation} onChange={(e) => updateTransport(item.id, "driverAccommodation", e.target.checked)} className="rounded border-slate-300" />
                                <span className="text-sm text-slate-700">Included</span>
                              </label>
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className={labelCls}>Driver fee ($)</label>
                              <input type="number" min="0" step="0.01" className={inputCls} value={s.driverFee} onChange={(e) => updateTransport(item.id, "driverFee", e.target.value)} placeholder="Override..." />
                            </div>
                          </div>
                        </div>

                        {/* Transport breakdown */}
                        {transportBreakdown && (
                          <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800">
                            <p className="font-semibold mb-1.5 flex items-center gap-1.5"><TruckIcon /> Distance breakdown (auto-calculated)</p>
                            <p className="mb-0.5">
                              Route: <strong>{transportBreakdown.routeKm} km</strong>
                              &nbsp;·&nbsp;Excursions: <strong>{transportBreakdown.excursionKm} km</strong>
                              &nbsp;·&nbsp;Buffer: <strong>{transportBreakdown.bufferKm} km</strong>
                            </p>
                            <p>Total suggested: <strong>{transportBreakdown.totalKm} km</strong></p>
                          </div>
                        )}

                        {/* Remarks + subtotal */}
                        <div className="flex items-end gap-3">
                          <div className="flex flex-col gap-1 flex-1">
                            <label className={labelCls}>Remarks</label>
                            <input className={inputCls} value={s.remarks} onChange={(e) => updateTransport(item.id, "remarks", e.target.value)} placeholder="Optional..." />
                          </div>
                          <div className="rounded-lg bg-amber-50/50 border border-amber-100 px-3 py-2 text-sm font-semibold text-amber-800 whitespace-nowrap">
                            {fmt(t)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {transports.length === 0 && openSections.transport && (
                <div className="px-6 py-4">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleAddItem("TRANSPORT", "Transport", null)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-dashed border-slate-200 text-sm font-medium text-slate-500 hover:border-amber-300 hover:text-amber-600 hover:bg-amber-50/30 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    Add Transport
                  </button>
                </div>
              )}
          </div>

          {/* ─── OTHER CHARGES ─── */}
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/80 shadow-sm overflow-hidden">
              <button type="button" onClick={() => toggleSection("other")} className="w-full flex items-center justify-between px-6 py-4 border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 rounded-full bg-purple-500" />
                  <h2 className="text-sm font-semibold text-slate-800">Other Charges</h2>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">{addons.length}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-700">{fmt(otherSubtotal)}</span>
                  <ChevronIcon open={openSections.other} />
                </div>
              </button>
              {openSections.other && (
                <div className="divide-y divide-slate-100">
                  {addons.map((item) => {
                    const s = details.otherCharges[item.id];
                    if (!s) return null;
                    const t = otherChargeTotal(s);
                    return (
                      <div key={item.id} className="px-6 py-4 space-y-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-purple-700">{s.costItem || "Charge"}</span>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-[10px] font-medium text-red-400 hover:text-red-600 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className={labelCls}>Cost item</label>
                            <input className={inputCls} value={s.costItem} onChange={(e) => updateOtherCharge(item.id, "costItem", e.target.value)} />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className={labelCls}>Description</label>
                            <input className={inputCls} value={s.description} onChange={(e) => updateOtherCharge(item.id, "description", e.target.value)} placeholder="Optional..." />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className={labelCls}>Cost / unit ($)</label>
                            <input type="number" min="0" step="0.01" className={inputCls} value={s.costPerUnit} onChange={(e) => updateOtherCharge(item.id, "costPerUnit", e.target.value)} />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className={labelCls}>Units</label>
                            <input type="number" min="0" className={inputCls} value={s.units} onChange={(e) => updateOtherCharge(item.id, "units", e.target.value)} />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <input className={`${inputCls} flex-1 max-w-xs`} value={s.remarks} onChange={(e) => updateOtherCharge(item.id, "remarks", e.target.value)} placeholder="Remarks..." />
                          <span className="text-sm font-semibold text-purple-800 ml-3">{fmt(t)}</span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add other charge button */}
                  <div className="px-6 py-4 border-t border-slate-100">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleAddItem("ADDON", "Additional charge", null)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-dashed border-slate-200 text-sm font-medium text-slate-500 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50/30 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                      Add Charge
                    </button>
                  </div>
                </div>
              )}
          </div>

          {/* ─── PRICE SUMMARY ─── */}
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/80 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-800">Price Summary</h2>
            </div>
            <div className="px-6 py-5 space-y-5">
              {/* Category subtotals */}
              <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 space-y-1.5">
                {accommodations.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /> Accommodation</span>
                    <span className="font-medium text-slate-800">{fmt(accomSubtotal)}</span>
                  </div>
                )}
                {excursions.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" /> Excursions</span>
                    <span className="font-medium text-slate-800">{fmt(excursionSubtotal)}</span>
                  </div>
                )}
                {transports.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500" /> Transport</span>
                    <span className="font-medium text-slate-800">{fmt(transportSubtotal)}</span>
                  </div>
                )}
                {addons.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500" /> Other Charges</span>
                    <span className="font-medium text-slate-800">{fmt(otherSubtotal)}</span>
                  </div>
                )}
                <div className="border-t border-slate-200 pt-1.5 flex justify-between text-sm font-semibold">
                  <span className="text-slate-700">Subtotal</span>
                  <span className="text-slate-800">{fmt(subtotal)}</span>
                </div>
              </div>

              {/* Handling fee + Tax + Discount */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <p className={labelCls}>Handling fee</p>
                  <div className="flex gap-2">
                    <select className={`${selectCls} w-20`} value={summary.handlingFeeType} onChange={(e) => setSummary((prev) => ({ ...prev, handlingFeeType: e.target.value }))}>
                      <option value="fixed">$</option>
                      <option value="percentage">%</option>
                    </select>
                    <input type="number" min="0" step="0.01" className={inputCls} value={summary.handlingFeeAmt} onChange={(e) => setSummary((prev) => ({ ...prev, handlingFeeAmt: e.target.value }))} />
                  </div>
                  {handlingFee > 0 && <p className="text-xs text-slate-400">= {fmt(handlingFee)}</p>}
                </div>
                <div className="space-y-2">
                  <p className={labelCls}>Tax rate (%)</p>
                  <input type="number" min="0" step="0.1" className={inputCls} value={summary.taxRate} onChange={(e) => setSummary((prev) => ({ ...prev, taxRate: e.target.value }))} />
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={summary.taxInclusive} onChange={(e) => setSummary((prev) => ({ ...prev, taxInclusive: e.target.checked }))} className="rounded border-slate-300" />
                    <span className="text-xs text-slate-600">Tax inclusive</span>
                  </label>
                </div>
                <div className="space-y-2">
                  <p className={labelCls}>Discount ($)</p>
                  <input type="number" min="0" step="0.01" className={inputCls} value={summary.discountAmt} onChange={(e) => setSummary((prev) => ({ ...prev, discountAmt: e.target.value }))} />
                </div>
              </div>

              {/* Grand total */}
              <div className="rounded-xl bg-slate-800 text-white px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Grand Total</p>
                  {handlingFee > 0 && <p className="text-xs text-slate-400 mt-0.5">incl. {fmt(handlingFee)} handling</p>}
                  {tax > 0 && <p className="text-xs text-slate-400">+ {fmt(tax)} tax</p>}
                  {discount > 0 && <p className="text-xs text-slate-400">- {fmt(discount)} discount</p>}
                </div>
                <span className="text-2xl font-bold">{fmt(grandTotal)}</span>
              </div>

              {/* Deposit */}
              <div className="flex flex-wrap gap-3 items-end">
                <div className="flex flex-col gap-1">
                  <label className={`${labelCls}`}>Deposit amount</label>
                  <input type="number" min="0" step="0.01" value={deposit} onChange={(e) => setDeposit(e.target.value)} className={`${inputCls} w-40`} placeholder="0.00" />
                </div>
                <button type="button" onClick={set30PctDeposit} className="border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium px-4 py-2 transition-colors">
                  30%
                </button>
                {p(deposit) > 0 && grandTotal > 0 && (
                  <span className="text-xs text-slate-400 mb-2">({((p(deposit) / grandTotal) * 100).toFixed(1)}% of total)</span>
                )}
              </div>

              {/* Valid until */}
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Valid until</label>
                <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className={`${inputCls} w-48`} />
              </div>

              {/* Admin notes */}
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Admin notes (sent with quote)</label>
                <textarea rows={3} value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} placeholder="Add any notes or context for the customer..." className={`${inputCls} resize-none`} />
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 pt-1">
                <button type="button" onClick={handleSaveDraft} disabled={isPending} className="border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {isPending ? "Saving..." : "Save Draft"}
                </button>
                {quoteSent ? (
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2">
                      <CheckCircleIcon /> Quote Sent
                    </span>
                    <button type="button" onClick={() => { setQuoteSent(false); setSuccessMessage(null); }} className="text-xs text-slate-500 hover:text-slate-700 underline transition-colors">
                      Send another revision
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setShowReviewModal(true)} disabled={isPending || grandTotal <= 0} className="bg-slate-800 text-white hover:bg-slate-700 rounded-xl text-sm font-medium px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    Review & Send Quote
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── REVIEW MODAL ─── */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowReviewModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-800">Review Quote</h2>
              <button type="button" onClick={() => setShowReviewModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-sm">
              {/* Customer info */}
              <div className="space-y-1">
                <p className="font-semibold text-slate-800">{session.customer.name ?? "Unknown"}</p>
                <p className="text-xs text-slate-500">{fmtDate(booking.arrivalDate)} → {fmtDate(booking.departureDate)} ({tripDays} day{tripDays !== 1 ? "s" : ""}) · {booking.numTravelers} traveler{booking.numTravelers !== 1 ? "s" : ""}</p>
              </div>

              {/* Accommodation */}
              {accommodations.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">Accommodation</p>
                    <span className="text-xs font-semibold text-slate-700">{fmt(accomSubtotal)}</span>
                  </div>
                  <div className="space-y-2">
                    {accommodations.map((item, i) => {
                      const s = details.accommodations[item.id];
                      if (!s) return null;
                      const t = accomTotal(s, item.nights ?? 1);
                      const rt = s.roomType || "dbl";
                      const roomsKey = `${rt}Rooms` as keyof AccomState;
                      const rateKey = `${rt}Rate` as keyof AccomState;
                      const rtLabels: Record<string, string> = { sgl: "Single", dbl: "Double", twn: "Twin", tpl: "Triple" };
                      return (
                        <div key={item.id} className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-slate-700">Stay {i + 1}: {item.destinationName ?? "Destination"} ({item.nights ?? 1} night{(item.nights ?? 1) !== 1 ? "s" : ""})</p>
                            <span className="font-semibold text-slate-800">{fmt(t.selling)}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {s.hotelName || "No hotel selected"} — {p(String(s[roomsKey]))}× {rtLabels[rt]} @ {fmt(p(String(s[rateKey])))}/night
                            {s.mealPlan && <span> · {s.mealPlan}</span>}
                          </p>
                          {t.margin > 0 && (
                            <p className="text-xs text-slate-400 mt-0.5">
                              Margin: {s.marginType === "percentage" ? `${p(s.marginValue)}%` : fmt(p(s.marginValue))} ({fmt(t.margin)})
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Excursions */}
              {excursions.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-green-700 uppercase tracking-wide">Excursions</p>
                    <span className="text-xs font-semibold text-slate-700">{fmt(excursionSubtotal)}</span>
                  </div>
                  <div className="space-y-1.5">
                    {excursions.map((item) => {
                      const s = details.excursions[item.id];
                      if (!s) return null;
                      const t = excursionTotal(s);
                      return (
                        <div key={item.id} className="flex items-center justify-between rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
                          <div>
                            <p className="font-medium text-slate-700">{s.excursionName || "Unnamed excursion"}</p>
                            <p className="text-xs text-slate-500">
                              {p(s.adultCount) > 0 && <span>{p(s.adultCount)} adult{p(s.adultCount) !== 1 ? "s" : ""} @ {fmt(p(s.costPerPerson))}</span>}
                              {p(s.childCount) > 0 && <span> · {p(s.childCount)} child{p(s.childCount) !== 1 ? "ren" : ""} @ {fmt(p(s.childRate))}</span>}
                            </p>
                          </div>
                          <span className="font-semibold text-slate-800 shrink-0 ml-3">{fmt(t)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Transport */}
              {transports.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">Transport</p>
                    <span className="text-xs font-semibold text-slate-700">{fmt(transportSubtotal)}</span>
                  </div>
                  {transports.map((item) => {
                    const s = details.transports[item.id];
                    if (!s) return null;
                    const t = transportTotal(s, tripDays);
                    return (
                      <div key={item.id} className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-slate-700">{s.vehicleType || "Vehicle"}</p>
                          <span className="font-semibold text-slate-800">{fmt(t)}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {p(s.distanceKm) > 0 && <span>{p(s.distanceKm)} km @ {fmt(p(s.ratePerKm))}/km</span>}
                          {p(s.driverRatePerDay) > 0 && <span> · Driver {fmt(p(s.driverRatePerDay))}/day × {tripDays} days</span>}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Other charges */}
              {addons.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-purple-700 uppercase tracking-wide">Other Charges</p>
                    <span className="text-xs font-semibold text-slate-700">{fmt(otherSubtotal)}</span>
                  </div>
                  <div className="space-y-1.5">
                    {addons.map((item) => {
                      const s = details.otherCharges[item.id];
                      if (!s) return null;
                      const t = otherChargeTotal(s);
                      return (
                        <div key={item.id} className="flex items-center justify-between rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
                          <div>
                            <p className="font-medium text-slate-700">{s.costItem || "Charge"}</p>
                            <p className="text-xs text-slate-500">{p(s.units)} × {fmt(p(s.costPerUnit))}</p>
                          </div>
                          <span className="font-semibold text-slate-800 shrink-0 ml-3">{fmt(t)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Totals */}
              <div className="border-t border-slate-200 pt-4 space-y-1.5">
                <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                {handlingFee > 0 && <div className="flex justify-between text-slate-600"><span>Handling fee</span><span>{fmt(handlingFee)}</span></div>}
                {tax > 0 && <div className="flex justify-between text-slate-600"><span>Tax ({p(summary.taxRate)}%)</span><span>{fmt(tax)}</span></div>}
                {discount > 0 && <div className="flex justify-between text-slate-600"><span>Discount</span><span className="text-red-600">-{fmt(discount)}</span></div>}
                <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Grand Total</span><span>{fmt(grandTotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Deposit</span>
                  <span>{fmt(p(deposit))}{p(deposit) > 0 && grandTotal > 0 && ` (${((p(deposit) / grandTotal) * 100).toFixed(0)}%)`}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Valid until</span><span>{validUntil || "Not set"}</span>
                </div>
                {adminNotes && (
                  <div className="mt-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase mb-0.5">Notes to customer</p>
                    <p className="text-xs text-slate-600">{adminNotes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200">
              <button type="button" onClick={() => setShowReviewModal(false)} className="border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium px-5 py-2.5 transition-colors">
                Go Back
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => { setShowReviewModal(false); handleSendQuote(); }}
                className="bg-slate-800 text-white hover:bg-slate-700 rounded-xl text-sm font-medium px-5 py-2.5 transition-colors disabled:opacity-50"
              >
                {isPending ? "Sending..." : "Confirm & Send Quote"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
