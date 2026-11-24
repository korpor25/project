import { redirect } from "next/navigation";
import { BrandPanel } from "@/components/shared/BrandPanel";
import { LoginForm } from "@/components/auth/LoginForm";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/");

  return (
    <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      {/* Brand art and form share a single card — no seam between them. */}
      <div className="mx-auto grid w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-sm lg:max-w-none lg:grid-cols-2">
        <BrandPanel className="rounded-none" />
        <div className="flex w-full items-center justify-center p-8 sm:p-10">
          <div className="w-full max-w-md">
            <LoginForm />
          </div>
        </div>
      </div>
    </section>
  );
}
