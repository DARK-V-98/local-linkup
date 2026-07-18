import {
  collection,
  doc,
  addDoc,
  updateDoc,
  arrayUnion,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export const DISPUTES_COL = "disputes";

export type DisputeStatus = "open" | "investigating" | "resolved" | "closed";
export type DisputeType = "no_show" | "quality" | "payment" | "fraud" | "other";

export interface FSDisputeMessage {
  from: "buyer" | "seller" | "admin";
  text: string;
  /** ISO string — array elements cannot hold a serverTimestamp sentinel */
  at: string;
}

export interface FSDispute {
  id: string;
  orderId: string;
  type: DisputeType;
  status: DisputeStatus;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  service: string;
  amount: number;
  description: string;
  messages: FSDisputeMessage[];
  resolution?: string;
  createdAt: Timestamp;
}

export async function raiseDispute(
  dispute: Omit<FSDispute, "id" | "createdAt" | "status" | "messages">
): Promise<string> {
  const ref = await addDoc(collection(db, DISPUTES_COL), {
    ...dispute,
    status: "open",
    messages: [],
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function addDisputeMessage(
  id: string,
  message: FSDisputeMessage,
  status?: DisputeStatus
): Promise<void> {
  await updateDoc(doc(db, DISPUTES_COL, id), {
    messages: arrayUnion(message),
    ...(status ? { status } : {}),
  });
}

export async function setDisputeStatus(
  id: string,
  status: DisputeStatus,
  resolution?: string
): Promise<void> {
  await updateDoc(doc(db, DISPUTES_COL, id), {
    status,
    ...(resolution ? { resolution } : {}),
  });
}

export function subscribeToDisputes(
  callback: (disputes: FSDispute[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const q = query(collection(db, DISPUTES_COL), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as FSDispute))),
    (err) => onError?.(err)
  );
}
