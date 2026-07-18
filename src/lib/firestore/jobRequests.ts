import {
  collection,
  addDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  increment,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export const JOB_REQUESTS_COL = "jobRequests";

export type JobUrgency = "flexible" | "this_week" | "urgent";

/** A buyer's open request for quotes — the "post a job" board. */
export interface FSJobRequest {
  id: string;
  title: string;
  category: string;
  categoryIcon: string;
  description: string;
  budget: string;
  district: string;
  urgency: JobUrgency;
  /** Absent for guest posts, which are allowed on this board */
  authorId?: string;
  authorName: string;
  phone: string;
  verified: boolean;
  responses: number;
  status: "open" | "closed";
  createdAt: Timestamp;
}

export async function addJobRequest(
  request: Omit<FSJobRequest, "id" | "createdAt" | "responses" | "status">
): Promise<string> {
  const ref = await addDoc(collection(db, JOB_REQUESTS_COL), {
    ...request,
    responses: 0,
    status: "open",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function incrementJobResponses(id: string): Promise<void> {
  await updateDoc(doc(db, JOB_REQUESTS_COL, id), { responses: increment(1) });
}

export function subscribeToJobRequests(
  callback: (requests: FSJobRequest[]) => void,
  n = 50
): () => void {
  const q = query(
    collection(db, JOB_REQUESTS_COL),
    orderBy("createdAt", "desc"),
    limit(n)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as FSJobRequest)));
  });
}
