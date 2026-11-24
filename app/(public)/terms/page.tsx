import type { Metadata } from "next";
import { LegalDocument } from "@/components/shared/LegalDocument";
import { TERMS_INTRO, TERMS_SECTIONS } from "@/lib/legal";

export const metadata: Metadata = {
  title: "เงื่อนไขการใช้งาน",
  description:
    "เงื่อนไขการใช้งานเว็บไซต์และการเช่าพื้นที่บูธกับ CS Exhibition Management — การสมัครสมาชิก การจอง การชำระเงิน เอกสาร ข้อปฏิบัติในพื้นที่ และการยกเลิก",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalDocument
      eyebrow="ข้อกำหนด"
      title="เงื่อนไขการใช้งาน"
      intro={TERMS_INTRO}
      sections={TERMS_SECTIONS}
      contactLead="มีข้อสงสัยเกี่ยวกับเงื่อนไขฉบับนี้ หรือต้องการแจ้งปัญหาการใช้งาน ติดต่อเราได้ที่"
    />
  );
}
