import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { BranchGalleryManager } from "@/components/admin/gallery/BranchGalleryManager";

export const dynamic = "force-dynamic";

export default function AdminGalleryPage() {
  return (
    <>
      <AdminTopbar
        title="ภาพบรรยากาศห้าง"
        subtitle="อัปโหลดรูปบรรยากาศแยกตามห้าง — แสดงบนหน้า เกี่ยวกับเรา และ /gallery"
      />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <BranchGalleryManager />
      </main>
    </>
  );
}
