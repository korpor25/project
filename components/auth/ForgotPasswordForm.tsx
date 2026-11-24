"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  email: z.string().email("กรุณากรอกอีเมลให้ถูกต้อง"),
});

type FormValues = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const [done, setDone] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setDone(true);
  });

  if (done) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">ส่งอีเมลรีเซตรหัสผ่านแล้ว</h1>
        <p className="text-sm text-muted-foreground">
          กรุณาตรวจสอบกล่องอีเมลของ {form.getValues("email")} แล้วคลิกลิงก์ในอีเมลเพื่อตั้งรหัสผ่านใหม่
        </p>
        <Link href="/login" className="text-sm text-primary hover:underline">
          กลับไปหน้าเข้าสู่ระบบ
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <header>
        <h1 className="text-2xl font-bold">ลืมรหัสผ่าน?</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          กรอกอีเมลที่ใช้สมัครเพื่อรับลิงก์รีเซตรหัสผ่าน
        </p>
      </header>

      <div className="space-y-2">
        <Label htmlFor="email">อีเมล</Label>
        <Input
          id="email"
          type="email"
          placeholder="example@email.com"
          {...form.register("email")}
        />
        {form.formState.errors.email && (
          <p className="text-xs text-danger">{form.formState.errors.email.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "กำลังส่ง..." : "ส่งลิงก์รีเซตรหัสผ่าน"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-primary hover:underline">
          กลับไปหน้าเข้าสู่ระบบ
        </Link>
      </p>
    </form>
  );
}
