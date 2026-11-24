import { CheckCircle2, ClipboardCheck, CreditCard, MousePointerClick } from "lucide-react";

const steps = [
  { icon: MousePointerClick, label: "เลือกพื้นที่", desc: "ค้นหาในห้างที่ต้องการ" },
  { icon: ClipboardCheck, label: "ส่งคำขอจอง", desc: "กรอกข้อมูลและแนบเอกสาร" },
  { icon: CreditCard, label: "ยืนยัน & ชำระเงิน", desc: "โอนผ่านธนาคาร แบ่งงวดได้" },
  { icon: CheckCircle2, label: "เริ่มขาย", desc: "Admin อนุมัติพร้อมเปิดบูธ" },
];

export function StepsFlow() {
  return (
    <section className="bg-muted/40 py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold">จองพื้นที่ง่ายใน 4 ขั้นตอน</h2>
        <ol className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-0">
          {steps.map((s, i) => (
            <li key={s.label} className="relative flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
                <s.icon className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm font-semibold">
                <span className="mr-1 text-primary">{i + 1}.</span>
                {s.label}
              </p>
              <p className="mt-1 max-w-[160px] text-xs text-muted-foreground">{s.desc}</p>
              {i < steps.length - 1 && (
                <span
                  className="absolute top-7 hidden h-px w-[calc(100%-3.5rem)] bg-primary/40 md:block"
                  style={{ left: "calc(50% + 1.75rem)" }}
                  aria-hidden
                />
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
