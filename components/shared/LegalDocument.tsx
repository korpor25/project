import Link from "next/link";
import { CONTACT } from "@/lib/contact";
import type { LegalSection } from "@/lib/legal";
import { COMPANY_NAME, LEGAL_UPDATED_AT } from "@/lib/legal";

/**
 * Shared shell for /terms and /privacy: title, updated date, jump list, the
 * numbered sections, and a contact block built from the single contact source
 * so the details can't drift from the footer.
 */
export function LegalDocument({
  eyebrow,
  title,
  intro,
  sections,
  contactLead,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  sections: readonly LegalSection[];
  /** One line above the contact details, framing what to write in about. */
  contactLead: string;
}) {
  const contactId = `${sections.length + 1}`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{title}</h1>
        <div className="brand-rule mt-5 w-16" />
        <p className="mt-5 text-muted-foreground">{intro}</p>
        <p className="mt-4 text-sm text-muted-foreground">
          ปรับปรุงล่าสุด {LEGAL_UPDATED_AT}
        </p>
      </header>

      <nav aria-label="หัวข้อในหน้านี้" className="mt-10 rounded-2xl bg-muted/50 p-6">
        <p className="text-sm font-semibold">หัวข้อในหน้านี้</p>
        <ol className="mt-3 space-y-1.5">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
              >
                {s.heading}
              </a>
            </li>
          ))}
          <li>
            <a
              href="#contact"
              className="text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              {contactId}. ช่องทางติดต่อ
            </a>
          </li>
        </ol>
      </nav>

      <div className="mt-12 space-y-10">
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-24">
            <h2 className="text-xl font-bold">{section.heading}</h2>
            <div className="mt-3 space-y-3">
              {section.blocks.map((block, i) =>
                typeof block === "string" ? (
                  <p key={i} className="text-muted-foreground">
                    {block}
                  </p>
                ) : (
                  <ul key={i} className="space-y-2">
                    {block.list.map((item) => (
                      <li
                        key={item}
                        className="relative pl-5 text-muted-foreground before:absolute before:left-0 before:top-[0.7em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                ),
              )}
            </div>
          </section>
        ))}

        <section id="contact" className="scroll-mt-24">
          <h2 className="text-xl font-bold">{contactId}. ช่องทางติดต่อ</h2>
          <p className="mt-3 text-muted-foreground">{contactLead}</p>
          <dl className="mt-4 space-y-2 text-muted-foreground">
            <div className="flex gap-2">
              <dt className="w-24 shrink-0 font-medium text-foreground">บริษัท</dt>
              <dd>{COMPANY_NAME}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-24 shrink-0 font-medium text-foreground">ที่อยู่</dt>
              <dd>{CONTACT.address.display}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-24 shrink-0 font-medium text-foreground">อีเมล</dt>
              <dd>
                <a className="hover:text-primary hover:underline" href={CONTACT.email.href}>
                  {CONTACT.email.display}
                </a>
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-24 shrink-0 font-medium text-foreground">โทรศัพท์</dt>
              <dd>
                <a className="hover:text-primary hover:underline" href={CONTACT.mobile.href}>
                  {CONTACT.mobile.display}
                </a>
                {" · "}
                <a className="hover:text-primary hover:underline" href={CONTACT.office.href}>
                  {CONTACT.office.display}
                </a>
              </dd>
            </div>
          </dl>
          <Link
            href="/contact"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            ไปหน้าติดต่อเรา
          </Link>
        </section>
      </div>
    </div>
  );
}
