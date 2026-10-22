import DashboardShell from "@/components/dashboard/DashboardShell";
import { subscribeToSubmissions, updateSubmission, type Submission } from "@/lib/firestore/workflows";
import { useEffect, useState } from "react";
import { toast } from "sonner";
export default function Requests() {
    const [rows, setRows] = useState<Submission[]>([]);
    const [filter, setFilter] = useState("open");
    const [error, setError] = useState("");
    const [notes, setNotes] = useState<Record<string, string>>({});
    const [busy, setBusy] = useState(false);
    useEffect(() => subscribeToSubmissions(setRows, () => setError("Could not load requests. Check your connection and permissions.")), []);
    const update = async (row: Submission, status: Submission["status"]) => {
        setBusy(true);
        try {
            await updateSubmission(row.id, status, notes[row.id] ?? row.notes ?? "");
            toast.success("Request updated.");
        }
        catch {
            toast.error("Could not update the request.");
        }
        finally {
            setBusy(false);
        }
    };
    return <DashboardShell><div className="space-y-6"><h1 className="text-3xl font-black">Support & service requests</h1><p className="text-slate-500">Contact messages, overseas enquiries, urgent service requests, newsletter requests and account requests.</p><select aria-label="Request status" value={filter} onChange={e => setFilter(e.target.value)} className="rounded-xl border p-3">{["all", "open", "in_progress", "closed"].map(value => <option key={value}>{value}</option>)}</select>{error && <p role="alert">{error}</p>}{rows.filter(row => filter === "all" || row.status === filter).map(row => <article key={row.id} className="border bg-white rounded-2xl p-5 space-y-3"><h2 className="font-black text-lg">{row.kind.replace(/_/g, " ")} · {row.status}</h2><p>{row.authorName} · <a href={`mailto:${row.email}`} className="text-primary">{row.email}</a></p><dl className="grid sm:grid-cols-2 gap-3">{Object.entries(row.payload).map(([key, value]) => <div key={key}><dt className="text-xs uppercase font-bold text-slate-500">{key}</dt><dd className="break-words whitespace-pre-wrap">{value}</dd></div>)}</dl><textarea aria-label="Internal notes" className="border rounded-xl p-3 w-full" value={notes[row.id] ?? row.notes ?? ""} maxLength={5000} onChange={e => setNotes({ ...notes, [row.id]: e.target.value })}/><div className="flex flex-wrap gap-3">{(["open", "in_progress", "closed"] as const).map(status => <button key={status} disabled={busy} onClick={() => void update(row, status)} className="border rounded-xl px-4 py-2 font-bold">{status.replace(/_/g, " ")}</button>)}</div></article>)}</div></DashboardShell>;
}
