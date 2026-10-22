import { callWorkflow, usePayments } from "@/hooks/usePayments";
import { csvCell } from "@/lib/dashboard";
import { formatPrice } from "@/lib/format";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import DashboardShell from "./DashboardShell";
export default function FinancialWorkspace({ role }: {
    role: "buyer" | "seller" | "admin";
}) {
    const { payments, payouts, balance, loading, error } = usePayments(role);
    const [busy, setBusy] = useState(false);
    const [form, setForm] = useState({ bank: "", accountNo: "", accountName: "", branch: "", amount: "" });
    const [requestId, setRequestId] = useState(() => crypto.randomUUID());
    const [references, setReferences] = useState<Record<string, string>>({});
    const paid = payments.filter(payment => payment.status === "paid" && !payment.test);
    const total = paid.reduce((sum, payment) => sum + payment.amountMinor, 0) / 100;
    const run = async (name: string, data: unknown) => {
        setBusy(true);
        try {
            await callWorkflow(name, data);
            toast.success("Financial record updated.");
            return true;
        }
        catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not complete the request.");
            return false;
        }
        finally {
            setBusy(false);
        }
    };
    const exportRecords = () => { const rows = [["Booking", "Service", "Amount LKR", "Method", "Status"], ...payments.map(p => [p.bookingId, p.serviceTitle, p.amountMinor / 100, p.method, p.status])]; const blob = new Blob([rows.map(row => row.map(csvCell).join(",")).join("\n")], { type: "text/csv;charset=utf-8" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "needly-payments.csv"; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); };
    return <DashboardShell><div className="space-y-6">
    <div className="flex flex-wrap justify-between gap-3"><div><h1 className="text-3xl font-black">{role === "seller" ? "Earnings & payouts" : "Payments"}</h1><p className="text-slate-500 mt-2">Verified payment records, including cash confirmed by the seller.</p></div><button onClick={exportRecords} className="rounded-xl border px-4 py-2 font-bold">Export CSV</button></div>
    {loading && <p role="status">Loading financial records…</p>}{error && <p role="alert" className="text-red-600">{error}</p>}
    <div className="grid sm:grid-cols-3 gap-4">{[{ label: role === "buyer" ? "Paid" : "Payments received", amount: total }, ...(role === "seller" ? [{ label: "Cleared online balance", amount: balance.availableMinor / 100 }, { label: "Reserved for payouts", amount: balance.reservedMinor / 100 }] : [])].map(metric => <div key={metric.label} className="bg-white border rounded-2xl p-5"><p className="text-sm text-slate-500">{metric.label}</p><p className="text-2xl font-black mt-2">{formatPrice(metric.amount)}</p></div>)}</div>
    <p className="text-sm text-slate-500">Booking value is separate from collected payments. Online funds become available after the service is completed and the buyer approves delivery. Sandbox payments are excluded from balances. Cash received directly is excluded from the platform payout balance.</p>
    <section className="bg-white border rounded-2xl overflow-x-auto"><table className="w-full text-sm text-left"><thead><tr>{["Service", "Amount", "Method", "Status", "Booking"].map(h => <th key={h} className="p-4">{h}</th>)}</tr></thead><tbody>{payments.map(payment => <tr key={payment.id} className="border-t"><td className="p-4">{payment.serviceTitle}</td><td className="p-4 whitespace-nowrap">{formatPrice(payment.amountMinor / 100)}</td><td className="p-4">{payment.method}{payment.test ? " (test)" : ""}</td><td className="p-4">{payment.status}</td><td className="p-4"><Link className="text-primary font-bold" to={`/booking/confirm/${payment.bookingId}`}>View</Link></td></tr>)}</tbody></table>{!loading && !payments.length && <p className="p-6 text-slate-500">No recorded payments yet.</p>}</section>
    {role === "seller" && (balance.payoutHold || balance.riskHold) && <p role="alert" className="text-red-600">Payouts are on hold pending a dispute or payment reconciliation. Contact support.</p>}
    {role === "seller" && <form className="bg-white border rounded-2xl p-6 space-y-4" onSubmit={async (e) => {
                e.preventDefault();
                if (await run("requestPayout", { ...form, amount: Number(form.amount), requestId })) {
                    setRequestId(crypto.randomUUID());
                    setForm({ bank: "", accountNo: "", accountName: "", branch: "", amount: "" });
                }
            }}><h2 className="text-xl font-black">Request a bank payout</h2><p className="text-sm text-slate-500">Minimum Rs. 500. Support processes approved requests manually and records the transfer reference.</p><div className="grid sm:grid-cols-2 gap-4">{Object.keys(form).map(key => <label key={key} className="text-sm capitalize">{key.replace(/([A-Z])/g, " $1")}<input required maxLength={key === "accountNo" ? 50 : 200} type={key === "amount" ? "number" : "text"} min={key === "amount" ? 500 : undefined} step={key === "amount" ? "0.01" : undefined} value={form[key as keyof typeof form]} onChange={e => setForm({ ...form, [key]: e.target.value })} className="block w-full mt-1 rounded-xl border p-3"/></label>)}</div><button disabled={busy} className="bg-slate-900 text-white rounded-xl p-3 font-bold disabled:opacity-50">Submit payout request</button></form>}
    {role !== "buyer" && <section className="space-y-4"><h2 className="text-xl font-black">Payout requests</h2>{!payouts.length && <p>No payout requests.</p>}{payouts.map(payout => <article key={payout.id} className="bg-white border rounded-2xl p-5 space-y-3"><p className="font-bold">{payout.sellerName} · {formatPrice(payout.amountMinor / 100)} · {payout.status}</p><p className="text-sm">{payout.bank} · {payout.accountNo} · {payout.accountName} · {payout.branch}</p>{payout.reference && <p>Reference: {payout.reference}</p>}{role === "admin" && payout.status === "pending" && <div className="flex flex-wrap gap-3"><input aria-label="Transfer reference or rejection reason" placeholder="Transfer reference or rejection reason" className="rounded-xl border p-3" value={references[payout.id] ?? ""} onChange={e => setReferences({ ...references, [payout.id]: e.target.value })}/><button disabled={busy || !references[payout.id]?.trim()} onClick={() => void run("resolvePayout", { id: payout.id, status: "paid", reference: references[payout.id] })} className="rounded-xl bg-slate-900 text-white p-3">Record completed bank transfer</button><button disabled={busy || !references[payout.id]?.trim()} onClick={() => void run("resolvePayout", { id: payout.id, status: "rejected", reference: references[payout.id] })} className="rounded-xl border p-3">Reject & release balance</button></div>}</article>)}</section>}
  </div></DashboardShell>;
}
