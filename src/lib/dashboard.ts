import { type StoredBooking } from "./store";
export function dateKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Colombo", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}
export function bookingDate(value: unknown): Date | null {
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") return value.toDate();
  if (typeof value !== "string") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
export function buildBookingTrend(bookings: Pick<StoredBooking, "status" | "createdAt" | "price">[], days: number, now = new Date()) {
  const keys = Array.from({ length: days }, (_, i) => {
    const date = new Date(now.getTime() - (days - 1 - i) * 86400000);
    return { date: dateKey(date), label: date.toLocaleDateString("en-GB", { timeZone: "Asia/Colombo", month: "short", day: "numeric" }), amount: 0, orders: 0 };
  });
  const map = new Map(keys.map(day => [day.date, day]));
  for (const b of bookings) {
    const created = bookingDate(b.createdAt);
    const day = created ? map.get(dateKey(created)) : undefined;
    if (!day) continue;
    day.orders++;
    if (b.status === "completed") day.amount += b.price;
  }
  return keys;
}
export function csvCell(value: string | number): string {
  const raw = String(value);
  const safe = /^(?:\s*[=+\-@]|[\t\r\n])/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
}

