import { ChevronDown } from "lucide-react";
import type { Faq } from "@/lib/faqs";

// Native <details> accordion — no client JS needed. Shared by the landing FAQ
// section and the /faq page.
export function FaqAccordion({ items }: { items: Faq[] }) {
  return (
    <div className="space-y-3">
      {items.map(({ q, a }) => (
        <details
          key={q}
          className="group rounded-xl border border-border bg-card shadow-sm"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-semibold [&::-webkit-details-marker]:hidden">
            {q}
            <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
          </summary>
          <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
            {a}
          </p>
        </details>
      ))}
    </div>
  );
}
 