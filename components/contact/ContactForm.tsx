"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ClipboardCopy, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { CONTACT, CONTACT_EMAIL, CONTACT_TOPICS } from "@/lib/contact";

const schema = z.object({
  name: z.string().trim().min(1, "กรุณากรอกชื่อของคุณ"),
  phone: z
    .string()
    .trim()
    .refine(
      (v) => /^0\d{8,9}$/.test(v.replace(/\D/g, "")),
      "เบอร์โทรไม่ถูกต้อง เช่น 081 234 5678",
    ),
  email: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || z.string().email().safeParse(v).success,
      "รูปแบบอีเมลไม่ถูกต้อง",
    ),
  topic: z.string().min(1),
  message: z.string().trim().min(10, "เล่ารายละเอียดอย่างน้อย 10 ตัวอักษร"),
});

type FormValues = z.infer<typeof schema>;

function composeMessage(v: FormValues) {
  return [
    `เรื่อง: ${v.topic}`,
    `ชื่อผู้ติดต่อ: ${v.name}`,
    `เบอร์โทร: ${v.phone}`,
    v.email ? `อีเมล: ${v.email}` : null,
    "",
    v.message,
  ]
    .filter((line) => line !== null)
    .join("\n");
}

export function ContactForm() {
  const [copied, setCopied] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      topic: CONTACT_TOPICS[0],
      message: "",
    },
  });
  const { errors } = form.formState;

  const openMail = form.handleSubmit((v) => {
    const subject = `[${v.topic}] ${v.name}`;
    const href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(composeMessage(v))}`;
    window.location.assign(href);
  });

  const copyMessage = form.handleSubmit(async (v) => {
    try {
      await navigator.clipboard.writeText(composeMessage(v));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard blocked; the composed text is still in the fields above.
    }
  });

  return (
    <form onSubmit={openMail} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-name">ชื่อ-นามสกุล</Label>
          <Input
            id="contact-name"
            autoComplete="name"
            placeholder="เช่น สมชาย ใจดี"
            aria-invalid={!!errors.name}
            {...form.register("name")}
          />
          {errors.name && (
            <p className="text-xs text-danger">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-phone">เบอร์โทร</Label>
          <Input
            id="contact-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="เช่น 081 234 5678"
            aria-invalid={!!errors.phone}
            {...form.register("phone")}
          />
          {errors.phone && (
            <p className="text-xs text-danger">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-email">
            อีเมล{" "}
            <span className="font-normal text-muted-foreground">
              (ไม่บังคับ)
            </span>
          </Label>
          <Input
            id="contact-email"
            type="email"
            autoComplete="email"
            placeholder="example@email.com"
            aria-invalid={!!errors.email}
            {...form.register("email")}
          />
          {errors.email && (
            <p className="text-xs text-danger">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-topic">เรื่องที่ติดต่อ</Label>
          <Select id="contact-topic" {...form.register("topic")}>
            {CONTACT_TOPICS.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-message">รายละเอียด</Label>
        <Textarea
          id="contact-message"
          rows={5}
          placeholder="สนใจพื้นที่โซนไหน ช่วงวันที่เท่าไร ขายสินค้าประเภทอะไร — บอกมาได้เลย"
          aria-invalid={!!errors.message}
          {...form.register("message")}
        />
        {errors.message && (
          <p className="text-xs text-danger">{errors.message.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" size="lg" className="sm:flex-1">
          <Mail className="h-4 w-4" />
          เปิดอีเมลพร้อมข้อความนี้
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={copyMessage}
          className="sm:flex-1"
        >
          {copied ? (
            <Check className="h-4 w-4 text-success" />
          ) : (
            <ClipboardCopy className="h-4 w-4" />
          )}
          {copied ? "คัดลอกแล้ว วางในแชทได้เลย" : "คัดลอกไปส่งทาง LINE"}
        </Button>
      </div>

      {/* Says exactly what the buttons do. Nothing is transmitted from this
          page — there is no contact endpoint on the API yet. */}
      <p className="text-xs leading-relaxed text-muted-foreground">
        ปุ่มแรกจะเปิดแอปอีเมลของคุณพร้อมข้อความที่กรอกไว้ ยังไม่ถูกส่งจนกว่าคุณจะกดส่งในแอป
        · ปุ่มที่สองคัดลอกข้อความเดียวกันไปวางใน{" "}
        <a
          href={CONTACT.line.href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary hover:underline"
        >
          LINE {CONTACT.line.display}
        </a>
      </p>
    </form>
  );
}
