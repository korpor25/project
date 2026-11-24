// Photos for the "ห้างพันธมิตร" cards on the landing page.
//
// Those cards are generated from the live event branch names (`ev.branch`),
// so we can't hard-key on an exact string — the DB might store a slightly
// different spacing/case than the filenames. We match on a normalized key
// (lowercased, whitespace removed) so small formatting differences still hit.
//
// Files live in public/mall/. To add a mall, drop the image there and add a
// row below keyed by the mall's display name (as it appears on the card).

// Keys are the branchName strings exactly as the backend stores them (Thai) —
// matched whitespace/case-insensitively, so minor spacing differences still hit.
const MALL_PHOTOS: Record<string, string> = {
  "มาร์เก็ตรังสิต": "/mall/market-village-rangsit.jpg",
  "มาร์เก็ตวิลเลจ กิ่งแก้ว": "/mall/market-village-kingkaeo.jpg",
  "หัวหิน มาร์เก็ตวิลเลจ": "/mall/market-village-hua-hin.jpg",
  "ห้างเสริมไทย มหาสารคาม": "/mall/sermthai-complex-mahasarakham.jpg",
  "เซ็นทรัลพิษณุโลก": "/mall/central-phitsanulok.jpg",
  "โรบินสันไลฟ์สไตล์ ปราจีนบุรี": "/mall/robinson-lifestyle-prachinburi.jpg",
  "โรบินสันไลฟ์สไตล์ มุกดาหาร": "/mall/robinson-lifestyle-mukdahan.jpg",
  "ไอซีเอส": "/mall/ics-bangkok.jpg",
  // No event uses these branches right now — kept ready for when one is added.
  "ไอคอนสยาม": "/mall/iconsiam-bangkok.jpg",
  "มาร์เก็ตวิลเลจ กำแพงเพชร": "/mall/market-village-kamphaeng-phet.jpg",
};

/** Lowercase and strip whitespace so "Market Village  Rangsit" == "market village rangsit". */
function normalize(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "");
}

// Pre-normalize the map once so lookups are O(1) and tolerant of spacing/case.
const BY_NORMALIZED: Record<string, string> = Object.fromEntries(
  Object.entries(MALL_PHOTOS).map(([name, src]) => [normalize(name), src]),
);

/** Returns the photo path for a mall/branch name, or undefined if none exists. */
export function mallImage(name: string): string | undefined {
  return BY_NORMALIZED[normalize(name)];
}
