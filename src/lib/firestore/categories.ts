import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { AdminCategory } from "@/lib/adminCategories";

export const CATEGORIES_COL = "categories";

export interface FirestoreCategory extends Omit<AdminCategory, "createdAt"> {
  /** Firestore Timestamp on reads, ISO string in the local fallback */
  createdAt?: unknown;
  updatedAt?: unknown;
}

// ── Reads ──────────────────────────────────────────────────────────────────────

export async function fetchCategories(): Promise<FirestoreCategory[]> {
  const q = query(collection(db, CATEGORIES_COL), orderBy("order", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreCategory));
}

export function subscribeToCategories(
  callback: (categories: FirestoreCategory[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const q = query(collection(db, CATEGORIES_COL), orderBy("order", "asc"));
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreCategory))),
    (err) => onError?.(err)
  );
}

// ── Writes ─────────────────────────────────────────────────────────────────────

export async function addFirestoreCategory(
  category: Omit<AdminCategory, "id" | "createdAt">
): Promise<string> {
  const id = slugify(category.name);
  await setDoc(doc(db, CATEGORIES_COL, id), {
    ...category,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return id;
}

export async function updateFirestoreCategory(
  id: string,
  updates: Partial<Omit<FirestoreCategory, "id">>
): Promise<void> {
  await updateDoc(doc(db, CATEGORIES_COL, id), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteFirestoreCategory(id: string): Promise<void> {
  await deleteDoc(doc(db, CATEGORIES_COL, id));
}

/**
 * Writes the starter category set on a first run. Uses a batch so the
 * collection either seeds fully or not at all.
 */
export async function seedCategories(
  categories: Omit<AdminCategory, "createdAt">[]
): Promise<void> {
  const batch = writeBatch(db);
  categories.forEach((cat, i) => {
    const { id, ...rest } = cat;
    batch.set(doc(db, CATEGORIES_COL, id), {
      ...rest,
      order: rest.order ?? i,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
  await batch.commit();
}

/** Stable, human-readable document id derived from the category name. */
export function slugify(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || `cat-${Date.now()}`;
}
