import { getUser } from "@/lib/auth";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useEffect, useState } from "react";
export interface Payment {
    id: string;
    bookingId: string;
    buyerId: string;
    sellerId: string;
    serviceTitle: string;
    amountMinor: number;
    status: string;
    method: string;
    test?: boolean;
    createdAt?: {
        toMillis?: () => number;
    };
}
export interface Payout {
    id: string;
    sellerId: string;
    sellerName: string;
    amountMinor: number;
    bank: string;
    accountNo: string;
    accountName: string;
    branch: string;
    status: string;
    reference?: string;
}
export function usePayments(role: "buyer" | "seller" | "admin") {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [balance, setBalance] = useState({ availableMinor: 0, reservedMinor: 0, payoutHold: false, riskHold: false });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const user = getUser();
    useEffect(() => {
        setPayments([]);
        setPayouts([]);
        setBalance({ availableMinor: 0, reservedMinor: 0, payoutHold: false, riskHold: false });
        if (!user || !isFirebaseConfigured) {
            setLoading(false);
            setError("Payments require a database connection.");
            return;
        }
        const fail = () => { setLoading(false); setError("Could not load financial records. Check your connection and permissions."); };
        const base = collection(db, "payments");
        const stop = onSnapshot(role === "admin" ? base : query(base, where(role === "buyer" ? "buyerId" : "sellerId", "==", user.id)), snap => { setPayments(snap.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Payment).sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0))); setLoading(false); setError(null); }, fail);
        const stops = [stop];
        if (role !== "buyer") {
            const base = collection(db, "payouts");
            stops.push(onSnapshot(role === "admin" ? base : query(base, where("sellerId", "==", user.id)), snap => setPayouts(snap.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Payout)), fail));
        }
        if (role === "seller")
            stops.push(onSnapshot(doc(db, "balances", user.id), snap => setBalance({ availableMinor: snap.data()?.availableMinor ?? 0, reservedMinor: snap.data()?.reservedMinor ?? 0, payoutHold: snap.data()?.payoutHold ?? false, riskHold: snap.data()?.riskHold ?? false }), fail));
        return () => stops.forEach(stop => stop());
    }, [role, user?.id]);
    return { payments, payouts, balance, loading, error };
}
export async function callWorkflow(name: string, data: unknown) { return httpsCallable(getFunctions(undefined, "us-central1"), name)(data); }
