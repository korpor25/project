import "server-only";

import { serverFetch } from "./server";
import type { ApiBooking } from "./bookings";

type Envelope<T> = { data: T };
type Paged<T> = {
  data: T[];
  meta?: { page: number; perPage: number; total: number };
};

export async function fetchMyBookings(): Promise<ApiBooking[]> {
  const res = await serverFetch<Paged<ApiBooking>>("/api/v1/bookings/me", {
    query: { perPage: 50 },
  });
  return res.data;
}

export async function fetchBookingByCode(
  code: string,
): Promise<ApiBooking | null> {
  const res = await serverFetch<Envelope<ApiBooking>>(
    `/api/v1/bookings/${encodeURIComponent(code)}`,
  );
  return res.data;
}

export async function fetchAdminBookings(
  params: { status?: string; page?: number; perPage?: number } = {},
): Promise<{ rows: ApiBooking[]; total: number }> {
  const res = await serverFetch<Paged<ApiBooking>>(
    "/api/v1/admin/bookings",
    {
      query: {
        status: params.status,
        page: params.page ?? 1,
        perPage: params.perPage ?? 50,
      },
    },
  );
  return { rows: res.data, total: res.meta?.total ?? res.data.length };
}

export type BookingDocumentRow = {
  id: string;
  bookingId: string;
  docType: "PRODUCT_IMAGE" | "ID_CARD" | "COMPANY_CERT" | "OTHER";
  storagePath: string;
  fileSize?: number;
  mimeType?: string;
  uploadedAt: string;
  signedUrl?: string;
};

export type PaymentSlipRow = {
  id: string;
  installmentNo: number;
  label?: string;
  amount: number;
  status: "PENDING" | "SUBMITTED" | "APPROVED" | "REJECTED";
  slipPath?: string;
  submittedAt?: string;
  signedUrl?: string;
};

export async function fetchBookingAttachments(code: string): Promise<{
  documents: BookingDocumentRow[];
  payments: PaymentSlipRow[];
}> {
  const res = await serverFetch<
    Envelope<{ documents: BookingDocumentRow[]; payments: PaymentSlipRow[] }>
  >(`/api/v1/bookings/${encodeURIComponent(code)}/documents`);
  return res.data;
}
