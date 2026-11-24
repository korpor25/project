"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, ChevronDown } from "lucide-react";
import { articles } from "@/lib/articles";
import { cn } from "@/lib/utils";

/**
 * Navbar dropdown listing the articles from lib/articles.ts. Client-side so it
 * can close itself — a plain <details> stays open after a link click, because
 * client-side navigation keeps the (public) layout (and this menu) mounted.
 */
export function ArticlesMenu() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  // Stores the route the menu was opened on rather than a bare boolean, so any
  // navigation closes it as a derived value. Resetting via an effect instead
  // would be a setState-in-effect cascade (and an eslint error in this repo).
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn === pathname;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpenedOn(null);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenedOn(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpenedOn(open ? null : pathname)}
        className="flex cursor-pointer items-center gap-1 hover:text-primary"
      >
        {t("relatedArticles")}
        <ChevronDown
          className={cn(
            "h-3 w-3 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute left-0 z-50 mt-2 w-80 rounded-lg border border-border bg-card p-1 shadow-lg">
          {articles.map((a) => (
            <Link
              key={a.slug}
              href={`/articles/${encodeURIComponent(a.slug)}`}
              onClick={() => setOpenedOn(null)}
              className="block rounded-md px-3 py-2 hover:bg-muted"
            >
              <span className="line-clamp-2 font-medium leading-snug">
                {a.title}
              </span>
            </Link>
          ))}
          <Link
            href="/articles"
            onClick={() => setOpenedOn(null)}
            className="mt-1 flex items-center justify-between gap-2 rounded-md border-t border-border px-3 py-2 text-sm font-medium text-primary hover:bg-muted"
          >
            {t("allArticles")}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
