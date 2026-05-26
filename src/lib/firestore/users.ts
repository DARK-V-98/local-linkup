import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { AuthUser } from "@/lib/auth";

export const USERS_COL = "users";

export interface UserProfile extends AuthUser {
  bio?: string;
  avatarUrl?: string;
  totalOrders?: number;
  totalEarnings?: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

// ── Reads ──────────────────────────────────────────────────────────────────────

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const snap = await getDoc(doc(db, USERS_COL, uid));
    if (!snap.exists()) return null;
    return { id: uid, ...snap.data() } as UserProfile;
  } catch {
    return null;
  }
}

// ── Writes ─────────────────────────────────────────────────────────────────────

export async function createUserProfile(
  uid: string,
  data: Omit<AuthUser, "id">
): Promise<void> {
  await setDoc(doc(db, USERS_COL, uid), {
    ...data,
    totalOrders: 0,
    totalEarnings: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateUserProfile(
  uid: string,
  updates: Partial<Omit<UserProfile, "id" | "createdAt">>
): Promise<void> {
  await updateDoc(doc(db, USERS_COL, uid), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function setUserVerified(uid: string, verified: boolean): Promise<void> {
  await updateDoc(doc(db, USERS_COL, uid), {
    verified,
    updatedAt: serverTimestamp(),
  });
}
