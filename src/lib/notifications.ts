import { getUser } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { collection, doc, limit, onSnapshot, orderBy, query, writeBatch } from "firebase/firestore";
export interface AppNotification {
    id: string;
    type: "booking_new" | "booking_confirmed" | "booking_completed" | "message" | "review";
    title: string;
    body: string;
    link?: string;
    createdAt: string;
    read: boolean;
}
let rows: AppNotification[] = [];
const emit = () => window.dispatchEvent(new Event("needly-notifications-change"));
export const getNotifications = () => rows;
export function startNotificationSync(uid: string) {
    rows = [];
    emit();
    return onSnapshot(query(collection(db, "users", uid, "notifications"), orderBy("createdAt", "desc"), limit(50)), snap => { rows = snap.docs.map(item => ({ ...item.data(), id: item.id, createdAt: item.data().createdAt?.toDate?.().toISOString() ?? new Date().toISOString() }) as AppNotification); emit(); }, () => { rows = []; emit(); });
}
export function clearNotifications() { rows = []; emit(); }
export async function markNotificationsRead(id?: string) {
    const user = getUser();
    if (!user)
        return;
    const batch = writeBatch(db);
    rows.filter(row => !row.read && (!id || row.id === id)).forEach(row => batch.update(doc(db, "users", user.id, "notifications", row.id), { read: true }));
    await batch.commit();
}
