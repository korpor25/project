"use client";

import { useEffect, useState } from "react";
import { Stepper } from "@/components/ui/Stepper";
import { BookingStepCustomer } from "./BookingStepCustomer";
import { BookingStepPayment } from "./BookingStepPayment";
import { BookingStepReview } from "./BookingStepReview";
import { BookingSummaryRail } from "./BookingSummaryRail";
import { useBookingStore } from "@/stores/bookingStore";
import type { Booth, EventDetail } from "@/types/domain";

const STEPS = [
  { label: "เลือกพื้นที่" },
  { label: "กรอกข้อมูล" },
  { label: "ชำระเงิน" },
  { label: "ยืนยันการจอง" },
];

export function BookingWizard({
  event,
  booths,
}: {
  event: EventDetail;
  booths: Booth[];
}) {
  const patch = useBookingStore((s) => s.patch);
  const [step, setStep] = useState(1);

  // Seed the store from URL props if the user lands here without prior state
  // (e.g. shared link, refresh). The booths prop is authoritative because the
  // server resolved it from the searchParam.
  const codesKey = booths.map((b) => b.code).join(",");
  useEffect(() => {
    patch({ eventId: event.id, boothCodes: codesKey.split(","), weeks: 1 });
  }, [event.id, codesKey, patch]);

  return (
    <>
      <Stepper steps={STEPS} current={step} />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          {step === 1 && <BookingStepCustomer onNext={() => setStep(2)} />}
          {step === 2 && (
            <BookingStepPayment onNext={() => setStep(3)} onBack={() => setStep(1)} />
          )}
          {step === 3 && (
            <BookingStepReview event={event} booths={booths} onBack={() => setStep(2)} />
          )}
        </div>
        <BookingSummaryRail event={event} booths={booths} />
      </div>
    </>
  );
}

