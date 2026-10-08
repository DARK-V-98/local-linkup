import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Pencil, Pause, Play, Trash2, X, ArrowUpRight } from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { DashboardHeading, StatusBadge, EmptyState, LoadingState } from "@/components/dashboard/WorkspaceWidgets";
import ServiceImage from "@/components/ServiceImage";
import { useMyServices } from "@/hooks/useMyServices";
import { type StoredService } from "@/lib/store";
import { formatPrice } from "@/lib/format";
import { usePageTitle } from "@/lib/usePageTitle";
import { toast } from "sonner";

export default function MyServices() {
  usePageTitle("Your services");
  const { services, loading, error, update, remove } = useMyServices();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editTarget, setEditTarget] = useState<StoredService | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const displayed = services.filter(s=>(filter==="all"||s.status===filter) && `${s.title} ${s.category}`.toLowerCase().includes(search.toLowerCase()));
  const openEdit = (s:StoredService) => { setEditTarget(s);setEditTitle(s.title);setEditPrice(String(s.price));setEditDesc(s.description);setImageUrl(s.imageUrl ?? ""); };
  const saveEdit = async (e:React.FormEvent) => {
    e.preventDefault(); if(!editTarget || busy) return;
    if (!editTitle.trim() || !Number.isFinite(Number(editPrice)) || Number(editPrice)<=0) { toast.error("Add a title and a price greater than zero."); return; }
    if(imageUrl.trim() && !/^https:\/\/[^\s]+$/i.test(imageUrl.trim())) { toast.error("Use a valid HTTPS image link."); return; }
    setBusy(true);
    try { await update(editTarget.id,{title:editTitle.trim(),price:Number(editPrice),description:editDesc.trim(),imageUrl:imageUrl.trim()}); toast.success("Your service is updated."); setEditTarget(null); }
    catch { toast.error("Could not update your service. Please try again."); } finally { setBusy(false); }
  };
  const changeStatus = async(s:StoredService) => { if(busy) return; setBusy(true); try { await update(s.id,{status:s.status==="active"?"paused":"active"}); toast.success(s.status==="active"?"Service paused.":"Service published."); } catch { toast.error("Could not change the service status."); } finally { setBusy(false); } };
  const deleteOne = async(s:StoredService) => { if(busy || !window.confirm(`Delete “${s.title}”? This cannot be undone.`)) return; setBusy(true); try { await remove(s.id); setSelected(prev=>new Set([...prev].filter(id=>id!==s.id))); toast.success("Service deleted."); } catch { toast.error("Could not delete this service."); } finally { setBusy(false); } };
  const bulk = async(action:"active"|"paused"|"delete") => {
    if(busy || !selected.size) return;
    if(action==="delete" && !window.confirm(`Delete ${selected.size} selected services? This cannot be undone.`)) return;
    setBusy(true);
    const results = await Promise.allSettled([...selected].map(id=>action==="delete"?remove(id):update(id,{status:action})));
    const failures=results.filter(r=>r.status==="rejected").length;
    if(failures) toast.error(`${failures} service changes could not be saved. Please try again.`);
    else toast.success(`${selected.size} services ${action==="delete"?"deleted":action==="active"?"published":"paused"}.`);
    setSelected(new Set()); setBusy(false);
  };
  return <DashboardShell><DashboardHeading eyebrow="YOUR SKILLS, ON DISPLAY" title="Build a better storefront." description="Keep your services clear, useful, and ready for your next client." action={<Link className="workspace-primary-button" to="/dashboard/seller/new-service"><Plus size={17} />Create a service</Link>} />
    {error && <div className="dashboard-data-warning" role="alert">{error}</div>}
    <div className="service-management-toolbar"><div className="management-tabs">{["all","active","paused","draft"].map(f=><button key={f} onClick={()=>setFilter(f)} className={filter===f?"active":""} aria-pressed={filter===f}>{f} <span>{f==="all"?services.length:services.filter(s=>s.status===f).length}</span></button>)}</div><label className="service-management-search"><Search size={17} /><input aria-label="Search your services" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search your services" /></label></div>
    {selected.size>0 && <div className="service-bulk-toolbar"><strong>{selected.size} selected</strong><button disabled={busy} onClick={()=>bulk("active")}>Publish</button><button disabled={busy} onClick={()=>bulk("paused")}>Pause</button><button disabled={busy} onClick={()=>bulk("delete")}>Delete</button><button onClick={()=>setSelected(new Set())}>Clear</button></div>}
    {loading ? <LoadingState /> : displayed.length ? <div className="managed-service-list">{displayed.map(s=><article className="managed-service" key={s.id}><input type="checkbox" aria-label={`Select ${s.title}`} checked={selected.has(s.id)} onChange={()=>setSelected(prev=>{const next=new Set(prev);if(next.has(s.id)) next.delete(s.id); else next.add(s.id);return next;})} /><div className="managed-service-image"><ServiceImage imageUrl={s.imageUrl} category={s.category} /></div><div className="managed-service-copy"><div><StatusBadge status={s.status} /><span>{s.category}</span></div><h2>{s.title}</h2><p>{s.district} · {formatPrice(s.price)} / {s.priceUnit || "service"}</p></div><div className="managed-service-actions"><button onClick={()=>openEdit(s)} disabled={busy}><Pencil size={15} />Edit</button><button onClick={()=>changeStatus(s)} disabled={busy}>{s.status==="active"?<Pause size={15} />:<Play size={15} />}{s.status==="active"?"Pause":"Publish"}</button><button aria-label={`Delete ${s.title}`} onClick={()=>deleteOne(s)} disabled={busy}><Trash2 size={16} /></button>{s.status==="active"&&<Link to={`/service/${s.id}`} aria-label={`View ${s.title}`}><ArrowUpRight size={17} /></Link>}</div></article>)}</div> : <div className="dashboard-panel"><EmptyState title={search || filter!=="all"?"No services match this view":"Give your skills a home"} body={search || filter!=="all"?"Clear your search or choose another status.":"Create your first service and share what you do best."} to={!search&&filter==="all"?"/dashboard/seller/new-service":undefined} action="Create a service" /></div>}
    {editTarget && <div className="service-edit-overlay"><form onSubmit={saveEdit} className="service-edit-dialog" role="dialog" aria-modal="true" aria-labelledby="edit-service-title"><div className="panel-heading"><h2 id="edit-service-title">Edit your service</h2><button type="button" aria-label="Close editor" disabled={busy} onClick={()=>setEditTarget(null)}><X size={20} /></button></div><label>Service title<input value={editTitle} onChange={e=>setEditTitle(e.target.value)} required autoFocus /></label><label>Price (LKR)<input type="number" min="1" step="any" value={editPrice} onChange={e=>setEditPrice(e.target.value)} required /></label><label>Description<textarea rows={4} value={editDesc} onChange={e=>setEditDesc(e.target.value)} /></label><label>Photo of your work<input type="url" value={imageUrl} onChange={e=>setImageUrl(e.target.value)} placeholder="https://example.com/your-work.jpg" /></label><p className="image-input-help">Use an HTTPS image link. The photo appears on phones and computers.</p>{imageUrl.trim() && <div className="edit-service-image"><ServiceImage imageUrl={imageUrl} category={editTarget.category} /></div>}<div className="service-editor-actions"><button type="button" disabled={busy} className="workspace-secondary-button" onClick={()=>setEditTarget(null)}>Cancel</button><button type="submit" disabled={busy} className="workspace-primary-button">{busy?"Saving…":"Save changes"}</button></div></form></div>}
  </DashboardShell>;
}
