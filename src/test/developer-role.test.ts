import {
DEVELOPER_EMAIL,
hasAdminAccess,
isDeveloper,
resolveRole,
type AuthUser,
} from "@/lib/auth";
import { describe,expect,it } from "vitest";

const user = (over: Partial<AuthUser>): AuthUser => ({
  id: "U1",
  name: "Test",
  email: "someone@example.com",
  phone: "",
  role: "buyer",
  district: "Colombo",
  verified: false,
  joinedAt: "2026-01-01",
  ...over,
});

describe("developer role", () => {
  it("does not grant owner privileges without verified email ownership",()=>{expect(resolveRole(DEVELOPER_EMAIL,"buyer",false)).toBe("buyer");expect(resolveRole("attacker@example.com","developer",true)).toBe("buyer");});
  it("promotes the owner email to developer, whatever role it registered with", () => {
    expect(resolveRole(DEVELOPER_EMAIL, "buyer", true)).toBe("developer");
    expect(resolveRole(DEVELOPER_EMAIL, "seller", true)).toBe("developer");
    expect(resolveRole(DEVELOPER_EMAIL, "admin", true)).toBe("developer");
  });

  it("ignores casing and surrounding whitespace on the owner email", () => {
    expect(resolveRole("  TikFese@Gmail.com  ", "buyer", true)).toBe("developer");
  });

  it("leaves every other account's role untouched", () => {
    expect(resolveRole("someone@example.com", "buyer")).toBe("buyer");
    expect(resolveRole("someone@example.com", "seller")).toBe("seller");
    expect(resolveRole("tikfese@gmail.com.evil.com", "buyer")).toBe("buyer");
    expect(resolveRole("nottikfese@gmail.com", "buyer")).toBe("buyer");
  });

  it("grants developer every admin surface", () => {
    expect(hasAdminAccess(user({ role: "developer" }))).toBe(true);
    expect(hasAdminAccess(user({ role: "admin" }))).toBe(true);
    expect(hasAdminAccess(user({ role: "seller" }))).toBe(false);
    expect(hasAdminAccess(user({ role: "buyer" }))).toBe(false);
  });

  it("distinguishes developer from plain admin", () => {
    expect(isDeveloper(user({ role: "developer" }))).toBe(true);
    expect(isDeveloper(user({ role: "admin" }))).toBe(false);
  });
});
