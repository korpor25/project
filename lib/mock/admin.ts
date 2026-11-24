import type { BookingStatus } from "@/types/domain";

export type AdminBooking = {
  code: string;
  customerName: string;
  company: string;
  email: string;
  phone: string;
  lineId?: string;
  eventNameTh: string;
  boothCode: string;
  zoneName: string;
  startDate: string;
  endDate: string;
  total: number;
  status: BookingStatus;
  createdAt: string;
  slip?: boolean;
  rejectionReason?: string;
};

const FIRST_NAMES = ["สมชาย", "สุดา", "ปรียา", "ธีรเดช", "ณัฐกานต์", "วรรณา", "พงศ์ศักดิ์", "อรอุมา"];
const LAST_NAMES = ["ใจดี", "สุขสบาย", "ทองมา", "ศรีสุข", "ธาราพิรุณ", "ภัทรพงษ์", "อินทรัตน์"];
const COMPANIES = [
  "Fashion Grand Sale", "Tech Innovation 2025", "Food & Drink Grand", "Home & Living Expo",
  "Beauty Expo 2025", "Pet Expo Thailand", "Tech Innovation Expo", "Christmas Markest",
];
const EVENTS = [
  "Lifestyle Pop-up Market 2026", "Food Festival 2026", "Beauty Expo 2026",
  "Tech Innovation 2026", "Home & Living Fair", "Pet Expo Thailand",
];

const STATUSES: BookingStatus[] = ["PENDING", "REVIEWING", "APPROVED", "REJECTED", "EXPIRED", "CANCELLED"];

function randomItem<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

export const adminBookings: AdminBooking[] = Array.from({ length: 24 }).map((_, i) => {
  const status = STATUSES[i % STATUSES.length];
  const code = `BK-2569-${String(1000 + i).padStart(4, "0")}`;
  return {
    code,
    customerName: `${randomItem(FIRST_NAMES, i)} ${randomItem(LAST_NAMES, i + 3)}`,
    company: randomItem(COMPANIES, i),
    email: `customer${i + 1}@example.com`,
    phone: `08${(1 + (i % 9)).toString()}-${(200 + (i * 37) % 800).toString().padStart(3, "0")}-${(1000 + (i * 113) % 9000).toString().padStart(4, "0")}`,
    lineId: i % 3 === 0 ? `@${randomItem(["alixstore", "fashionhouse", "techspace"], i)}` : undefined,
    eventNameTh: randomItem(EVENTS, i),
    boothCode: `${"ABCDEFGH"[i % 8]}-${String(((i * 7) % 24) + 1).padStart(2, "0")}`,
    zoneName: ["Fashion", "Food", "Beauty", "Lifestyle", "Tech"][i % 5],
    startDate: `2026-${String(((i % 12) + 1)).padStart(2, "0")}-${String(((i % 27) + 1)).padStart(2, "0")}`,
    endDate: `2026-${String(((i % 12) + 1)).padStart(2, "0")}-${String(Math.min(((i % 27) + 8), 28)).padStart(2, "0")}`,
    total: 18000 + (i * 1700) % 50000,
    status,
    createdAt: `2026-05-${String(15 - (i % 14)).padStart(2, "0")}T${String(8 + (i % 10)).padStart(2, "0")}:30:00Z`,
    slip: status !== "PENDING",
    rejectionReason: status === "REJECTED" ? "เอกสารไม่ครบ — ขาดทะเบียนพาณิชย์" : undefined,
  };
});

export type AdminBranch = {
  id: string;
  name: string;
  province: string;
  floorCount: number;
  totalBooths: number;
  availableBooths: number;
  status: "ACTIVE" | "INACTIVE";
};

export const adminBranches: AdminBranch[] = [
  { id: "br-1", name: "Central Ladprao",   province: "กรุงเทพ",  floorCount: 7, totalBooths: 96,  availableBooths: 18, status: "ACTIVE" },
  { id: "br-2", name: "Central World",     province: "กรุงเทพ",  floorCount: 8, totalBooths: 124, availableBooths: 24, status: "ACTIVE" },
  { id: "br-3", name: "Central Rama 9",    province: "กรุงเทพ",  floorCount: 6, totalBooths: 78,  availableBooths: 12, status: "ACTIVE" },
  { id: "br-4", name: "Central Bangna",    province: "กรุงเทพ",  floorCount: 5, totalBooths: 60,  availableBooths: 8,  status: "ACTIVE" },
  { id: "br-5", name: "Central Pinklao",   province: "กรุงเทพ",  floorCount: 5, totalBooths: 48,  availableBooths: 0,  status: "INACTIVE" },
];

export type AdminUser = {
  id: string;
  fullName: string;
  email: string;
  company?: string;
  joinedAt: string;
  bookingCount: number;
  status: "ACTIVE" | "SUSPENDED";
  suspendedReason?: string;
};

export const adminUsers: AdminUser[] = [
  { id: "u-1", fullName: "สมชาย ใจดี",      email: "somchai@example.com",   company: "Fashion Grand Sale",    joinedAt: "2025-12-01", bookingCount: 8, status: "ACTIVE" },
  { id: "u-2", fullName: "สุดา สมหวัง",     email: "suda@example.com",      company: "Beauty Plus",           joinedAt: "2026-01-15", bookingCount: 5, status: "ACTIVE" },
  { id: "u-3", fullName: "ปรียา สดใส",      email: "preya@example.com",     company: "Food Lab",              joinedAt: "2025-11-20", bookingCount: 12, status: "ACTIVE" },
  { id: "u-4", fullName: "ธีรเดช ทองมา",   email: "teerade@example.com",   company: "Tech Space",            joinedAt: "2025-09-10", bookingCount: 3, status: "SUSPENDED", suspendedReason: "ส่งเอกสารปลอม" },
  { id: "u-5", fullName: "ณัฐกานต์ ใจกล้า", email: "nutta@example.com",     company: "Lifestyle Studio",      joinedAt: "2026-02-05", bookingCount: 2, status: "ACTIVE" },
];

export type ActivityEntry = {
  actor: string;
  action: string;
  target: string;
  time: string;
};

export const recentActivity: ActivityEntry[] = [
  { actor: "Admin CS",   action: "อนุมัติการจอง",    target: "BK-2569-1003", time: "5 นาทีที่แล้ว" },
  { actor: "Admin Pim",  action: "เพิ่มบูธใหม่",      target: "K-12 (Beauty)", time: "20 นาทีที่แล้ว" },
  { actor: "Admin CS",   action: "อัปโหลดแผนผัง",    target: "Central Ladprao ชั้น 2", time: "1 ชม.ที่แล้ว" },
  { actor: "Admin Tee",  action: "ปฏิเสธการจอง",     target: "BK-2569-0995", time: "2 ชม.ที่แล้ว" },
  { actor: "Admin Pim",  action: "ระงับบัญชี",        target: "teerade@example.com", time: "3 ชม.ที่แล้ว" },
];
