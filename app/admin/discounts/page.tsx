import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { DiscountCodesShell } from "@/components/admin/discount/DiscountCodesShell";

export default function AdminDiscountsPage() {
  return (
    <>
      <AdminTopbar
        title="โค้ดส่วนลด"
        subtitle="สร้างและจัดการโค้ดส่วนลดสำหรับผู้เช่าบูธ"
      />
      <main className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
        <DiscountCodesShell />
      </main>
    </>
  );
}
