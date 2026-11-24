import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { BranchesTable } from "@/components/admin/branch/BranchesTable";
import { fetchBranches } from "@/lib/api/admin-server";

export const dynamic = "force-dynamic";

export default async function AdminBranchesPage() {
  const branches = await fetchBranches();

  return (
    <>
      <AdminTopbar
        title="ห้างสาขา"
        subtitle="จัดการสาขา ชั้น และสถานะของแต่ละห้างสรรพสินค้า"
      />
      <main className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
        <BranchesTable branches={branches} />
      </main>
    </>
  );
}
