import { Check, FileDown } from "lucide-react";
import type { EventDetail } from "@/types/domain";

export function EventBottomCards({ event }: { event: EventDetail }) {
  return (
    <section className="mt-10 grid gap-4 md:grid-cols-3">
      <Card title="เกี่ยวกับอีเวนต์">
        <p className="text-sm leading-relaxed text-muted-foreground">{event.description}</p>
      </Card>
      <Card title="เงื่อนไขการเช่า">
        <ul className="space-y-2 text-sm">
          {event.terms.map((t) => (
            <li key={t} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </Card>
      <Card title="ดาวน์โหลดเอกสาร">
        {event.documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">ยังไม่มีเอกสาร</p>
        ) : (
          <ul className="space-y-2">
            {event.documents.map((d) => (
              <li key={d.href}>
                <a
                  href={d.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-muted"
                >
                  <span>{d.label}</span>
                  <FileDown className="h-4 w-4 text-muted-foreground" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </section>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-3 text-base font-semibold">{title}</h3>
      {children}
    </div>
  );
}
