import { create } from "zustand";
import type { DiscountResult } from "@/types/domain";

export type BookingDraft = {
  // Step 1: selected booths. Holds an array because the plan screen lets the
  // renter take several booths in one pass; a single booth is just length 1.
  eventId?: string;
  boothCodes?: string[];
  /** Zone of the first selected booth — locks the product category downstream. */
  boothZone?: string;
  weeks?: number;

  // Step 2: customer info
  fullName?: string;
  companyName?: string;
  phone?: string;
  email?: string;
  taxId?: string;
  productCategory?: string;
  productDetail?: string;
  productImages?: File[];
  idCard?: File[];
  companyDoc?: File[];

  // Step 3: payment
  paymentMethod?: "BANK_TRANSFER" | "PROMPTPAY";
  installmentPlan?: "ALL" | "DEPOSIT" | "INSTALLMENT_1";
  slip?: File[];

  // Step 4 has no fields — final confirmation

  // Discount
  discount?: DiscountResult;
};

type BookingStore = {
  step: number;
  draft: BookingDraft;
  setStep: (step: number) => void;
  patch: (patch: Partial<BookingDraft>) => void;
  reset: () => void;
};

export const useBookingStore = create<BookingStore>((set) => ({
  step: 0,
  draft: {},
  setStep: (step) => set({ step }),
  patch: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),
  reset: () => set({ step: 0, draft: {} }),
}));
 