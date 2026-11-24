export type EventStatus = "DRAFT" | "UPCOMING" | "OPEN" | "CLOSED" | "CANCELLED";
export type BoothStatus = "AVAILABLE" | "LOCKED" | "RESERVED" | "SUSPENDED" | "HIDDEN";
export type BookingStatus =
  | "PENDING"
  | "REVIEWING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "EXPIRED";

export type EventSummary = {
  id: string;
  slug: string;
  nameTh: string;
  branch: string;
  province: string;
  startDate: string; // ISO yyyy-mm-dd
  endDate: string;
  status: EventStatus;
  startingPrice: number;
  category: string;
  remainingBooths: number;
  totalBooths: number;
  cover?: string; // uploaded image URL (preferred); falls back to coverTone gradient
  coverTone: string; // CSS linear-gradient(...) string for inline `style={{ background }}`
};

export type EventDetail = EventSummary & {
  zoneArea: string;
  floor: string;
  /** Public URL of the uploaded floorplan image (null when admin hasn't uploaded yet). */
  floorPlanUrl?: string;
  openTime: string;
  closeTime: string;
  description: string;
  highlights: {
    footTraffic: string;
    topZone: string;
    nearbyStores: string;
    accessibility: string;
  };
  terms: string[];
  prohibitedCategories: string[];
  hiddenRules: number[];
  hiddenProhibited: number[];
  cover?: string; // uploaded image URL (preferred over coverTone gradient)
  documents: { label: string; href: string }[];
  gallery: string[]; // image URLs (real). If empty, page hides the section.
};

export type Booth = {
  id: string;
  code: string;
  status: BoothStatus;
  price: number;
  widthM?: number;
  lengthM?: number;
  areaSqm?: number;
  zone?: string;
  tenantProductCategory?: string;
  tenantProductDetail?: string;
  /**
   * Set when the booking on this booth is settled — approved and paid in full.
   * Splits RESERVED into "จองแล้ว" (taken, money not in) and "ขายแล้ว" (done),
   * which the booth status alone cannot express.
   *
   * Optional because the API does not send it yet: while it is undefined every
   * RESERVED booth keeps reading "จองแล้ว", which is the safe half to be wrong
   * about — it never claims money arrived when it has not.
   */
  paid?: boolean;
};

export type PriceBreakdown = {
  rent: number;
  serviceFee: number;
  deposit: number;
  vatBase: number;
  vat: number;
  grandTotal: number;
  discountAmount: number;
  finalTotal: number;
};

export type DiscountType = "PERCENT" | "FIXED";

export type DiscountResult = {
  code: string;
  type: DiscountType;
  value: number; // percent (0-100) or baht amount
};
 