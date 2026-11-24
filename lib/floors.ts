// Floor labels for the admin pickers.
//
// A branch only stores `floorCount` (how many above-ground floors it has), so
// anything outside that range — basements (B1, B2), mezzanines, named decks —
// can't be derived from it. Those are typed in by hand via the "กำหนดเอง"
// option, which is why every floor picker keeps a free-text escape hatch.

/** Sentinel `<option>` value that switches a floor picker to free text. */
export const CUSTOM_FLOOR = "__custom__";

export function buildFloorOptions(floorCount: number): string[] {
  const n = Math.max(0, Math.floor(floorCount || 0));
  return ["ชั้น G", ...Array.from({ length: n }, (_, i) => `ชั้น ${i + 1}`)];
}

/** True when `floor` is a hand-typed value rather than one of the branch's floors. */
export function isCustomFloor(floor: string, options: string[]): boolean {
  return !options.includes(floor);
}

/**
 * Events store branch + floor as one `zoneArea` string ("Branch • Floor"), which
 * `fetchEventDuplicatePrefill` splits back apart on the bullet. Joining here
 * keeps the separator out of the string when either half is missing.
 */
export function formatZoneArea(branchName: string | undefined, floor: string): string {
  return [branchName?.trim(), floor.trim()].filter(Boolean).join(" • ");
}

/**
 * Inverse of `formatZoneArea`. A zoneArea without the bullet is treated as the
 * floor alone — that's how hand-typed values ("ชั้น 1") were stored before the
 * edit form gained a branch picker.
 */
export function parseZoneArea(zoneArea: string): { branchName: string; floor: string } {
  const parts = zoneArea.split("•").map((s) => s.trim());
  if (parts.length < 2) return { branchName: "", floor: parts[0] ?? "" };
  return { branchName: parts[0], floor: parts.slice(1).join(" • ") };
}

