"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { GalleryImage } from "@/lib/gallery";

export function GalleryGrid({ images }: { images: GalleryImage[] }) {
  // null = lightbox closed; number = index of the open image.
  const [active, setActive] = useState<number | null>(null);

  const close = useCallback(() => setActive(null), []);
  const show = useCallback(
    (dir: 1 | -1) =>
      setActive((cur) =>
        cur === null ? cur : (cur + dir + images.length) % images.length,
      ),
    [images.length],
  );

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") show(1);
      if (e.key === "ArrowLeft") show(-1);
    };
    window.addEventListener("keydown", onKey);
    // Lock background scroll while the lightbox is open.
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active, close, show]);

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {images.map((img, i) => (
          <li key={img.src}>
            <button
              type="button"
              onClick={() => setActive(i)}
              className="group relative block aspect-square w-full overflow-hidden rounded-xl bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              aria-label={`ดูรูป: ${img.caption}`}
            >
              <Image
                src={img.src}
                alt={img.caption}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-left text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                {img.caption}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {active !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="แกลเลอรีรูปภาพ"
        >
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="ปิด"
          >
            <X className="h-6 w-6" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              show(-1);
            }}
            className="absolute left-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="รูปก่อนหน้า"
          >
            <ChevronLeft className="h-7 w-7" />
          </button>

          {/* Stop propagation so clicking the image itself doesn't close. */}
          <figure
            className="relative max-h-[85vh] w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative mx-auto aspect-[16/10] w-full">
              <Image
                src={images[active].src}
                alt={images[active].caption}
                fill
                sizes="100vw"
                className="rounded-lg object-contain"
                priority
              />
            </div>
            <figcaption className="mt-3 text-center text-sm text-white/80">
              {images[active].caption}
            </figcaption>
          </figure>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              show(1);
            }}
            className="absolute right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="รูปถัดไป"
          >
            <ChevronRight className="h-7 w-7" />
          </button>
        </div>
      )}
    </>
  );
}
 