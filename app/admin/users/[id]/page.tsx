import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  AtSign,
  Award,
  Briefcase,
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  KeyRound,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  ShieldOff,
  TrendingUp,
} from "lucide-react";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { BookingStatusPill } from "@/components/ui/StatusPill";
import { fetchAdminUser } from "@/lib/api/admin-server";
import { formatTHB, formatThaiDate } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await fetchAdminUser(id);
  if (!user) notFound();

  const displayName = user.fullName ?? user.email;
  const initial = displayName.slice(0, 1).toUpperCase();

  return (
    <>
      <AdminTopbar title={displayName} subtitle={user.email} />
      <main className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับไปรายชื่อผู้ใช้
        </Link>

        <section className="grid gap-4 lg:grid-cols-[360px_1fr]">
          <article className="rounded-xl border border-border bg-card p-6 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-warning-soft text-2xl font-bold text-warning">
              {initial}
            </div>
            <h2 className="mt-3 text-lg font-bold">{displayName}</h2>
            <p className="text-sm text-muted-foreground">
              {user.companyName ?? "—"}
            </p>
            <div className="mt-2 flex justify-center gap-2">
              <Badge tone={user.status === "ACTIVE" ? "success" : "danger"}>
                {user.status === "ACTIVE" ? "ใช้งานอยู่" : "ระงับ"}
              </Badge>
              <Badge tone={user.role === "USER" ? "neutral" : "primary"}>
                {user.role}
              </Badge>
            </div>

            <ul className="mt-5 space-y-2.5 border-t border-border pt-4 text-left text-sm">
              <ContactRow icon={Mail} label={user.email} />
              <ContactRow icon={Phone} label={user.phone ?? "ยังไม่ระบุเบอร์โทร"} />
              <ContactRow
                icon={MessageSquare}
                label={user.companyName ?? "ยังไม่ระบุบริษัท"}
                hint="บริษัท"
              />
              <ContactRow icon={MapPin} label="—" hint="ที่อยู่หลัก" />
              <ContactRow
                icon={CalendarDays}
                label={`สมัครเมื่อ ${formatThaiDate(user.createdAt.slice(0, 10))}`}
              />
              {user.lastLoginAt && (
                <ContactRow
                  icon={CalendarCheck}
                  label={`เข้าใช้งานล่าสุด ${formatThaiDate(user.lastLoginAt.slice(0, 10))}`}
                />
              )}
            </ul>

            <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Button variant="outline" size="sm">
                <KeyRound className="h-4 w-4" />
                รีเซตรหัสผ่าน
              </Button>
              <Button variant="outline" size="sm">
                <AtSign className="h-4 w-4" />
                ส่งอีเมล
              </Button>
            </div>
            {user.status === "ACTIVE" ? (
              <Button variant="danger" className="mt-2 w-full" size="sm">
                <ShieldOff className="h-4 w-4" />
                ระงับบัญชี
              </Button>
            ) : (
              <Button variant="success" className="mt-2 w-full" size="sm">
                กู้คืนบัญชี
              </Button>
            )}
            {user.suspendedReason && (
              <p className="mt-3 rounded-md bg-danger-soft px-3 py-2 text-xs text-danger">
                {user.suspendedReason}
              </p>
            )}
          </article>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                icon={ClipboardList}
                label="การจองทั้งหมด"
                value="—"
                tone="text-info"
              />
              <StatCard
                icon={CalendarCheck}
                label="อนุมัติแล้ว"
                value="—"
                tone="text-success"
              />
              <StatCard
                icon={Briefcase}
                label="ยอดใช้จ่ายรวม"
                value={formatTHB(0)}
                tone="text-primary"
              />
              <StatCard
                icon={TrendingUp}
                label="Lifetime Value"
                value={formatTHB(0)}
                tone="text-warning"
              />
            </div>

            <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <header className="mb-3">
                <h3 className="text-base font-semibold">ประวัติการจอง</h3>
                <p className="text-xs text-muted-foreground">
                  ฟีเจอร์นี้รอ endpoint <code>/admin/users/:id/bookings</code> — กำลังพัฒนา
                </p>
              </header>
              <p className="rounded-md border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                ยังไม่มีข้อมูลการจองของผู้ใช้นี้
              </p>
              {/* Reserved for when we wire bookings: */}
              <span className="hidden">
                <BookingStatusPill status="PENDING" />
              </span>
            </article>

            <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <header className="mb-3">
                <h3 className="flex items-center gap-2 text-base font-semibold">
                  <Award className="h-4 w-4 text-primary" />
                  Activity Timeline
                </h3>
                <p className="text-xs text-muted-foreground">
                  รออัพเดท: เชื่อมกับ audit_logs ในอนาคต
                </p>
              </header>
              <p className="rounded-md border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                ยังไม่มีบันทึก activity
              </p>
            </article>
          </div>
        </section>
      </main>
    </>
  );
}

function ContactRow({
  icon: Icon,
  label,
  hint,
}: {
  icon: React.ElementType;
  label: string;
  hint?: string;
}) {
  return (
    <li className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm">{label}</p>
        {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
      </div>
    </li>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <Icon className={`h-4 w-4 ${tone}`} />
      <p className="mt-2 text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-bold">{value}</p>
    </div>
  );
}
