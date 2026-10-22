import { useAuth } from "@/hooks/useAuth";
import { isFirebaseConfigured } from "@/lib/firebase";
import {
subscribeToJobRequests,
type FSJobRequest,
type JobUrgency,
} from "@/lib/firestore/jobRequests";
import { tsToIso } from "@/lib/firestore/normalize";
import { useEffect,useState } from "react";

/** A job request shaped for the board, with the timestamp resolved. */
export interface JobRequestView {
  id: string;
  authorId?:string;
  title: string;
  category: string;
  categoryIcon: string;
  description: string;
  budget: string;
  district: string;
  urgency: JobUrgency;
  postedAt: Date;
  responses: number;
  name: string;
  verified: boolean;
}

/** Live "post a job" board, newest first. */
export function useJobRequests() {
  const [requests, setRequests] = useState<JobRequestView[]>([]);
  const [loading, setLoading] = useState(true);

  const {user}=useAuth();
  const [error,setError]=useState<string|null>(null);
  useEffect(() => {
    setRequests([]);
    if (!isFirebaseConfigured || !user) {
      setLoading(false);
      return;
    }

    let settled = false;
    const fallbackTimer = window.setTimeout(() => {
      if (!settled) setLoading(false);
    }, 5000);

    const unsub = subscribeToJobRequests((docs) => {
      settled = true;
      setRequests(docs.map(toView));
      setLoading(false);
    },50,()=>{setLoading(false);setError("Could not load job requests. Please sign in and check your connection.");});

    return () => {
      window.clearTimeout(fallbackTimer);
      unsub();
    };
  }, [user?.id]);

  return { requests, loading,error };
}

function toView(r: FSJobRequest): JobRequestView {
  return {
    id: r.id,
    authorId:r.authorId,
    title: r.title,
    category: r.category,
    categoryIcon: r.categoryIcon || "fa-tag",
    description: r.description,
    budget: r.budget,
    district: r.district,
    urgency: r.urgency,
    postedAt: new Date(tsToIso(r.createdAt)),
    responses: r.responses ?? 0,
    name: r.authorName,
    verified: Boolean(r.verified),
  };
}
