import DashboardShell from "@/components/dashboard/DashboardShell";
import { useAuth } from "@/hooks/useAuth";
import { useBusinessDoc, useBusinessRows, businessCommand } from "@/hooks/useHospitality";
import { type HotelProperty, type HotelItem } from "@/lib/hospitality";
import { SL_DISTRICTS } from "@/data/catalog";
import { useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "sonner";
import StayRequests from "@/pages/hotel/StayRequests";
const facilities = ["Wi-Fi", "Parking", "Pool", "Restaurant", "Air conditioning", "Lift", "Family rooms", "Pet friendly", "Step-free entrance"];
export default function HotelWorkspace() {
    const { user } = useAuth(), { pathname } = useLocation(), { value: property, loading, error } = useBusinessDoc<HotelProperty>(`hotelProperties/${user!.id}`);
    const { value: review } = useBusinessDoc<{
        notes: string;
    }>(`businessReviews/hotel_${user!.id}`);
    const section = pathname.split("/")[3] ?? "overview";
    if (user?.sellerType !== "business")
        return <DashboardShell><div className="business-page"><h1>Hotel business workspace</h1><p>This workspace requires a business seller account. Contact support if your existing account needs to be updated.</p><Link to="/contact">Contact support</Link></div></DashboardShell>;
    return <DashboardShell><div className="business-page"><p className="business-eyebrow">NEEDLYY HOTEL STUDIO</p><h1>{section === "overview" ? "Your hotel business" : section === "property" ? "Property onboarding" : section.charAt(0).toUpperCase() + section.slice(1)}</h1><p>Build your rooms, packages and extras, then respond to guest requests with tailored proposals.</p>{error && <p role="alert">{error}</p>}{loading ? <p>Loading property…</p> : <>
 <div className="business-notice"><strong>Property: {property?.name ?? "Not set up"} · {property?.status ?? "Start onboarding"}</strong>{review?.notes && <p>Review notes: {review.notes}</p>}<p>This release handles enquiries and proposals. Availability is confirmed by the hotel; proposal acceptance does not reserve rooms or collect payment.</p></div>
 {section === "property" ? <PropertyForm property={property}/> : section === "requests" ? <StayRequests owner/> : ["rooms", "addons", "packages"].includes(section) ? property ? <CatalogEditor kind={section} uid={user!.id}/> : <Link className="business-primary" to="/dashboard/hotel/property">Set up your property first</Link> : <div className="business-grid">{[{ title: "Set up your property", to: "property", text: "Describe your business, facilities, check-in times and policies." }, { title: "Room types", to: "rooms", text: "Set nightly rates, occupancy, unit counts and stay limits." }, { title: "Package builder", to: "packages", text: "Bundle a room, fixed nights and included extras." }, { title: "Add-on catalog", to: "addons", text: "Offer meals, transport and other extras with clear pricing." }, { title: "Guest proposals", to: "requests", text: "Review dates and requirements, then send a custom quote." }, { title: "Public hotel page", to: "public", text: "View your approved property as guests see it." }].map(item => <Link className="business-card" key={item.to} to={item.to === "public" ? `/hotels/${user!.id}` : `/dashboard/hotel/${item.to}`}><h2>{item.title}</h2><p>{item.text}</p><span className="text-primary font-bold">Open →</span></Link>)}</div>}
 </>}</div></DashboardShell>;
}
function PropertyForm({ property }: {
    property: HotelProperty | null;
}) {
    const [busy, setBusy] = useState(false), locked = property?.status === "approved" || property?.status === "suspended";
    const save = async (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const form = new FormData(e.currentTarget); setBusy(true); try {
        await businessCommand("saveHotel", { property: { ...Object.fromEntries(form), facilities: form.getAll("facilities") } });
        toast.success("Property submitted for review.");
    }
    catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not save property.");
    }
    finally {
        setBusy(false);
    } };
    return <form className="business-card business-form" onSubmit={save}><p>Business identity documents are reviewed through <Link to="/dashboard/seller/verification">Identity verification</Link>. Only approved hotels appear publicly. After approval, contact support to change property details.</p><fieldset disabled={locked || busy} className="space-y-5"><div className="business-grid"><label>Hotel / property name<input required name="name" maxLength={120} defaultValue={property?.name}/></label><label>District<select name="district" defaultValue={property?.district ?? "Colombo"}>{SL_DISTRICTS.filter(item => !["All Districts", "Online"].includes(item)).map(item => <option key={item}>{item}</option>)}</select></label></div><label>Full property address<textarea required name="address" maxLength={500} defaultValue={property?.address}/></label><label>About your property<textarea required name="description" rows={4} maxLength={5000} defaultValue={property?.description}/></label><div className="business-grid"><label>Reservation phone<input required type="tel" name="phone" maxLength={40} defaultValue={property?.phone}/></label><label>Website (optional)<input type="url" name="website" maxLength={300} defaultValue={property?.website}/></label><label>Check-in time<input required type="time" name="checkIn" defaultValue={property?.checkIn ?? "14:00"}/></label><label>Check-out time<input required type="time" name="checkOut" defaultValue={property?.checkOut ?? "11:00"}/></label></div><fieldset><legend>Facilities (describe accessibility precisely in your description)</legend><div className="business-checks">{facilities.map(item => <label key={item}><input name="facilities" type="checkbox" value={item} defaultChecked={property?.facilities.includes(item)}/>{item}</label>)}</div></fieldset><label>Stay, cancellation and payment policies<textarea required name="policy" maxLength={5000} rows={5} defaultValue={property?.policy} placeholder="Explain children, pets, cancellations, deposits and conditions."/></label><button className="business-primary" disabled={busy}>{busy ? "Saving…" : "Submit property for review"}</button></fieldset>{locked && <p>This property is {property.status}. Contact support for property changes.</p>}</form>;
}
function CatalogEditor({ kind, uid }: {
    kind: string;
    uid: string;
}) {
    const { rows, loading, error } = useBusinessRows<HotelItem>(`hotelProperties/${uid}/${kind}`), { rows: rooms } = useBusinessRows<HotelItem>(`hotelProperties/${uid}/rooms`), { rows: addons } = useBusinessRows<HotelItem>(`hotelProperties/${uid}/addons`);
    const [editing, setEditing] = useState<HotelItem | null>(null), [busy, setBusy] = useState(false), [formKey, setFormKey] = useState(0);
    const save = async (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const form = new FormData(e.currentTarget), price = Number(form.get("price")); if (!Number.isFinite(price) || price < 0) {
        toast.error("Enter a valid price.");
        return;
    } setBusy(true); try {
        await businessCommand("saveHotelItem", { kind, id: editing?.id, item: { name: form.get("name"), description: form.get("description"), priceMinor: Math.round(price * 100), active: form.get("active") === "on", capacity: Number(form.get("capacity")), units: Number(form.get("units")), minNights: Number(form.get("minNights")), maxNights: Number(form.get("maxNights")), basis: form.get("basis"), roomId: form.get("roomId"), nights: Number(form.get("nights")), includedAddonIds: form.getAll("includedAddonIds") } });
        toast.success("Catalog item saved.");
        setEditing(null);
        setFormKey(key => key + 1);
    }
    catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not save item.");
    }
    finally {
        setBusy(false);
    } };
    return <div className="space-y-6"><p>{kind === "rooms" ? "Room quantities describe your capacity, not live dated availability. Confirm each guest request manually." : kind === "packages" ? "Package price is per room for the full fixed-night stay. Included extras are not charged twice." : "Extras apply to all guests, including children, unless your proposal explicitly revises those terms."}</p>{error && <p role="alert">{error}</p>}<form key={`${kind}-${editing?.id ?? "new"}-${formKey}`} onSubmit={save} className="business-card business-form"><h2>{editing ? "Edit item" : "Create item"}</h2><div className="business-grid"><label>Name<input required name="name" maxLength={120} defaultValue={editing?.name}/></label><label>{kind === "rooms" ? "Nightly price per room" : kind === "packages" ? "Full package price per room" : "Extra price"} (LKR)<input required type="number" name="price" min={kind === "addons" ? 0 : 0.01} max={1000000} step="0.01" defaultValue={editing ? editing.priceMinor / 100 : undefined}/></label></div><label>Description<textarea name="description" maxLength={3000} defaultValue={editing?.description}/></label>
 {kind === "rooms" && <div className="business-grid">{[{ name: "capacity", label: "Maximum guests per room", min: 1, max: 20, value: 2 }, { name: "units", label: "Number of rooms", min: 1, max: 500, value: 1 }, { name: "minNights", label: "Minimum nights", min: 1, max: 90, value: 1 }, { name: "maxNights", label: "Maximum nights", min: 1, max: 90, value: 30 }].map(field => <label key={field.name}>{field.label}<input required type="number" name={field.name} min={field.min} max={field.max} defaultValue={editing?.[field.name as keyof HotelItem] as number ?? field.value}/></label>)}</div>}
 {kind === "addons" && <label>Charge basis<select name="basis" defaultValue={editing?.basis ?? "stay"}><option value="stay">Once per stay</option><option value="night">Per room per night</option><option value="person">Per guest per stay</option><option value="person_night">Per guest per night</option></select></label>}
 {kind === "packages" && <><div className="business-grid"><label>Room type<select name="roomId" required defaultValue={editing?.roomId ?? ""}><option value="" disabled>Select an active room</option>{rooms.filter(item => item.active).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>Included nights<input type="number" name="nights" required min={1} max={90} defaultValue={editing?.nights ?? 2}/></label></div><fieldset><legend>Included extras</legend><div className="business-checks">{addons.filter(item => item.active).map(item => <label key={item.id}><input name="includedAddonIds" type="checkbox" value={item.id} defaultChecked={editing?.includedAddonIds?.includes(item.id)}/>{item.name}</label>)}</div></fieldset></>}
 <label className="business-check"><input name="active" type="checkbox" defaultChecked={editing?.active ?? false}/>Available in your approved public catalog</label><div className="flex flex-wrap gap-3"><button disabled={busy} className="business-primary">{busy ? "Saving…" : "Save item"}</button>{editing && <button type="button" className="business-secondary" onClick={() => setEditing(null)}>Cancel editing</button>}</div></form>
 {loading ? <p>Loading catalog…</p> : !rows.length ? <p>No items yet. Create your first {kind === "rooms" ? "room type" : kind === "addons" ? "extra" : "package"} above.</p> : <div className="business-grid">{rows.map(item => <article className="business-card" key={item.id}><h2>{item.name}</h2><p>{item.description}</p><p className="font-bold mt-3">LKR {(item.priceMinor / 100).toLocaleString()} · {item.active ? "Active" : "Paused"}</p><button onClick={() => setEditing(item)} className="business-secondary mt-4">Edit item</button></article>)}</div>}</div>;
}
