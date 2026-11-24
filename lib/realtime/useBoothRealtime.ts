"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Booth } from "@/types/domain";

type BoothRow = {
  id: string;
  status: Booth["status"];
  locked_until: string | null;
  event_id: string;
};

type Update = {
  id: string;
  status: Booth["status"];
  lockedUntil?: string;
};

/**
 * Subscribes to postgres_changes on public.booths and emits an update
 * whenever a booth in `eventId` transitions (AVAILABLE ↔ LOCKED ↔ RESERVED).
 *
 * Realtime is enabled in migration 0001 via
 *   `alter publication supabase_realtime add table public.booths`.
 */
export function useBoothRealtime(
  eventId: string | undefined,
  onUpdate: (u: Update) => void,
) {
  // `onUpdate` is captured fresh via a ref so the channel doesn't have to be
  // rebuilt on every parent re-render — only eventId changes resubscribe.
  const cbRef = useRef(onUpdate);
  useEffect(() => {
    cbRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    if (!eventId) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`booths:${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "booths",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          const row = payload.new as BoothRow;
          cbRef.current({
            id: row.id,
            status: row.status,
            lockedUntil: row.locked_until ?? undefined,
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);
}
