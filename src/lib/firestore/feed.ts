import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  increment,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export const POSTS_COL = "feedPosts";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface FSPost {
  id: string;
  authorId: string;
  authorName: string;
  authorInitial: string;
  authorRole: "buyer" | "seller";
  category: string;
  title: string;
  description: string;
  price?: number;
  imageUrl?: string;
  likes: number;
  shares: number;
  comments: number;
  createdAt: Timestamp;
}

export interface FSPostComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorInitial: string;
  text: string;
  createdAt: Timestamp;
}

// ── Writes ─────────────────────────────────────────────────────────────────────

export async function addFeedPost(
  post: Omit<FSPost, "id" | "createdAt" | "likes" | "shares" | "comments">
): Promise<string> {
  const ref = await addDoc(collection(db, POSTS_COL), {
    ...post,
    likes: 0,
    shares: 0,
    comments: 0,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function likePost(postId: string): Promise<void> {
  await updateDoc(doc(db, POSTS_COL, postId), {
    likes: increment(1),
  });
}

export async function sharePost(postId: string): Promise<void> {
  await updateDoc(doc(db, POSTS_COL, postId), {
    shares: increment(1),
  });
}

export async function addComment(
  postId: string,
  comment: Omit<FSPostComment, "id" | "createdAt" | "postId">
): Promise<void> {
  await addDoc(collection(db, POSTS_COL, postId, "comments"), {
    ...comment,
    postId,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, POSTS_COL, postId), {
    comments: increment(1),
  });
}

// ── Reads ──────────────────────────────────────────────────────────────────────

export async function getFeedPosts(n = 30): Promise<FSPost[]> {
  const q = query(
    collection(db, POSTS_COL),
    orderBy("createdAt", "desc"),
    limit(n)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FSPost));
}

// ── Real-time ──────────────────────────────────────────────────────────────────

export function subscribeToFeed(
  callback: (posts: FSPost[]) => void,
  n = 30
): () => void {
  const q = query(
    collection(db, POSTS_COL),
    orderBy("createdAt", "desc"),
    limit(n)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as FSPost)));
  });
}
