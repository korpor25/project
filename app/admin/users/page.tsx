import { Plus } from "lucide-react";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { UsersTableShell } from "@/components/admin/user/UsersTableShell";
import { Button } from "@/components/ui/Button";
import { fetchAdminUsers } from "@/lib/api/admin-server";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await fetchAdminUsers();

  return (
    <>
      <AdminTopbar title="ผู้ใช้งาน" subtitle="จัดการบัญชีผู้เช่าและผู้ดูแล" />
      <main className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
        <div className="flex items-center justify-end">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            เพิ่มผู้ดูแล (Admin)
          </Button>
        </div>
        <UsersTableShell users={users} />
      </main>
    </>
  );
}
