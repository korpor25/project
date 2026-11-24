import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { articles } from "@/lib/articles";

export const metadata: Metadata = {
  title: "บทความและความรู้",
  description:
    "รวมบทความ เคล็ดลับ และคู่มือเกี่ยวกับการเช่าพื้นที่ขายของในห้าง การออกบูธงานอีเวนต์ และการจองพื้นที่ในศูนย์การค้า",
  alternates: { canonical: "/articles" },
};

function formatThaiDate(iso: string) {
  return new Date(iso).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ArticlesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-bold sm:text-4xl">บทความและความรู้</h1>
        <p className="mt-3 text-muted-foreground">
          เคล็ดลับและคู่มือสำหรับผู้เช่าพื้นที่ — ตั้งแต่การเลือกทำเล เตรียมเอกสาร
          ไปจนถึงการออกบูธให้ขายดี
        </p>
      </header>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {articles.map((a) => (
          <Link
            key={a.slug}
            href={`/articles/${encodeURIComponent(a.slug)}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-md"
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              <Image
                src={a.cover}
                alt={a.title}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{formatThaiDate(a.publishedAt)}</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {a.readingMinutes} นาที
                </span>
              </div>
              <h2 className="mt-2 text-lg font-bold leading-snug group-hover:text-primary">
                {a.title}
              </h2>
              <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">
                {a.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                อ่านบทความ
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
 