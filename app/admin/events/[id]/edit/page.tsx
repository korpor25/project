import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { EditEventForm } from "@/components/admin/event/EditEventForm";
import { fetchAdminEvent, fetchEventBooths } from "@/lib/api/events";

export const dynamic = "force-dynamic";

export default async function AdminEditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await fetchAdminEvent(id);
  if (!event) notFound();
  // The booths list endpoint takes a slug *or* an id, so `id` works as-is.
  const booths = await fetchEventBooths(id, 0);

  return (
    <>
      <AdminTopbar
        title={`แก้ไข: ${event.nameTh}`}
        subtitle="ปรับข้อมูลอีเวนต์และสถานะการเผยแพร่"
      />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <Link
          href="/admin/events"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับไปจัดการอีเวนต์
        </Link>
        <EditEventForm initial={event} booths={booths} />
      </main>
    </>
  );
}

