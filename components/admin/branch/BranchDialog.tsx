"use client";

import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { createBranch, updateBranch, type AdminBranch } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/error";
import { buildFloorOptions } from "@/lib/floors";

type Mode = "create" | "edit";

export function BranchDialog({
  open,
  mode,
  branch,
  onClose,
  onSaved,
}: {
  open: boolean;
  mode: Mode;
  branch?: AdminBranch | null;
  onClose: () => void;
  /** Receives the branch as saved by the API — callers that need to select the
   *  freshly created branch can read its id straight off it. */
  onSaved: (saved: AdminBranch) => void;
}) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [province, setProvince] = useState("");
  const [floorCount, setFloorCount] = useState(1);
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form whenever the dialog opens with a different branch.
  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(null);
    setName(branch?.name ?? "");
    setAddress(branch?.address ?? "");
    setProvince(branch?.province ?? "");
    setFloorCount(branch?.floorCount ?? 1);
    setStatus((branch?.status as "ACTIVE" | "INACTIVE") ?? "ACTIVE");
  }, [open, branch]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError("กรุณากรอกชื่อสาขา");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        name: name.trim(),
        address: address.trim() || undefined,
        province: province.trim() || undefined,
        floorCount,
        status,
      };
      const saved =
        mode === "create"
          ? await createBranch(payload)
          : branch
            ? await updateBranch(branch.id, payload)
            : null;
      if (saved) onSaved(saved);
      onClose();
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : "ไม่สามารถบันทึกสาขาได้ กรุณาลองใหม่",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => !submitting && onClose()}>
      <DialogHeader>
        <DialogTitle>
          <div className="flex items-center gap-2 text-primary-hover">
            <Building2 className="h-5 w-5" />
            {mode === "create" ? "เพิ่มสาขาใหม่" : "แก้ไขสาขา"}
          </div>
        </DialogTitle>
      </DialogHeader>
      <DialogBody className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="name">ชื่อสาขา *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Central Ladprao"
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="province">จังหวัด</Label>
            <Input
              id="province"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              placeholder="กรุงเทพ"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="floors">จำนวนชั้น</Label>
            <Input
              id="floors"
              type="number"
              min="1"
              max="20"
              value={floorCount}
              onChange={(e) => setFloorCount(Number(e.target.value))}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          ชั้นที่เลือกได้: {buildFloorOptions(floorCount).join(", ")}
          <br />
          ชั้นใต้ดินหรือชั้นที่ชื่อไม่เป็นตัวเลข (B1, B2, ชั้นลอย) พิมพ์เองได้ตอนสร้างอีเวนต์
        </p>
        <div className="space-y-1.5">
          <Label htmlFor="address">ที่อยู่</Label>
          <Textarea
            id="address"
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="999/9 ถนน..."
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="status">สถานะ</Label>
          <Select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as "ACTIVE" | "INACTIVE")}
          >
            <option value="ACTIVE">ใช้งานอยู่</option>
            <option value="INACTIVE">ปิดชั่วคราว</option>
          </Select>
        </div>

        {error && (
          <p className="rounded-md border border-danger/30 bg-danger-soft p-3 text-sm text-danger">
            {error}
          </p>
        )}
      </DialogBody>
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={submitting}>
          ยกเลิก
        </Button>
        <Button onClick={handleSave} disabled={submitting}>
          {submitting ? "กำลังบันทึก..." : mode === "create" ? "เพิ่มสาขา" : "บันทึก"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
 
