import "server-only";

import { serverFetch } from "./server";
import type { Payment } from "./payments";

type Envelope<T> = { data: T };

export async function fetchBookingPayments(code: string): Promise<Payment[]> {
  const res = await serverFetch<Envelope<Payment[]>>(
    `/api/v1/bookings/${encodeURIComponent(code)}/payments`,
  );
  return res.data;
}
