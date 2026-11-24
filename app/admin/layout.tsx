import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AdminNavProvider } from "@/components/admin/AdminNavProvider";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminUserMenu } from "@/components/admin/AdminUserMenu";
import { fetchAdminUsers, fetchDashboard } from "@/lib/api/admin-server";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin/dashboard");
  }

  const meta = (user.app_metadata ?? {}) as { user_role?: string };
  const role = meta.user_role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    redirect("/");
  }

  // Pull the pending count once so the sidebar badge reflects reality.
  // Best-effort — silent fallback to 0 keeps the layout from hard-failing.
  let pendingCount = 0;
  let pendingUserCount = 0;
  const [kpi, users] = await Promise.all([
    fetchDashboard().catch(() => null),
    fetchAdminUsers().catch(() => null),
  ]);
  if (kpi) pendingCount = kpi.pending;
  if (users) {
    pendingUserCount = users.filter((u) => u.status === "PENDING").length;
  }

  return (
    <AdminNavProvider
      pendingCount={pendingCount}
      pendingUserCount={pendingUserCount}
    >
      <div className="flex min-h-screen bg-[#f6f5f1]">
        <AdminSidebar userSlot={<AdminUserMenu variant="sidebar" />} />
        {/* min-w-0 stops a wide table inside a page from stretching this flex
            child past the viewport — the page cannot scroll sideways, so the
            overflow would simply be clipped and unreachable. */}
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </AdminNavProvider>
  );
}
