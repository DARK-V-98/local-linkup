import { useMemo, useState } from "react";
import { Download, ShoppingBag, Wallet, CheckCircle2, XCircle, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { DashboardHeading, Metric, Panel, EmptyState, BookingRows, LoadingState } from "@/components/dashboard/WorkspaceWidgets";
import { useAllBookings } from "@/hooks/useAllBookings";
import { useBookings } from "@/hooks/useBookings";
import { type StoredBooking } from "@/lib/store";
import { bookingDate, dateKey, csvCell } from "@/lib/dashboard";
import { formatPrice } from "@/lib/format";
import { usePageTitle } from "@/lib/usePageTitle";

export default function AdminReports() {
  const { bookings, loading, error } = useAllBookings();
  return <BookingReport bookings={bookings} loading={loading} error={error} workspace="admin" />;
}
export function SellerAnalytics() {
  const { bookings, loading, error } = useBookings("seller");
  const normalized = useMemo(()=>bookings.map(b=>({...b,createdAt:bookingDate(b.createdAt)?.toISOString() ?? ""})),[bookings]);
  return <BookingReport bookings={normalized} loading={loading} error={error} workspace="seller" />;
}
function BookingReport({ bookings, loading, error, workspace }: { bookings: StoredBooking[]; loading: boolean; error?: string | null; workspace: "admin"|"seller" }) {
  usePageTitle(workspace==="admin"?"Marketplace reports":"Business analytics");
  const [period, setPeriod] = useState("30");
  const [status,setStatus] = useState("all");
  const [search,setSearch] = useState("");
  const [page,setPage] = useState(1);
  const base = workspace==="admin"?"/admin":"/dashboard/seller";
  const filtered = useMemo(()=> {
    const today = dateKey(new Date());
    const start = period === "all" ? "" : dateKey(new Date(Date.now()-(Number(period)-1)*86400000));
    return bookings.filter(b=> {
      const date = bookingDate(b.createdAt);
      const key = date ? dateKey(date) : "";
      return (period==="all" || (key>=start && key<=today)) && (status==="all" || b.status===status) && `${b.serviceTitle} ${b.category} ${b.district} ${b.id}`.toLowerCase().includes(search.toLowerCase());
    });
  },[bookings,period,status,search]);
  const completed = filtered.filter(b=>b.status==="completed");
  const gross = completed.reduce((sum,b)=>sum+b.price,0);
  const grouped = (key:"category"|"district") => Object.entries(filtered.reduce<Record<string,{count:number,value:number}>>((acc,b)=> {
    const entry = acc[b[key] || "Unspecified"] ?? {count:0,value:0};
    entry.count++; if(b.status==="completed") entry.value+=b.price;
    acc[b[key] || "Unspecified"]=entry; return acc;
  },{})).sort((a,b)=>b[1].count-a[1].count).slice(0,8);
  const totalPages = Math.max(1,Math.ceil(filtered.length/10));
  const currentPage = Math.min(page,totalPages);
  const exportCsv = () => {
    const headings = ["Booking ID","Service","Category","District","Status","Created date","Scheduled date","Price (LKR)"];
    const rows = filtered.map(b=>[b.id,b.serviceTitle,b.category,b.district,b.status,b.createdAt,b.date,b.price]);
    const csv = [headings,...rows].map(row=>row.map(csvCell).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"}));
    const anchor = document.createElement("a"); anchor.href=url; anchor.download=`needlyy-${workspace}-bookings-${dateKey(new Date())}.csv`; anchor.click();
    window.setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  return <DashboardShell><DashboardHeading eyebrow={workspace==="admin"?"MARKETPLACE INTELLIGENCE":"YOUR BUSINESS IN NUMBERS"} title={workspace==="admin"?"Make sense of the momentum.":"See where your work takes you."} description="Filter your booking records, spot patterns, and take your report with you." action={<button className="workspace-primary-button" onClick={exportCsv} disabled={loading || !!error || !filtered.length}><Download size={17} />Export CSV</button>} />
    {error && <div className="dashboard-data-warning" role="alert">{error}</div>}
    <section className="report-filters" aria-label="Report filters"><label>Period<select value={period} onChange={e=>{setPeriod(e.target.value);setPage(1);}}><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="all">All time</option></select></label><label>Order status<select value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}}><option value="all">All statuses</option>{["pending","confirmed","in_progress","completed","cancelled"].map(s=><option key={s} value={s}>{s.replace(/_/g," ")}</option>)}</select></label><label className="report-search">Search records<input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Service, category, district, or booking ID" /></label><button className="workspace-secondary-button" onClick={()=>{setPeriod("30");setStatus("all");setSearch("");setPage(1);}}>Reset</button></section>
    <div className="dashboard-metrics"><Metric label="Matching bookings" value={loading?"—":filtered.length} detail="Records in your current selection" Icon={ShoppingBag} to={`${base}/orders`} /><Metric label="Completed booking value" value={loading?"—":formatPrice(gross)} detail="Gross service value before fees" Icon={Wallet} to={`${base}/${workspace==="admin"?"payments":"earnings"}`} /><Metric label="Completed" value={loading?"—":completed.length} detail={filtered.length?`${Math.round(completed.length/filtered.length*100)}% of this selection`:"No records in this selection"} Icon={CheckCircle2} to={`${base}/orders`} tone="blue" /><Metric label="Cancelled" value={loading?"—":filtered.filter(b=>b.status==="cancelled").length} detail="Cancelled bookings in this selection" Icon={XCircle} to={`${base}/orders`} tone="blue" /></div>
    <div className="report-breakdowns">{(["category","district"] as const).map(key=><Panel key={key} title={key==="category"?"By service category":"By district"} subtitle="Booking counts and completed booking value.">{loading?<LoadingState />:grouped(key).length?<div className="dashboard-breakdown">{grouped(key).map(([name,value])=><div key={name}><div><span>{name}</span><strong>{value.count} · {formatPrice(value.value)}</strong></div><div className="breakdown-track"><span style={{width:`${value.count/filtered.length*100}%`}} /></div></div>)}</div>:<EmptyState title="No matching activity" body="Try a wider period or a different status." />}</Panel>)}</div>
    <Panel title="Booking records" subtitle={`${filtered.length} matching records · Page ${currentPage} of ${totalPages}`} to={`${base}/orders`} action="Manage orders">{loading?<LoadingState />:filtered.length?<><BookingRows bookings={filtered.slice((currentPage-1)*10,currentPage*10)} perspective={workspace} to={`${base}/orders`} /><div className="report-pagination"><button disabled={currentPage===1} onClick={()=>setPage(currentPage-1)}>Previous</button><span>{currentPage} / {totalPages}</span><button disabled={currentPage===totalPages} onClick={()=>setPage(currentPage+1)}>Next</button></div></>:<EmptyState title="No records match these filters" body="Adjust the period, clear your search, or choose another status." />}</Panel>
    <p className="report-footnote">Booking value includes completed services only. Dates use Sri Lanka time. <Link to={`${base}/orders`}>View orders <ArrowUpRight size={12} /></Link></p>
  </DashboardShell>;
}


