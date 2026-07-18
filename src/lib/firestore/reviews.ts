import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export const REVIEWS_COL = "reviews";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface FSReview {
  id: string;
  serviceId: string;
  sellerId: string;
  buyerId: string;
  bookingId?: string;
  author: string;
  initial: string;
  rating: number;
  text: string;
  reply?: string;
  repliedAt?: Timestamp;
  createdAt: Timestamp;
}

// ── Writes ─────────────────────────────────────────────────────────────────────

export async function addReview(
  review: Omit<FSReview, "id" | "createdAt">
): Promise<string> {
  const ref = await addDoc(collection(db, REVIEWS_COL), {
    ...review,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function addSellerReply(
  reviewId: string,
  reply: string
): Promise<void> {
  const { updateDoc } = await import("firebase/firestore");
  await updateDoc(doc(db, REVIEWS_COL, reviewId), {
    reply,
    repliedAt: serverTimestamp(),
  });
}

// ── Reads ──────────────────────────────────────────────────────────────────────

export async function getReviewsByService(
  serviceId: string
): Promise<FSReview[]> {
  const q = query(
    collection(db, REVIEWS_COL),
    where("serviceId", "==", serviceId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FSReview));
}

export async function getReviewsBySeller(
  sellerId: string
): Promise<FSReview[]> {
  const q = query(
    collection(db, REVIEWS_COL),
    where("sellerId", "==", sellerId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FSReview));
}

// ── Real-time ──────────────────────────────────────────────────────────────────

export function subscribeToServiceReviews(
  serviceId: string,
  callback: (reviews: FSReview[]) => void
): () => void {
  const q = query(
    collection(db, REVIEWS_COL),
    where("serviceId", "==", serviceId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as FSReview)));
  });
}

/**
 * Recent high-rated reviews across the whole platform, for the home page
 * testimonial strip. Reviews are publicly readable.
 */
export async function getTopReviews(n = 3): Promise<FSReview[]> {
  const { limit } = await import("firebase/firestore");
  const q = query(
    collection(db, REVIEWS_COL),
    where("rating", ">=", 4),
    orderBy("rating", "desc"),
    orderBy("createdAt", "desc"),
    limit(n)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FSReview));
}
