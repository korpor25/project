// Booking type + client-side mutations.
//
// IMPORTANT: this module is imported by client components, so it must not
// transitively touch `next/headers`. Server-side fetchers live in
// `bookings-server.ts`.

import { apiFetch } from "./client";

export type CreateBookingPayload = {
  /** Array of booth UUIDs to book atomically. Replaces the deprecated scalar boothId. */
  boothIds: string[];
  weeks: number;
  fullName: string;
  companyName?: string;
  phone: string;
  email: string;
  taxId?: string;
  productCategory?: string;
  productDetail?: string;
  installmentPlan?: "ALL" | "DEPOSIT" | "INSTALLMENT_1";
  discountCode?: string;
  acceptTerms: boolean;
};

/** Per-booth line item returned in the booking create response (ADR-0012). */
export type BookingBooth = {
  boothId: string;
  boothCode: string;
  /** Snapshotted per-day price for this booth at time of booking. */
  price: number;
};

export type ApiBooking = {
  id: string;
  code: string;
  userId: string;
  /** Legacy primary booth id — present for old bookings; prefer booths[] for new ones. */
  boothId: string;
  eventId: string;
  /** Legacy primary booth code — present for old bookings; prefer booths[] for new ones. */
  boothCode: string;
  /** All booths included in this booking (ADR-0012). Empty for pre-migration bookings. */
  booths?: BookingBooth[];
  zoneName?: string;
  widthM: number;
  lengthM: number;
  eventNameTh: string;
  branch?: string;
  floor?: string;
  fullName: string;
  companyName?: string;
  phone: string;
  email: string;
  taxId?: string;
  productCategory?: string;
  productDetail?: string;
  status:
    | "PENDING"
    | "REVIEWING"
    | "APPROVED"
    | "REJECTED"
    | "CANCELLED"
    | "EXPIRED";
  rejectionReason?: string;
  totalRent: number;
  serviceFee: number;
  deposit: number;
  vat: number;
  grandTotal: number;
  discountCodeId?: string;
  discountCode?: string;
  discountAmount?: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
};

export function createBooking(payload: CreateBookingPayload) {
  return apiFetch<ApiBooking>("/api/v1/bookings", {
    method: "POST",
    body: payload,
  });
}

export function cancelBooking(code: string) {
  return apiFetch<{ status: string }>(
    `/api/v1/bookings/${encodeURIComponent(code)}`,
    { method: "DELETE" },
  );
}

export type BookingAttachments = {
  documents: Array<{
    id: string;
    docType: "PRODUCT_IMAGE" | "ID_CARD" | "COMPANY_CERT" | "OTHER";
    storagePath: string;
    mimeType?: string;
    uploadedAt: string;
    signedUrl?: string;
  }>;
  payments: Array<{
    id: string;
    installmentNo: number;
    label?: string;
    amount: number;
    status: string;
    slipPath?: string;
    signedUrl?: string;
    submittedAt?: string;
  }>;
};

export function fetchBookingAttachmentsClient(code: string) {
  return apiFetch<BookingAttachments>(
    `/api/v1/bookings/${encodeURIComponent(code)}/documents`,
  );
}
