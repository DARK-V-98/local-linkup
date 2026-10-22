import { db } from "@/lib/firebase";
import {
addDoc,
collection,
doc,
getDoc,
limit,
onSnapshot,
orderBy,
query,
serverTimestamp,
setDoc,
type Timestamp
} from "firebase/firestore";

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

export async function sendJobQuote(requestId:string,uid:string,name:string,message:string) {
  if(!message.trim()||message.length>2000)throw new Error("Use 1–2,000 characters for your quote.");
  const ref=doc(db,JOB_REQUESTS_COL,requestId,"responses",uid);
  const existing=await getDoc(ref);if(existing.exists())throw new Error("You already submitted a quote for this job.");
  await setDoc(ref,{sellerId:uid,sellerName:name,message:message.trim(),createdAt:serverTimestamp()});
}
export function subscribeJobQuotes(requestId:string,callback:(rows:{id:string;sellerName:string;message:string}[])=>void,onError:(error:unknown)=>void) {
  return onSnapshot(collection(db,JOB_REQUESTS_COL,requestId,"responses"),snap=>callback(snap.docs.map(item=>({...item.data(),id:item.id}) as {id:string;sellerName:string;message:string})),onError);
}

export function subscribeToJobRequests(
  callback: (requests: FSJobRequest[]) => void,
  n = 50,
  onError?: (error:unknown)=>void
): () => void {
  const q = query(
    collection(db, JOB_REQUESTS_COL),
    orderBy("createdAt", "desc"),
    limit(n)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ ...d.data(), id: d.id } as FSJobRequest)));
  },onError);
}
