"use client";

import { useState } from "react";
import { FileText, Image as ImageIcon, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  appendEventDocument,
  appendEventGallery,
  removeEventDocument,
  removeEventGallery,
  uploadEventCover,
  uploadEventFloorplan,
} from "@/lib/api/admin";
import { createClient } from "@/lib/supabase/client";

export type EventDocument = { label: string; url: string };

export type EventMediaState = {
  floorPlanUrl?: string;
  coverUrl?: string;
  galleryUrls: string[];
  documents: EventDocument[];
};

/**
 * Admin-side media manager for a single event. Used by the create wizard
 * (after the basics step has produced an eventId) and by the edit form.
 * State is lifted to the parent so the parent can persist its own view of
 * what's been uploaded; this component just handles the upload calls.
 */
export function EventMediaSection({
  eventId,
  state,
  onChange,
}: {
  eventId: string;
  state: EventMediaState;
  onChange: (s: EventMediaState) => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const withToken = async <T,>(fn: (token: string) => Promise<T>): Promise<T> => {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error("กรุณาเข้าสู่ระบบใหม่");
    return fn(token);
  };

  const handleFloorplan = async (file: File) => {
    setBusy("floorplan");
    setError(null);
    try {
      const r = await withToken((t) => uploadEventFloorplan(eventId, file, t));
      onChange({ ...state, floorPlanUrl: r.floorPlanUrl });
    } catch (e) {
      setError(e instanceof Error ? e.message : "อัปโหลดผังไม่สำเร็จ");
    } finally {
      setBusy(null);
    }
  };

  const handleCover = async (file: File) => {
    setBusy("cover");
    setError(null);
    try {
      const r = await withToken((t) => uploadEventCover(eventId, file, t));
      onChange({ ...state, coverUrl: r.coverUrl });
    } catch (e) {
      setError(e instanceof Error ? e.message : "อัปโหลดรูปปกไม่สำเร็จ");
    } finally {
      setBusy(null);
    }
  };

  const handleGalleryAdd = async (file: File) => {
    setBusy("gallery");
    setError(null);
    try {
      const r = await withToken((t) => appendEventGallery(eventId, file, t));
      onChange({ ...state, galleryUrls: [...state.galleryUrls, r.url] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "อัปโหลดรูปแกลอรี่ไม่สำเร็จ");
    } finally {
      setBusy(null);
    }
  };

  const handleGalleryRemove = async (url: string) => {
    try {
      await removeEventGallery(eventId, url);
      onChange({ ...state, galleryUrls: state.galleryUrls.filter((u) => u !== url) });
    } catch (e) {
      setError(e instanceof Error ? e.message : "ลบไม่สำเร็จ");
    }
  };

  const [docLabel, setDocLabel] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const handleDocSubmit = async () => {
    if (!docFile || !docLabel.trim()) {
      setError("กรุณาระบุชื่อเอกสารและเลือกไฟล์");
      return;
    }
    setBusy("doc");
    setError(null);
    try {
      const r = await withToken((t) => appendEventDocument(eventId, docFile, docLabel.trim(), t));
      onChange({ ...state, documents: [...state.documents, r] });
      setDocLabel("");
      setDocFile(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "อัปโหลดเอกสารไม่สำเร็จ");
    } finally {
      setBusy(null);
    }
  };

  const handleDocRemove = async (url: string) => {
    try {
      await removeEventDocument(eventId, url);
      onChange({ ...state, documents: state.documents.filter((d) => d.url !== url) });
    } catch (e) {
      setError(e instanceof Error ? e.message : "ลบไม่สำเร็จ");
    }
  };

  return (
    <div className="space-y-6">
      <Section title="แผนผังบูธ" hint="ภาพอ้างอิงให้ลูกค้าดูประกอบการเลือกบูธ">
        <ImagePanel
          url={state.floorPlanUrl}
          busy={busy === "floorplan"}
          onUpload={handleFloorplan}
          emptyLabel="ยังไม่มีแผนผัง"
        />
      </Section>

      <Section title="รูปปกอีเวนต์" hint="ภาพ banner ที่หน้ารายละเอียดอีเวนต์ — แนะนำสัดส่วน 16:9">
        <ImagePanel
          url={state.coverUrl}
          busy={busy === "cover"}
          onUpload={handleCover}
          emptyLabel="ยังไม่มีรูปปก"
        />
      </Section>

      <Section title="ภาพประกอบ (Gallery)" hint="ภาพบรรยากาศของงาน เพิ่มได้หลายรูป">
        {state.galleryUrls.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-muted/40 px-3 py-6 text-center text-xs text-muted-foreground">
            ยังไม่มีรูปแกลอรี่
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {state.galleryUrls.map((url) => (
              <li key={url} className="group relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt=""
                  className="aspect-square w-full rounded-md border border-border object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleGalleryRemove(url)}
                  className="absolute right-1 top-1 rounded-full bg-danger p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="ลบรูป"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <UploadButton
          accept="image/png,image/jpeg,image/webp"
          busy={busy === "gallery"}
          label="เพิ่มรูป"
          onPick={handleGalleryAdd}
        />
      </Section>

      <Section title="เอกสารที่เกี่ยวข้อง" hint="PDF / รูปภาพ — ลูกค้าจะดาวน์โหลดได้จากหน้าอีเวนต์">
        {state.documents.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-muted/40 px-3 py-6 text-center text-xs text-muted-foreground">
            ยังไม่มีเอกสาร
          </p>
        ) : (
          <ul className="space-y-1.5">
            {state.documents.map((doc) => (
              <li
                key={doc.url}
                className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm"
              >
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-w-0 items-center gap-2 hover:underline"
                >
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{doc.label}</span>
                </a>
                <button
                  type="button"
                  onClick={() => handleDocRemove(doc.url)}
                  className="rounded-md p-1 text-muted-foreground hover:bg-danger-soft hover:text-danger"
                  aria-label="ลบ"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
          <Input
            placeholder="ชื่อเอกสาร เช่น เงื่อนไขการเช่า"
            value={docLabel}
            onChange={(e) => setDocLabel(e.target.value)}
          />
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-muted">
            <Upload className="h-4 w-4" />
            {docFile ? docFile.name : "เลือกไฟล์"}
            <input
              type="file"
              accept="application/pdf,image/*"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setDocFile(f);
                e.currentTarget.value = "";
              }}
            />
          </label>
          <Button size="sm" onClick={handleDocSubmit} disabled={busy === "doc"}>
            {busy === "doc" ? "กำลังอัปโหลด..." : "เพิ่ม"}
          </Button>
        </div>
      </Section>

      {error && (
        <p className="rounded-md border border-danger/30 bg-danger-soft p-2 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mb-2 text-xs text-muted-foreground">{hint}</p>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function ImagePanel({
  url,
  busy,
  onUpload,
  emptyLabel,
}: {
  url: string | undefined;
  busy: boolean;
  onUpload: (f: File) => void;
  emptyLabel: string;
}) {
  return (
    <>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          className="max-h-64 w-full rounded-lg border border-border object-contain"
        />
      ) : (
        <div className="flex aspect-[16/9] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 text-xs text-muted-foreground">
          <ImageIcon className="h-6 w-6" />
          <p>{emptyLabel}</p>
        </div>
      )}
      <UploadButton
        accept="image/png,image/jpeg,image/webp"
        busy={busy}
        label={url ? "เปลี่ยนรูป" : "อัปโหลด"}
        onPick={onUpload}
      />
    </>
  );
}

function UploadButton({
  accept,
  busy,
  label,
  onPick,
}: {
  accept: string;
  busy: boolean;
  label: string;
  onPick: (f: File) => void;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-muted">
      <Upload className="h-4 w-4" />
      {busy ? "กำลังอัปโหลด..." : label}
      <input
        type="file"
        accept={accept}
        hidden
        disabled={busy}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
          e.currentTarget.value = "";
        }}
      />
    </label>
  );
}
