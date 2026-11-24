"use client";

import { useState } from "react";
import { Check, Copy, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { CONTACT } from "@/lib/contact";
import { cn } from "@/lib/utils";

type Channel = {
  key: string;
  label: string;
  value: string;
  href: string;
  /** What tapping the value actually does — not a promise about replies. */
  hint: string;
  icon: typeof Phone;
  external?: boolean;
  /** Optional second line, e.g. the office landline under the mobile. */
  secondary?: { label: string; value: string; href: string };
};

const CHANNELS: Channel[] = [
  {
    key: "phone",
    label: "โทรศัพท์",
    value: CONTACT.mobile.display,
    href: CONTACT.mobile.href,
    hint: "กดที่เบอร์เพื่อโทรจากมือถือ",
    icon: Phone,
    secondary: {
      label: "สำนักงาน",
      value: CONTACT.office.display,
      href: CONTACT.office.href,
    },
  },
  {
    key: "email",
    label: "อีเมล",
    value: CONTACT.email.display,
    href: CONTACT.email.href,
    hint: "เหมาะกับเรื่องที่ต้องแนบเอกสาร",
    icon: Mail,
  },
  {
    key: "line",
    label: "LINE",
    value: CONTACT.line.display,
    href: CONTACT.line.href,
    hint: "เพิ่มเพื่อนแล้วพิมพ์คุยได้ทันที",
    icon: MessageCircle,
    external: true,
  },
  {
    key: "address",
    label: "ที่ตั้งสำนักงาน",
    value: CONTACT.address.display,
    href: CONTACT.address.href,
    hint: "กดเพื่อเปิดใน Google Maps",
    icon: MapPin,
    external: true,
  },
];

export function ContactChannels() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (channel: Channel) => {
    try {
      await navigator.clipboard.writeText(channel.value);
      setCopied(channel.key);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      // Clipboard is blocked (insecure origin, denied permission). The value is
      // selectable text right there, so there is nothing useful to announce.
    }
  };

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {CHANNELS.map((c) => {
        const Icon = c.icon;
        const isCopied = copied === c.key;
        return (
          <li
            key={c.key}
            className="group relative flex gap-4 overflow-hidden rounded-2xl border border-border bg-card p-5 pl-6 transition-shadow duration-200 hover:shadow-md"
          >
            {/* Gold edge, a vertical take on the .brand-rule divider the rest
                of the site uses. Thickens on hover so the whole tile reads as
                one target. */}
            <span
              aria-hidden
              className="absolute inset-y-0 left-0 w-1 bg-primary/30 transition-all duration-200 group-hover:w-2 group-hover:bg-primary"
            />

            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Icon className="h-5 w-5" />
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {c.label}
              </p>
              {/* The value is the content of this page, so it is set at display
                  size rather than buried as metadata — and it doubles as a
                  large tap target on mobile. */}
              <a
                href={c.href}
                {...(c.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="mt-1 block break-words text-base font-bold leading-snug text-foreground decoration-primary decoration-2 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:text-lg"
              >
                {c.value}
              </a>
              {c.secondary && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {c.secondary.label}{" "}
                  <a
                    href={c.secondary.href}
                    className="font-medium text-foreground hover:text-primary hover:underline"
                  >
                    {c.secondary.value}
                  </a>
                </p>
              )}
              <p className="mt-1.5 text-xs text-muted-foreground">{c.hint}</p>
            </div>

            <button
              type="button"
              onClick={() => copy(c)}
              aria-label={`คัดลอก${c.label}`}
              className={cn(
                "h-8 shrink-0 self-start rounded-lg px-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                isCopied
                  ? "text-success"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <span className="flex items-center gap-1">
                {isCopied ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {isCopied ? "คัดลอกแล้ว" : "คัดลอก"}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
