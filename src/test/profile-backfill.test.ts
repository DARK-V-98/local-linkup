import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/lib/firebase", () => ({
  isFirebaseConfigured: true,
  auth: {},
  db: {},
  storage: {},
}));

const ensureUserProfile = vi.fn();
const updateUserProfile = vi.fn();

vi.mock("@/lib/firestore/users", () => ({
  ensureUserProfile: (...a: unknown[]) => ensureUserProfile(...a),
  updateUserProfile: (...a: unknown[]) => updateUserProfile(...a),
  createUserProfile: vi.fn(),
}));

import { ensureProfileForUser, DEVELOPER_EMAIL } from "@/lib/auth";

const fbUser = (over: Partial<Record<string, unknown>> = {}) => ({
  uid: "UID123",
  email: "person@example.com",
  displayName: "Person Example",
  phoneNumber: null,
  photoURL: null,
  emailVerified: false,
  ...over,
}) as Parameters<typeof ensureProfileForUser>[0];

describe("profile backfill on sign-in", () => {
  beforeEach(() => {
    ensureUserProfile.mockReset();
    updateUserProfile.mockReset();
    localStorage.clear();
  });

  it("creates a Firestore profile when the account has none", async () => {
    ensureUserProfile.mockImplementation(async (uid, seed) => ({
      profile: { id: uid, ...seed },
      created: true,
    }));

    const profile = await ensureProfileForUser(fbUser());

    expect(ensureUserProfile).toHaveBeenCalledOnce();
    expect(profile.id).toBe("UID123");
    expect(profile.email).toBe("person@example.com");
    expect(profile.name).toBe("Person Example");
  });

  it("backfills with the least privilege — never admin or verified", async () => {
    ensureUserProfile.mockImplementation(async (uid, seed) => ({
      profile: { id: uid, ...seed },
      created: true,
    }));

    const profile = await ensureProfileForUser(fbUser({ emailVerified: true }));

    expect(profile.role).toBe("buyer");
    expect(profile.verified).toBe(false);
  });

  it("returns the existing profile untouched instead of overwriting it", async () => {
    const existing = {
      id: "UID123",
      name: "Established Seller",
      email: "person@example.com",
      phone: "+94771234567",
      role: "seller" as const,
      district: "Kandy",
      verified: true,
      joinedAt: "2024-01-01",
      sellerCategory: "Technology",
    };
    ensureUserProfile.mockResolvedValue({ profile: existing, created: false });

    const profile = await ensureProfileForUser(fbUser());

    expect(profile).toEqual(existing);
    // An existing seller must not be demoted or re-verified by a login.
    expect(updateUserProfile).not.toHaveBeenCalled();
  });

  it("promotes the owner email to developer even on a fresh backfill", async () => {
    ensureUserProfile.mockImplementation(async (uid, seed) => ({
      profile: { id: uid, ...seed },
      created: true,
    }));

    const profile = await ensureProfileForUser(fbUser({ email: DEVELOPER_EMAIL }));

    expect(profile.role).toBe("developer");
  });

  it("propagates read failures rather than treating them as 'missing'", async () => {
    // The caller must keep the cached session; silently creating a profile
    // here would clobber the real document once connectivity returns.
    ensureUserProfile.mockRejectedValue(new Error("unavailable"));

    await expect(ensureProfileForUser(fbUser())).rejects.toThrow("unavailable");
  });
});
