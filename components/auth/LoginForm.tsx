"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AtSign, Lock, Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { createClient } from "@/lib/supabase/client";
import {
  PENDING_APPROVAL_PATH,
  isAwaitingApproval,
} from "@/lib/auth/userStatus";
import { lookupEmailByPhone } from "@/lib/api/auth";

/** Thai mobile/landline as typed: 9-10 digits starting 0, dashes or spaces ok. */
const PHONE_RE = /^0[\d\s-]{7,12}$/;

function looksLikePhone(v: string) {
  return PHONE_RE.test(v.trim()) && /^\d{9,10}$/.test(v.replace(/\D/g, ""));
}

const schema = z.object({
  identifier: z
    .string()
    .min(1, "กรุณากรอกเบอร์โทรศัพท์หรืออีเมล")
    .refine(
      (v) => looksLikePhone(v) || z.string().email().safeParse(v.trim()).success,
      "กรุณากรอกเบอร์โทรศัพท์หรืออีเมลให้ถูกต้อง",
    ),
  password: z.string().min(8, "รหัสผ่านต้องอย่างน้อย 8 ตัวอักษร"),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { identifier: "", password: "" },
  });

  /** Shared sign-in logic once an email is known (from direct input or phone lookup). */
  async function signInWithEmail(email: string, password: string) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setServerError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      return;
    }

    // Pick destination: an account still awaiting approval goes to the waiting
    // page regardless of `?next=` — every other route would bounce it there.
    let dest = nextParam && nextParam.startsWith("/") ? nextParam : "/";
    if (isAwaitingApproval(data.user)) {
      dest = PENDING_APPROVAL_PATH;
    } else if (!nextParam) {
      const role = (
        data.user?.app_metadata as { user_role?: string } | undefined
      )?.user_role;
      if (role === "ADMIN" || role === "SUPER_ADMIN") {
        dest = "/admin/dashboard";
      }
    }

    // Full document navigation (not router.push) so the browser sends the
    // freshly-set sb-*-auth-token cookies on the next GET. router.refresh
    // races with cookie propagation and leaves the navbar showing logged-out
    // state on the destination page.
    window.location.assign(dest);
  }

  const onSubmit = form.handleSubmit(async (values) => {
    setServerError(null);

    if (looksLikePhone(values.identifier)) {
      // Resolve phone number to account email via backend, then sign in normally.
      const lookup = await lookupEmailByPhone(values.identifier.trim());
      if (!lookup.ok) {
        if (lookup.notFound) {
          setServerError("ไม่พบบัญชีที่ผูกกับเบอร์นี้ กรุณาตรวจสอบอีกครั้ง");
        } else {
          setServerError("เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
        }
        return;
      }
      await signInWithEmail(lookup.email, values.password);
      return;
    }

    // Direct email path — unchanged.
    await signInWithEmail(values.identifier.trim(), values.password);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <header>
        <h1 className="text-2xl font-bold">ยินดีต้อนรับ</h1>
        <p className="mt-1 text-sm text-muted-foreground">เข้าสู่ระบบเพื่อจัดการบูธของคุณ</p>
      </header>

      <div className="space-y-2">
        <Label htmlFor="identifier">{t("emailOrPhone")}</Label>
        <div className="relative">
          <AtSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            id="identifier"
            type="text"
            inputMode="email"
            placeholder="example@email.com หรือ 08X-XXX-XXXX"
            autoComplete="username"
            className="pl-10"
            {...form.register("identifier")}
          />
        </div>
        {form.formState.errors.identifier && (
          <p className="text-xs text-danger">
            {form.formState.errors.identifier.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{t("password")}</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            className="pl-10 pr-10"
            {...form.register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {form.formState.errors.password && (
          <p className="text-xs text-danger">{form.formState.errors.password.message}</p>
        )}
        <div className="text-right">
          <Link href="/forgot-password" className="text-xs text-primary hover:underline">
            {t("forgotPassword")}?
          </Link>
        </div>
      </div>

      {serverError && (
        <div className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{serverError}</div>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "กำลังเข้าสู่ระบบ..." : t("loginButton")}
      </Button>

      <p className="pt-2 text-center text-sm text-muted-foreground">
        ยังไม่มีบัญชี?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          {t("registerTitle")}
        </Link>
      </p>
    </form>
  );
}
