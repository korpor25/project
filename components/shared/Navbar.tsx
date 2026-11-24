import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ChevronDown, LogOut, User as UserIcon } from "lucide-react";
import { ArticlesMenu } from "@/components/shared/ArticlesMenu";
import { MobileNav } from "@/components/shared/MobileNav";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { createClient } from "@/lib/supabase/server";

export async function Navbar() {
  const t = await getTranslations("nav");

  // Reads the session every request. Layout that hosts Navbar must be dynamic
  // (force-dynamic or pages above don't aggressively cache) so this stays
  // session-aware right after login/logout.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const role = (user?.app_metadata as { user_role?: string } | undefined)
    ?.user_role;
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
  const displayName =
    (user?.user_metadata as { full_name?: string } | undefined)?.full_name ??
    user?.email ??
    "";

  // Sticky rather than fixed: the header keeps its space in the flow, so hero
  // heights built on calc(100vh - 4rem) stay correct. z-40 parks it above page
  // content but under the z-50 layer used by dialogs and the contact FAB, so a
  // modal still covers it.
  // Same list the desktop nav renders, handed to the mobile panel so the two
  // can't drift apart. Articles link straight to the index on mobile — the
  // desktop dropdown would be a menu inside a menu.
  const mobileLinks = [
    { href: "/", label: t("home") },
    { href: "/events", label: t("rentSpace") },
    { href: "/articles", label: t("relatedArticles") },
    { href: "/gallery", label: t("gallery") },
    { href: "/about", label: t("about") },
    { href: "/contact", label: t("contact") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b-2 border-primary/80 bg-card">
      <Container className="flex h-16 items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-2">
          {/* Mark only — the full lockup's "EXHIBITION MANAGEMENT" line is
              unreadable at navbar height, and the wordmark is already spelled
              out beside it, so the image is decorative (empty alt). */}
          <Image
            src="/logo-mark.png"
            alt=""
            width={512}
            height={512}
            className="h-9 w-9 shrink-0 object-contain"
            priority
          />
          <span className="text-lg font-bold tracking-tight">
            <span className="text-primary">CS</span> Exhibition
          </span>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            Management
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link href="/" className="hover:text-primary">
            {t("home")}
          </Link>
          <Link href="/events" className="hover:text-primary">
            {t("rentSpace")}
          </Link>

          {/* Driven by the in-code article store, so publishing an article in
              lib/articles.ts adds it here with no navbar change. */}
          <ArticlesMenu />

          <Link href="/gallery" className="hover:text-primary">
            {t("gallery")}
          </Link>
          <Link href="/about" className="hover:text-primary">
            {t("about")}
          </Link>
          <Link href="/contact" className="hover:text-primary">
            {t("contact")}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* Hidden on phones: 360px is tight once the hamburger is in,
                  and the account dropdown already links to the admin area. */}
              {isAdmin && (
                <Link href="/admin/dashboard" className="hidden sm:inline-flex">
                  <Button variant="outline" size="sm">
                    Admin
                  </Button>
                </Link>
              )}
              <Link
                href="/bookings"
                className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline"
              >
                การจองของฉัน
              </Link>
              <details className="relative">
                <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-full bg-muted/60 py-1 pl-1 pr-2 text-sm">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    {displayName.slice(0, 1).toUpperCase() || (
                      <UserIcon className="h-3 w-3" />
                    )}
                  </span>
                  <span className="hidden max-w-[120px] truncate sm:inline">
                    {displayName}
                  </span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </summary>
                <div className="absolute right-0 z-50 mt-2 w-44 rounded-lg border border-border bg-card p-1 shadow-lg">
                  <Link
                    href="/bookings"
                    className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
                  >
                    การจองของฉัน
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin/dashboard"
                      className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
                    >
                      หน้าผู้ดูแลระบบ
                    </Link>
                  )}
                  <form
                    action="/logout"
                    method="post"
                    className="mt-1 border-t border-border pt-1"
                  >
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
            </>
          ) : (
            <>
              {/* Auth moves into the mobile menu below sm — the bar cannot hold
                  a logo, two buttons and a menu toggle at 390px. */}
              <Link href="/login" className="hidden sm:inline-flex">
                <Button variant="ghost" size="sm">
                  {t("login")}
                </Button>
              </Link>
              {/* Badge is decoration on top of the label, so it sits outside
                  the button rather than inside its flow. Hidden on phones —
                  the bar is already tight there once the menu button is in. */}
              <div className="relative hidden sm:block">
                <Link href="/register">
                  <Button size="sm">{t("registerFree")}</Button>
                </Link>
                <span className="pointer-events-none absolute -right-2 -top-2.5 rounded-full bg-danger px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white shadow-sm">
                  {t("registerFreeBadge")}
                </span>
              </div>
            </>
          )}

          <MobileNav
            links={mobileLinks}
            signedIn={!!user}
            loginLabel={t("login")}
            registerLabel={t("registerFree")}
          />
        </div>
      </Container>
    </header>
  );
}
