// Returns the inline `style` props needed to paint an event's cover area:
// real uploaded image when available, falling back to the per-category
// linear-gradient placeholder. Used by EventHero, EventCard, landing hero,
// admin lists — anywhere we display an event thumbnail/banner.
export function coverStyle(event: {
  cover?: string;
  coverTone: string;
}): React.CSSProperties {
  if (event.cover) {
    return {
      backgroundImage: `url(${event.cover})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  return { background: event.coverTone };
}
