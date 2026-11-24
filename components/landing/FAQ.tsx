import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FaqAccordion } from "@/components/shared/FaqAccordion";
import { faqs } from "@/lib/faqs";

export function FAQ() {
  // Show the first few on the landing page; full list lives at /faq.
  const preview = faqs.slice(0, 5);

  return (
    <section className="py-14">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold">คำถามที่พบบ่อย</h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          รวมคำถามยอดฮิตเกี่ยวกับการจองพื้นที่และการชำระเงิน
        </p>

        <div className="mt-10">
          <FaqAccordion items={preview} />
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/faq"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            ดูคำถามที่พบบ่อยทั้งหมด
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
 