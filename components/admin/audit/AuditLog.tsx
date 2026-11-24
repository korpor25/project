"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  CheckCircle2,
  ClipboardList,
  Download,
  Filter,
  Search,
  Shield,
  Trash2,
  UserCog,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { AuditEntry } from "@/lib/api/admin";

// Map backend entity_type → presentational metadata (label, icon, color).
const ENTITY_META: Record<
  string,
  { label: string; icon: React.ElementType; tone: string }
> = {
  booking: { label: "การจอง", icon: ClipboardList, tone: "bg-info-soft text-info" },
  user:    { label: "ผู้ใช้",   icon: UserCog,        tone: "bg-warning-soft text-warning" },
  booth:   { label: "บูธ",      icon: Activity,       tone: "bg-success-soft text-success" },
  event:   { label: "อีเวนต์",  icon: Activity,       tone: "bg-primary-soft text-primary-hover" },
  system:  { label: "ระบบ",     icon: Shield,         tone: "bg-muted text-foreground" },
};

const ACTION_LABEL: Record<string, string> = {
  approve:  "อนุมัติการจอง",
  reject:   "ปฏิเสธการจอง",
  suspend:  "ระงับบัญชี",
  restore:  "กู้คืนบัญชี",
  create:   "สร้าง",
  update:   "แก้ไข",
  delete:   "ลบ",
};

export function AuditLog({ entries }: { entries: AuditEntry[] }) {
  const [search, setSearch] = useState("");
  const [entityType, setEntityType] = useState("ทั้งหมด");
  const [action, setAction] = useState("ทั้งหมด");

  const filtered = useMemo(() => {
    return entries.filter((l) => {
      if (entityType !== "ทั้งหมด" && l.entityType !== entityType) return false;
      if (action !== "ทั้งหมด" && l.action !== action) return false;
      if (search) {
        const q = search.toLowerCase();
        return [
          l.action,
          l.actorEmail ?? "",
          l.actorName ?? "",
          l.entityId,
        ].some((f) => f.toLowerCase().includes(q));
      }
      return true;
    });
  }, [entries, search, entityType, action]);

  // Group entries by entity type for the stat cards at the top.
  const stats = Object.entries(ENTITY_META).map(([key, meta]) => ({
    key,
    label: meta.label,
    icon: meta.icon,
    count: entries.filter((e) => e.entityType === key).length,
  }));

  return (
    <>
      <section className="mb-6 grid grid-cols-3 gap-3 md:grid-cols-5">
        {stats.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setEntityType(s.key)}
            className={`rounded-xl border p-3 text-left transition-colors ${
              entityType === s.key
                ? "border-primary bg-primary-soft"
                : "border-border bg-card hover:border-primary/40"
            }`}
          >
            <s.icon className="mb-1.5 h-4 w-4 text-primary" />
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-lg font-bold">{s.count}</p>
          </button>
        ))}
      </section>

      <section className="mb-4 grid grid-cols-1 gap-3 rounded-xl border border-border bg-card p-4 shadow-sm md:grid-cols-[1fr_180px_180px_auto_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาด้วยผู้ใช้, action, หรือ entity ID"
            className="pl-9"
          />
        </div>
        <Select value={entityType} onChange={(e) => setEntityType(e.target.value)}>
          <option>ทั้งหมด</option>
          {Object.entries(ENTITY_META).map(([key, meta]) => (
            <option key={key} value={key}>
              {meta.label}
            </option>
          ))}
        </Select>
        <Select value={action} onChange={(e) => setAction(e.target.value)}>
          <option>ทั้งหมด</option>
          {Object.entries(ACTION_LABEL).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </Select>
        <Button variant="outline">
          <Filter className="h-4 w-4" />
          ตัวกรองเพิ่ม
        </Button>
        <Button variant="outline">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </section>

      <section className="rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2.5">เวลา</th>
                <th className="px-3 py-2.5">ผู้กระทำ</th>
                <th className="px-3 py-2.5">การกระทำ</th>
                <th className="px-3 py-2.5">หมวด</th>
                <th className="px-3 py-2.5">เป้าหมาย</th>
                <th className="px-3 py-2.5">รายละเอียด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((l) => {
                const meta = ENTITY_META[l.entityType] ?? ENTITY_META.system;
                return (
                  <tr key={l.id} className="hover:bg-muted/40">
                    <td className="px-3 py-3 font-mono text-xs text-muted-foreground">
                      {l.createdAt.replace("T", " ").slice(0, 19)}
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-medium">{l.actorName ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        {l.actorEmail ?? "ระบบ"}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1.5">
                        <ActionPill action={l.action} />
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <Badge tone="neutral">
                        <span className="inline-flex items-center gap-1">
                          <meta.icon className="h-3 w-3" />
                          {meta.label}
                        </span>
                      </Badge>
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-muted-foreground">
                      {l.entityId.slice(0, 8)}…
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">
                      {l.diff && Object.keys(l.diff).length > 0 ? (
                        <code className="rounded bg-muted px-1 py-0.5">
                          {JSON.stringify(l.diff).slice(0, 80)}
                        </code>
                      ) : (
                        <span>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-10 text-center text-sm text-muted-foreground"
                  >
                    ไม่พบรายการที่ตรงกับเงื่อนไข
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <footer className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground">
          <span>
            แสดง <span className="font-semibold text-foreground">{filtered.length}</span> /{" "}
            {entries.length} รายการ
          </span>
        </footer>
      </section>

      <div className="mt-4 flex items-center justify-between rounded-lg border border-info/30 bg-info-soft p-3 text-xs text-info">
        <span className="flex items-center gap-2">
          <Trash2 className="h-3.5 w-3.5" />
          ระบบจะลบล็อกที่เก่ากว่า 90 วันอัตโนมัติ
        </span>
        <a href="#" className="font-semibold hover:underline">
          เปลี่ยนนโยบาย →
        </a>
      </div>
    </>
  );
}

function ActionPill({ action }: { action: string }) {
  const label = ACTION_LABEL[action] ?? action;
  const tone =
    action === "approve" || action === "restore" || action === "create"
      ? "bg-success-soft text-success"
      : action === "reject" || action === "suspend" || action === "delete"
        ? "bg-danger-soft text-danger"
        : "bg-muted text-foreground";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${tone}`}
    >
      <CheckCircle2 className="h-3 w-3" />
      {label}
    </span>
  );
}
