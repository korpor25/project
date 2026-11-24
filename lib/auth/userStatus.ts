// Approval state of a customer account.
//
// Read from `app_metadata`, the same place the role lives. That object is
// writable only with the service role key, so a user cannot approve their own
// account by editing their profile — `user_metadata` would be wide open.

export type UserStatus = "PENDING" | "APPROVED" | "REJECTED";

/** Shape we need off a Supabase user — kept loose so both the browser and
 *  middleware clients satisfy it without importing the full SDK type. */
type WithAppMetadata =
  | { app_metadata?: Record<string, unknown> | null }
  | null
  | undefined;

/**
 * Defaults to APPROVED when the claim is absent, and that default is load
 * bearing: the backend does not write `user_status` yet, and every account
 * created before this feature has no claim at all. Defaulting to PENDING
 * would lock out the entire existing customer base the moment this ships.
 *
 * Once the backend sets PENDING on signup, only new accounts get gated.
 */
export function userStatusOf(user: WithAppMetadata): UserStatus {
  const raw = user?.app_metadata?.user_status;
  return raw === "PENDING" || raw === "REJECTED" ? raw : "APPROVED";
}

/** True while the account is waiting on an admin decision. */
export function isAwaitingApproval(user: WithAppMetadata): boolean {
  return userStatusOf(user) !== "APPROVED";
}

/** Where a not-yet-approved account is parked. */
export const PENDING_APPROVAL_PATH = "/pending-approval";

/**
 * Routes a PENDING account may still reach. Everything else redirects to the
 * waiting page. Sign-out has to stay open or a pending user gets stuck in the
 * app with no way out, and the legal pages stay open because registration
 * asked them to accept those terms.
 */
export const PENDING_ALLOWED_PATHS = [
  PENDING_APPROVAL_PATH,
  // Without this the POST to /logout is redirected to the waiting page before
  // the route handler runs, the session is never cleared, and the account is
  // trapped on that page with no way out.
  "/logout",
  "/login",
  "/register",
  "/forgot-password",
  "/auth",
  "/terms",
  "/privacy",
  "/contact",
  "/faq",
  "/about",
];

export function isAllowedWhilePending(pathname: string): boolean {
  return PENDING_ALLOWED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}
