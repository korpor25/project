// Direct-to-Storage uploads.
//
// Frontend uploads booking docs to Supabase Storage with the user's session;
// RLS in 0003_storage_buckets.sql restricts writes to the user's own folder.
// After a successful upload, we POST to the backend to record the path.

import { apiFetch } from "@/lib/api/client";
import { submitPaymentSlip } from "@/lib/api/payments";
import { createClient } from "@/lib/supabase/client";

const BUCKET = "booking-docs";

export type DocType = "PRODUCT_IMAGE" | "ID_CARD" | "COMPANY_CERT" | "OTHER";

export type UploadedDoc = {
  docType: DocType;
  storagePath: string;
  fileSize: number;
  mimeType: string;
};

function extOf(name: string): string {
  const m = /\.([a-z0-9]+)$/i.exec(name);
  return m ? m[1].toLowerCase() : "bin";
}

function pathFor(userId: string, bookingCode: string, docType: string, originalName: string): string {
  const ext = extOf(originalName);
  const stamp = Date.now();
  return `${userId}/${bookingCode}/${docType.toLowerCase()}_${stamp}.${ext}`;
}

async function uploadOne(
  userId: string,
  bookingCode: string,
  docType: DocType,
  file: File,
): Promise<UploadedDoc> {
  const supabase = createClient();
  const storagePath = pathFor(userId, bookingCode, docType, file.name);

  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, file, {
    cacheControl: "3600",
    contentType: file.type || undefined,
    upsert: false,
  });
  if (error) {
    throw new Error(`อัปโหลด ${file.name} ไม่สำเร็จ: ${error.message}`);
  }

  return {
    docType,
    storagePath,
    fileSize: file.size,
    mimeType: file.type || "application/octet-stream",
  };
}

/** Upload a list of files of the same type and register each with the backend. */
export async function uploadBookingDocs(
  userId: string,
  bookingCode: string,
  docType: DocType,
  files: File[],
): Promise<UploadedDoc[]> {
  const out: UploadedDoc[] = [];
  for (const f of files) {
    const doc = await uploadOne(userId, bookingCode, docType, f);
    await apiFetch<unknown>(
      `/api/v1/bookings/${encodeURIComponent(bookingCode)}/documents`,
      { method: "POST", body: doc },
    );
    out.push(doc);
  }
  return out;
}

/** Upload the payment slip and link it to the booking's first installment. */
export async function uploadPaymentSlip(
  userId: string,
  bookingCode: string,
  file: File,
): Promise<string> {
  const supabase = createClient();
  const storagePath = pathFor(userId, bookingCode, "slip", file.name);

  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, file, {
    cacheControl: "3600",
    contentType: file.type || undefined,
    upsert: false,
  });
  if (error) {
    throw new Error(`อัปโหลดสลิปไม่สำเร็จ: ${error.message}`);
  }

  await apiFetch<unknown>(
    `/api/v1/bookings/${encodeURIComponent(bookingCode)}/slip`,
    { method: "POST", body: { storagePath } },
  );
  return storagePath;
}

/**
 * Upload a slip for a specific installment and submit it to the backend.
 * Returns the storage path so callers can re-render the row with a preview.
 */
export async function uploadInstallmentSlip(
  userId: string,
  bookingCode: string,
  installmentNo: number,
  paymentId: string,
  file: File,
): Promise<string> {
  const supabase = createClient();
  const storagePath = pathFor(
    userId,
    bookingCode,
    `slip-${installmentNo}`,
    file.name,
  );

  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, file, {
    cacheControl: "3600",
    contentType: file.type || undefined,
    upsert: false,
  });
  if (error) {
    throw new Error(`อัปโหลดสลิปไม่สำเร็จ: ${error.message}`);
  }

  await submitPaymentSlip(paymentId, storagePath);
  return storagePath;
}

// --- Floorplan uploads ---
//
// Floorplans go through the backend (multipart) instead of direct-to-Storage
// because Supabase's default `storage.objects` policies surface confusing
// "RLS violation" errors for admin uploads. The backend uses the service-role
// key to write past RLS — the admin route is already role-gated.


export type BookingAttachments = {
  documents: Array<{
    id: string;
    docType: DocType;
    storagePath: string;
    signedUrl?: string;
    mimeType?: string;
    uploadedAt: string;
  }>;
  payments: Array<{
    id: string;
    installmentNo: number;
    label?: string;
    amount: number;
    status: string;
    slipPath?: string;
    signedUrl?: string;
    submittedAt?: string;
  }>;
};
