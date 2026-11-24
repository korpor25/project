import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SocialLinks } from "@/components/shared/SocialLinks";
import { CONTACT } from "@/lib/contact";

export function Footer() {
  return (
    <footer className="mt-20 bg-[#1a1d2e] text-white">
      <Container className="grid gap-6 py-8 sm:grid-cols-[1.5fr_1fr] sm:gap-8 md:py-10">
        <div>
          {/* Mark only — the lockup's wordmark is set in near-black, which
              would disappear against this footer's dark background. */}
          <div className="flex items-center gap-3">
            <Image
              src="/logo-mark.png"
              alt=""
              width={512}
              height={512}
              className="h-11 w-11 shrink-0 object-contain"
            />
            <p className="text-xl font-bold">
              <span className="text-primary">CS</span> Exhibition Management
            </p>
          </div>
          <p className="mt-3 max-w-sm text-sm text-white/70">
            {CONTACT.address.display}
          </p>

          <SocialLinks className="mt-4" />
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold">ติดต่อ</p>
          <ul className="space-y-2 text-sm text-white/70">
            <li>
              โทร.{" "}
              <a href={CONTACT.mobile.href} className="hover:text-primary">
                {CONTACT.mobile.display}
              </a>
            </li>
            <li>
              สำนักงาน{" "}
              <a href={CONTACT.office.href} className="hover:text-primary">
                {CONTACT.office.display}
              </a>
            </li>
            <li>
              <a href={CONTACT.email.href} className="hover:text-primary">
                {CONTACT.email.display}
              </a>
            </li>
            <li>
              LINE:{" "}
              <a
                href={CONTACT.line.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary"
              >
                {CONTACT.line.display}
              </a>
            </li>
          </ul>
        </div>
      </Container>
      <div className="border-t border-white/10 py-4">
        <Container>
          <p className="text-center text-xs text-white/50">
            © 2026 CS Exhibition Management. All rights reserved.
          </p>
        </Container>
      </div>
    </footer>
  );
}
