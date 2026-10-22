import { useAuth } from "@/hooks/useAuth";
import { businessCommand, useBusinessRows } from "@/hooks/useHospitality";
import { type StayRequest } from "@/lib/hospitality";
import { useState } from "react";
import { toast } from "sonner";
export default function StayRequests({ owner = false }: {
    owner?: boolean;
}) {
    const { user } = useAuth(), { rows, loading, error } = useBusinessRows<StayRequest>("hotelRequests", owner ? "ownerId" : "buyerId", user!.id), [busy, setBusy] = useState(false);
    const act = async (action: string, data: Record<string, unknown>) => { setBusy(true); try {
        await businessCommand(action, data);
        toast.success("Request updated.");
    }
    catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not update request.");
    }
    finally {
        setBusy(false);
    } };
    return <div className="space-y-5">{error && <p role="alert">{error}</p>}{loading ? <p>Loading requests…</p> : !rows.length ? <p>No hotel requests yet. Guest requests and proposals appear here.</p> : rows.map(row => <article key={row.id} className="business-card space-y-4"><div><h2>{row.propertyName} · {row.status}</h2><p>{row.buyerName} · {row.arrival} to {row.departure}</p><p>{row.adults} adults · {row.children} children · {row.rooms} rooms</p><p className="mt-3 whitespace-pre-wrap">{row.notes}</p></div><p>Catalog estimate: <strong>LKR {(row.estimateMinor / 100).toLocaleString()}</strong></p><p className="text-sm">This is an enquiry. Room availability, final terms and payment are confirmed separately by the hotel. Accepting a proposal is not a confirmed reservation.</p>
 {row.quoteMinor !== undefined && <div className="business-notice"><strong>Proposal #{row.quoteVersion}: LKR {(row.quoteMinor / 100).toLocaleString()}</strong><p className="whitespace-pre-wrap">{row.quoteTerms}</p><p>Valid through {row.quoteExpires} (Sri Lanka date)</p></div>}
 {owner && ["requested", "quoted"].includes(row.status) && <form className="business-form" onSubmit={e => { e.preventDefault(); const form = new FormData(e.currentTarget); void act("quoteStay", { id: row.id, quoteMinor: Math.round(Number(form.get("price")) * 100), quoteExpires: form.get("expiry"), quoteTerms: form.get("terms") }); }}><div className="business-grid"><label>Total proposal price (LKR)<input required name="price" type="number" min="0.01" step="0.01" defaultValue={(row.quoteMinor ?? row.estimateMinor) / 100}/></label><label>Proposal expiry<input required type="date" name="expiry" max={row.arrival} defaultValue={row.quoteExpires}/></label></div><label>Itemized inclusions, availability conditions and full terms<textarea required name="terms" maxLength={5000} rows={4} defaultValue={row.quoteTerms}/></label><button disabled={busy} className="business-primary">Send {row.quoteVersion ? "revised " : ""}proposal</button></form>}
 {!owner && row.status === "quoted" && <div className="flex flex-wrap gap-3"><button disabled={busy} className="business-primary" onClick={() => void act("answerStayQuote", { id: row.id, status: "accepted", quoteVersion: row.quoteVersion })}>Agree to proposal terms</button><button disabled={busy} className="business-secondary" onClick={() => void act("answerStayQuote", { id: row.id, status: "declined", quoteVersion: row.quoteVersion })}>Decline proposal</button></div>}
 {row.status !== "closed" && <button disabled={busy} className="business-secondary" onClick={() => void act("closeStay", { id: row.id })}>Close enquiry</button>}</article>)}</div>;
}
