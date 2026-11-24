import type { Metadata } from "next";
import Link from "next/link";
import { FaqAccordion } from "@/components/shared/FaqAccordion";
import { faqs } from "@/lib/faqs";

export const metadata: Metadata = {
  title: "คำถามที่พบบ่อย (FAQ)",
  description:
    "รวมคำถามที่พบบ่อยเกี่ยวกับการจองพื้นที่บูธ การชำระเงิน เอกสารที่ต้องเตรียม การยืนยันการจอง และการยกเลิก — ตอบครบทุกข้อสงสัยก่อนจอง",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  // FAQPage structured data — lets Google show answers directly in results.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">คำถามที่พบบ่อย</h1>
        <p className="mt-3 text-muted-foreground">
          รวมทุกข้อสงสัยเกี่ยวกับการจองพื้นที่ การชำระเงิน และเอกสาร
          หากไม่พบคำตอบที่ต้องการ สามารถติดต่อทีมงานได้โดยตรง
        </p>
      </header>

      <div className="mt-10">
        <FaqAccordion items={faqs} />
      </div>

      <div className="mt-12 rounded-2xl bg-muted/50 p-6 text-center">
        <p className="text-lg font-semibold">ยังมีคำถามอื่นอีกไหม?</p>
        <p className="mt-1 text-sm text-muted-foreground">
          ทีมงานยินดีช่วยเหลือ ติดต่อเราได้ทุกช่องทาง
        </p>
        <Link
          href="/contact"
          className="mt-4 inline-flex h-12 items-center justify-center rounded-md bg-primary px-6 text-base font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          ติดต่อทีมงาน
        </Link>
      </div>
    </div>
  );
}
 