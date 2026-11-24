"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useEffect } from "react";
import {
  BarChart3,
  Building2,
  CalendarDays,
  ClipboardList,
  FileSpreadsheet,
  History,
  Images,
  LayoutDashboard,
  PlusCircle,
  Settings,
  Store,
  Tag,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminNav } from "./AdminNavProvider";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
};

type NavGroup = { title: string; items: NavItem[] };

type AdminSidebarProps = {
  /** Bottom slot — typically a server-rendered profile/logout dropdown. */
  userSlot?: React.ReactNode;
};

function buildNav(pendingCount?: number, pendingUserCount?: number): NavGroup[] {
  return [
    {
      title: "เมนูหลัก",
      items: [
        { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/calendar", label: "ปฏิทินงาน", icon: CalendarDays },
        {
          href: "/admin/bookings",
          label: "การจองทั้งหมด",
          icon: ClipboardList,
          badge:
            pendingCount && pendingCount > 0 ? String(pendingCount) : undefined,
        },
        { href: "/admin/booths", label: "จัดการบูธ", icon: Store },
      ],
    },
    {
      title: "การจัดการ",
      items: [
        { href: "/admin/branches", label: "ห้างสาขา", icon: Building2 },
        { href: "/admin/gallery", label: "ภาพบรรยากาศห้าง", icon: Images },
        {
          href: "/admin/users",
          label: "ผู้ใช้งาน",
          icon: Users,
          badge:
            pendingUserCount && pendingUserCount > 0
              ? String(pendingUserCount)
              : undefined,
        },
        { href: "/admin/events", label: "จัดการอีเวนต์", icon: CalendarDays },
        { href: "/admin/events/new", label: "สร้างอีเวนต์", icon: PlusCircle },
        { href: "/admin/discounts", label: "โค้ดส่วนลด", icon: Tag },
      ],
    },
    {
      title: "รายงาน",
      items: [
        { href: "/admin/reports/revenue", label: "รายงานรายได้", icon: FileSpreadsheet },
        { href: "/admin/analytics", label: "การวิเคราะห์พื้นที่", icon: BarChart3 },
      ],
    },
    {
      title: "ระบบ",
      items: [
        { href: "/admin/settings", label: "ตั้งค่าระบบ", icon: Settings },
        { href: "/admin/audit", label: "ประวัติการใช้งาน", icon: History },
      ],
    },
  ];
}

export function AdminSidebar({ userSlot }: AdminSidebarProps) {
  const pathname = usePathname();
  const { pendingCount, pendingUserCount, open, close } = useAdminNav();
  const nav = buildNav(pendingCount, pendingUserCount);

  // Only the most specific matching item is active. Without this, a parent
  // like /admin/events also matches /admin/events/new via the startsWith
  // check, so both "จัดการอีเวนต์" and "สร้างอีเวนต์" would light up together.
  // Picking the longest matching href keeps exactly one item highlighted.
  const activeHref = nav
    .flatMap((g) => g.items.map((i) => i.href))
    .filter((href) => pathname === href || pathname.startsWith(href + "/"))
    .sort((a, b) => b.length - a.length)[0];

  // Tapping a link navigates but leaves the panel sitting over the page it
  // just moved to, so dismiss it whenever the route settles.
  useEffect(() => {
    close();
  }, [pathname, close]);

  // A drawer that lets the page scroll behind it reads as broken on a phone.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  const body = <SidebarBody nav={nav} activeHref={activeHref} userSlot={userSlot} />;

  return (
    <>
      {/* sticky top-0 keeps the rail in view while the main content scrolls.
          h-screen + flex column means the nav scrolls internally if it
          overflows. Below lg the rail would eat 256px of a 375px phone and
          push the page out of a viewport that cannot scroll sideways, so
          there it is replaced by the drawer below. */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
        {body}
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="เมนูผู้ดูแลระบบ"
        >
          <button
            type="button"
            aria-label="ปิดเมนู"
            onClick={close}
            className="absolute inset-0 bg-foreground/50 motion-safe:animate-[fadeIn_150ms_ease-out]"
          />

          {/* Anchored left so the panel arrives from the same edge the desktop
              rail occupies — same object, different size. */}
          <aside
            id="admin-nav-drawer"
            className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-border bg-card shadow-2xl motion-safe:animate-[slideInLeft_220ms_cubic-bezier(0.16,1,0.3,1)]"
          >
            <button
              type="button"
              onClick={close}
              aria-label="ปิด"
              className="absolute right-2 top-4 flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            {body}
          </aside>
        </div>
      )}
    </>
  );
}

function SidebarBody({
  nav,
  activeHref,
  userSlot,
}: {
  nav: NavGroup[];
  activeHref?: string;
  userSlot?: React.ReactNode;
}) {
  return (
    <>
      {/* Extra right padding below lg keeps the brand clear of the drawer's
          close button, which is absolutely positioned in the same corner. */}
      <Link
        href="/admin/dashboard"
        className="flex items-center gap-2 border-b border-border px-5 py-5 pr-12 lg:pr-5"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary bg-white">
          <Image
            src="/logo-mark.png"
            alt=""
            width={512}
            height={512}
            className="h-6 w-6 object-contain"
          />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold">CS Exhibition</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Admin Panel
          </p>
        </div>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {nav.map((group) => (
          <div key={group.title} className="mb-5">
            <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {group.title}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = item.href === activeHref;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        // Taller rows on touch so the targets clear a
                        // comfortable tap size; back to compact from lg.
                        "group flex items-center gap-2.5 rounded-md px-2.5 py-2.5 text-sm transition-colors lg:py-2",
                        active
                          ? "bg-primary-soft font-semibold text-primary-hover"
                          : "text-foreground hover:bg-muted",
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <span className="rounded-full bg-warning-soft px-1.5 text-[10px] font-semibold text-warning">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-border px-3 py-3">{userSlot}</div>
    </>
  );
}
