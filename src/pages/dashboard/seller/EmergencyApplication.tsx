import DashboardShell from "@/components/dashboard/DashboardShell";
import { useMyServices } from "@/hooks/useMyServices";
import { useBusinessDoc, businessCommand } from "@/hooks/useHospitality";
import { useAuth } from "@/hooks/useAuth";
import { EMERGENCY_TYPES, type EmergencyApplication as Application } from "@/lib/hospitality";
import { SL_DISTRICTS } from "@/data/catalog";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
export default function EmergencyApplication() {
    const { user } = useAuth(), { services } = useMyServices(), { value, loading, error } = useBusinessDoc<Application>(`emergencyApplications/${user!.id}`), [busy, setBusy] = useState(false);
    return <DashboardShell><div className="business-page"><p className="business-eyebrow">EXPAND YOUR SERVICES</p><h1>Emergency service application</h1><p>Apply after creating your seller profile and active service listings. An administrator reviews your identity, services and coverage before you appear in urgent-service matching.</p>{error && <p role="alert">{error}</p>}{loading ? <p>Loading application…</p> : <><div className="business-notice">Status: <strong>{value?.status ?? "Not submitted"}</strong>{value?.notes && <p>{value.notes}</p>}</div><form key={value?.status ?? "new"} className="business-card business-form" onSubmit={async (e) => { e.preventDefault(); const form = new FormData(e.currentTarget); setBusy(true); try {
            await businessCommand("applyEmergency", { types: form.getAll("types"), serviceIds: form.getAll("serviceIds"), district: form.get("district"), phone: form.get("phone"), hours: form.get("hours"), description: form.get("description") });
            toast.success("Application submitted for review.");
        }
        catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not submit application.");
        }
        finally {
            setBusy(false);
        } }}>
 <fieldset><legend>Services you can provide urgently</legend><div className="business-checks">{EMERGENCY_TYPES.map(type => <label key={type.id}><input type="checkbox" name="types" value={type.id} defaultChecked={value?.types.includes(type.id)}/>{type.label}</label>)}</div></fieldset>
 <fieldset><legend>Your active listings (maximum five)</legend>{services.filter(item => item.status === "active").length ? services.filter(item => item.status === "active").map(item => <label className="business-check" key={item.id}><input type="checkbox" name="serviceIds" value={item.id} defaultChecked={value?.serviceIds.includes(item.id)}/>{item.title}</label>) : <p>Publish a service first. <Link to="/dashboard/seller/new-service">Create a service</Link></p>}</fieldset>
 <div className="business-grid"><label>Coverage district<select name="district" defaultValue={value?.district ?? user?.district ?? "Colombo"}>{SL_DISTRICTS.filter(item => !["All Districts", "Online"].includes(item)).map(item => <option key={item}>{item}</option>)}</select></label><label>Public contact phone<input required name="phone" type="tel" maxLength={40} defaultValue={value?.phone ?? user?.phone}/></label></div>
 <label>Actual service hours<input required name="hours" maxLength={300} defaultValue={value?.hours} placeholder="For example: Monday–Saturday, 7am–8pm"/></label><label>Experience and urgent-service coverage<textarea required name="description" maxLength={2000} defaultValue={value?.description} rows={4}/></label><p className="text-sm text-slate-500">Your contact, coverage and hours become public after approval. Response times and prices are agreed directly with customers. Resubmitting removes your existing urgent listing until review.</p><button disabled={busy || value?.status === "suspended"} className="business-primary">{busy ? "Submitting…" : "Submit for review"}</button></form></>}</div></DashboardShell>;
}
