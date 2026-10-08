import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useBookings } from "@/hooks/useBookings";
const mocks = vi.hoisted(()=>({buyer:vi.fn(()=>vi.fn()),seller:vi.fn(()=>vi.fn())}));
vi.mock("@/lib/firebase",()=>({isFirebaseConfigured:true}));
vi.mock("@/lib/auth",()=>({getUser:()=>({id:"admin-preview",role:"admin"})}));
vi.mock("@/lib/firestore/bookings",()=>({subscribeToBookingsByBuyer:mocks.buyer,subscribeToBookingsBySeller:mocks.seller,updateFirestoreBookingStatus:vi.fn()}));
describe("dashboard booking subscriptions",()=> {
  beforeEach(()=>vi.clearAllMocks());
  it("uses seller-scoped bookings when an administrator views the seller workspace",()=> {
    renderHook(()=>useBookings("seller"));
    expect(mocks.seller).toHaveBeenCalledWith("admin-preview",expect.any(Function),expect.any(Function));
    expect(mocks.buyer).not.toHaveBeenCalled();
  });
  it("uses buyer-scoped bookings for the buyer workspace",()=> {
    renderHook(()=>useBookings("buyer"));
    expect(mocks.buyer).toHaveBeenCalledWith("admin-preview",expect.any(Function),expect.any(Function));
    expect(mocks.seller).not.toHaveBeenCalled();
  });
  it("reports a failed subscription and recovers when data arrives",()=> {
    const {result}=renderHook(()=>useBookings("buyer"));
    const callback=mocks.buyer.mock.calls[0] as unknown as [string,(rows:unknown[])=>void,()=>void];
    act(()=>callback[2]());
    expect(result.current.error).toContain("Could not load");
    expect(result.current.loading).toBe(false);
    act(()=>callback[1]([]));
    expect(result.current.error).toBeNull();
  });
});
