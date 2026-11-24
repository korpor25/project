"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AlertTriangle, ImageOff, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import {
  appendBranchGallery,
  listBranchGallery,
  listBranches,
  removeBranchGallery,
  type AdminBranch,
  type BranchGalleryImage,
} from "@/lib/api/admin";
import { createClient } from "@/lib/supabase/client";

/**
 * Manages the "ภาพบรรยากาศ" folder for one branch.
 *
 * The three endpoints this calls are not implemented yet (see the contract note
 * in lib/api/admin.ts), so loading and uploading both surface a plain "ยังไม่
 * พร้อมใช้งาน" state rather than pretending to work. Once the API ships this
 * screen needs no changes.
 */
export function BranchGalleryManager() {
  const [branches, setBranches] = useState<AdminBranch[]>([]);
  const [branchId, setBranchId] = useState("");
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Images are stored with the branch they belong to so `loading` is derived
  // and a slow reply for a previously selected branch cannot overwrite a newer
  // one — same shape as ZoneAnalytics.
  const [result, setResult] = useState<{
    branchId: string;
    images: BranchGalleryImage[];
  } | null>(null);
  const loading = branchId !== "" && result?.branchId !== branchId;
  const images = result?.images ?? [];

  useEffect(() => {
    listBranches()
      .then((data) => {
        setBranches(data);
        setBranchId((prev) => prev || data[0]?.id || "");
      })
      .catch(() => setError("โหลดรายชื่อห้างไม่สำเร็จ"));
  }, []);

  useEffect(() => {
    if (!branchId) return;
    let cancelled = false;
    listBranchGallery(branchId)
      .then((r) => {
        if (!cancelled) setResult({ branchId, images: r.images ?? [] });
      })
      .catch(() => {
        if (!cancelled) {
          setResult({ branchId, images: [] });
          setError(
            "ยังเรียกรูปของห้างนี้ไม่ได้ — API ฝั่ง backend ยังไม่มี endpoint นี้",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [branchId]);

  const withToken = async <T,>(fn: (token: string) => Promise<T>): Promise<T> => {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error("กรุณาเข้าสู่ระบบใหม่");
    return fn(token);
  };

  const handleUpload = async (file: File) => {
    if (!branchId) return;
    setBusy(true);
    setError(null);
    try {
      const img = await withToken((t) =>
        appendBranchGallery(branchId, file, t, caption.trim() || undefined),
      );
      setResult((cur) =>
        cur && cur.branchId === branchId
          ? { branchId, images: [...cur.images, img] }
          : { branchId, images: [img] },
      );
      setCaption("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "อัปโหลดไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (url: string) => {
    try {
      await removeBranchGallery(branchId, url);
      setResult((cur) =>
        cur ? { ...cur, images: cur.images.filter((i) => i.url !== url) } : cur,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "ลบรูปไม่สำเร็จ");
    }
  };

  const branchName = branches.find((b) => b.id === branchId)?.name ?? "";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="min-w-[220px] flex-1">
          <label
            htmlFor="gallery-branch"
            className="mb-1.5 block text-xs font-medium text-muted-foreground"
          >
            เลือกห้าง
          </label>
          <Select
            id="gallery-branch"
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
          >
            {branches.length === 0 && <option value="">กำลังโหลด...</option>}
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="min-w-[220px] flex-1">
          <label
            htmlFor="gallery-caption"
            className="mb-1.5 block text-xs font-medium text-muted-foreground"
          >
            คำบรรยายรูป (ไม่บังคับ)
          </label>
          <input
            id="gallery-caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="เช่น โซนบูธอาหาร ชั้น G"
            className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          />
        </div>

        <label className="shrink-0">
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={busy || !branchId}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload(f);
              e.target.value = "";
            }}
          />
          <span
            className={
              busy || !branchId
                ? "inline-flex h-10 cursor-not-allowed items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground opacity-50"
                : "inline-flex h-10 cursor-pointer items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
            }
          >
            <Upload className="h-4 w-4" />
            {busy ? "กำลังอัปโหลด..." : "เพิ่มรูป"}
          </span>
        </label>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-warning/30 bg-warning-soft p-4 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <div>
            <p className="font-medium text-foreground">{error}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              หน้านี้พร้อมใช้งานทันทีที่ backend เพิ่ม 3 endpoint ของแกลเลอรีห้าง
              — ดูรูปแบบที่ต้องการได้ในคอมเมนต์ของ lib/api/admin.ts
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          กำลังโหลดรูป...
        </p>
      ) : images.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <ImageOff className="mx-auto h-8 w-8 text-muted-foreground/40" />
          <p className="mt-3 text-sm font-medium">
            {branchName ? `${branchName} ยังไม่มีรูป` : "ยังไม่มีรูป"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            กด &ldquo;เพิ่มรูป&rdquo; เพื่ออัปโหลดภาพบรรยากาศของห้างนี้
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img) => (
            <li
              key={img.url}
              className="group relative overflow-hidden rounded-xl border border-border bg-muted"
            >
              <div className="relative aspect-square">
                <Image
                  src={img.url}
                  alt={img.caption ?? ""}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover"
                  unoptimized
                />
              </div>
              {img.caption && (
                <p className="truncate bg-card px-2 py-1.5 text-[11px] text-muted-foreground">
                  {img.caption}
                </p>
              )}
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => handleRemove(img.url)}
                aria-label="ลบรูปนี้"
                className="absolute right-2 top-2 h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
