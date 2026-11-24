import { SOCIAL_LINKS } from "@/lib/contact";
import { cn } from "@/lib/utils";

/**
 * The company's social profiles. Shared by the footer and the contact page so
 * the two can't drift — the URLs come from lib/contact.ts either way.
 */
export function SocialLinks({
  tone = "dark",
  className,
}: {
  /** "dark" sits on the navy footer, "light" on a white page section. */
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <ul className={cn("flex items-center gap-3", className)}>
      {SOCIAL_LINKS.map((s) => (
        <li key={s.key}>
          <a
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.label}
            title={s.label}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
              tone === "dark"
                ? "bg-white/10 text-white/80 hover:bg-primary hover:text-primary-foreground"
                : "border border-border text-muted-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground",
            )}
          >
            <SocialIcon name={s.key} />
          </a>
        </li>
      ))}
    </ul>
  );
}

/**
 * Brand glyphs drawn inline: lucide dropped its brand icon set, and these marks
 * have to stay recognisable — a generic "link" icon would not read as Facebook
 * or TikTok. `currentColor` lets them inherit the hover state.
 */
export function SocialIcon({ name }: { name: "facebook" | "tiktok" }) {
  if (name === "facebook") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
        <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.5h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.49 0-1.96.93-1.96 1.89v2.27h3.33l-.53 3.5h-2.8V24C19.61 23.1 24 18.1 24 12.07z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5 2.59 2.59 0 0 1 0-5.18c.27 0 .53.04.77.12v-3.2a5.74 5.74 0 0 0-.77-.05 5.79 5.79 0 1 0 5.79 5.79V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.29 4.29 0 0 1-3.35-1.48z" />
    </svg>
  );
}
