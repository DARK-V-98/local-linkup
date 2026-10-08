import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Users, Wallet, ShieldCheck, ArrowUpRight, Layers, Tags, CircleAlert, FileBarChart, Store, Settings } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { DashboardHeading, Metric, Panel, EmptyState, BookingRows, QuickActions, LoadingState } from "@/components/dashboard/WorkspaceWidgets";
import { useAllBookings } from "@/hooks/useAllBookings";
import { useAllUsers } from "@/hooks/useAllUsers";
import { useCategories } from "@/hooks/useCategories";
import { useServices } from "@/hooks/useServices";
import { subscribeToDisputes, type FSDispute } from "@/lib/firestore/disputes";
import { isFirebaseConfigured } from "@/lib/firebase";
import { buildBookingTrend } from "@/lib/dashboard";
import { formatPrice } from "@/lib/format";
import { usePageTitle } from "@/lib/usePageTitle";

export default function AdminDashboard() {
  usePageTitle("Admin console");
  const { bookings, loading, error } = useAllBookings();
  const { users, loading: usersLoading, error: usersError } = useAllUsers();
  const { categories } = useCategories();
  const { services, loading: servicesLoading } = useServices();
  const [disputes, setDisputes] = useState<FSDispute[]>([]);
  const [disputeUnavailable, setDisputeUnavailable] = useState(false);
  const [period, setPeriod] = useState<7|30>(7);
  const [chart, setChart] = useState<"amount"|"orders">("amount");
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return subscribeToDisputes(setDisputes,()=>setDisputeUnavailable(true));
  }, []);
  const sellers = users.filter(u=>u.role==="seller");
  const verify = sellers.filter(u=>!u.verified && u.status!=="suspended");
  const pending = bookings.filter(b=>b.status==="pending");
  const active = bookings.filter(b=>["pending","confirmed","in_progress"].includes(b.status));
  const completed = bookings.filter(b=>b.status==="completed");
  const gmv = completed.reduce((sum,b)=>sum+b.price,0);
  const openDisputes = disputes.filter(d=>["open","investigating"].includes(d.status));
  const trend = useMemo(()=>buildBookingTrend(bookings,period),[bookings,period]);
  return <DashboardShell>
    <DashboardHeading eyebrow="THE MARKETPLACE AT A GLANCE" title="Keep good work moving." description="Your operations, people, and priorities — together in one place." action={<Link to="/admin/reports" className="workspace-primary-button"><FileBarChart size={17} />Open reports</Link>} />
    {error && <div className="dashboard-data-warning" role="alert">{error}</div>}
    {usersError && <div className="dashboard-data-warning" role="alert">User data could not be loaded. Check your connection or permissions in User Management.</div>}
    <div className="dashboard-metrics"><Metric label="Completed booking value" value={loading ? "—" : formatPrice(gmv)} detail="Gross value of completed bookings" Icon={Wallet} to="/admin/payments" /><Metric label="Active orders" value={loading ? "—" : active.length} detail={`${pending.length} awaiting confirmation`} Icon={ShoppingBag} to="/admin/orders" tone="blue" /><Metric label="Registered users" value={usersLoading || usersError ? "—" : users.length} detail={`${sellers.length} seller accounts`} Icon={Users} to="/admin/users" /><Metric label="Verification queue" value={usersLoading || usersError ? "—" : verify.length} detail="Seller profiles awaiting review" Icon={ShieldCheck} to="/admin/verifications" tone="blue" /></div>
    <QuickActions actions={[{title:"Review verifications",description:"Help new professionals get started",to:"/admin/verifications",Icon:ShieldCheck},{title:"Resolve disputes",description:disputeUnavailable ? "Open the dispute centre" : `${openDisputes.length} open or under investigation`,to:"/admin/disputes",Icon:CircleAlert},{title:"Marketplace settings",description:"Manage how the platform works",to:"/admin/settings",Icon:Settings}]} />
    <div className="dashboard-columns"><div className="dashboard-column">
      <Panel title="Marketplace activity" subtitle="Bookings grouped by creation date."><div className="chart-toolbar"><div className="period-switch"><button className={chart==="amount"?"active":""} aria-pressed={chart==="amount"} onClick={()=>setChart("amount")}>Booking value</button><button className={chart==="orders"?"active":""} aria-pressed={chart==="orders"} onClick={()=>setChart("orders")}>Orders</button></div><div className="period-switch">{([7,30] as const).map(p=><button key={p} aria-pressed={period===p} className={period===p?"active":""} onClick={()=>setPeriod(p)}>{p} days</button>)}</div></div><div className="workspace-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trend}><defs><linearGradient id="admin-value-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#199b53" stopOpacity={.2} /><stop offset="100%" stopColor="#199b53" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#edf1ee" /><XAxis dataKey="label" axisLine={false} tickLine={false} minTickGap={24} tick={{fontSize:10,fill:"#839087"}} /><YAxis axisLine={false} tickLine={false} width={44} allowDecimals={chart!=="orders"} tick={{fontSize:10,fill:"#839087"}} /><Tooltip formatter={(v:number)=>chart==="amount"?formatPrice(v):v} /><Area type="monotone" dataKey={chart} name={chart==="amount"?"Completed booking value":"Orders"} stroke="#199b53" strokeWidth={2} fill="url(#admin-value-fill)" /></AreaChart></ResponsiveContainer></div>{!loading && trend.every(d=>d[chart]===0) && <p className="chart-note">No {chart==="amount"?"completed booking value":"bookings"} in this period.</p>}</Panel>
      <Panel title="Latest orders" subtitle="Follow the work happening across the marketplace." to="/admin/orders">{loading ? <LoadingState /> : bookings.length ? <BookingRows perspective="admin" bookings={bookings.slice(0,5)} to="/admin/orders" /> : <EmptyState title="A clear view from the very first booking" body="Marketplace orders will appear here as customers make bookings." />}</Panel>
      <Panel title="Marketplace management" subtitle="Keep your catalog useful, current, and easy to find."><div className="management-grid">{[{title:"Service catalog",value:servicesLoading?"—":services.length,detail:"Loaded active listings",to:"/admin/services",Icon:Layers},{title:"Categories",value:categories.length,detail:"Active discovery categories",to:"/admin/categories",Icon:Tags},{title:"Seller accounts",value:usersLoading?"—":sellers.length,detail:"Registered professionals",to:"/admin/sellers",Icon:Store},{title:"User management",value:usersLoading?"—":users.length,detail:"Buyers, sellers, and team",to:"/admin/users",Icon:Users}].map(item=><Link key={item.title} to={item.to}><item.Icon size={22} /><strong>{item.value}</strong><h3>{item.title}</h3><p>{item.detail}</p><ArrowUpRight size={15} /></Link>)}</div></Panel>
    </div><div className="dashboard-column">
      <Panel title="Needs your attention" subtitle="The next steps for your operations team."><div className="attention-queue">{[{title:"Pending orders",value:pending.length,to:"/admin/orders",Icon:ShoppingBag},{title:"Unverified sellers",value:usersLoading?"—":verify.length,to:"/admin/verifications",Icon:ShieldCheck},{title:"Open disputes",value:disputeUnavailable?"—":openDisputes.length,to:"/admin/disputes",Icon:CircleAlert}].map(q=><Link key={q.title} to={q.to}><q.Icon size={20} /><span>{q.title}</span><strong>{q.value}</strong><ArrowUpRight size={15} /></Link>)}</div></Panel>
      <Panel title="Verification shortlist" to="/admin/verifications" action="Review">{usersLoading ? <LoadingState /> : verify.length ? <div className="conversation-preview">{verify.slice(0,4).map(u=><Link key={u.id} to="/admin/verifications"><span className="small-avatar">{u.name.charAt(0)}</span><div><strong>{u.businessName || u.name}</strong><span>{u.district} · {u.sellerType || "Individual"}</span></div><ArrowUpRight size={15} /></Link>)}</div> : <EmptyState title={usersError?"Queue unavailable":"No profiles waiting"} body={usersError?"Open verifications to check access to seller profiles.":"New unverified seller accounts will appear here for review."} />}</Panel>
      <section className="workspace-tip"><FileBarChart size={23} /><div><h3>Turn activity into insight</h3><p>Filter by period and order status, compare service categories, and export your booking report.</p><Link to="/admin/reports">Explore reports <ArrowUpRight size={14} /></Link></div></section>
    </div></div>
  </DashboardShell>;
}
