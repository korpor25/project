"use client";

import { Upload, X, FileText } from "lucide-react";
import { useRef, useState, type DragEvent, type ChangeEvent } from "react";
import { cn } from "@/lib/utils";

export type FileDropzoneProps = {
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  label?: string;
  hint?: string;
  value?: File[];
  onChange?: (files: File[]) => void;
  className?: string;
};

export function FileDropzone({
  accept = "image/jpeg,image/png,application/pdf",
  multiple = false,
  maxSizeMB = 5,
  label = "อัปโหลดไฟล์",
  hint,
  value = [],
  onChange,
  className,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    setError(null);
    const arr = Array.from(files);
    for (const f of arr) {
      if (f.size > maxSizeMB * 1024 * 1024) {
        setError(`ไฟล์ต้องไม่เกิน ${maxSizeMB} MB`);
        return;
      }
    }
    onChange?.(multiple ? [...value, ...arr] : arr.slice(0, 1));
  };

  const remove = (idx: number) => {
    onChange?.(value.filter((_, i) => i !== idx));
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const onSelect = (e: ChangeEvent<HTMLInputElement>) => handleFiles(e.target.files);

  const formatsHint = hint ?? `${accept.replaceAll("/", " ").replaceAll(",", ", ")} • ไม่เกิน ${maxSizeMB} MB`;

  return (
    <div className={cn("space-y-2", className)}>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/30 px-4 py-8 text-center transition-colors",
          dragging ? "border-primary bg-primary-soft/50" : "border-border hover:border-primary/60",
        )}
        role="button"
        tabIndex={0}
      >
        <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-1 text-xs text-muted-foreground">{formatsHint}</p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={onSelect}
        />
      </div>

      {error && <p className="text-xs text-danger">{error}</p>}

      {value.length > 0 && (
        <ul className="space-y-1">
          {value.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-sm"
            >
              <span className="flex items-center gap-2 truncate">
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{f.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({(f.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </span>
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-muted-foreground hover:text-danger"
                aria-label="ลบไฟล์"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
