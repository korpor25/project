"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type AdminNavValue = {
  /** Pending booking count → badge on "การจองทั้งหมด". */
  pendingCount: number;
  /** Accounts awaiting approval → badge on "ผู้ใช้งาน". */
  pendingUserCount: number;
  /** Whether the mobile drawer is showing. Always false from `lg` up. */
  open: boolean;
  toggle: () => void;
  close: () => void;
};

const AdminNavContext = createContext<AdminNavValue | null>(null);

/**
 * Shares the drawer state between the two places that need it: the trigger
 * lives in the topbar (rendered per page) while the panel lives in the
 * sidebar (rendered by the layout), so neither can own the state alone.
 *
 * The badge counts ride along because they are fetched server-side in the
 * layout, and the mobile drawer needs the same numbers as the desktop rail —
 * a pending-approval badge matters more on a phone, not less.
 */
export function AdminNavProvider({
  pendingCount,
  pendingUserCount,
  children,
}: {
  pendingCount: number;
  pendingUserCount: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((v) => !v), []);
  const close = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ pendingCount, pendingUserCount, open, toggle, close }),
    [pendingCount, pendingUserCount, open, toggle, close],
  );

  return <AdminNavContext.Provider value={value}>{children}</AdminNavContext.Provider>;
}

export function useAdminNav(): AdminNavValue {
  const ctx = useContext(AdminNavContext);
  if (!ctx) throw new Error("useAdminNav must be used inside <AdminNavProvider>");
  return ctx;
}
