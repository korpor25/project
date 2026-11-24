"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isOffline =
    error.message?.includes("fetch failed") ||
    error.message?.includes("ECONNREFUSED") ||
    error.message?.includes("SERVICE_UNAVAILABLE") ||
    error.message?.includes("ไม่สามารถเชื่อมต่อ");

  return (
    <div className="flex flex-1 items-center justify-center p-10">
      <div className="mx-auto max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-warning-soft">
          <AlertTriangle className="h-6 w-6 text-warning" />
        </div>
        <h2 className="text-lg font-semibold">
          {isOffline ? "ไม่สามารถเชื่อมต่อ API ได้" : "เกิดข้อผิดพลาด"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {isOffline
            ? "Backend server ยังไม่ได้รัน กรุณาเริ่มต้น Go API แล้วลองใหม่"
            : error.message}
        </p>
        {error.digest && (
          <p className="mt-1 font-mono text-xs text-muted-foreground">#{error.digest}</p>
        )}
        <Button className="mt-6" onClick={reset}>
          <RefreshCw className="h-4 w-4" />
          ลองใหม่
        </Button>
      </div>
    </div>
  );
}
 