// ─── AuthUser interface ────────────────────────────────────────────────────────

/**
 * The site owner / developer account. Whenever this email signs in — or
 * registers, as a buyer or a seller — it is promoted to the `developer` role,
 * which carries every admin power plus developer-only tooling.
 *
 * This client-side check is for UI only. The real enforcement lives in
 * firestore.rules, which reads the email straight off the verified Firebase
 * Auth token and cannot be spoofed from the browser.
 */
export const DEVELOPER_EMAIL = "tikfese@gmail.com";

export type UserRole = "buyer" | "seller" | "admin" | "developer";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  district: string;
  verified: boolean;
  joinedAt: string;
  bio?: string;
  sellerCategory?: string;
  /** How the seller registered — individuals and businesses verify differently */
  sellerType?: "individual" | "business";
  businessName?: string;
  avatarUrl?: string;
}

// ─── localStorage layer (sync — used by all existing components) ──────────────

const AUTH_KEY = "needly_auth_user";

export function getUser(): AuthUser | null {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY) ?? "null");
  } catch {
    return null;
  }
}

export function setUser(user: AuthUser): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  // Notify same-window listeners (Header, etc.)
  window.dispatchEvent(new CustomEvent("needly-auth-change"));
}

export function clearUser(): void {
  localStorage.removeItem(AUTH_KEY);
  window.dispatchEvent(new CustomEvent("needly-auth-change"));
}

export function isLoggedIn(): boolean {
  return getUser() !== null;
}

/** True for the owner account — the only role above `admin`. */
export function isDeveloper(user = getUser()): boolean {
  return user?.role === "developer";
}

/** Developer and admin share every admin surface; developer adds more on top. */
export function hasAdminAccess(user = getUser()): boolean {
  return user?.role === "admin" || user?.role === "developer";
}

/**
 * Resolves the effective role for an email at sign-in / sign-up time.
 * The owner email always outranks whatever is stored on the profile.
 */
export function resolveRole(email: string, storedRole: UserRole): UserRole {
  return email.trim().toLowerCase() === DEVELOPER_EMAIL ? "developer" : storedRole;
}

export function genUserId(): string {
  return "U" + Math.random().toString(36).substring(2, 10).toUpperCase();
}

// ─── Firebase Auth (async — used by Login, Register pages) ────────────────────
// These functions are tree-shaken if Firebase is not configured.

import { isFirebaseConfigured, auth } from "@/lib/firebase";
import {
  createUserProfile,
  updateUserProfile,
  ensureUserProfile,
} from "@/lib/firestore/users";

export async function signInWithFirebase(
  email: string,
  password: string
): Promise<AuthUser> {
  if (!isFirebaseConfigured) {
    throw new Error("Sign-in is unavailable — Firebase is not configured.");
  }

  const { signInWithEmailAndPassword } = await import("firebase/auth");
  const cred = await signInWithEmailAndPassword(auth, email, password);

  // Backfills the Firestore profile if it is missing, and applies the
  // owner-email promotion when it already exists.
  const profile = await ensureProfileForUser(cred.user, email);
  setUser(profile);
  return profile;
}

/**
 * Guarantees the signed-in account has a Firestore profile and returns it.
 *
 * Every sign-in path funnels through here, so a user whose document is missing
 * — created before profiles were written, removed by hand, or lost to a failed
 * registration — is backfilled on their next login instead of staying
 * invisible to the admin screens.
 *
 * Defaults are deliberately conservative: role "buyer" and unverified. A
 * backfilled profile must never grant privileges the user did not already have.
 */
export async function ensureProfileForUser(
  firebaseUser: {
    uid: string;
    email: string | null;
    displayName: string | null;
    phoneNumber: string | null;
    photoURL: string | null;
    emailVerified: boolean;
  },
  fallbackEmail = ""
): Promise<AuthUser> {
  const email = firebaseUser.email ?? fallbackEmail;

  const seed: Omit<AuthUser, "id"> = {
    name: firebaseUser.displayName ?? email.split("@")[0] ?? "User",
    email,
    phone: firebaseUser.phoneNumber ?? "",
    role: resolveRole(email, "buyer"),
    district: "Colombo",
    verified: false,
    joinedAt: new Date().toISOString().split("T")[0],
    ...(firebaseUser.photoURL ? { avatarUrl: firebaseUser.photoURL } : {}),
  };

  const { profile, created } = await ensureUserProfile(firebaseUser.uid, seed);
  if (created) {
    console.info(`[auth] Backfilled missing Firestore profile for ${email}`);
    return profile as AuthUser;
  }

  // Existing profile — only the owner-email promotion may change it.
  return ensureDeveloperRole(profile as AuthUser);
}

/**
 * Promotes the owner account to `developer` and persists it, so the role is
 * correct the first time that email signs in — whether it originally
 * registered as a buyer or a seller.
 */
async function ensureDeveloperRole(profile: AuthUser): Promise<AuthUser> {
  const role = resolveRole(profile.email, profile.role);
  if (role === profile.role) return profile;

  const promoted = { ...profile, role, verified: true };
  try {
    await updateUserProfile(profile.id, { role, verified: true });
  } catch {
    // Offline or rules rejected the write — the session still gets the role,
    // and firestore.rules grants access from the token email regardless.
  }
  return promoted;
}

export async function signUpBuyer(data: {
  name: string;
  email: string;
  phone: string;
  password: string;
  district: string;
}): Promise<AuthUser> {
  if (!isFirebaseConfigured) {
    // Offline fallback
    const user: AuthUser = {
      id: genUserId(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: resolveRole(data.email, "buyer"),
      district: data.district,
      verified: false,
      joinedAt: new Date().toISOString().split("T")[0],
    };
    setUser(user);
    return user;
  }

  const { createUserWithEmailAndPassword, updateProfile } = await import(
    "firebase/auth"
  );
  const cred = await createUserWithEmailAndPassword(
    auth,
    data.email,
    data.password
  );
  await updateProfile(cred.user, { displayName: data.name });

  const userData: Omit<AuthUser, "id"> = {
    name: data.name,
    email: data.email,
    phone: data.phone,
    role: resolveRole(data.email, "buyer"),
    district: data.district,
    verified: false,
    joinedAt: new Date().toISOString().split("T")[0],
  };
  await createUserProfile(cred.user.uid, userData);

  const authUser: AuthUser = { id: cred.user.uid, ...userData };
  setUser(authUser);
  return authUser;
}

export async function signUpSeller(data: {
  name: string;
  email: string;
  phone: string;
  password: string;
  sellerCategory: string;
  district?: string;
  bio?: string;
  sellerType?: "individual" | "business";
  businessName?: string;
}): Promise<AuthUser> {
  if (!isFirebaseConfigured) {
    const user: AuthUser = {
      id: genUserId(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: resolveRole(data.email, "seller"),
      district: data.district ?? "Colombo",
      verified: false,
      joinedAt: new Date().toISOString().split("T")[0],
      sellerCategory: data.sellerCategory,
      bio: data.bio,
      sellerType: data.sellerType,
      businessName: data.businessName,
    };
    setUser(user);
    return user;
  }

  const { createUserWithEmailAndPassword, updateProfile } = await import(
    "firebase/auth"
  );
  const cred = await createUserWithEmailAndPassword(
    auth,
    data.email,
    data.password
  );
  await updateProfile(cred.user, { displayName: data.name });

  const userData: Omit<AuthUser, "id"> = {
    name: data.name,
    email: data.email,
    phone: data.phone,
    role: resolveRole(data.email, "seller"),
    district: data.district ?? "Colombo",
    verified: false,
    joinedAt: new Date().toISOString().split("T")[0],
    sellerCategory: data.sellerCategory,
    bio: data.bio,
    sellerType: data.sellerType,
    businessName: data.businessName,
  };
  await createUserProfile(cred.user.uid, userData);

  const authUser: AuthUser = { id: cred.user.uid, ...userData };
  setUser(authUser);
  return authUser;
}

export async function signInWithGoogle(): Promise<AuthUser> {
  if (!isFirebaseConfigured) {
    throw new Error("Google Sign-In requires Firebase configuration.");
  }

  const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
  const provider = new GoogleAuthProvider();
  provider.addScope("profile");
  provider.addScope("email");

  const cred = await signInWithPopup(auth, provider);

  // Same guarantee as email sign-in: a Google account always ends up with a
  // Firestore profile, created on first sign-in and backfilled if it went missing.
  const profile = await ensureProfileForUser(cred.user);
  setUser(profile);
  return profile;
}

export async function signOutFirebase(): Promise<void> {
  if (isFirebaseConfigured) {
    const { signOut } = await import("firebase/auth");
    await signOut(auth);
  }
  clearUser();
}

export async function sendPasswordReset(email: string): Promise<void> {
  if (!isFirebaseConfigured) {
    throw new Error("Password reset requires Firebase configuration.");
  }
  const { sendPasswordResetEmail } = await import("firebase/auth");
  await sendPasswordResetEmail(auth, email);
}
