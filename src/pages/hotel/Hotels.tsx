import AppShell from "@/components/layout/AppShell";
import { useBusinessDoc, useBusinessRows, businessCommand } from "@/hooks/useHospitality";
import { useAuth } from "@/hooks/useAuth";
import { type HotelProperty, type HotelItem, type StaySelection } from "@/lib/hospitality";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Building2, MapPin, ArrowRight } from "lucide-react";
import { toast } from "sonner";
export default function Hotels() { const { propertyId } = useParams(); return <AppShell fullBleed><div className="business-page mx-auto max-w-6xl p-4 md:p-8">{propertyId ? <HotelDetail id={propertyId}/> : <HotelDirectory />}</div></AppShell>; }
function HotelDirectory() {
    const { rows, loading, error } = useBusinessRows<HotelProperty>("hotelProperties", "status", "approved");
    return <><p className="business-eyebrow">MAKE ROOM FOR SOMETHING GOOD</p><h1>Stays, made personal.</h1><p>Explore registered hotel businesses, build a stay and ask the hotel for a tailored proposal.</p><div className="business-notice">Hotel stays are currently request-only. The hotel confirms availability and final terms before arranging a reservation or payment.</div>{error && <p role="alert">{error}</p>}{loading ? <p>Loading hotels…</p> : !rows.length ? <div className="business-card"><Building2 size={36}/><h2>Our hotel collection is taking shape.</h2><p>Approved properties appear here as hotels complete onboarding.</p><Link to="/register/seller?business=hotel" className="business-primary">Register your hotel</Link></div> : <div className="business-grid">{rows.map(item => <Link key={item.id} to={`/hotels/${item.id}`} className="business-card"><Building2 className="text-primary" size={32}/><h2 className="mt-4">{item.name}</h2><p className="flex gap-2 items-center"><MapPin size={16}/>{item.district}</p><p className="line-clamp-3 mt-3">{item.description}</p><span className="business-secondary mt-4">Explore rooms and packages<ArrowRight size={18}/></span></Link>)}</div>}<div className="mt-8"><Link to="/dashboard/hotel/property" className="business-secondary">Manage a hotel business</Link></div></>;
}
function HotelDetail({ id }: {
    id: string;
}) {
    const { value: property, loading, error } = useBusinessDoc<HotelProperty>(`hotelProperties/${id}`), { rows: rooms } = useBusinessRows<HotelItem>(`hotelProperties/${id}/rooms`, "active", true), { rows: addons } = useBusinessRows<HotelItem>(`hotelProperties/${id}/addons`, "active", true), { rows: packages } = useBusinessRows<HotelItem>(`hotelProperties/${id}/packages`, "active", true);
    const { user } = useAuth(), navigate = useNavigate(), [busy, setBusy] = useState(false), [requestKey, setRequestKey] = useState(() => crypto.randomUUID()), [selection, setSelection] = useState<StaySelection>({ arrival: "", departure: "", adults: 2, children: 0, rooms: 1, roomId: "", packageId: "", addonIds: [], notes: "" });
    const room = rooms.find(item => item.id === selection.roomId), pack = packages.find(item => item.id === selection.packageId), nights = selection.arrival && selection.departure ? (Date.parse(selection.departure) - Date.parse(selection.arrival)) / 86400000 : 0;
    const estimate = room && nights > 0 ? (pack ? pack.priceMinor * selection.rooms : room.priceMinor * nights * selection.rooms) + addons.filter(item => item.active && selection.addonIds.includes(item.id) && !pack?.includedAddonIds.includes(item.id)).reduce((sum, item) => sum + item.priceMinor * (item.basis === "night" ? nights * selection.rooms : item.basis === "person" ? selection.adults + selection.children : item.basis === "person_night" ? (selection.adults + selection.children) * nights : 1), 0) : null;
    const update = (key: keyof StaySelection, value: string | number | string[]) => setSelection(previous => ({ ...previous, [key]: value }));
    if (loading)
        return <p>Loading property…</p>;
    if (error || !property)
        return <><h1>Property unavailable</h1><p>This hotel may still be awaiting approval.</p><Link to="/hotels">Explore hotels</Link></>;
    return <><Link to="/hotels" className="business-secondary">← All hotels</Link><p className="business-eyebrow mt-6">{property.district} · HOTEL BUSINESS</p><h1>{property.name}</h1><p>{property.description}</p><div className="business-card space-y-3"><p><strong>Address:</strong> {property.address}</p><a className="text-primary underline" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.address + ", " + property.district + ", Sri Lanka")}`} target="_blank" rel="noopener noreferrer">View address on map</a><p>Check-in {property.checkIn} · Check-out {property.checkOut}</p><div className="flex flex-wrap gap-2">{property.facilities.map(item => <span className="rounded-full bg-green-50 px-3 py-2 text-xs" key={item}>{item}</span>)}</div><p className="whitespace-pre-wrap">{property.policy}</p></div><div className="business-notice">Build a stay below. This is a request for a proposal, not a live room reservation. Availability and any additional requirements must be confirmed by the hotel.</div>
 <form className="business-card business-form" onSubmit={async (e) => { e.preventDefault(); if (!user) {
        navigate(`/login?redirect=${encodeURIComponent(`/hotels/${id}`)}`);
        return;
    } setBusy(true); try {
        await businessCommand("requestStay", { propertyId: id, requestId: `${user.id}_${requestKey}`, selection });
        toast.success("Stay request saved. Follow the proposal in Hotel stays.");
        setRequestKey(crypto.randomUUID());
        navigate("/dashboard/buyer/hotels");
    }
    catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not send request.");
    }
    finally {
        setBusy(false);
    } }}><h2>Build your stay</h2><div className="business-grid"><label>Arrival<input required type="date" value={selection.arrival} onChange={e => update("arrival", e.target.value)}/></label><label>Departure<input required type="date" value={selection.departure} onChange={e => update("departure", e.target.value)}/></label></div><div className="business-grid">{[{ key: "adults", label: "Adults", min: 1, max: 100 }, { key: "children", label: "Children", min: 0, max: 100 }, { key: "rooms", label: "Rooms", min: 1, max: 20 }].map(field => <label key={field.key}>{field.label}<input required type="number" min={field.min} max={field.max} value={selection[field.key as "adults" | "children" | "rooms"]} onChange={e => update(field.key as keyof StaySelection, Number(e.target.value))}/></label>)}</div>
 <label>Room type<select required value={selection.roomId} onChange={e => setSelection(previous => ({ ...previous, roomId: e.target.value, packageId: "" }))}><option value="">Choose your room</option>{rooms.filter(item => item.active).map(item => <option value={item.id} key={item.id}>{item.name} · LKR {item.priceMinor / 100} / room / night · max {item.capacity} guests</option>)}</select></label>{room && <p>{room.description} · {room.minNights}–{room.maxNights} nights</p>}
 <label>Package (optional)<select value={selection.packageId} onChange={e => update("packageId", e.target.value)}><option value="">Room only — build my own stay</option>{packages.filter(item => item.active && item.roomId === selection.roomId).map(item => <option key={item.id} value={item.id}>{item.name} · {item.nights} nights · LKR {item.priceMinor / 100} per room</option>)}</select></label>{pack && <p>{pack.description} · Choose dates spanning exactly {pack.nights} nights.</p>}
 <fieldset><legend>Extras</legend><div className="business-checks">{addons.filter(item => item.active).map(item => <label key={item.id}><input type="checkbox" checked={selection.addonIds.includes(item.id) || !!pack?.includedAddonIds.includes(item.id)} disabled={pack?.includedAddonIds.includes(item.id)} onChange={e => update("addonIds", e.target.checked ? [...selection.addonIds, item.id] : selection.addonIds.filter(value => value !== item.id))}/><span>{item.name} · {pack?.includedAddonIds.includes(item.id) ? "Included in package" : `LKR ${item.priceMinor / 100} / ${item.basis.replace(/_/g, " ")}`}<small className="block">{item.description}</small></span></label>)}</div></fieldset><label>Tailor this package<textarea value={selection.notes} onChange={e => update("notes", e.target.value)} rows={4} maxLength={3000} placeholder="Occasion, meal preferences, transport or other requirements. Ask the hotel to confirm suitability."/></label><div className="business-notice"><strong>{estimate !== null ? `Estimated LKR ${(estimate / 100).toLocaleString()} for ${nights} nights` : "Choose dates and a room for an estimate."}</strong><p>The server checks the catalog price on submission. Your hotel proposal specifies the final inclusions and charges.</p></div><button disabled={busy || property.status !== "approved"} className="business-primary">{busy ? "Sending…" : "Request a tailored proposal"}</button></form></>;
}
