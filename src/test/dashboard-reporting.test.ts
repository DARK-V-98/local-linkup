import { describe, expect, it } from "vitest";
import { buildBookingTrend, bookingDate, csvCell, dateKey } from "@/lib/dashboard";
import { type StoredBooking } from "@/lib/store";

describe("dashboard reporting", () => {
  const now = new Date("2026-10-08T12:00:00Z");
  it("keeps chronological days and counts all orders but values only completed work", () => {
    const rows: Pick<StoredBooking, "status" | "createdAt" | "price">[] = [
      {status:"completed",createdAt:"2026-10-07T12:00:00Z",price:1250},
      {status:"pending",createdAt:"2026-10-07T13:00:00Z",price:5000},
      {status:"cancelled",createdAt:"2026-10-08T01:00:00Z",price:500},
      {status:"completed",createdAt:"2026-09-01T01:00:00Z",price:9999},
      {status:"completed",createdAt:"not a date",price:9999},
    ];
    const data = buildBookingTrend(rows,3,now);
    expect(data.map(d=>d.date)).toEqual(["2026-10-06","2026-10-07","2026-10-08"]);
    expect(data.map(d=>d.amount)).toEqual([0,1250,0]);
    expect(data.map(d=>d.orders)).toEqual([0,2,1]);
  });
  it("uses Sri Lanka calendar dates around UTC midnight", () => {
    expect(dateKey(new Date("2026-10-07T20:00:00Z"))).toBe("2026-10-08");
    const data = buildBookingTrend([{status:"completed",price:200,createdAt:"2026-10-07T20:00:00Z"}],1,now);
    expect(data[0].amount).toBe(200);
  });
  it("does not invent revenue for empty periods", () => {
    expect(buildBookingTrend([],7,now).every(day=>day.amount===0 && day.orders===0)).toBe(true);
  });
  it("accepts Firestore dates and rejects invalid dates", () => {
    expect(bookingDate({toDate:()=>now})).toBe(now);
    expect(bookingDate("invalid")).toBeNull();
  });
  it("quotes CSV safely and prevents spreadsheet formula execution", () => {
    expect(csvCell('A "good", service')).toBe('"A ""good"", service"');
    expect(csvCell('=HYPERLINK("https://example.com")')).toBe('"\'=HYPERLINK(""https://example.com"")"');
    expect(csvCell(1250)).toBe('"1250"');
  });
});
