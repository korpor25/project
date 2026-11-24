import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Gift, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { fetchEvents } from "@/lib/api/events";
import { coverStyle } from "@/lib/eventCover";
import { formatTHB } from "@/lib/pricing";

export async function Hero({ isLoggedIn }: { isLoggedIn: boolean }) {
  // First open/upcoming event populates the featured card. Falls back to a
  // simple "browse all" link when the DB is empty.
  const events = await fetchEvents();
  const featured = events.find((e) => e.status === "OPEN") ?? events[0];
  const featuredCard = featured
    ? {
        slug: featured.slug,
        nameTh: featured.nameTh,
        branch: featured.branch,
        category: featured.category,
        startingPrice: featured.startingPrice,
        cover: featured.cover,
        coverTone: featured.coverTone,
        remainingBooths: featured.remainingBooths,
        totalBooths: featured.totalBooths,
      }
    : null;

  return (
    <section className="relative isolate overflow-hidden bg-navy text-white">
      {/* Background photo — drop your image at public/hero.jpg. Falls back to
          the navy background + overlay if the file is missing. */}
      <Image
        src="/hero.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover"
        aria-hidden
      />
      {/* Dark gradient overlay keeps the white headline readable over any photo. */}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-br from-navy/90 via-navy/70 to-[#4a5a7e]/55"
        aria-hidden
      />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:gap-8 sm:px-6 sm:py-16 lg:grid lg:grid-cols-[1fr_360px] lg:px-8 lg:py-24">
        <div>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            จองพื้นที่ขายในห้าง &amp; Event
            <br />
            ครบจบในระบบเดียว
          </h1>
          <p className="mt-4 max-w-xl text-sm text-white/80 sm:text-base">
            หาทำเลขายของในศูนย์การค้าทั่วประเทศ • เช่าพื้นที่และออกบูธขายสินค้า •
            เปรียบเทียบราคา จองและชำระเงินอย่างปลอดภัย
          </p>

          {/* Only for signed-out visitors — a signup pitch aimed at someone
              already holding an account is noise. */}
          {!isLoggedIn && <FreeSignupBanner />}
        </div>

        <FeaturedBoothCard isLoggedIn={isLoggedIn} event={featuredCard} />

        {/* Search sits under the featured card on phones — someone who came to
            browse sees a real listing before a row of empty dropdowns. On lg it
            drops back into the left column, under the headline. */}
        <form
          action="/events"
          method="get"
          className="grid gap-3 rounded-xl bg-white p-3 shadow-lg sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-center lg:col-start-1"
        >
            <select
              name="province"
              defaultValue=""
              className="h-11 rounded-md border border-border bg-card px-3 text-sm text-foreground"
            >
              <option value="">จังหวัดทั้งหมด</option>
              <option value="กรุงเทพ">กรุงเทพ</option>
              <option value="นนทบุรี">นนทบุรี</option>
              <option value="ปทุมธานี">ปทุมธานี</option>
              <option value="ชลบุรี">ชลบุรี</option>
            </select>
            <select
              name="category"
              defaultValue=""
              className="h-11 rounded-md border border-border bg-card px-3 text-sm text-foreground"
            >
              <option value="">หมวดหมู่ทั้งหมด</option>
              <option value="Fashion">Fashion</option>
              <option value="Food">Food</option>
              <option value="Beauty">Beauty</option>
              <option value="Lifestyle">Lifestyle</option>
              <option value="Tech">Tech</option>
            </select>
            <select
              name="status"
              defaultValue=""
              className="h-11 rounded-md border border-border bg-card px-3 text-sm text-foreground"
            >
              <option value="">สถานะทั้งหมด</option>
              <option value="OPEN">เปิดรับจอง</option>
              <option value="UPCOMING">เร็วๆ นี้</option>
            </select>
            <Button type="submit" size="lg" className="w-full sm:w-auto">
              <Search className="h-4 w-4" />
              ค้นหา
            </Button>
        </form>
      </div>
    </section>
  );
}

/** Verified against what the product does today — see the banner comment. */
const BENEFITS = [
  "ดูราคาพื้นที่ได้ทันที",
  "จองบูธออนไลน์ด้วยตัวเอง",
  "ติดตามสถานะการจองได้ตลอด",
];

/**
 * Signup pitch that sits between the headline and the search bar.
 *
 * The three benefits are the ones the product actually delivers today: prices
 * are masked until sign-in, booking needs an account, and "การจองของฉัน"
 * tracks status. Nothing here promises a feature that does not exist.
 */
function FreeSignupBanner() {
  return (
    <div className="mt-6 rounded-2xl border border-primary/40 bg-gradient-to-r from-[#fdf7e8] to-[#f6e9cd] p-4 text-foreground shadow-lg sm:mt-8 sm:flex sm:items-center sm:gap-5 sm:p-5">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary-hover sm:h-11 sm:w-11 sm:rounded-xl"
          aria-hidden
        >
          <Gift className="h-5 w-5 sm:h-6 sm:w-6" />
        </span>

        <div className="min-w-0">
        <p className="font-bold leading-tight sm:text-lg">
          สมัครสมาชิก<span className="text-danger">ฟรี</span>{" "}
          <span className="text-sm font-medium text-muted-foreground">
            ไม่มีค่าใช้จ่าย
          </span>
        </p>
        {/* One benefit per line on phones — the same three run together as a
            dot-separated string wraps mid-phrase at 390px and reads as mush. */}
        <ul className="mt-1.5 space-y-0.5 text-xs text-muted-foreground sm:mt-1 sm:flex sm:flex-wrap sm:gap-x-4 sm:space-y-0 sm:text-sm">
          {BENEFITS.map((b) => (
            <li key={b} className="flex items-start gap-1.5">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-hover" aria-hidden />
              {b}
            </li>
          ))}
        </ul>
        </div>
      </div>

      <Link href="/register" className="mt-3 block shrink-0 sm:mt-0">
        <Button size="lg" className="w-full sm:w-auto">
          สมัครเลยวันนี้
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}

function FeaturedBoothCard({
  event,
  isLoggedIn,
}: {
  event: {
    slug: string;
    nameTh: string;
    branch: string;
    category: string;
    startingPrice: number;
    cover?: string;
    coverTone: string;
    remainingBooths: number;
    totalBooths: number;
  } | null;
  isLoggedIn: boolean;
}) {
  if (!event) {
    return (
      <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-2xl bg-white text-foreground shadow-2xl lg:mt-12">
        <div
          className="aspect-[16/10] w-full lg:aspect-[4/3]"
          style={{ background: "linear-gradient(135deg, #dcd0b2, #a48d5f)" }}
          aria-hidden
        />
        <div className="p-5 text-center">
          <p className="text-sm text-muted-foreground">ยังไม่มีอีเวนต์เปิดรับจอง</p>
          <Link
            href="/events"
            className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
          >
            ดูอีเวนต์ทั้งหมด →
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-2xl bg-white text-foreground shadow-2xl lg:mt-12">
      <div
        className="aspect-[16/10] w-full lg:aspect-[4/3]"
        style={coverStyle(event)}
        aria-hidden
      />
      <div className="p-5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {event.branch} • {event.category}
        </p>
        <p className="mt-1 text-lg font-bold">{event.nameTh}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {event.remainingBooths} / {event.totalBooths} บูธว่าง
        </p>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-foreground">เริ่มต้น</p>
            {isLoggedIn ? (
              <p className="text-2xl font-bold text-primary">
                {formatTHB(event.startingPrice)}
              </p>
            ) : (
              <p className="text-sm font-medium text-primary">เข้าสู่ระบบเพื่อดูราคา</p>
            )}
          </div>
          <Link
            href={`/events/${event.slug}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            ดูรายละเอียด →
          </Link>
        </div>
      </div>
    </div>
  );
}
 