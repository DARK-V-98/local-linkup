import { useState, useEffect } from "react";
import { isFirebaseConfigured } from "@/lib/firebase";
import {
  subscribeToJobRequests,
  type FSJobRequest,
  type JobUrgency,
} from "@/lib/firestore/jobRequests";
import { tsToIso } from "@/lib/firestore/normalize";

/** A job request shaped for the board, with the timestamp resolved. */
export interface JobRequestView {
  id: string;
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

  useEffect(() => {
    if (!isFirebaseConfigured) {
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
    });

    return () => {
      window.clearTimeout(fallbackTimer);
      unsub();
    };
  }, []);

  return { requests, loading };
}

function toView(r: FSJobRequest): JobRequestView {
  return {
    id: r.id,
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
