import { db } from "@/lib/firebase";
import type { StoredBooking } from "@/lib/store";
import {
arrayUnion,
collection,
doc,
getDoc,
getDocs,
onSnapshot,
orderBy,
query,
runTransaction,
serverTimestamp,
setDoc,
where,
type Timestamp
} from "firebase/firestore";

export const BOOKINGS_COL = "bookings";

export interface FirestoreBooking extends Omit<StoredBooking, "createdAt"> {
  buyerId: string;
  sellerId: string;
  createdAt: Timestamp | string;
  updatedAt?: Timestamp;
  statusNote?: string;
  cancelReason?: string;
  completedAt?: Timestamp;
  buyerApprovedAt?: Timestamp;
}

// ── Writes ─────────────────────────────────────────────────────────────────────

export async function addFirestoreBooking(
  booking: Omit<FirestoreBooking, "createdAt" | "updatedAt">
): Promise<string> {
  const ref = doc(db, BOOKINGS_COL, booking.id);
  await setDoc(ref, { ...booking, statusHistory: [{ status: "pending", at: new Date().toISOString() }], createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
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

  await runTransaction(db, async tx => {
    const ref = doc(db, BOOKINGS_COL, id);
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error("Booking not found.");
    const transitions: Record<string, string[]> = { pending: ["confirmed", "cancelled"], confirmed: ["in_progress", "cancelled"], in_progress: ["completed", "cancelled"], completed: [], cancelled: [] };
    if (!transitions[snap.data().status]?.includes(status)) throw new Error("This status change is no longer available. Refresh the order.");
    tx.update(ref, { ...updates, statusHistory: arrayUnion({ status, at: new Date().toISOString() }) });
  });
}

// ── Reads ──────────────────────────────────────────────────────────────────────

export async function getFirestoreBookingById(
  id: string
): Promise<FirestoreBooking | null> {
  try {
    const snap = await getDoc(doc(db, BOOKINGS_COL, id));
    if (!snap.exists()) return null;
    return { ...snap.data(), id: snap.id } as FirestoreBooking;
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
  return snap.docs.map((d) => ({ ...d.data(), id: d.id } as FirestoreBooking));
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
  return snap.docs.map((d) => ({ ...d.data(), id: d.id } as FirestoreBooking));
}

// ── Real-time subscriptions ────────────────────────────────────────────────────

export function subscribeToBookingsByBuyer(
  buyerId: string,
  callback: (bookings: FirestoreBooking[]) => void,
  onError?: (error: unknown) => void
): () => void {
  const q = query(
    collection(db, BOOKINGS_COL),
    where("buyerId", "==", buyerId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ ...d.data(), id: d.id } as FirestoreBooking)));
  }, onError);
}

export function subscribeToBookingsBySeller(
  sellerId: string,
  callback: (bookings: FirestoreBooking[]) => void,
  onError?: (error: unknown) => void
): () => void {
  const q = query(
    collection(db, BOOKINGS_COL),
    where("sellerId", "==", sellerId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ ...d.data(), id: d.id } as FirestoreBooking)));
  }, onError);
}

/**
 * Every booking on the platform — admin screens only.
 * The security rules restrict reads to admins and the parties involved.
 */
export function subscribeToAllBookings(
  callback: (bookings: FirestoreBooking[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const q = query(collection(db, BOOKINGS_COL), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ ...d.data(), id: d.id } as FirestoreBooking))),
    (err) => onError?.(err)
  );
}

export function subscribeToBooking(id: string, callback: (booking: FirestoreBooking | null) => void, onError: (error: unknown) => void) {
  return onSnapshot(doc(db, BOOKINGS_COL, id), snap => callback(snap.exists() ? { ...snap.data(), id: snap.id } as FirestoreBooking : null), onError);
}
