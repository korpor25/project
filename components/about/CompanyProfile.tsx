import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Award,
  Building2,
  CalendarRange,
  CheckCircle2,
  Eye,
  Headset,
  LayoutGrid,
  Lightbulb,
  MapPin,
  Sparkles,
  Target,
} from "lucide-react";

const concepts: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: MapPin,
    title: "ทำเลที่ดี",
    desc: "ช่วยเพิ่มโอกาสในการขาย",
  },
  {
    icon: Sparkles,
    title: "การจัดบูธที่มีคุณภาพ",
    desc: "ช่วยเสริมภาพลักษณ์ของแบรนด์",
  },
  {
    icon: Headset,
    title: "บริการที่เป็นระบบ",
    desc: "ช่วยให้ลูกค้าโฟกัสกับการขายได้เต็มที่",
  },
];

const scopeOfWork = [
  "ออกแบบ Layout ในแต่ละห้าง ให้เหมาะสมกับการแสดงสินค้า",
  "ตกแต่งพื้นที่ตาม Theme เพื่อช่วยดึงดูดให้ลูกค้าเข้ามาซื้อสินค้า เพิ่มยอดขาย",
  "จัดเตรียมอุปกรณ์ เช่น ปูพรม ตั้งโต๊ะ ยิงผ้าสเกิร์ต เดินระบบไฟ",
  "ดูแลการดำเนินงานตั้งแต่เริ่มต้นจนถึงรื้อถอนบูธ",
];

const partnerMalls = [
  "Lotus’s สาขาต่าง ๆ",
  "Big C เช่น บิ๊กซีเพชรบุรี",
  "Central สาขาต่าง ๆ",
  "ICS",
  "Robinson หลายสาขา",
  "The Mall บางแค, งามวงศ์วาน, ท่าพระ",
  "Market Village หัวหิน",
  "Market Village รังสิต",
  "Market Village สุวรรณภูมิ",
  "เสริมไทยคอมเพล็กซ์",
  "แปซิฟิคศรีราชา",
];

const strengths = [
  "เข้าใจระบบการทำงานของศูนย์การค้าเป็นอย่างดี",
  "มีความสัมพันธ์ที่ดีกับเจ้าหน้าที่และผู้ดูแลพื้นที่",
  "ประสานงานได้รวดเร็วและมีประสิทธิภาพ",
  "สามารถบริหารงานได้ตามมาตรฐานและแก้ไขปัญหาเฉพาะหน้าได้ดี",
];

const visionPoints = [
  "พื้นที่จัดงานที่มีคุณภาพ",
  "การบริการที่เป็นมืออาชีพ",
  "การประสานงานที่รวดเร็ว",
  "ความสัมพันธ์ระยะยาวกับลูกค้าและศูนย์การค้าทั่วประเทศ",
];

function SectionHeading({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <h2 className="text-2xl font-bold">{title}</h2>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
        <Icon className="h-4 w-4 shrink-0" />
        {label}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{value}</p>
    </div>
  );
}

export function CompanyProfile() {
  return (
    <div className="mt-16 space-y-16">
      {/* แนวคิดของเรา */}
      <section>
        <SectionHeading icon={Lightbulb} title="แนวคิดของเรา" />
        <ul className="mt-6 grid gap-5 sm:grid-cols-3">
          {concepts.map((c) => (
            <li
              key={c.title}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <c.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-bold">{c.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* บริการของเรา */}
      <section>
        <SectionHeading icon={LayoutGrid} title="บริการของเรา" />
        <p className="mt-4 text-muted-foreground">
          เราให้บริการด้านการบริหารพื้นที่เช่าและจัดงานแสดงสินค้าแบบครบวงจร
          (Organizer)
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <InfoCard
            icon={Building2}
            label="ประเภทพื้นที่ที่ให้บริการ"
            value="พื้นที่เช่าภายในศูนย์การค้า (Indoor Event)"
          />
          <InfoCard
            icon={CalendarRange}
            label="รูปแบบการเช่า"
            value="ราย 7–15 วัน หรือแต่ละช่วงเวลาที่ทางเราได้ประสานกับทางห้างไว้"
          />
        </div>
        <div className="mt-8">
          <h3 className="flex items-center gap-2 font-bold">
            <LayoutGrid className="h-4 w-4 text-primary" />
            งานที่เราดูแล
          </h3>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {scopeOfWork.map((w) => (
              <li
                key={w}
                className="flex gap-3 rounded-xl border border-border bg-card p-4 text-sm shadow-sm"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ประสบการณ์และความน่าเชื่อถือ */}
      <section>
        <SectionHeading icon={Award} title="ประสบการณ์และความน่าเชื่อถือ" />
        <p className="mt-4 text-muted-foreground">
          บริษัทเริ่มดำเนินธุรกิจตั้งแต่ปี พ.ศ. 2549
          และมีประสบการณ์ทำงานร่วมกับศูนย์การค้าชั้นนำอย่างต่อเนื่อง
        </p>
        <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <p className="text-sm font-semibold">
            ศูนย์การค้าที่เราเคยร่วมดำเนินงานด้วย
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {partnerMalls.map((m) => (
              <li
                key={m}
                className="rounded-full border border-border bg-background px-3 py-1 text-sm text-muted-foreground"
              >
                {m}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-8">
          <h3 className="font-bold">จากประสบการณ์ของเรา</h3>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {strengths.map((s) => (
              <li key={s} className="flex gap-3 text-sm">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* วิสัยทัศน์ของเรา */}
      <section>
        <SectionHeading icon={Eye} title="วิสัยทัศน์ของเรา" />
        <p className="mt-4 text-muted-foreground">
          เรามุ่งพัฒนาระบบการบริหารงานให้มีประสิทธิภาพมากยิ่งขึ้น
          พร้อมสร้างโอกาสทางธุรกิจให้กับผู้ประกอบการผ่าน
        </p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {visionPoints.map((v) => (
            <li
              key={v}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <Target className="h-5 w-5 shrink-0 text-primary" />
              <span className="font-medium">{v}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Closing CTA */}
      <section className="rounded-2xl border border-primary/30 bg-primary-soft p-8 text-center sm:p-12">
        <h2 className="text-xl font-bold sm:text-2xl">
          เพราะความสำเร็จของลูกค้า คือความสำเร็จของเรา
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
          บริษัท ซีเอส เอ็กซิบิชั่น แมเนจเม้นท์ จำกัด
          พร้อมเป็นผู้ช่วยเบื้องหลังความสำเร็จของทุกธุรกิจ
          ไม่ว่าคุณจะเป็นผู้ประกอบการรายใหม่ เจ้าของแบรนด์
          หรือบริษัทที่ต้องการขยายตลาด เราพร้อมดูแลทุกขั้นตอนอย่างมืออาชีพ
        </p>
        <Link
          href="/contact"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary-hover"
        >
          ร่วมสร้างโอกาสทางธุรกิจไปกับเรา
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
