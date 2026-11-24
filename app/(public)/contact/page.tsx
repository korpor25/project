import type { Metadata } from "next";
import { ContactChannels } from "@/components/contact/ContactChannels";
import { ContactForm } from "@/components/contact/ContactForm";
import { SocialLinks } from "@/components/shared/SocialLinks";
import { Container } from "@/components/ui/Container";
import { CONTACT } from "@/lib/contact";

export const metadata: Metadata = {
  title: "ติดต่อเรา",
  description: `ติดต่อ CS Exhibition เรื่องพื้นที่บูธและอีเวนต์ในศูนย์การค้า — โทร ${CONTACT.mobile.display}, LINE ${CONTACT.line.display} หรือส่งรายละเอียดมาทางอีเมล`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div>
      <section className="bg-navy text-navy-foreground">
        <Container className="py-14 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Contact
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">ติดต่อเรา</h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/70">
            อยากรู้ว่าโซนไหนยังว่าง ราคาเท่าไร หรือรอบจัดงานถัดไปเมื่อไร
            เลือกช่องทางที่สะดวกที่สุดได้เลย
          </p>
          <div className="mt-6 h-0.5 w-12 rounded-full bg-primary" />
        </Container>
      </section>

      <Container className="py-12 sm:py-16">
        <ContactChannels />

        {/* Separate from the channel cards above: those are things you copy or
            dial to reach us, these are pages to follow. */}
        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-border pt-8">
          <div>
            <p className="font-semibold">ติดตามเรา</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              ดูบรรยากาศงานและพื้นที่ว่างรอบใหม่ก่อนใคร
            </p>
          </div>
          <SocialLinks tone="light" />
        </div>
      </Container>

      <section className="border-t border-border bg-muted/60">
        <Container className="py-12 sm:py-16">
          <div className="mx-auto max-w-3xl">
            <header className="mb-8">
              <h2 className="text-2xl font-bold">ส่งรายละเอียดมาให้เรา</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                กรอกข้อมูลครั้งเดียว แล้วเลือกว่าจะส่งต่อทางอีเมลหรือ LINE
              </p>
            </header>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
              <ContactForm />
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
