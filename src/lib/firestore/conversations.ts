import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export const CONVERSATIONS_COL = "conversations";
export const MESSAGES_SUBCOL = "messages";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface FSConversation {
  id: string;
  participants: string[]; // [buyerId, sellerId]
  buyerId: string;
  sellerId: string;
  buyerName: string;
  buyerInitial: string;
  sellerName: string;
  sellerInitial: string;
  serviceId: string;
  serviceName: string;
  lastMessage: string;
  lastAt: Timestamp;
  unreadBuyer: number;
  unreadSeller: number;
  buyerOnline?: boolean;
  sellerOnline?: boolean;
  createdAt?: Timestamp;
}

export interface FSMessage {
  id: string;
  conversationId: string;
  senderId: string;
  from: "buyer" | "seller";
  text: string;
  sentAt: Timestamp;
  read: boolean;
  type?: "text" | "image" | "file";
  attachmentUrl?: string;
}

// ── Conversations ──────────────────────────────────────────────────────────────

export async function createConversation(
  data: Omit<FSConversation, "id" | "lastAt" | "createdAt">
): Promise<string> {
  const ref = await addDoc(collection(db, CONVERSATIONS_COL), {
    ...data,
    lastAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getConversationById(
  id: string
): Promise<FSConversation | null> {
  try {
    const snap = await getDoc(doc(db, CONVERSATIONS_COL, id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as FSConversation;
  } catch {
    return null;
  }
}

export async function findExistingConversation(
  buyerId: string,
  sellerId: string,
  serviceId: string
): Promise<FSConversation | null> {
  const q = query(
    collection(db, CONVERSATIONS_COL),
    where("buyerId", "==", buyerId),
    where("sellerId", "==", sellerId),
    where("serviceId", "==", serviceId)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as FSConversation;
}

export async function markConversationRead(
  conversationId: string,
  role: "buyer" | "seller"
): Promise<void> {
  const field = role === "buyer" ? "unreadBuyer" : "unreadSeller";
  await updateDoc(doc(db, CONVERSATIONS_COL, conversationId), {
    [field]: 0,
  });
}

export async function updateOnlineStatus(
  conversationId: string,
  role: "buyer" | "seller",
  online: boolean
): Promise<void> {
  const field = role === "buyer" ? "buyerOnline" : "sellerOnline";
  await updateDoc(doc(db, CONVERSATIONS_COL, conversationId), {
    [field]: online,
  });
}

// ── Real-time conversations ────────────────────────────────────────────────────

export function subscribeToConversations(
  userId: string,
  callback: (convos: FSConversation[]) => void
): () => void {
  const q = query(
    collection(db, CONVERSATIONS_COL),
    where("participants", "array-contains", userId),
    orderBy("lastAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as FSConversation)));
  });
}

// ── Messages ──────────────────────────────────────────────────────────────────

export async function sendMessage(
  conversationId: string,
  msg: Omit<FSMessage, "id" | "sentAt" | "conversationId">
): Promise<void> {
  // Add message to subcollection
  const msgRef = collection(db, CONVERSATIONS_COL, conversationId, MESSAGES_SUBCOL);
  await addDoc(msgRef, {
    ...msg,
    conversationId,
    sentAt: serverTimestamp(),
    read: false,
  });

  // Update conversation: last message + increment unread for recipient
  const unreadField = msg.from === "seller" ? "unreadBuyer" : "unreadSeller";
  await updateDoc(doc(db, CONVERSATIONS_COL, conversationId), {
    lastMessage: msg.text,
    lastAt: serverTimestamp(),
    [unreadField]: increment(1),
  });
}

export async function markMessagesRead(
  conversationId: string,
  role: "buyer" | "seller"
): Promise<void> {
  // Reset unread counter on conversation
  await markConversationRead(conversationId, role);
}

// ── Real-time messages ─────────────────────────────────────────────────────────

export function subscribeToMessages(
  conversationId: string,
  callback: (messages: FSMessage[]) => void
): () => void {
  const q = query(
    collection(db, CONVERSATIONS_COL, conversationId, MESSAGES_SUBCOL),
    orderBy("sentAt", "asc")
  );
  return onSnapshot(q, (snap) => {
    callback(
      snap.docs.map((d) => ({ id: d.id, ...d.data() } as FSMessage))
    );
  });
}
