import DashboardShell from "@/components/dashboard/DashboardShell";
import { useBusinessRows, businessCommand } from "@/hooks/useHospitality";
import { type HotelProperty, type EmergencyApplication } from "@/lib/hospitality";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
export default function BusinessApplications() {
    const hotels = useBusinessRows<HotelProperty>("hotelProperties"), emergency = useBusinessRows<EmergencyApplication>("emergencyApplications"), [busy, setBusy] = useState(false), [notes, setNotes] = useState<Record<string, string>>({});
    const rows = [...hotels.rows.map(item => ({ ...item, kind: "hotel", label: item.name })), ...emergency.rows.map(item => ({ ...item, kind: "emergency", label: item.displayName }))];
    return <DashboardShell><div className="business-page"><h1>Hotel & urgent-service applications</h1><p>Review the seller’s identity documents before approving a business capability. Approving a hotel does not enable instant booking or payment.</p><Link to="/admin/verifications" className="business-secondary">Review identity documents</Link>{(hotels.error || emergency.error) && <p role="alert">Could not load applications.</p>}{hotels.loading || emergency.loading ? <p>Loading applications…</p> : !rows.length ? <p>No applications yet.</p> : rows.map(row => <article className="business-card space-y-4" key={row.kind + row.id}><h2>{row.label} · {row.kind} · {row.status}</h2><p>Seller ID: {row.ownerId}</p><p>{row.district} · {row.phone}</p><p className="whitespace-pre-wrap">{row.description}</p>{"address" in row && <><p>{row.address}</p><p>{row.policy}</p><p>{row.facilities.join(", ")}</p></>}{"types" in row && <><p>Urgent categories: {row.types.join(", ")}</p><p>Hours: {row.hours}</p><div className="flex flex-wrap gap-3">{row.serviceIds.map(id => <Link className="text-primary underline" key={id} to={`/service/${id}`}>Review service {id}</Link>)}</div></>}<label className="business-form">Review notes<textarea value={notes[row.kind + row.id] ?? ""} onChange={e => setNotes(previous => ({ ...previous, [row.kind + row.id]: e.target.value }))} maxLength={2000}/></label><div className="flex flex-wrap gap-3">{["approved", "changes_requested", "rejected", "suspended"].map(status => <button key={status} className="business-secondary" disabled={busy} onClick={async () => { setBusy(true); try {
        await businessCommand("reviewBusiness", { id: row.id, kind: row.kind, status, notes: notes[row.kind + row.id] ?? "" });
        toast.success("Review saved.");
    }
    catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not save review.");
    }
    finally {
        setBusy(false);
    } }}>{status.replace(/_/g, " ")}</button>)}</div></article>)}</div></DashboardShell>;
}
