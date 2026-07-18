import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  increment,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { StoredService } from "@/lib/store";

export const SERVICES_COL = "services";

export interface FirestoreService extends Omit<StoredService, "createdAt"> {
  sellerId: string;
  sellerName: string;
  sellerPhone?: string;
  sellerVerified?: boolean;
  sellerBio?: string;
  sellerMember?: string;
  sellerJobs?: number;
  sellerDistrict?: string;
  badge?: string | null;
  badgeIcon?: string | null;
  location?: string;
  imageUrl?: string;
  reviewCount?: number;
  /** Firestore Timestamp on reads, ISO string in local fallback */
  createdAt?: unknown;
  updatedAt?: unknown;
}

// ── Filters type ───────────────────────────────────────────────────────────────

export interface ServiceFilters {
  category?: string;
  district?: string;
  type?: string;
  maxPrice?: number;
  minRating?: number;
  search?: string;
  pageSize?: number;
}

// ── Reads ──────────────────────────────────────────────────────────────────────

export async function fetchServices(filters: ServiceFilters = {}): Promise<FirestoreService[]> {
  const constraints: QueryConstraint[] = [];

  if (filters.category) {
    constraints.push(where("category", "==", filters.category));
  }
  if (filters.district && filters.district !== "All Districts") {
    constraints.push(where("district", "==", filters.district));
  }
  if (filters.type) {
    constraints.push(where("type", "==", filters.type));
  }

  constraints.push(where("status", "==", "active"));
  constraints.push(orderBy("createdAt", "desc"));
  constraints.push(limit(filters.pageSize ?? 50));

  const q = query(collection(db, SERVICES_COL), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreService));
}

export async function fetchServiceById(id: string): Promise<FirestoreService | null> {
  try {
    const snap = await getDoc(doc(db, SERVICES_COL, id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as FirestoreService;
  } catch {
    return null;
  }
}

export async function fetchMyServices(sellerId: string): Promise<FirestoreService[]> {
  const q = query(
    collection(db, SERVICES_COL),
    where("sellerId", "==", sellerId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreService));
}

/**
 * Real per-category service counts, keyed by category name.
 * One query over active services, tallied client-side — Firestore has no
 * group-by, and the alternative is one count query per category.
 */
export async function fetchCategoryCounts(): Promise<Record<string, number>> {
  const q = query(collection(db, SERVICES_COL), where("status", "==", "active"));
  const snap = await getDocs(q);
  return snap.docs.reduce<Record<string, number>>((acc, d) => {
    const category = (d.data() as FirestoreService).category;
    if (category) acc[category] = (acc[category] ?? 0) + 1;
    return acc;
  }, {});
}

export async function fetchTopServices(n = 8): Promise<FirestoreService[]> {
  const q = query(
    collection(db, SERVICES_COL),
    where("status", "==", "active"),
    orderBy("orders", "desc"),
    limit(n)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreService));
}

// ── Writes ─────────────────────────────────────────────────────────────────────

export async function addFirestoreService(
  service: Omit<FirestoreService, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const ref = await addDoc(collection(db, SERVICES_COL), {
    ...service,
    views: 0,
    orders: 0,
    rating: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateFirestoreService(
  id: string,
  updates: Partial<Omit<FirestoreService, "id">>
): Promise<void> {
  await updateDoc(doc(db, SERVICES_COL, id), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteFirestoreService(id: string): Promise<void> {
  await deleteDoc(doc(db, SERVICES_COL, id));
}

export async function incrementServiceViews(id: string): Promise<void> {
  await updateDoc(doc(db, SERVICES_COL, id), {
    views: increment(1),
  });
}

// ── Real-time ──────────────────────────────────────────────────────────────────

export function subscribeToMyServices(
  sellerId: string,
  callback: (services: FirestoreService[]) => void
): () => void {
  const q = query(
    collection(db, SERVICES_COL),
    where("sellerId", "==", sellerId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreService)));
  });
}

export function subscribeToServices(
  filters: ServiceFilters,
  callback: (services: FirestoreService[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const constraints: QueryConstraint[] = [
    where("status", "==", "active"),
    orderBy("createdAt", "desc"),
    limit(filters.pageSize ?? 50),
  ];
  if (filters.category) constraints.unshift(where("category", "==", filters.category));
  if (filters.district && filters.district !== "All Districts") {
    constraints.unshift(where("district", "==", filters.district));
  }

  const q = query(collection(db, SERVICES_COL), ...constraints);
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreService))),
    // Without a handler Firestore logs an uncaught error and the caller is
    // left waiting forever — surface it so the UI can stop loading.
    (err) => onError?.(err)
  );
}

/**
 * Every listing regardless of status — admin catalog moderation only.
 */
export function subscribeToAllServices(
  callback: (services: FirestoreService[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const q = query(collection(db, SERVICES_COL), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreService))),
    (err) => onError?.(err)
  );
}
