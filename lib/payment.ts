// Company bank account shown to renters at the payment step.
//
// Kept out of the component so the booking flow, the booking detail page and
// any future receipt/email all quote the same number. The values that were
// hardcoded here before (KBank 123-4-56789-0) were scaffold placeholders.

export const BANK_ACCOUNT = {
  bank: "ธนาคารกรุงเทพ",
  bankEn: "Bangkok Bank",
  accountName: "บริษัท ซีเอส เอ็กซิบิชั่น แมเนจเม้นท์ จำกัด",
  accountNumber: "210-064085-9",
} as const;

/** Digits only — the form a banking app expects when pasted. */
export const BANK_ACCOUNT_DIGITS = BANK_ACCOUNT.accountNumber.replace(
  /\D/g,
  "",
);

/**
 * Whether the PromptPay method is offered at checkout.
 *
 * The QR currently rendered is a placeholder pattern, NOT a scannable code —
 * no PromptPay QR has been issued for this account yet. When the real image
 * arrives, drop it at public/promptpay-qr.png, swap the placeholder block in
 * BookingStepPayment for an <Image>, and delete the "ตัวอย่าง" caption.
 */
export const PROMPTPAY_AVAILABLE = true;
