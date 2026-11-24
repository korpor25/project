import type { Metadata } from "next";
import { CompanyProfile } from "@/components/about/CompanyProfile";

export const metadata: Metadata = {
  title: "เกี่ยวกับเรา",
  description:
    "บริษัท ซีเอส เอ็กซิบิชั่น แมเนจเม้นท์ จำกัด ออแกไนท์และผู้เชี่ยวชาญด้านการให้เช่าพื้นที่ในห้าง ออกบูธงานแสดงสินค้า และรับจัดงานอีเว้นท์ครบวงจรในศูนย์การค้าชั้นนำ ประสบการณ์กว่า 20 ปี",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          เกี่ยวกับเรา
        </p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
          บริษัท ซีเอส เอ็กซิบิชั่น แมเนจเม้นท์ จำกัด
        </h1>
        <p className="mt-3 text-lg font-medium text-muted-foreground">
          ออแกไนท์ผู้เชี่ยวชาญด้านการให้เช่าพื้นที่ในห้าง ออกบูธ และงานแสดงสินค้าครบวงจร
        </p>
        <div className="brand-rule mt-5 w-16" />
        <p className="mt-5 text-muted-foreground">
          บริษัท ซีเอส เอ็กซิบิชั่น แมเนจเม้นท์ จำกัด
          ดำเนินธุรกิจออแกไนซ์ ให้เช่าพื้นที่ขายของในห้าง และจัดงานแสดงสินค้ามากว่า 20 ปี
          เรามุ่งมั่นเป็นพันธมิตรทางธุรกิจที่ช่วยให้ผู้ประกอบการหาทำเลขายของที่ใช่
          และเข้าถึงลูกค้าได้อย่างมีประสิทธิภาพ ผ่านพื้นที่เช่าคุณภาพและบูธขายสินค้า
          ภายในศูนย์การค้าชั้นนำทั่วประเทศ
        </p>
      </header>

      <CompanyProfile />
    </div>
  );
}
