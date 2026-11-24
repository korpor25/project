import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { AuditLog } from "@/components/admin/audit/AuditLog";
import { fetchAuditLog } from "@/lib/api/admin-server";

export const dynamic = "force-dynamic";

export default async function AdminAuditPage() {
  const { rows } = await fetchAuditLog({ perPage: 100 });

  return (
    <>
      <AdminTopbar
        title="ประวัติการใช้งาน"
        subtitle="บันทึกการกระทำของผู้ดูแลและระบบ ค้นหาและกรองตามหมวดได้"
      />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <AuditLog entries={rows} />
      </main>
    </>
  );
}
