// Payment client + types. Imported by client components — must not pull in
// `next/headers`. Server-side fetchers live in `payments-server.ts`.

import { apiFetch } from "./client";

export type PaymentStatus = "PENDING" | "SUBMITTED" | "APPROVED" | "REJECTED";

export type Payment = {
  id: string;
  bookingId: string;
  installmentNo: number;
  label?: string;
  amount: number;
  dueDate?: string;
  status: PaymentStatus;
  slipPath?: string;
  signedUrl?: string;
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  notes?: string;
};

export function fetchBookingPaymentsClient(code: string) {
  return apiFetch<Payment[]>(
    `/api/v1/bookings/${encodeURIComponent(code)}/payments`,
  );
}

export function submitPaymentSlip(paymentId: string, storagePath: string) {
  return apiFetch<{ id: string; status: PaymentStatus }>(
    `/api/v1/payments/${encodeURIComponent(paymentId)}/slip`,
    { method: "POST", body: { storagePath } },
  );
}

export function approvePayment(paymentId: string) {
  return apiFetch<{ id: string; status: PaymentStatus }>(
    `/api/v1/admin/payments/${encodeURIComponent(paymentId)}/approve`,
    { method: "PATCH" },
  );
}

export function rejectPayment(paymentId: string, notes: string) {
  return apiFetch<{ id: string; status: PaymentStatus }>(
    `/api/v1/admin/payments/${encodeURIComponent(paymentId)}/reject`,
    { method: "PATCH", body: { notes } },
  );
}
