// Single source of truth for the company's public contact details.
//
// These used to be retyped in the footer, the floating contact button and the
// contact page, and had already drifted: the floating button dialled
// 02 123 4567 and mailed contact@cs-exhibition.com, neither of which is real.

const MOBILE_DISPLAY = "086-3141367";
const OFFICE_DISPLAY = "02 279 2884";
const EMAIL = "s_nongnurse@hotmail.com";
const LINE_ID = "0863141367";
const ADDRESS = "238/2 ถ.พระรามที่ 6 ซอย 28 แขวงพญาไท เขตพญาไท กทม 10400";
const FACEBOOK_PAGE = "csexhibition";
const TIKTOK_HANDLE = "cs_exhibition_888";

/** "086-3141367" -> "tel:+66863141367" so the dialler also works from abroad. */
function telHref(display: string) {
  return `tel:+66${display.replace(/\D/g, "").replace(/^0/, "")}`;
}

export const CONTACT = {
  /** The number on the company's own banners — the one customers should use. */
  mobile: { display: MOBILE_DISPLAY, href: telHref(MOBILE_DISPLAY) },
  office: { display: OFFICE_DISPLAY, href: telHref(OFFICE_DISPLAY) },
  email: { display: EMAIL, href: `mailto:${EMAIL}` },
  line: {
    display: LINE_ID,
    // "~" is LINE's add-friend prefix for a plain LINE ID. Official accounts
    // use "@id" instead — swap the prefix if this ever becomes an OA.
    href: `https://line.me/R/ti/p/~${LINE_ID}`,
  },
  address: {
    display: ADDRESS,
    href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}`,
  },
} as const;

/**
 * Public social profiles, in the order they should appear.
 *
 * Built from the handle rather than pasted whole: the URL copied out of a
 * browser carries `?is_from_webapp=1&sender_device=pc`, which is TikTok's own
 * session tracking and says nothing about the visitor we send. Dropping it
 * keeps the link clean and it resolves identically.
 */
export const SOCIAL_LINKS = [
  {
    key: "facebook",
    label: "Facebook",
    href: `https://www.facebook.com/${FACEBOOK_PAGE}`,
  },
  {
    key: "tiktok",
    label: "TikTok",
    href: `https://www.tiktok.com/@${TIKTOK_HANDLE}`,
  },
] as const;

export const CONTACT_EMAIL = EMAIL;

/** Reasons people actually write in about, used by the contact form. */
export const CONTACT_TOPICS = [
  "สอบถามพื้นที่ว่างและราคา",
  "ขอใบเสนอราคา",
  "ติดตามสถานะการจอง",
  "แจ้งปัญหาการใช้งานระบบ",
  "เรื่องอื่น ๆ",
] as const;
