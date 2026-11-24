import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { SettingsForm } from "@/components/admin/settings/SettingsForm";
import { fetchSettings } from "@/lib/api/admin-server";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await fetchSettings();

  return (
    <>
      <AdminTopbar
        title="ตั้งค่าระบบ"
        subtitle="ข้อมูลบริษัท แบรนด์ และโครงสร้างราคาเริ่มต้น"
      />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <SettingsForm initial={settings} />
      </main>
    </>
  );
}
