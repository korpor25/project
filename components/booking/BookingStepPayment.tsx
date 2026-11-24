"use client";

import { useState } from "react";
import { Check, CheckCircle, Copy, CreditCard, Tag, Wallet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { validateDiscountCode } from "@/lib/api/discounts";
import {
  BANK_ACCOUNT,
  BANK_ACCOUNT_DIGITS,
  PROMPTPAY_AVAILABLE,
} from "@/lib/payment";
import { formatTHB } from "@/lib/pricing";
import { useBookingStore } from "@/stores/bookingStore";

export function BookingStepPayment({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const { draft, patch } = useBookingStore();
  const [codeInput, setCodeInput] = useState("");
  const [validating, setValidating] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [accountCopied, setAccountCopied] = useState(false);

  const handleCopyAccount = async () => {
    try {
      await navigator.clipboard.writeText(BANK_ACCOUNT_DIGITS);
      setAccountCopied(true);
      window.setTimeout(() => setAccountCopied(false), 2000);
    } catch {
      // Clipboard blocked; the number is selectable text right beside it.
    }
  };

  const handleApplyCode = async () => {
    setValidating(true);
    setCodeError(null);
    const result = await validateDiscountCode(codeInput);
    setValidating(false);
    if (!result) {
      setCodeError("โค้ดส่วนลดไม่ถูกต้องหรือหมดอายุแล้ว");
      return;
    }
    patch({ discount: result });
  };

  const handleRemoveCode = () => {
    setCodeInput("");
    setCodeError(null);
    patch({ discount: undefined });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.slip || draft.slip.length === 0) {
      alert("กรุณาอัปโหลดสลิปการโอนเงิน");
      return;
    }
    onNext();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-card p-6"
    >
      <header className="mb-6 flex items-start gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary-hover">
          <Wallet className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-bold">การชำระเงิน</h2>
          <p className="text-xs text-muted-foreground">เลือกรูปแบบการชำระและอัปโหลดสลิปเพื่อให้ Admin ตรวจสอบ</p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>รูปแบบการชำระ</Label>
          <Select
            value={draft.installmentPlan ?? "DEPOSIT"}
            onChange={(e) => patch({ installmentPlan: e.target.value as never })}
          >
            <option value="ALL">ชำระเต็มจำนวน</option>
            <option value="DEPOSIT">ชำระค่ามัดจำ 30%</option>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>วิธีการชำระ</Label>
          <Select
            value={draft.paymentMethod ?? "BANK_TRANSFER"}
            onChange={(e) => patch({ paymentMethod: e.target.value as never })}
          >
            <option value="BANK_TRANSFER">โอนผ่านธนาคาร</option>
            {/* Gated on the flag rather than removed: the value stays valid in
                the store and the API either way. */}
            <option value="PROMPTPAY" disabled={!PROMPTPAY_AVAILABLE}>
              PromptPay / QR Code
              {PROMPTPAY_AVAILABLE ? "" : " (ยังไม่เปิดให้บริการ)"}
            </option>
          </Select>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_240px]">
        <div className="rounded-xl border border-border bg-primary-soft/40 p-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary-hover" />
            <p className="font-semibold">โอนเข้าบัญชี</p>
          </div>

          <dl className="mt-3 space-y-1.5 text-sm">
            <Row
              label="ธนาคาร"
              value={`${BANK_ACCOUNT.bank} (${BANK_ACCOUNT.bankEn})`}
            />
            <Row label="ชื่อบัญชี" value={BANK_ACCOUNT.accountName} />
          </dl>

          {/* The account number gets its own block: it is the one value the
              renter has to retype into a banking app, so it is set large and
              in tabular figures, with a copy button beside it. */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2.5">
            <div>
              <p className="text-xs text-muted-foreground">เลขที่บัญชี</p>
              <p className="text-lg font-bold tabular-nums tracking-wide">
                {BANK_ACCOUNT.accountNumber}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyAccount}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              {accountCopied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-success" />
                  คัดลอกแล้ว
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  คัดลอกเลขบัญชี
                </>
              )}
            </button>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            โอนแล้วแนบสลิปด้านล่างได้เลย ทีมงานจะตรวจสอบและแจ้งผลกลับ
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card p-4">
          {/* Placeholder pattern standing in for the PromptPay QR — not a
              scannable code. Replace with <Image src="/promptpay-qr.png" />
              once the real one is issued, and drop the caption below. */}
          <div className="aspect-square w-full bg-[repeating-linear-gradient(45deg,#1a1a1a_0_8px,#fff_8px_16px)] opacity-90" />
          <p className="text-center text-[11px] text-muted-foreground">
            QR ตัวอย่าง — ยังสแกนไม่ได้ กรุณาโอนตามเลขบัญชี
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border p-4">
        <div className="mb-3 flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-medium">โค้ดส่วนลด</p>
        </div>
        {draft.discount ? (
          <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-3 py-2.5">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="font-semibold text-green-700">{draft.discount.code}</span>
              <span className="text-green-600">
                {draft.discount.type === "PERCENT"
                  ? `ลด ${draft.discount.value}%`
                  : `ลด ${formatTHB(draft.discount.value)}`}
              </span>
            </div>
            <button
              type="button"
              onClick={handleRemoveCode}
              className="text-xs text-muted-foreground underline hover:text-foreground"
            >
              ลบออก
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex gap-2">
              <Input
                placeholder="ใส่โค้ดส่วนลด เช่น FRIEND20"
                value={codeInput}
                onChange={(e) => { setCodeInput(e.target.value); setCodeError(null); }}
                onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                className="uppercase"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleApplyCode}
                disabled={!codeInput.trim() || validating}
              >
                {validating ? "กำลังตรวจสอบ…" : "ใช้โค้ด"}
              </Button>
            </div>
            {codeError && (
              <p className="text-xs text-danger">{codeError}</p>
            )}
          </div>
        )}
      </div>

      <div className="mt-6">
        <FileDropzone
          label="อัปโหลดสลิปโอนเงิน *"
          hint="JPG, PNG • ไม่เกิน 10 MB"
          accept="image/jpeg,image/png"
          maxSizeMB={10}
          value={draft.slip ?? []}
          onChange={(f) => patch({ slip: f })}
        />
      </div>

      <div className="mt-6 flex items-center justify-between gap-2">
        <Button type="button" variant="outline" size="lg" onClick={onBack}>
          ย้อนกลับ
        </Button>
        <Button type="submit" size="lg">ถัดไป: ตรวจสอบและยืนยัน</Button>
      </div>
    </form>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
 