import { db } from "@/lib/firebase";
import {
addDoc,
collection,
deleteDoc,
doc,
getDocs,
limit,
onSnapshot,
orderBy,
query,
serverTimestamp,
setDoc,
type Timestamp
} from "firebase/firestore";

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

export async function setPostLiked(postId:string,uid:string,liked:boolean) {
 const target=doc(db,POSTS_COL,postId,"likes",uid);
 if(liked)await setDoc(target,{createdAt:serverTimestamp()});else await deleteDoc(target);
}
export function subscribePostLike(postId:string,uid:string,callback:(liked:boolean)=>void) {
 return onSnapshot(doc(db,POSTS_COL,postId,"likes",uid),snap=>callback(snap.exists()));
}
export async function addComment(postId:string,comment:Omit<FSPostComment,"id"|"createdAt"|"postId">) {
 await addDoc(collection(db,POSTS_COL,postId,"comments"),{...comment,postId,createdAt:serverTimestamp()});
}
export function subscribeComments(postId:string,callback:(comments:FSPostComment[])=>void,onError:(error:unknown)=>void) {
 return onSnapshot(query(collection(db,POSTS_COL,postId,"comments"),orderBy("createdAt","asc"),limit(100)),snap=>callback(snap.docs.map(item=>({...item.data(),id:item.id}) as FSPostComment)),onError);
}

// ── Reads ──────────────────────────────────────────────────────────────────────

export async function getFeedPosts(n = 30): Promise<FSPost[]> {
  const q = query(
    collection(db, POSTS_COL),
    orderBy("createdAt", "desc"),
    limit(n)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), id: d.id } as FSPost));
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
    callback(snap.docs.map((d) => ({ ...d.data(), id: d.id } as FSPost)));
  });
}
