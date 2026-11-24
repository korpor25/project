// Canonical hardcoded rule + prohibited-category lists. Admin doesn't edit
// the text — they pick which items to hide per event via `hiddenRules` /
// `hiddenProhibited` index arrays on the event row. Add new items by
// appending: indexes stored in the DB stay stable.

export const DEFAULT_RULES = [
  "ผู้เช่าต้องเปิดร้านตลอดระยะเวลางาน",
  "ห้ามเจาะ ตัด แปลงโครงสร้างของสถานที่",
  "ห้ามปิดร้านก่อนเวลาที่กำหนด",
  "ห้ามใช้เสียงดัง / อุปกรณ์รบกวนผู้อื่น",
  "ต้องมาติดตั้งก่อน 1 วันเวลาห้างปิด",
  "ห้ามโอนสิทธิ์หรือแบ่งพื้นที่ให้บุคคลอื่น",
  "ต้องรักษาความสะอาดและจัดเก็บขยะตัวเองเป็นประจำ",
];

export const DEFAULT_PROHIBITED = [
  "อาหารออร์แกนิก",
  "บุหรี่ / บุหรี่ไฟฟ้า",
  "สินค้าละเมิดลิขสิทธิ์",
  "อาหารสด / เนื้อสัตว์สด",
  "บริการที่ต้องมีใบอนุญาต",
  "การพนัน / ลอตเตอรี่",
];
