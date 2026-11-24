// Gallery for the About page, grouped one folder per mall.
//
// The 30 files in public/gallery/ are LINE exports named S__4513xxxx. They fall
// into five runs of exactly six, separated by gaps in the numbering (043-044,
// 051, 058) — one run per event. The venue for each run was identified from
// signage visible in the photos, not from the file order, which does NOT match
// the order the screenshots were sent in:
//
//   S__45146115-120  เปิดสำรับความอร่อย arch  -> เซ็นทรัลพิษณุโลก
//   S__45138052-057  Big C green signage + KFC -> บิ๊กซีเพชรบุรี
//   S__45138045-050  pink/purple striped booths -> เซ็นทรัลเชียงใหม่แอร์พอร์ต
//   S__45138059-064  "Chill Market" + planting  -> มาร์เก็ตวิลเลจสุวรรณภูมิ
//   S__45138037-042  CENTRAL CHIANGMAI billboard, Cuisine Market -> เซ็นทรัลเฟสติวัลเชียงใหม่
//
// Uploading from the admin screen will replace this file once the backend
// gallery endpoints exist — see the contract note in lib/api/admin.ts.

export type GalleryImage = {
  src: string; // path under /public
  caption: string;
};

export type GalleryVenue = {
  slug: string;
  name: string;
  province?: string;
  /** ISO yyyy-mm-dd. Omitted when the event dates aren't recorded. */
  startDate?: string;
  endDate?: string;
  /** Shown on the folder card; defaults to the first image if omitted. */
  cover?: string;
  images: GalleryImage[];
};

// Generic scene captions cycled across each run — the individual shots have
// never been labelled. Prefixed with the venue so alt text stays distinct.
const CAPTIONS = [
  "บรรยากาศงานอีเวนต์ในศูนย์การค้า",
  "โซนบูธแฟชั่นและไลฟ์สไตล์",
  "พื้นที่จัดแสดงสินค้าใจกลางห้าง",
  "บูธอาหารและเครื่องดื่ม",
  "กิจกรรมโปรโมชันหน้าร้าน",
  "ทำเลทางเข้าที่มีผู้คนพลุกพล่าน",
];

function toImages(venueName: string, files: string[]): GalleryImage[] {
  return files.map((file, i) => ({
    src: `/gallery/${file}`,
    caption: `${venueName} — ${CAPTIONS[i % CAPTIONS.length]}`,
  }));
}

// Newest event first; the undated one sits last.
export const galleryVenues: GalleryVenue[] = [
  {
    slug: "central-chiangmai-airport",
    name: "เซ็นทรัล เชียงใหม่ แอร์พอร์ต",
    province: "เชียงใหม่",
    startDate: "2026-06-25",
    endDate: "2026-07-02",
    images: toImages("เซ็นทรัล เชียงใหม่ แอร์พอร์ต", [
      "S__45138045_0.jpg",
      "S__45138046_0.jpg",
      "S__45138047_0.jpg",
      "S__45138048_0.jpg",
      "S__45138049_0.jpg",
      "S__45138050_0.jpg",
    ]),
  },
  {
    slug: "bigc-phetchaburi",
    name: "บิ๊กซี เพชรบุรี",
    province: "เพชรบุรี",
    startDate: "2026-06-01",
    endDate: "2026-06-30",
    images: toImages("บิ๊กซี เพชรบุรี", [
      "S__45138052_0.jpg",
      "S__45138053_0.jpg",
      "S__45138054_0.jpg",
      "S__45138055_0.jpg",
      "S__45138056_0.jpg",
      "S__45138057_0.jpg",
    ]),
  },
  {
    slug: "market-village-suvarnabhumi",
    name: "มาร์เก็ตวิลเลจ สุวรรณภูมิ",
    province: "สมุทรปราการ",
    startDate: "2026-05-01",
    endDate: "2026-05-16",
    images: toImages("มาร์เก็ตวิลเลจ สุวรรณภูมิ", [
      "S__45138059_0.jpg",
      "S__45138060_0.jpg",
      "S__45138061_0.jpg",
      "S__45138062_0.jpg",
      "S__45138063_0.jpg",
      "S__45138064_0.jpg",
    ]),
  },
  {
    slug: "central-phitsanulok",
    name: "เซ็นทรัล พิษณุโลก",
    province: "พิษณุโลก",
    startDate: "2026-03-28",
    endDate: "2026-04-06",
    images: toImages("เซ็นทรัล พิษณุโลก", [
      "S__45146115_0.jpg",
      "S__45146116_0.jpg",
      "S__45146117_0.jpg",
      "S__45146118_0.jpg",
      "S__45146119_0.jpg",
      "S__45146120_0.jpg",
    ]),
  },
  {
    slug: "central-festival-chiangmai",
    name: "เซ็นทรัล เฟสติวัล เชียงใหม่",
    province: "เชียงใหม่",
    images: toImages("เซ็นทรัล เฟสติวัล เชียงใหม่", [
      "S__45138037_0.jpg",
      "S__45138038_0.jpg",
      "S__45138039_0.jpg",
      "S__45138040_0.jpg",
      "S__45138041_0.jpg",
      "S__45138042_0.jpg",
    ]),
  },
];

export function getGalleryVenue(slug: string): GalleryVenue | undefined {
  return galleryVenues.find((v) => v.slug === slug);
}

export function venueCover(v: GalleryVenue): string {
  return v.cover ?? v.images[0]?.src ?? "/hero.jpg";
}

/** Every photo, ungrouped — for anything that wants the whole set. */
export const galleryImages: GalleryImage[] = galleryVenues.flatMap(
  (v) => v.images,
);
