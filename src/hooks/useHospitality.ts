import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, query, where, type QueryConstraint } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { db } from "@/lib/firebase";
export async function businessCommand(action: string, data: Record<string, unknown> = {}) {
    const result = await httpsCallable<Record<string, unknown>, {
        id?: string;
    }>(getFunctions(undefined, "us-central1"), "businessOperations")({ action, ...data });
    return result.data;
}
export function useBusinessDoc<T>(path: string) {
    const [value, setValue] = useState<T | null>(null), [loading, setLoading] = useState(true), [error, setError] = useState("");
    useEffect(() => { setLoading(true); setError(""); return onSnapshot(doc(db, path), snap => { setValue(snap.exists() ? { ...snap.data(), id: snap.id } as T : null); setLoading(false); }, () => { setValue(null); setError("Could not load this record. Check your connection and access."); setLoading(false); }); }, [path]);
    return { value, loading, error };
}
export function useBusinessRows<T>(path: string, field?: string, value?: string | boolean) {
    const [rows, setRows] = useState<T[]>([]), [loading, setLoading] = useState(true), [error, setError] = useState("");
    useEffect(() => { setLoading(true); setError(""); const filters: QueryConstraint[] = field ? [where(field, "==", value)] : []; return onSnapshot(query(collection(db, path), ...filters), snap => { setRows(snap.docs.map(item => ({ ...item.data(), id: item.id }) as T)); setLoading(false); }, () => { setRows([]); setError("Could not load records. Check your connection and access."); setLoading(false); }); }, [path, field, value]);
    return { rows, loading, error };
}
