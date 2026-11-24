/**
 * Public auth API calls (no bearer token required).
 * Used by LoginForm to resolve phone -> email before signInWithPassword.
 */
import { apiFetch } from "./client";
import { ApiError } from "./error";

export type LookupEmailResult =
  | { ok: true; email: string }
  | { ok: false; notFound: true }
  | { ok: false; notFound: false; message: string };

/**
 * Resolve a Thai phone number to the associated account email.
 * Calls POST /api/v1/auth/lookup-email (public endpoint — no auth header).
 */
export async function lookupEmailByPhone(
  phone: string,
): Promise<LookupEmailResult> {
  try {
    const result = await apiFetch<{ email: string }>(
      "/api/v1/auth/lookup-email",
      {
        method: "POST",
        body: { phone },
        anonymous: true,
      },
    );
    return { ok: true, email: result.email };
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 404 && err.code === "ACCOUNT_NOT_FOUND") {
        return { ok: false, notFound: true };
      }
      // 422 VALIDATION_FAILED or any other API error
      return { ok: false, notFound: false, message: err.message };
    }
    return { ok: false, notFound: false, message: "เกิดข้อผิดพลาด กรุณาลองใหม่" };
  }
}
