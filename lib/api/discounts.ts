import type { DiscountResult, DiscountType } from "@/types/domain";
import { apiFetch } from "./client";
import { ApiError } from "./error";

// --- User-facing: validate during booking ---

export type DiscountCode = {
  id: string;
  code: string;
  type: DiscountType;
  value: number;
  maxUses?: number;
  usedCount: number;
  expiresAt?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

/**
 * Validate a discount code against the backend. Returns the redeemable result
 * or `null` if the code is unknown / inactive / expired / used-up. The
 * booking endpoint re-validates server-side, so a stale result here just
 * means the user sees a friendlier message on submit.
 */
export async function validateDiscountCode(
  code: string,
): Promise<DiscountResult | null> {
  try {
    const data = await apiFetch<DiscountResult>(
      "/api/v1/discount-codes/validate",
      { method: "POST", body: { code } },
    );
    return data ?? null;
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 400)) {
      return null;
    }
    throw err;
  }
}

// --- Admin CRUD ---

export function listDiscountCodes() {
  return apiFetch<DiscountCode[]>("/api/v1/admin/discount-codes");
}

export type CreateDiscountPayload = {
  code: string;
  type: DiscountType;
  value: number;
  maxUses?: number;
  expiresAt?: string;
};

export function createDiscountCode(payload: CreateDiscountPayload) {
  return apiFetch<DiscountCode>("/api/v1/admin/discount-codes", {
    method: "POST",
    body: payload,
  });
}

export function setDiscountActive(id: string, active: boolean) {
  return apiFetch<{ active: boolean }>(
    `/api/v1/admin/discount-codes/${encodeURIComponent(id)}`,
    { method: "PATCH", body: { active } },
  );
}

export function deleteDiscountCode(id: string) {
  return apiFetch<unknown>(
    `/api/v1/admin/discount-codes/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
}
