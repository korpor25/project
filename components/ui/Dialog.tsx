"use client";

import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Dialog({
  open,
  onClose,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      {/* Capped to the viewport and laid out as a column so the body can take
          the leftover height and scroll. Without the cap a long form runs off
          a short screen and, because the panel clips its overflow, the footer
          buttons become unreachable. dvh rather than vh so a mobile address
          bar sliding in does not hide them either. */}
      <div
        className={cn(
          "relative z-10 flex max-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-card shadow-xl",
          className,
        )}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 text-muted-foreground hover:text-foreground"
          aria-label="ปิด"
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ children }: { children: ReactNode }) {
  return (
    <div className="shrink-0 border-b border-border px-4 py-4 pr-12 sm:px-6">
      {children}
    </div>
  );
}

export function DialogTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-lg font-semibold">{children}</h2>;
}

export function DialogBody({ children, className }: { children: ReactNode; className?: string }) {
  // The only part that scrolls — the header and footer stay pinned so the
  // title and the save button are always in reach.
  return (
    <div className={cn("min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6", className)}>
      {children}
    </div>
  );
}

export function DialogFooter({ children }: { children: ReactNode }) {
  return (
    <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-border px-4 py-3 sm:px-6">
      {children}
    </div>
  );
}
