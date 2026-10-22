import DashboardShell from "@/components/dashboard/DashboardShell";
import { useAllUsers } from "@/hooks/useAllUsers";
import { reviewVerification, subscribeVerifications, viewVerificationFile, type Verification } from "@/lib/firestore/workflows";
import { useEffect, useState } from "react";
import { toast } from "sonner";
export default function Verifications() {
    const { users } = useAllUsers();
    const [apps, setApps] = useState<Verification[]>([]);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const [filter, setFilter] = useState("pending");
    const [notes, setNotes] = useState<Record<string, string>>({});
    useEffect(() => subscribeVerifications(setApps, () => setError("Could not load private verification applications.")), []);
    const review = async (app: Verification, status: "approved" | "rejected") => {
        setBusy(true);
        try {
            await reviewVerification(app.id, status, notes[app.id] ?? app.notes ?? "");
            toast.success("Verification decision saved.");
        }
        catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not save decision.");
        }
        finally {
            setBusy(false);
        }
    };
    return <DashboardShell><div className="space-y-6"><h1 className="text-3xl font-black">Seller verification</h1><p className="text-slate-500">Review private identity documents before approving a seller. Rejection does not suspend the account.</p><select aria-label="Application status" className="border rounded-xl p-3" value={filter} onChange={e => setFilter(e.target.value)}>{["all", "pending", "approved", "rejected"].map(value => <option key={value}>{value}</option>)}</select>{error && <p role="alert">{error}</p>}{!apps.length && <p>No submitted applications.</p>}{apps.filter(app => filter === "all" || app.status === filter).map(app => <article key={app.id} className="bg-white border rounded-2xl p-5 space-y-4"><h2 className="font-black text-xl">{users.find(user => user.id === app.id)?.name ?? app.id} · {app.status}</h2><p>{app.idType} · {app.identityNumber} {app.businessRegistration}</p><div className="flex flex-wrap gap-3">{app.documents.map(file => <button key={file.path} disabled={busy} className="rounded-xl border p-3 text-primary font-bold" onClick={async () => {
                    setBusy(true);
                    try {
                        await viewVerificationFile(app.id, file.path);
                    }
                    catch (error) {
                        toast.error(error instanceof Error ? error.message : "Could not open document.");
                    }
                    finally {
                        setBusy(false);
                    }
                }}>View {file.name}</button>)}</div><textarea aria-label="Review notes" maxLength={5000} className="w-full border rounded-xl p-3" value={notes[app.id] ?? app.notes ?? ""} onChange={e => setNotes({ ...notes, [app.id]: e.target.value })}/><div className="flex gap-3"><button disabled={busy} onClick={() => void review(app, "approved")} className="rounded-xl bg-slate-900 text-white p-3 font-bold">Approve identity</button><button disabled={busy} onClick={() => void review(app, "rejected")} className="rounded-xl border p-3 font-bold">Reject application</button></div></article>)}</div></DashboardShell>;
}
