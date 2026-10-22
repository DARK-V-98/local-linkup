import DashboardShell from "@/components/dashboard/DashboardShell";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { submitVerification, type Verification } from "@/lib/firestore/workflows";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { toast } from "sonner";
export default function SellerVerification() {
    const user = getUser();
    const [application, setApplication] = useState<Verification | null>(null);
    const [busy, setBusy] = useState(false);
    const business = user?.sellerType === "business";
    useEffect(() => {
        if (!user)
            return;
        return onSnapshot(doc(db, "verifications", user.id), snap => setApplication(snap.exists() ? { ...snap.data(), id: snap.id } as Verification : null), () => toast.error("Could not load verification status."));
    }, [user?.id]);
    return <DashboardShell><div className="max-w-xl space-y-6"><h1 className="text-3xl font-black">Identity verification</h1><p>Status: {application?.status ?? "No application submitted"}</p>{application?.notes && <p className="border rounded-xl p-4">Review notes: {application.notes}</p>}{application?.status !== "approved" && <form className="bg-white border rounded-3xl p-6 space-y-4" onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const data = new FormData(form);
                setBusy(true);
                try {
                    await submitVerification(data, { sellerType: business ? "business" : "individual", businessRegistration: String(data.get("businessRegistration") ?? "") });
                    toast.success("Documents saved for admin review.");
                    form.reset();
                }
                catch (error) {
                    toast.error(error instanceof Error ? error.message : "Could not submit documents.");
                }
                finally {
                    setBusy(false);
                }
            }}><p className="text-sm text-slate-500">JPG, PNG or PDF, up to 5MB per document. Files are private to you and authorized reviewers.</p><label className="block font-bold text-sm">{business ? "Tax number" : "Identity number"}<input name={business ? "tin" : "nic"} required maxLength={100} className="block border rounded-xl p-3 w-full mt-2"/></label>{business && <label className="block font-bold text-sm">Business registration number<input name="businessRegistration" required maxLength={100} className="block border rounded-xl p-3 w-full mt-2"/></label>}{(business ? [{ name: "brnDoc", label: "Registration certificate" }, { name: "ownerId", label: "Owner ID" }] : [{ name: "idFront", label: "ID front" }, { name: "idBack", label: "ID back" }, { name: "selfie", label: "Selfie holding ID" }]).map(file => <label key={file.name} className="block text-sm font-bold">{file.label}<input required type="file" name={file.name} accept="image/jpeg,image/png,application/pdf" className="block w-full mt-2 border rounded-xl p-3"/></label>)}<button disabled={busy} className="rounded-xl p-3 bg-slate-900 text-white font-bold disabled:opacity-50">Submit documents</button></form>}</div></DashboardShell>;
}
