import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { CreateEventWizard } from "@/components/admin/event/CreateEventWizard";
import { fetchEventDuplicatePrefill } from "@/lib/api/events";

export const dynamic = "force-dynamic";

export default async function AdminCreateEventPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  const prefill = from ? await fetchEventDuplicatePrefill(from) : null;

  return (
    <>
      <AdminTopbar
        title={prefill ? "ทำซ้ำอีเวนต์" : "สร้างอีเวนต์ใหม่"}
        subtitle={
          prefill
            ? "คัดลอกโซนและบูธจากอีเวนต์เดิม แก้ไขวันที่แล้วเปิดรับจองอีกรอบ"
            : "กำหนดรายละเอียดอีเวนต์ ราคา และสื่อ"
        }
      />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <Link
          href="/admin/events"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับไปจัดการอีเวนต์
        </Link>
        <CreateEventWizard prefill={prefill ?? undefined} />
      </main>
    </>
  );
}
 