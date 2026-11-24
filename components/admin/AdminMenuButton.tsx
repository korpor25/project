"use client";

import { Menu } from "lucide-react";
import { useAdminNav } from "./AdminNavProvider";

/**
 * Opens the admin nav drawer. Sits in the topbar so every admin page gets it
 * without each page having to opt in.
 */
export function AdminMenuButton() {
  const { open, toggle } = useAdminNav();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-expanded={open}
      aria-controls="admin-nav-drawer"
      aria-label="เปิดเมนู"
      className="-ml-1.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 lg:hidden"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}
