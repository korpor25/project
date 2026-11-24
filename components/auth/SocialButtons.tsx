"use client";

import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

const PROVIDERS = ["google", "facebook", "apple"] as const;
type Provider = (typeof PROVIDERS)[number];

const LABELS: Record<Provider, string> = {
  google: "Google",
  facebook: "Facebook",
  apple: "Apple",
};

export function SocialButtons() {
  const t = useTranslations("auth");
  const supabase = createClient();

  const handleClick = async (provider: Provider) => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div>
      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        <span>{t("or")}</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {PROVIDERS.map((p) => (
          <Button
            key={p}
            type="button"
            variant="outline"
            onClick={() => handleClick(p)}
            aria-label={LABELS[p]}
          >
            <SocialIcon provider={p} />
          </Button>
        ))}
      </div>
    </div>
  );
}

function SocialIcon({ provider }: { provider: Provider }) {
  if (provider === "google") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23z" fill="#34A853" />
        <path d="M5.84 14.12a6.5 6.5 0 0 1 0-4.24V7.04H2.18a11 11 0 0 0 0 9.92l3.66-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" fill="#EA4335" />
      </svg>
    );
  }
  if (provider === "facebook") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
        <path
          d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.5h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.49 0-1.96.93-1.96 1.89v2.27h3.33l-.53 3.5h-2.8V24C19.61 23.1 24 18.1 24 12.07z"
          fill="#1877F2"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        d="M16.37 1.43c-1.07.07-2.32.74-3.06 1.61-.67.78-1.23 1.96-1.07 3.12 1.18.04 2.39-.66 3.1-1.55.7-.87 1.16-2.05 1.03-3.18zm3.36 17.05c-.5 1.16-.75 1.67-1.39 2.7-.9 1.44-2.16 3.23-3.73 3.25-1.4.02-1.76-.92-3.66-.92-1.9 0-2.3.93-3.7.94-1.57.02-2.77-1.62-3.66-3.06C2.3 17.62 1.7 12.94 3.84 9.74c1.5-2.24 3.86-3.55 6.08-3.55 2.25 0 3.66 1.22 5.51 1.22 1.8 0 2.9-1.22 5.49-1.22 1.96 0 4.04 1.07 5.52 2.92-4.85 2.66-4.05 9.6-1.52 11.37z"
        fill="#000"
      />
    </svg>
  );
}
