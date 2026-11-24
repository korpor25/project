"use client";

import { useState } from "react";
import Link from "next/link";
import { Headphones, X, Phone, MessageCircle, Mail } from "lucide-react";
import { CONTACT } from "@/lib/contact";

export function ContactFAB() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* expanded options */}
      {open && (
        <div className="flex flex-col items-end gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <ContactOption
            href="/contact"
            icon={<MessageCircle className="h-4 w-4" />}
            label="ส่งข้อความ"
          />
          <ContactOption
            href={CONTACT.mobile.href}
            icon={<Phone className="h-4 w-4" />}
            label="โทรหาเรา"
          />
          <ContactOption
            href={CONTACT.email.href}
            icon={<Mail className="h-4 w-4" />}
            label="อีเมล"
          />
        </div>
      )}

      {/* main FAB */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="ติดต่อเจ้าหน้าที่"
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/40 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-primary/50 active:scale-95"
      >
        {/* pulse ring */}
        {!open && (
          <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
        )}
        {open ? (
          <X className="h-5 w-5" />
        ) : (
          <Headphones className="h-5 w-5" />
        )}

        {/* tooltip */}
        {!open && (
          <span className="pointer-events-none absolute right-16 whitespace-nowrap rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background opacity-0 shadow transition-opacity group-hover:opacity-100">
            ติดต่อเจ้าหน้าที่
            <span className="absolute right-[-4px] top-1/2 -translate-y-1/2 border-4 border-transparent border-l-foreground" />
          </span>
        )}
      </button>
    </div>
  );
}

function ContactOption({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-2 rounded-full border border-border bg-card py-2 pl-3 pr-4 shadow-md transition-all duration-150 hover:border-primary/40 hover:shadow-lg"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
        {icon}
      </span>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}
