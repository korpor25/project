import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { articles, getArticle } from "@/lib/articles";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.csexhibition.com";

type Params = { slug: string };

// Pre-render every article at build time.
export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(decodeURIComponent(slug));
  if (!article) return {};

  const canonical = `/articles/${encodeURIComponent(article.slug)}`;
  return {
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.description,
      url: canonical,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      images: [{ url: article.cover }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
      images: [article.cover],
    },
  };
}

function formatThaiDate(iso: string) {
  return new Date(iso).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const article = getArticle(decodeURIComponent(slug));
  if (!article) notFound();

  // Article structured data helps Google render rich results.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    image: `${siteUrl}${article.cover}`,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: { "@type": "Organization", name: "CS Exhibition" },
    publisher: {
      "@type": "Organization",
      name: "CS Exhibition",
      logo: { "@type": "ImageObject", url: `${siteUrl}/hero.jpg` },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/articles/${encodeURIComponent(article.slug)}`,
    },
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/articles"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        กลับไปหน้าบทความ
      </Link>

      <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
        {article.title}
      </h1>
      <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
        <span>{formatThaiDate(article.publishedAt)}</span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-4 w-4" />
          อ่าน {article.readingMinutes} นาที
        </span>
      </div>

      <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-2xl">
        <Image
          src={article.cover}
          alt={article.title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover"
        />
      </div>

      <div className="mt-8 space-y-5">
        {article.body.map((block, i) => {
          if (block.type === "heading") {
            return (
              <h2 key={i} className="pt-2 text-xl font-bold sm:text-2xl">
                {block.text}
              </h2>
            );
          }
          if (block.type === "list") {
            return (
              <ul
                key={i}
                className="list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-foreground/90"
              >
                {block.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            );
          }
          return (
            <p
              key={i}
              className="text-[15px] leading-relaxed text-foreground/90"
            >
              {block.text}
            </p>
          );
        })}
      </div>

      {/* Conversion CTA — turns readers into bookings. */}
      <div className="mt-12 rounded-2xl bg-muted/50 p-6 text-center">
        <p className="text-lg font-semibold">พร้อมเริ่มจองพื้นที่แล้วหรือยัง?</p>
        <p className="mt-1 text-sm text-muted-foreground">
          ดูบูธว่าง เปรียบเทียบราคา และจองได้ในที่เดียว
        </p>
        <Link
          href="/events"
          className="mt-4 inline-flex h-12 items-center justify-center rounded-md bg-primary px-6 text-base font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          ดูพื้นที่ว่างทั้งหมด
        </Link>
      </div>
    </article>
  );
}
 