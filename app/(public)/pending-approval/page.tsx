import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Clock, LogOut, Mail, MessageCircle, Phone, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CONTACT } from "@/lib/contact";
import { userStatusOf } from "@/lib/auth/userStatus";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "รอการอนุมัติ",
  robots: { index: false, follow: false },
};

export default async function PendingApprovalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const status = userStatusOf(user);
  // Nothing to wait for — send approved accounts back to the app rather than
  // stranding them on a page that no longer applies.
  if (status === "APPROVED") redirect("/");

  const rejected = status === "REJECTED";
  const meta = (user.user_metadata ?? {}) as {
    full_name?: string;
    phone?: string;
  };
  // Phone is what the account is identified by now; email is optional at signup
  // so it may not exist at all.
  const contact = meta.phone ?? user.email ?? "";

  return (
    <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full rounded-2xl border border-border bg-card p-8 shadow-sm sm:p-10">
        <span
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
            rejected ? "bg-danger-soft text-danger" : "bg-primary-soft text-primary-hover"
          }`}
        >
          {rejected ? (
            <XCircle className="h-7 w-7" />
          ) : (
            <Clock className="h-7 w-7" />
          )}
        </span>

        <h1 className="mt-5 text-2xl font-bold sm:text-3xl">
          {rejected ? "บัญชีนี้ไม่ผ่านการอนุมัติ" : "รอเจ้าหน้าที่อนุมัติบัญชี"}
        </h1>

        <p className="mt-3 text-muted-foreground">
          {rejected ? (
            <>
              เจ้าหน้าที่ตรวจสอบแล้วและยังไม่อนุมัติบัญชีนี้
              หากคิดว่าเป็นความผิดพลาด ติดต่อทีมงานเพื่อให้ตรวจสอบอีกครั้งได้
            </>
          ) : (
            <>
              สมัครสมาชิกเรียบร้อยแล้ว{meta.full_name ? ` คุณ${meta.full_name}` : ""}{" "}
              — ขั้นตอนสุดท้ายคือให้เจ้าหน้าที่ตรวจสอบและเปิดใช้งานบัญชี
              เราจะติดต่อกลับไปที่{" "}
              <span className="font-medium text-foreground">{contact}</span>{" "}
              ทันทีที่อนุมัติ
            </>
          )}
        </p>

        {!rejected && (
          <ol className="mt-6 space-y-3 rounded-xl bg-muted/50 p-5">
            <Step done label="สมัครสมาชิก" />
            <Step current label="เจ้าหน้าที่ตรวจสอบบัญชี" />
            <Step label="เข้าใช้งานและจองพื้นที่บูธได้" />
          </ol>
        )}

        <div className="mt-6 border-t border-border pt-6">
          <p className="text-sm font-medium">ต้องการให้ตรวจสอบเร็วขึ้น?</p>
          <p className="mt-1 text-sm text-muted-foreground">
            ติดต่อทีมงานพร้อมแจ้งเบอร์โทรที่ใช้สมัคร
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <ContactChip href={CONTACT.mobile.href} icon={<Phone className="h-4 w-4" />}>
              {CONTACT.mobile.display}
            </ContactChip>
            <ContactChip href={CONTACT.line.href} icon={<MessageCircle className="h-4 w-4" />}>
              LINE
            </ContactChip>
            <ContactChip href={CONTACT.email.href} icon={<Mail className="h-4 w-4" />}>
              อีเมล
            </ContactChip>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {/* A pending account can reach almost nothing, so signing out has to
              be one click away or they are stuck here. Native form post to the
              existing /logout route — same as the navbar, works without JS. */}
          <form action="/logout" method="post">
            <Button type="submit" variant="outline">
              <LogOut className="h-4 w-4" />
              ออกจากระบบ
            </Button>
          </form>
          <Link href="/faq">
            <Button variant="outline">คำถามที่พบบ่อย</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function Step({
  label,
  done,
  current,
}: {
  label: string;
  done?: boolean;
  current?: boolean;
}) {
  return (
    <li className="flex items-start gap-3 text-sm">
      <span
        className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${
          done ? "bg-success" : current ? "bg-primary ring-4 ring-primary/20" : "bg-border"
        }`}
        aria-hidden
      />
      <span className={current ? "font-medium" : done ? "text-muted-foreground" : "text-muted-foreground/70"}>
        {label}
      </span>
    </li>
  );
}

function ContactChip({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm transition-colors hover:border-primary/50 hover:text-primary"
    >
      {icon}
      {children}
    </a>
  );
}
