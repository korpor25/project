import type { Metadata } from "next";
import { LegalDocument } from "@/components/shared/LegalDocument";
import { PRIVACY_INTRO, PRIVACY_SECTIONS } from "@/lib/legal";

export const metadata: Metadata = {
  title: "นโยบายความเป็นส่วนตัว",
  description:
    "นโยบายความเป็นส่วนตัวของ CS Exhibition Management ตาม พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 — ข้อมูลที่เก็บ วัตถุประสงค์ การเปิดเผย ระยะเวลาเก็บรักษา และสิทธิของเจ้าของข้อมูล",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalDocument
      eyebrow="ความเป็นส่วนตัว"
      title="นโยบายความเป็นส่วนตัว"
      intro={PRIVACY_INTRO}
      sections={PRIVACY_SECTIONS}
      contactLead="ต้องการใช้สิทธิของเจ้าของข้อมูล หรือมีข้อสงสัยเกี่ยวกับนโยบายฉบับนี้ ติดต่อเราได้ที่"
    />
  );
}
