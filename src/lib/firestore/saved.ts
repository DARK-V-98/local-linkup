import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

/** Subcollection: users/{uid}/saved/{serviceId} */
const savedCol = (uid: string) => collection(db, "users", uid, "saved");

// ── Reads ──────────────────────────────────────────────────────────────────────

export async function getSavedIds(uid: string): Promise<string[]> {
  try {
    const snap = await getDocs(savedCol(uid));
    return snap.docs.map((d) => d.id);
  } catch {
    return [];
  }
}

export async function isFirestoreSaved(
  uid: string,
  serviceId: string
): Promise<boolean> {
  try {
    const snap = await getDoc(doc(savedCol(uid), serviceId));
    return snap.exists();
  } catch {
    return false;
  }
}

// ── Writes ─────────────────────────────────────────────────────────────────────

export async function addSaved(uid: string, serviceId: string): Promise<void> {
  await setDoc(doc(savedCol(uid), serviceId), {
    serviceId,
    savedAt: serverTimestamp(),
  });
}

export async function removeSaved(uid: string, serviceId: string): Promise<void> {
  await deleteDoc(doc(savedCol(uid), serviceId));
}

/** Toggle saved state — returns true if NOW saved, false if removed. */
export async function toggleFirestoreSaved(
  uid: string,
  serviceId: string
): Promise<boolean> {
  const exists = await isFirestoreSaved(uid, serviceId);
  if (exists) {
    await removeSaved(uid, serviceId);
    return false;
  } else {
    await addSaved(uid, serviceId);
    return true;
  }
}

// ── Real-time ──────────────────────────────────────────────────────────────────

export function subscribeToSaved(
  uid: string,
  callback: (ids: string[]) => void
): () => void {
  return onSnapshot(savedCol(uid), (snap) => {
    callback(snap.docs.map((d) => d.id));
  });
}
