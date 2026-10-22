import { getUser } from "@/lib/auth";
import { auth, db, isFirebaseConfigured, storage } from "@/lib/firebase";
import { validateUpload } from "@/lib/validation";
import { addDoc, collection, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, writeBatch } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { ref, uploadBytes } from "firebase/storage";
export type SubmissionKind = "contact" | "overseas" | "emergency" | "newsletter" | "account_deletion" | "account_deactivation";
export interface Submission {
    id: string;
    kind: SubmissionKind;
    authorId: string;
    authorName: string;
    email: string;
    payload: Record<string, string>;
    status: "open" | "in_progress" | "closed";
    notes?: string;
}
export async function submitRequest(kind: SubmissionKind, payload: Record<string, string>) {
    const user = getUser();
    if (!isFirebaseConfigured || !user)
        throw new Error("Please sign in to submit this request.");
    if (Object.values(payload).some(value => value.length > 5000))
        throw new Error("Please keep each field under 5,000 characters.");
    return addDoc(collection(db, "submissions"), { kind, authorId: user.id, authorName: user.name, email: user.email, payload, status: "open", createdAt: serverTimestamp() });
}
export function subscribeToSubmissions(callback: (items: Submission[]) => void, fail: (error: unknown) => void) {
    return onSnapshot(query(collection(db, "submissions"), orderBy("createdAt", "desc")), snap => callback(snap.docs.map(item => ({ ...item.data(), id: item.id }) as Submission)), fail);
}
export async function updateSubmission(id: string, status: Submission["status"], notes: string) {
    await updateDoc(doc(db, "submissions", id), { status, notes, updatedAt: serverTimestamp() });
}
export interface Verification {
    id: string;
    status: "pending" | "approved" | "rejected";
    identityNumber: string;
    idType: string;
    documents: {
        name: string;
        path: string;
    }[];
    notes?: string;
    businessRegistration?: string;
}
export async function submitVerification(data: FormData, details: Record<string, string>) {
    const user = getUser();
    if (!user || !isFirebaseConfigured)
        throw new Error("Please sign in to submit your documents.");
    const identity = String(data.get("nic") ?? data.get("tin") ?? "").trim();
    if (!identity || identity.length > 100)
        throw new Error("Enter your identity or tax number.");
    const keys = details.sellerType === "business" ? ["brnDoc", "ownerId", "taxDoc"] : ["idFront", "idBack", "selfie"];
    const files = keys.map(key => ({ key, file: data.get(key) })).filter((item): item is {
        key: string;
        file: File;
    } => item.file instanceof File && item.file.size > 0);
    if (files.length < 2)
        throw new Error("Upload at least the two required identity documents.");
    files.forEach(({ file }) => validateUpload(file));
    if (auth.currentUser?.uid !== user.id)
        throw new Error("Your sign-in session changed. Sign in again before uploading documents.");
    const documents = [];
    for (const { key, file } of files) {
        const path = `verifications/${user.id}/${crypto.randomUUID()}-${key}`;
        try {
            await uploadBytes(ref(storage, path), file, { contentType: file.type });
        } catch (error) {
            const code = (error as { code?: string }).code;
            if (code === "storage/unauthorized") throw new Error("Your account is saved, but verification upload was denied. Retry or finish Identity verification from your seller dashboard. Contact support if access is still denied.");
            if (code === "storage/unauthenticated") throw new Error("Please sign in again before uploading verification documents.");
            throw error;
        }
        documents.push({ name: key, path });
    }
    const { sellerType: _type, ...fields } = details;
    await setDoc(doc(db, "verifications", user.id), { ...fields, identityNumber: String(data.get("nic") ?? data.get("tin") ?? ""), idType: String(data.get("idType") ?? "Business registration"), documents, status: "pending", submittedAt: serverTimestamp() }, { merge: true });
}
export async function viewVerificationFile(uid: string, path: string) {
    const result = await httpsCallable<{
        uid: string;
        path: string;
    }, {
        url: string;
    }>(getFunctions(undefined, "us-central1"), "verificationDocument")({ uid, path });
    const link = document.createElement("a");
    link.href = result.data.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.click();
}
export function subscribeVerifications(callback: (items: Verification[]) => void, fail: (error: unknown) => void) {
    return onSnapshot(collection(db, "verifications"), snap => callback(snap.docs.map(item => ({ ...item.data(), id: item.id }) as Verification)), fail);
}
export async function reviewVerification(uid: string, status: "approved" | "rejected", notes: string) {
    const application = await getDoc(doc(db, "verifications", uid));
    if (!application.exists() || !application.data().documents?.length)
        throw new Error("This seller has not submitted verification documents.");
    const batch = writeBatch(db);
    batch.update(doc(db, "verifications", uid), { status, notes, reviewedAt: serverTimestamp() });
    batch.update(doc(db, "users", uid), { verified: status === "approved", updatedAt: serverTimestamp() });
    await batch.commit();
}
export const defaultSettings = { siteName: "Needlyy", supportEmail: "support@needlyy.lk", supportPhone: "", whatsappNumber: "", registrationOpen: true, newSellerApplications: true };
export type PlatformSettings = typeof defaultSettings;
export async function getPlatformSettings(): Promise<PlatformSettings> {
    const snap = await getDoc(doc(db, "settings", "platform"));
    return { ...defaultSettings, ...snap.data() };
}
export async function savePlatformSettings(settings: PlatformSettings) {
    if (!settings.siteName.trim() || settings.siteName.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.supportEmail))
        throw new Error("Check the platform name and support email.");
    if (settings.whatsappNumber && !/^\+?\d{10,15}$/.test(settings.whatsappNumber))
        throw new Error("Use an international WhatsApp number with 10–15 digits.");
    await setDoc(doc(db, "settings", "platform"), settings);
}
