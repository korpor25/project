import { redirect } from "next/navigation";
import { BrandPanel } from "@/components/shared/BrandPanel";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { createClient } from "@/lib/supabase/server";

export default async function RegisterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/");

  return (
    <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      {/* Form and brand art share a single card — no seam between them. */}
      <div className="mx-auto grid w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-sm lg:max-w-none lg:grid-cols-2">
        <div className="flex w-full items-center justify-center p-8 sm:p-10">
          <div className="w-full max-w-md">
            <RegisterForm />
          </div>
        </div>
        <BrandPanel className="rounded-none" />
      </div>
    </section>
  );
}
