import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { ZoneAnalytics } from "@/components/admin/analytics/ZoneAnalytics";

export default function AdminAnalyticsPage() {
  return (
    <>
      <AdminTopbar
        title="การวิเคราะห์พื้นที่"
        subtitle="Heatmap, การจัดอันดับโซน และคำแนะนำจาก AI"
      />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <ZoneAnalytics />
      </main>
    </>
  );
}
