import { BrandPanel } from "@/components/shared/BrandPanel";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-16">
      <BrandPanel />
      <div className="flex w-full items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
          <ForgotPasswordForm />
        </div>
      </div>
    </section>
  );
}
