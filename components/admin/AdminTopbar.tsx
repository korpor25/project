import { AdminMenuButton } from "./AdminMenuButton";
import { AdminUserMenu } from "./AdminUserMenu";

export function AdminTopbar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="flex items-center justify-between gap-2 border-b border-border bg-card px-4 py-3 sm:px-6 sm:py-3.5">
      {/* min-w-0 on both the row and the text block: without it the title
          refuses to shrink and pushes the actions off a narrow screen. */}
      <div className="flex min-w-0 items-center gap-1.5">
        <AdminMenuButton />
        <div className="min-w-0">
          <p className="truncate text-base font-semibold leading-tight sm:text-lg">
            {title}
          </p>
          {subtitle && (
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1 sm:gap-3">
        <AdminUserMenu variant="topbar" />
      </div>
    </header>
  );
}
