// Config for the first-visit welcome popup.
//
// Everything the popup needs lives here so turning it on, swapping the clip or
// switching it off never means touching component code.

export const WELCOME_MODAL = {
  /**
   * Local clip served from public/ — e.g. "/welcome.mp4".
   * Leave null to use `embedUrl` instead, or leave both null to disable.
   */
  videoSrc: "/welcome.mp4" as string | null,

  /** Optional still shown before the clip loads — e.g. "/welcome-poster.jpg". */
  poster: null as string | null,

  /**
   * Embed URL for a hosted clip (YouTube / Facebook / Vimeo).
   * Use the *embed* form, not the page URL:
   *   YouTube  https://www.youtube.com/embed/VIDEO_ID
   *   Facebook https://www.facebook.com/plugins/video.php?href=<encoded post url>
   * `videoSrc` wins if both are set.
   */
  embedUrl: null as string | null,

  title: "ยินดีต้อนรับสู่ CS Exhibition",
  description:
    "ดูวิธีจองพื้นที่บูธในศูนย์การค้าแบบครบทุกขั้นตอนภายในคลิปเดียว",

  /**
   * Bump this when the clip changes and everyone should see the new one —
   * visitors who dismissed v1 get shown v2 once.
   */
  version: "v1",
} as const;

/** True when there is actually something to play. */
export function isWelcomeModalEnabled(): boolean {
  return Boolean(WELCOME_MODAL.videoSrc || WELCOME_MODAL.embedUrl);
}

/** localStorage key, versioned so a new clip can re-open the popup. */
export const WELCOME_SEEN_KEY = `cs-welcome-seen-${WELCOME_MODAL.version}`;
