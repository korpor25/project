"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { createClient } from "@/lib/supabase/client";

const schema = z
  .object({
    firstName: z.string().min(1, "กรุณากรอกชื่อ"),
    lastName: z.string().min(1, "กรุณากรอกนามสกุล"),
    phone: z
      .string()
      .regex(/^0\d{2}-?\d{3}-?\d{4}$/, "เบอร์โทรรูปแบบ 0XX-XXX-XXXX"),
    // Optional now, and checked for shape only — never for deliverability.
    // An empty string has to pass, which .email().optional() alone would reject.
    email: z
      .string()
      .trim()
      .refine(
        (v) => v === "" || z.string().email().safeParse(v).success,
        "รูปแบบอีเมลไม่ถูกต้อง",
      ),
    lineId: z.string().optional(),
    password: z.string().min(8, "รหัสผ่านต้องอย่างน้อย 8 ตัวอักษร"),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((v) => v === true, "กรุณายอมรับเงื่อนไข"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "รหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export function RegisterForm() {
  const t = useTranslations("auth");
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      lineId: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setServerError(null);

    // The form treats email as optional, but Supabase still needs an email or
    // a phone as the account's identifier, and phone signup needs an SMS
    // provider that is not wired up yet. Say that plainly rather than letting
    // signUp fail with "Anonymous sign-ins are disabled", which tells the
    // person nothing. Delete this guard once signup moves to the backend.
    if (!values.email) {
      setServerError(
        "ตอนนี้ยังต้องกรอกอีเมลเพื่อเปิดบัญชี — ระบบสมัครด้วยเบอร์อย่างเดียวกำลังพัฒนา",
      );
      return;
    }

    const supabase = createClient();
    const phone = values.phone.replace(/-/g, "");
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: `${values.firstName} ${values.lastName}`.trim(),
          phone,
          line_id: values.lineId || null,
        },
      },
    });
    if (error) {
      setServerError(error.message);
      return;
    }
    setDone(true);
  });

  if (done) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">สมัครสมาชิกเรียบร้อย</h1>
        <p className="text-sm text-muted-foreground">
          เหลืออีกขั้นเดียว — เจ้าหน้าที่จะตรวจสอบและเปิดใช้งานบัญชีให้
          เราจะติดต่อกลับไปที่เบอร์ {form.getValues("phone")} ทันทีที่อนุมัติ
        </p>
        <div className="rounded-lg bg-primary-soft p-4 text-sm">
          <p className="font-medium">ระหว่างรออนุมัติ</p>
          <p className="mt-1 text-muted-foreground">
            เข้าสู่ระบบได้ตามปกติ แต่จะยังจองพื้นที่บูธไม่ได้จนกว่าจะได้รับอนุมัติ
          </p>
        </div>
        <Link href="/login">
          <Button variant="outline" className="w-full">
            กลับไปยังหน้าเข้าสู่ระบบ
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <header>
        <h1 className="text-2xl font-bold">{t("registerTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">กรอกข้อมูลเพื่อเริ่มต้นใช้งาน</p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <Field label="ชื่อ" error={form.formState.errors.firstName?.message}>
          <Input placeholder="ชื่อจริง" {...form.register("firstName")} />
        </Field>
        <Field label="นามสกุล" error={form.formState.errors.lastName?.message}>
          <Input placeholder="นามสกุล" {...form.register("lastName")} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label={t("phone")} error={form.formState.errors.phone?.message}>
          <Input placeholder="0XX-XXX-XXXX" {...form.register("phone")} />
        </Field>
        <Field
          label={`${t("email")} (ไม่บังคับ)`}
          error={form.formState.errors.email?.message}
        >
          <Input type="email" placeholder="example@email.com" {...form.register("email")} />
        </Field>
      </div>

      <Field label={`${t("lineId")} (ไม่บังคับ)`}>
        <Input placeholder="@example" {...form.register("lineId")} />
      </Field>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label={t("password")} error={form.formState.errors.password?.message}>
          <Input type="password" placeholder="อย่างน้อย 8 ตัวอักษร" {...form.register("password")} />
        </Field>
        <Field label={t("confirmPassword")} error={form.formState.errors.confirmPassword?.message}>
          <Input type="password" placeholder="ยืนยันรหัสผ่าน" {...form.register("confirmPassword")} />
        </Field>
      </div>

      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-border accent-[color:var(--primary)]"
          {...form.register("acceptTerms")}
        />
        <span>
          ฉันยอมรับ
          <Link href="/terms" className="mx-1 text-primary hover:underline">
            เงื่อนไขการใช้งาน
          </Link>
          และ
          <Link href="/privacy" className="mx-1 text-primary hover:underline">
            นโยบายความเป็นส่วนตัว
          </Link>
        </span>
      </label>
      {form.formState.errors.acceptTerms && (
        <p className="text-xs text-danger">{form.formState.errors.acceptTerms.message}</p>
      )}

      {serverError && (
        <div className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{serverError}</div>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "กำลังสมัคร..." : "สมัครสมาชิก"}
      </Button>

      <p className="pt-2 text-center text-sm text-muted-foreground">
        มีบัญชีอยู่แล้ว?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          {t("loginTitle")}
        </Link>
      </p>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
