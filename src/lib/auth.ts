// ─── AuthUser interface ────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "buyer" | "seller" | "admin";
  district: string;
  verified: boolean;
  joinedAt: string;
  bio?: string;
  sellerCategory?: string;
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

export function genUserId(): string {
  return "U" + Math.random().toString(36).substring(2, 10).toUpperCase();
}

// ─── Demo accounts (kept for offline/demo mode) ────────────────────────────────

export const DEMO_ACCOUNTS: Record<string, { password: string; user: AuthUser }> = {
  "buyer@demo.com": {
    password: "demo123",
    user: {
      id: "UDEMO01",
      name: "Saman Perera",
      email: "buyer@demo.com",
      phone: "+94771234567",
      role: "buyer",
      district: "Colombo",
      verified: true,
      joinedAt: "2024-01-15",
    },
  },
  "seller@demo.com": {
    password: "demo123",
    user: {
      id: "UDEMO02",
      name: "Tharindu P.",
      email: "seller@demo.com",
      phone: "+94779876543",
      role: "seller",
      district: "Colombo",
      verified: true,
      joinedAt: "2023-06-10",
      sellerCategory: "Technology",
    },
  },
  "admin@demo.com": {
    password: "demo123",
    user: {
      id: "UDEMO00",
      name: "Admin User",
      email: "admin@demo.com",
      phone: "+94700000000",
      role: "admin",
      district: "Colombo",
      verified: true,
      joinedAt: "2023-01-01",
    },
  },
};

// ─── Firebase Auth (async — used by Login, Register pages) ────────────────────
// These functions are tree-shaken if Firebase is not configured.

import { isFirebaseConfigured, auth } from "@/lib/firebase";
import { getUserProfile, createUserProfile } from "@/lib/firestore/users";

export async function signInWithFirebase(
  email: string,
  password: string
): Promise<AuthUser> {
  // 1. Demo accounts always work (offline-first)
  const demo = DEMO_ACCOUNTS[email.toLowerCase()];
  if (demo && demo.password === password) {
    setUser(demo.user);
    return demo.user;
  }

  if (!isFirebaseConfigured) {
    throw new Error("Firebase not configured. Use demo accounts or set up .env");
  }

  const { signInWithEmailAndPassword } = await import("firebase/auth");
  const cred = await signInWithEmailAndPassword(auth, email, password);

  const profile = await getUserProfile(cred.user.uid);
  if (profile) {
    setUser(profile);
    return profile;
  }

  // Profile missing — create a minimal one from Firebase Auth
  const minimal: AuthUser = {
    id: cred.user.uid,
    name: cred.user.displayName ?? email.split("@")[0],
    email: cred.user.email ?? email,
    phone: cred.user.phoneNumber ?? "",
    role: "buyer",
    district: "Colombo",
    verified: cred.user.emailVerified,
    joinedAt: new Date().toISOString().split("T")[0],
  };
  await createUserProfile(cred.user.uid, minimal);
  setUser(minimal);
  return minimal;
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
      role: "buyer",
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
    role: "buyer",
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
}): Promise<AuthUser> {
  if (!isFirebaseConfigured) {
    const user: AuthUser = {
      id: genUserId(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: "seller",
      district: data.district ?? "Colombo",
      verified: false,
      joinedAt: new Date().toISOString().split("T")[0],
      sellerCategory: data.sellerCategory,
      bio: data.bio,
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
    role: "seller",
    district: data.district ?? "Colombo",
    verified: false,
    joinedAt: new Date().toISOString().split("T")[0],
    sellerCategory: data.sellerCategory,
    bio: data.bio,
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
  let profile = await getUserProfile(cred.user.uid);

  if (!profile) {
    const userData: Omit<AuthUser, "id"> = {
      name: cred.user.displayName ?? cred.user.email?.split("@")[0] ?? "User",
      email: cred.user.email ?? "",
      phone: cred.user.phoneNumber ?? "",
      role: "buyer",
      district: "Colombo",
      verified: cred.user.emailVerified,
      joinedAt: new Date().toISOString().split("T")[0],
      avatarUrl: cred.user.photoURL ?? undefined,
    };
    await createUserProfile(cred.user.uid, userData);
    profile = { id: cred.user.uid, ...userData };
  }

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
