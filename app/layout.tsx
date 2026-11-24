import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Geist, Noto_Sans_Thai } from "next/font/google";
import { Providers } from "@/components/shared/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const notoThai = Noto_Sans_Thai({
  variable: "--font-noto-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.csexhibition.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CS Exhibition — จองพื้นที่บูธและอีเวนต์ในศูนย์การค้า",
    template: "%s | CS Exhibition",
  },
  description:
    "เช่าพื้นที่ขายของในห้างและออกบูธงานแสดงสินค้า ค้นหาทำเลขายของในศูนย์การค้าทั่วประเทศ เปรียบเทียบราคา จองและชำระเงินอย่างปลอดภัย ครบจบในระบบเดียว",
  // Search terms customers actually type. Thai spelling of loanwords varies a
  // lot, so the common variants of "organize" and "event" are all listed —
  // they are different queries to a search engine, not typos to fix.
  keywords: [
    "เช่าพื้นที่",
    "เช่าพื้นที่ในห้าง",
    "เช่าพื้นที่ขายของในห้าง",
    "พื้นที่ขายของ",
    "ขายของในห้าง",
    "ทำเลขายของ",
    "หาทำเลขายของ",
    "ออกบูธ",
    "ออกบูธ event",
    "บูธขายสินค้า",
    "จองบูธห้าง",
    "เช่าบูธงานอีเวนต์",
    "พื้นที่เช่าในศูนย์การค้า",
    "งานแสดงสินค้า",
    "งานอีเว้นท์",
    "ออกแกไนซ์",
    "ออแกไนท์",
  ],
  openGraph: {
    type: "website",
    locale: "th_TH",
    siteName: "CS Exhibition",
    url: siteUrl,
    title: "CS Exhibition — เช่าพื้นที่ขายของในห้าง ออกบูธงานแสดงสินค้า",
    description:
      "หาทำเลขายของในศูนย์การค้าทั่วประเทศ เช่าพื้นที่ ออกบูธ จัดงานอีเว้นท์ เปรียบเทียบราคาและจองออนไลน์ได้ทันที",
    images: [{ url: "/hero.jpg", width: 1706, height: 960, alt: "CS Exhibition" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CS Exhibition — เช่าพื้นที่ขายของในห้าง ออกบูธงานแสดงสินค้า",
    description:
      "หาทำเลขายของในศูนย์การค้าทั่วประเทศ เช่าพื้นที่ ออกบูธ จัดงานอีเว้นท์ เปรียบเทียบราคาและจองออนไลน์ได้ทันที",
    images: ["/hero.jpg"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${notoThai.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
 