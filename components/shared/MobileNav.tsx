"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

type NavLink = { href: string; label: string };

/**
 * The nav links only exist from `md` up, so below that the site had no way to
 * reach them at all. This is that missing menu.
 *
 * A client component rather than the `<details>` trick used by the account
 * dropdown: the panel has to close on tap and lock the page behind it, and
 * `<details>` would stay open over the page the user just moved to.
 */
export function MobileNav({
  links,
  signedIn,
  loginLabel,
  registerLabel,
}: {
  links: NavLink[];
  signedIn: boolean;
  loginLabel: string;
  registerLabel: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // A menu that scrolls the page behind it reads as broken on a phone.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? "ปิดเมนู" : "เปิดเมนู"}
        className="flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <>
          {/* Sits under the panel but over the page; tapping it closes. */}
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-x-0 bottom-0 top-16 z-30 bg-foreground/20"
          />

          <div
            id="mobile-nav-panel"
            className="absolute inset-x-0 top-16 z-40 border-b border-border bg-card shadow-lg"
          >
            <nav className="flex flex-col p-2">
              {links.map((l) => {
                const active =
                  l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={`rounded-md px-4 py-3 text-sm transition-colors ${
                      active
                        ? "bg-primary-soft font-medium text-primary-hover"
                        : "hover:bg-muted"
                    }`}
                  >
                    {l.label}
                  </Link>
                );
              })}

              {signedIn ? (
                <Link
                  href="/bookings"
                  onClick={() => setOpen(false)}
                  className="mt-1 rounded-md border-t border-border px-4 py-3 pt-4 text-sm hover:bg-muted"
                >
                  การจองของฉัน
                </Link>
              ) : (
                // Auth lives here on phones instead of the bar, which cannot
                // fit a logo, two buttons and a menu toggle at 390px.
                <div className="mt-2 flex flex-col gap-2 border-t border-border px-2 pb-1 pt-3">
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="flex h-11 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
                  >
                    {registerLabel}
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="flex h-11 items-center justify-center rounded-lg border border-border text-sm font-medium transition-colors hover:bg-muted"
                  >
                    {loginLabel}
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
