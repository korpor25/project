import { ChevronDown, LogOut, UserCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type Variant = "sidebar" | "topbar";

// Server component that renders the signed-in admin's avatar + dropdown with
// a logout form. Uses native <details> so it works without client JS — the
// menu opens on click and closes when the user blurs/clicks elsewhere.
export async function AdminUserMenu({ variant = "topbar" }: { variant?: Variant }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const fullName =
    (user?.user_metadata as { full_name?: string } | undefined)?.full_name ??
    user?.email?.split("@")[0] ??
    "Admin";
  const initial = fullName.slice(0, 1).toUpperCase();
  const role =
    (user?.app_metadata as { user_role?: string } | undefined)?.user_role ??
    "ADMIN";
  const roleLabel = role === "SUPER_ADMIN" ? "Super Administrator" : "Administrator";

  if (variant === "sidebar") {
    return (
      <details className="group relative">
        <summary className="flex cursor-pointer list-none items-center gap-2.5 rounded-md p-2 hover:bg-muted">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-warning-soft text-warning font-semibold">
            {initial}
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-medium">{fullName}</p>
            <p className="truncate text-[10px] text-muted-foreground">{roleLabel}</p>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
        </summary>
        <div className="absolute bottom-full left-0 right-0 z-50 mb-2 rounded-lg border border-border bg-card p-1 shadow-lg">
          <div className="px-3 py-2 text-xs text-muted-foreground">{user?.email}</div>
          <form action="/logout" method="post" className="border-t border-border pt-1">
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-danger hover:bg-danger-soft"
            >
              <LogOut className="h-3.5 w-3.5" />
              ออกจากระบบ
            </button>
          </form>
        </div>
      </details>
    );
  }

  return (
    <details className="relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full bg-muted/60 py-1 pl-1 pr-3 hover:bg-muted">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-warning text-warning-foreground text-[11px] font-semibold">
          {initial}
        </div>
        <span className="text-sm font-medium">{fullName}</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </summary>
      <div className="absolute right-0 z-50 mt-2 w-56 rounded-lg border border-border bg-card p-1 shadow-lg">
        <div className="flex items-center gap-2 px-3 py-2 text-xs">
          <UserCircle className="h-4 w-4 text-muted-foreground" />
          <div className="min-w-0">
            <p className="truncate font-medium">{fullName}</p>
            <p className="truncate text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <form action="/logout" method="post" className="border-t border-border pt-1">
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-danger hover:bg-danger-soft"
          >
            <LogOut className="h-3.5 w-3.5" />
            ออกจากระบบ
          </button>
        </form>
      </div>
    </details>
  );
}
