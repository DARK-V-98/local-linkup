import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  runTransaction,
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
  /** Admin-controlled account state; absent means active */
  status?: "active" | "suspended" | "pending";
  createdAt?: unknown;
  updatedAt?: unknown;
}

// ── Reads ──────────────────────────────────────────────────────────────────────

/**
 * Reads a profile, returning null ONLY when the document genuinely does not
 * exist. Network/permission failures throw.
 *
 * The distinction matters: callers create a profile when this returns null, so
 * treating an error as "missing" would overwrite a real user's document and
 * wipe their role and verification status.
 */
export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, USERS_COL, uid));
  if (!snap.exists()) return null;
  return { id: uid, ...snap.data() } as UserProfile;
}

/**
 * Lenient read for non-critical paths — swallows errors. Never use this to
 * decide whether to create a profile; use fetchUserProfile for that.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    return await fetchUserProfile(uid);
  } catch {
    return null;
  }
}

/**
 * Guarantees a Firestore profile exists for a signed-in account, creating one
 * from the given seed if it is missing. Runs in a transaction so two tabs
 * signing in at once cannot clobber each other, and so an existing document is
 * never overwritten.
 *
 * Throws if Firestore is unreachable — callers must not assume "missing".
 */
export async function ensureUserProfile(
  uid: string,
  seed: Omit<AuthUser, "id">
): Promise<{ profile: UserProfile; created: boolean }> {
  return runTransaction(db, async (tx) => {
    const ref = doc(db, USERS_COL, uid);
    const snap = await tx.get(ref);

    if (snap.exists()) {
      return {
        profile: { id: uid, ...snap.data() } as UserProfile,
        created: false,
      };
    }

    const data = {
      ...stripUndefined(seed),
      totalOrders: 0,
      totalEarnings: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    tx.set(ref, data);
    return { profile: { id: uid, ...seed } as UserProfile, created: true };
  });
}

// ── Writes ─────────────────────────────────────────────────────────────────────

export async function createUserProfile(
  uid: string,
  data: Omit<AuthUser, "id">
): Promise<void> {
  await setDoc(doc(db, USERS_COL, uid), {
    ...stripUndefined(data),
    totalOrders: 0,
    totalEarnings: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Firestore rejects `undefined` field values outright. Optional profile fields
 * (bio, businessName, …) are simply absent when not supplied.
 */
function stripUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
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

/**
 * Live list of every registered user, for the admin user-management screen.
 * Reads are gated to signed-in users by the security rules.
 */
export function subscribeToUsers(
  callback: (users: UserProfile[]) => void,
  onError?: (err: unknown) => void
): () => void {
  return onSnapshot(
    collection(db, USERS_COL),
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as UserProfile))),
    (err) => onError?.(err)
  );
}

export async function setUserStatus(
  uid: string,
  status: NonNullable<UserProfile["status"]>
): Promise<void> {
  await updateDoc(doc(db, USERS_COL, uid), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function setUserVerified(uid: string, verified: boolean): Promise<void> {
  await updateDoc(doc(db, USERS_COL, uid), {
    verified,
    updatedAt: serverTimestamp(),
  });
}
