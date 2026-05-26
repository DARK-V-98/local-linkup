import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { StoredBooking } from "@/lib/store";

export const BOOKINGS_COL = "bookings";

export interface FirestoreBooking extends Omit<StoredBooking, "createdAt"> {
  buyerId: string;
  sellerId: string;
  createdAt: Timestamp | string;
  updatedAt?: Timestamp;
  statusNote?: string;
  cancelReason?: string;
  completedAt?: Timestamp;
}

// ── Writes ─────────────────────────────────────────────────────────────────────

export async function addFirestoreBooking(
  booking: Omit<FirestoreBooking, "createdAt" | "updatedAt">
): Promise<string> {
  const ref = await addDoc(collection(db, BOOKINGS_COL), {
    ...booking,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateFirestoreBookingStatus(
  id: string,
  status: StoredBooking["status"],
  options: { note?: string; cancelReason?: string } = {}
): Promise<void> {
  const updates: Record<string, unknown> = {
    status,
    updatedAt: serverTimestamp(),
  };
  if (options.note) updates.statusNote = options.note;
  if (options.cancelReason) updates.cancelReason = options.cancelReason;
  if (status === "completed") updates.completedAt = serverTimestamp();

  await updateDoc(doc(db, BOOKINGS_COL, id), updates);
}

// ── Reads ──────────────────────────────────────────────────────────────────────

export async function getFirestoreBookingById(
  id: string
): Promise<FirestoreBooking | null> {
  try {
    const snap = await getDoc(doc(db, BOOKINGS_COL, id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as FirestoreBooking;
  } catch {
    return null;
  }
}

export async function getBookingsByBuyer(
  buyerId: string
): Promise<FirestoreBooking[]> {
  const q = query(
    collection(db, BOOKINGS_COL),
    where("buyerId", "==", buyerId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreBooking));
}

export async function getBookingsBySeller(
  sellerId: string
): Promise<FirestoreBooking[]> {
  const q = query(
    collection(db, BOOKINGS_COL),
    where("sellerId", "==", sellerId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreBooking));
}

// ── Real-time subscriptions ────────────────────────────────────────────────────

export function subscribeToBookingsByBuyer(
  buyerId: string,
  callback: (bookings: FirestoreBooking[]) => void
): () => void {
  const q = query(
    collection(db, BOOKINGS_COL),
    where("buyerId", "==", buyerId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreBooking)));
  });
}

export function subscribeToBookingsBySeller(
  sellerId: string,
  callback: (bookings: FirestoreBooking[]) => void
): () => void {
  const q = query(
    collection(db, BOOKINGS_COL),
    where("sellerId", "==", sellerId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreBooking)));
  });
}
