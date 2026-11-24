"use client";

import Link from "next/link";
import { ArrowRight, PlayCircle, Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import {
  WELCOME_MODAL,
  WELCOME_SEEN_KEY,
  isWelcomeModalEnabled,
} from "@/lib/welcomeModal";

/**
 * Plays a short intro clip the first time someone lands on the site.
 *
 * "Seen" is remembered in localStorage, not a cookie: it never needs to reach
 * the server, so sending it on every request would be waste. The key carries
 * the clip version, so publishing a new clip re-opens the popup once.
 *
 * Renders nothing at all until a clip is configured in lib/welcomeModal.ts —
 * shipping this before the video exists is harmless.
 *
 * Built on its own overlay rather than the shared Dialog: the video needs to
 * run edge to edge with no card padding around it, and the panel wants its own
 * entrance animation.
 */

/** localStorage never changes under us mid-session, so there is nothing to
 *  subscribe to — but useSyncExternalStore still needs the argument. */
const noSubscribe = () => () => {};

export function WelcomeModal() {
  const [dismissed, setDismissed] = useState(false);

  // useSyncExternalStore is the supported way to read a browser store without
  // a hydration mismatch: the server snapshot says "seen" so SSR renders
  // nothing, then the real value is read on the client after hydration.
  const alreadySeen = useSyncExternalStore(
    noSubscribe,
    () => {
      // ?welcome=1 forces it open again — the only practical way to review the
      // popup once you have dismissed it, short of clearing site data.
      if (window.location.search.includes("welcome=1")) return false;
      try {
        return window.localStorage.getItem(WELCOME_SEEN_KEY) !== null;
      } catch {
        // Private mode or storage blocked — treat as seen rather than showing
        // the popup on every single page load.
        return true;
      }
    },
    () => true,
  );

  const dismiss = useCallback(() => {
    setDismissed(true);
    try {
      window.localStorage.setItem(WELCOME_SEEN_KEY, "1");
    } catch {
      // Nothing to do — worst case they see it again next visit.
    }
  }, []);

  const open = isWelcomeModalEnabled() && !alreadySeen && !dismissed;

  // Esc to close and no scrolling behind the panel — the shared Dialog handled
  // both; this one owns its overlay, so it has to do it itself.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, dismiss]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
    >
      {/* Mid-dark scrim: enough to separate the panel from any page behind it,
          light enough that the white frosted glass still reads as glass. */}
      <div
        className="absolute inset-0 bg-[#1a1d2e]/55 backdrop-blur-md motion-safe:animate-[fadeIn_200ms_ease-out]"
        onClick={dismiss}
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-3xl motion-safe:animate-[popIn_320ms_cubic-bezier(0.16,1,0.3,1)]">
        {/* Gold bloom behind the glass — what makes the edges read as lit
            rather than as a flat translucent box. */}
        <div
          className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] bg-[radial-gradient(60%_50%_at_50%_0%,rgba(201,162,74,0.45),transparent_70%)] blur-2xl"
          aria-hidden
        />

        <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/75 shadow-[0_24px_80px_-12px_rgba(26,29,46,0.45)] backdrop-blur-2xl">
          {/* Gold hairline, echoing .brand-rule used on every page header. */}
          <div
            className="h-px w-full bg-gradient-to-r from-transparent via-primary to-transparent"
            aria-hidden
          />

          <button
            type="button"
            onClick={dismiss}
            aria-label="ปิด"
            className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/80 bg-white/80 text-foreground backdrop-blur-md transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="relative aspect-video w-full bg-black">
          {WELCOME_MODAL.videoSrc ? (
            <video
              src={WELCOME_MODAL.videoSrc}
              poster={WELCOME_MODAL.poster ?? undefined}
              controls
              // Muted is what makes autoplay allowed at all; controls let anyone
              // turn the sound on. playsInline stops iOS hijacking to fullscreen.
              autoPlay
              muted
              playsInline
              preload="metadata"
              className="h-full w-full"
            />
          ) : (
            <iframe
              src={WELCOME_MODAL.embedUrl ?? ""}
              title={WELCOME_MODAL.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
              allowFullScreen
              className="h-full w-full border-0"
            />
          )}
        </div>

          <div className="grid gap-5 border-t border-white/60 p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-7">
            <div className="min-w-0">
              <p className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary-soft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary-hover">
                <PlayCircle className="h-3.5 w-3.5" />
                แนะนำการใช้งาน
              </p>
              <h2
                id="welcome-title"
                className="mt-2.5 text-xl font-bold sm:text-2xl"
              >
                {WELCOME_MODAL.title}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {WELCOME_MODAL.description}
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-2.5 sm:w-52">
              <Link href="/register" onClick={dismiss} className="group block">
                <span className="relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#d9b463] via-primary to-[#b58c34] text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-all duration-200 group-hover:shadow-xl group-hover:shadow-primary/40 group-hover:brightness-[1.06]">
                  {/* Light sweeps across on hover — the one flourish on the
                      panel, and it stays still for reduced-motion users. */}
                  <span
                    className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:translate-x-full"
                    aria-hidden
                  />
                  <Sparkles className="relative h-4 w-4" />
                  <span className="relative">สมัครสมาชิกฟรี</span>
                  <ArrowRight className="relative h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </Link>

              <button
                type="button"
                onClick={dismiss}
                className="h-11 rounded-xl border border-border bg-white/60 text-sm font-medium text-muted-foreground backdrop-blur-sm transition-colors hover:border-primary/40 hover:bg-white hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                ดูเว็บไซต์ก่อน
              </button>

              <p className="text-center text-[11px] leading-tight text-muted-foreground">
                สมัครแล้วดูราคาพื้นที่ได้ทันที
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
