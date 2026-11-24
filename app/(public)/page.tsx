import type { Metadata } from "next";
import { EventsHighlight } from "@/components/landing/EventsHighlight";
import { FAQ } from "@/components/landing/FAQ";
import { Hero } from "@/components/landing/Hero";
import { PartnerMalls } from "@/components/landing/PartnerMalls";
import { RecommendedBooths } from "@/components/landing/RecommendedBooths";
import { StepsFlow } from "@/components/landing/StepsFlow";
import { CONTACT } from "@/lib/contact";
import { createClient } from "@/lib/supabase/server";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.csexhibition.com";

export const metadata: Metadata = {
  // Overrides the root default so the landing page leads with what people
  // search for rather than the product name.
  title: {
    absolute: "เช่าพื้นที่ขายของในห้าง ออกบูธงานแสดงสินค้า | CS Exhibition",
  },
  description:
    "หาทำเลขายของในศูนย์การค้าทั่วประเทศ เช่าพื้นที่ ออกบูธขายสินค้า จัดงานอีเว้นท์และงานแสดงสินค้า ดูพื้นที่ว่าง เปรียบเทียบราคา จองออนไลน์ได้ทันที",
  alternates: { canonical: "/" },
};


export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Tells search engines what the business is and what it sells, in the shape
  // they expect. Plain metadata cannot express services or service area.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "CS Exhibition Management",
    description:
      "ผู้ให้บริการเช่าพื้นที่ขายของในห้าง ออกบูธงานแสดงสินค้า และรับจัดงานอีเว้นท์ในศูนย์การค้าทั่วประเทศ",
    url: siteUrl,
    telephone: CONTACT.mobile.display,
    email: CONTACT.email.display,
    address: {
      "@type": "PostalAddress",
      streetAddress: CONTACT.address.display,
      addressCountry: "TH",
    },
    areaServed: { "@type": "Country", name: "ประเทศไทย" },
    knowsAbout: [
      "เช่าพื้นที่ในห้าง",
      "ทำเลขายของ",
      "ออกบูธ",
      "บูธขายสินค้า",
      "งานแสดงสินค้า",
      "งานอีเว้นท์",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero isLoggedIn={!!user} />
      <RecommendedBooths isLoggedIn={!!user} />
      <EventsHighlight />
      <StepsFlow />
      <FAQ />
      <PartnerMalls />
    </>
  );
}
