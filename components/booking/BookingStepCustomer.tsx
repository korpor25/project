"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UserRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useBookingStore } from "@/stores/bookingStore";

const schema = z.object({
  fullName: z.string().min(1, "กรอกชื่อ-นามสกุล"),
  companyName: z.string().optional(),
  phone: z.string().regex(/^0\d{2}-?\d{3}-?\d{4}$/, "เบอร์โทรรูปแบบ 0XX-XXX-XXXX"),
  email: z.string().email("กรุณากรอกอีเมลให้ถูกต้อง"),
  taxId: z
    .string()
    .optional()
    .refine((v) => !v || /^\d{13}$/.test(v), "เลขผู้เสียภาษีต้องเป็น 13 หลัก"),
  productCategory: z.string().min(1, "เลือกประเภทสินค้า"),
  productDetail: z.string().min(1, "อธิบายสินค้าโดยย่อ"),
});

type FormValues = z.infer<typeof schema>;

const CATEGORY_LABELS: Record<string, string> = {
  fashion: "Fashion",
  food: "Food & Beverage",
  beauty: "Beauty",
  lifestyle: "Lifestyle",
  tech: "Tech",
};

export function BookingStepCustomer({ onNext }: { onNext: () => void }) {
  const { draft, patch } = useBookingStore();

  const lockedCategory = draft.boothZone?.toLowerCase() ?? "";

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: draft.fullName ?? "",
      companyName: draft.companyName ?? "",
      phone: draft.phone ?? "",
      email: draft.email ?? "",
      taxId: draft.taxId ?? "",
      productCategory: draft.productCategory || lockedCategory,
      productDetail: draft.productDetail ?? "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    patch(values);
    onNext();
  });

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-border bg-card p-6" noValidate>
      <header className="mb-6 flex items-start gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary-hover">
          <UserRound className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-bold">ข้อมูลผู้จอง</h2>
          <p className="text-xs text-muted-foreground">
            กรอกข้อมูลของผู้ติดต่อหลัก ระบบใช้ในการออกสัญญา
          </p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="ชื่อ-นามสกุล *" error={form.formState.errors.fullName?.message}>
          <Input placeholder="เช่น สมชาย ใจดี" {...form.register("fullName")} />
        </Field>
        <Field label="ชื่อบริษัท / ร้านค้า">
          <Input placeholder="ระบุชื่อ ABC จำกัด" {...form.register("companyName")} />
        </Field>
        <Field label="เบอร์โทรศัพท์ *" error={form.formState.errors.phone?.message}>
          <Input placeholder="0XX-XXX-XXXX" {...form.register("phone")} />
        </Field>
        <Field label="อีเมล *" error={form.formState.errors.email?.message}>
          <Input type="email" placeholder="example@email.com" {...form.register("email")} />
        </Field>
        <Field label="เลขประจำตัวผู้เสียภาษี" error={form.formState.errors.taxId?.message}>
          <Input placeholder="13 หลัก (กรณีนิติบุคคล)" {...form.register("taxId")} />
        </Field>
        <Field label="ประเภทสินค้า *" error={form.formState.errors.productCategory?.message}>
          {lockedCategory ? (
            <>
              <Input value={CATEGORY_LABELS[lockedCategory] ?? lockedCategory} disabled />
              <input type="hidden" {...form.register("productCategory")} />
            </>
          ) : (
            <Select {...form.register("productCategory")}>
              <option value="">เลือกประเภท</option>
              <option value="fashion">Fashion</option>
              <option value="food">Food &amp; Beverage</option>
              <option value="beauty">Beauty</option>
              <option value="lifestyle">Lifestyle</option>
              <option value="tech">Tech</option>
            </Select>
          )}
        </Field>
      </div>

      <Field
        className="mt-4"
        label="รายละเอียดสินค้า *"
        error={form.formState.errors.productDetail?.message}
      >
        <Textarea
          rows={3}
          placeholder="อธิบายสินค้าโดยย่อ เช่น เครื่องสำอางสกินแคร์, อาหารทานเล่น..."
          {...form.register("productDetail")}
        />
      </Field>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <FileDropzone
          label="รูปภาพสินค้า *"
          hint="JPG, PNG, PDF • ไม่เกิน 5 MB"
          maxSizeMB={5}
          multiple
          value={useBookingStore.getState().draft.productImages ?? []}
          onChange={(f) => patch({ productImages: f })}
        />
        <FileDropzone
          label="สำเนาบัตรประชาชน *"
          hint="JPG, PNG, PDF • ไม่เกิน 5 MB"
          maxSizeMB={5}
          value={useBookingStore.getState().draft.idCard ?? []}
          onChange={(f) => patch({ idCard: f })}
        />
        <FileDropzone
          label="ทะเบียนพาณิชย์ (ถ้ามี)"
          hint="JPG, PNG, PDF • ไม่เกิน 10 MB"
          maxSizeMB={10}
          value={useBookingStore.getState().draft.companyDoc ?? []}
          onChange={(f) => patch({ companyDoc: f })}
        />
      </div>

      <div className="mt-6 flex items-center justify-end">
        <Button type="submit" size="lg">ถัดไป: ชำระเงิน</Button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
 