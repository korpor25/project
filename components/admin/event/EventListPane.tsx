"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { EventStatusPill } from "@/components/ui/StatusPill";
import { Input } from "@/components/ui/Input";
import { coverStyle } from "@/lib/eventCover";
import { cn } from "@/lib/utils";
import type { EventSummary } from "@/types/domain";
import { EventDetailTabs } from "./EventDetailTabs";

export function EventListPane({ events }: { events: EventSummary[] }) {
  const [selected, setSelected] = useState<EventSummary>(events[0]);
  const [q, setQ] = useState("");

  const filtered = events.filter((e) =>
    e.nameTh.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <aside className="rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              placeholder="ค้นหาชื่อ Event..."
              className="pl-10"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>
        <ul className="max-h-[calc(100vh-220px)] divide-y divide-border overflow-y-auto">
          {filtered.map((e) => (
            <li key={e.id}>
              <button
                type="button"
                onClick={() => setSelected(e)}
                className={cn(
                  "flex w-full gap-3 px-3 py-3 text-left transition-colors",
                  selected.id === e.id ? "bg-primary-soft/50" : "hover:bg-muted/40",
                )}
              >
                <div
                  className="h-16 w-20 shrink-0 rounded-md"
                  style={coverStyle(e)}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{e.nameTh}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {e.branch} • {e.province}
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {e.startDate} – {e.endDate}
                  </p>
                  <div className="mt-1">
                    <EventStatusPill status={e.status} />
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <EventDetailTabs event={selected} />
    </div>
  );
}
