import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { ShoppingBag, Wallet, Briefcase, MessageSquare, Plus, BarChart3, ArrowUpRight, Check, Circle, Image, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { DashboardHeading, Metric, Panel, EmptyState, BookingRows, QuickActions, LoadingState, StatusBadge } from "@/components/dashboard/WorkspaceWidgets";
import { useBookings } from "@/hooks/useBookings";
import { useMyServices } from "@/hooks/useMyServices";
import { useConversations } from "@/hooks/useConversations";
import { getUser } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import { buildBookingTrend, bookingDate } from "@/lib/dashboard";
import { usePageTitle } from "@/lib/usePageTitle";

export default function SellerDashboard() {
  usePageTitle("Seller studio");
  const user = getUser();
  const { bookings, loading, error } = useBookings("seller");
  const { services, loading: servicesLoading, error: servicesError } = useMyServices();
  const { conversations, totalUnread } = useConversations("seller");
  const [period, setPeriod] = useState<7 | 30>(7);
  const active = bookings.filter(b => ["pending","confirmed","in_progress"].includes(b.status));
  const completed = bookings.filter(b => b.status === "completed");
  const pending = bookings.filter(b => b.status === "pending");
  const gross = completed.reduce((sum,b) => sum + b.price,0);
  const trend = useMemo(() => buildBookingTrend(bookings.map(b => ({...b,createdAt:bookingDate(b.createdAt)?.toISOString() ?? ""})),period),[bookings,period]);
  const checks = [{label:"Add your phone number",done:!!user?.phone,to:"/dashboard/seller/settings"},{label:"Tell clients about your skills",done:!!user?.bio,to:"/dashboard/seller/settings"},{label:"Publish your first service",done:services.some(s => s.status === "active"),to:"/dashboard/seller/new-service"},{label:"Add a photo of your work",done:services.some(s => !!s.imageUrl),to:"/dashboard/seller/services"}];
  const complete = checks.filter(c=>c.done).length;
  return <DashboardShell>
    <DashboardHeading eyebrow="YOUR BUSINESS, IN FOCUS" title={`Let’s get to work${user?.name ? `, ${user.name.split(" ")[0]}` : ""}.`} description="A clear picture of your orders, services, and next opportunities." action={<Link className="workspace-primary-button" to="/dashboard/seller/new-service"><Plus size={17} />Create a service</Link>} />
    {(error || servicesError) && <div className="dashboard-data-warning" role="alert">{error || servicesError}</div>}
    <div className="dashboard-metrics"><Metric label="Active orders" value={loading ? "—" : active.length} detail={`${pending.length} awaiting confirmation`} Icon={ShoppingBag} to="/dashboard/seller/orders" tone="blue" /><Metric label="Completed booking value" value={loading ? "—" : formatPrice(gross)} detail="Gross value before fees" Icon={Wallet} to="/dashboard/seller/earnings" /><Metric label="Published services" value={servicesLoading ? "—" : services.filter(s=>s.status==="active").length} detail={`${services.filter(s=>s.status==="draft").length} drafts ready to finish`} Icon={Briefcase} to="/dashboard/seller/services" /><Metric label="Unread messages" value={totalUnread} detail="Your next conversation awaits" Icon={MessageSquare} to="/dashboard/seller/inbox" tone="blue" /></div>
    {pending.length > 0 && <Link className="dashboard-attention" to="/dashboard/seller/orders"><ShoppingBag size={20} /><span><strong>{pending.length} order{pending.length===1?" needs":"s need"} your attention</strong>Review the details and confirm your availability.</span><ArrowUpRight size={18} /></Link>}
    <QuickActions actions={[{title:"Manage your services",description:"Keep your storefront current",to:"/dashboard/seller/services",Icon:Briefcase},{title:"Open your inbox",description:"Turn conversations into connections",to:"/dashboard/seller/inbox",Icon:MessageSquare},{title:"Business analytics",description:"See where your work is growing",to:"/dashboard/seller/analytics",Icon:BarChart3}]} />
    <div className="dashboard-columns"><div className="dashboard-column">
      <Panel title="Booking value over time" subtitle="Completed bookings, grouped by creation date."><div className="chart-toolbar"><strong>{formatPrice(trend.reduce((sum,d)=>sum+d.amount,0))}</strong><div className="period-switch">{([7,30] as const).map(p=><button key={p} aria-pressed={period===p} onClick={()=>setPeriod(p)} className={period===p?"active":""}>{p} days</button>)}</div></div><div className="workspace-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={trend}><CartesianGrid vertical={false} stroke="#edf1ee" /><XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={24} tick={{fontSize:10,fill:"#839087"}} /><YAxis tickLine={false} axisLine={false} width={44} tick={{fontSize:10,fill:"#839087"}} /><Tooltip formatter={(value:number)=>formatPrice(value)} /><Bar dataKey="amount" name="Completed booking value" fill="#199b53" radius={[5,5,0,0]} maxBarSize={32} /></BarChart></ResponsiveContainer></div>{!loading && trend.every(d=>d.amount===0) && <p className="chart-note">No completed booking value in this period.</p>}</Panel>
      <Panel title="Orders on your radar" subtitle="Your latest active jobs." to="/dashboard/seller/orders">{loading ? <LoadingState /> : active.length ? <BookingRows perspective="seller" bookings={active.slice(0,5)} to="/dashboard/seller/orders" /> : <EmptyState title="Ready for your next client" body="New orders will appear here. Make sure your services are published and your profile is up to date." to="/dashboard/seller/services" action="Manage services" />}</Panel>
      <Panel title="Your storefront" subtitle="Small updates make a stronger first impression." to="/dashboard/seller/services">{servicesLoading ? <LoadingState /> : services.length ? <div className="storefront-list">{services.slice(0,4).map(s=><Link key={s.id} to="/dashboard/seller/services"><span className="storefront-icon">{s.imageUrl ? <Image size={20} /> : <FileText size={20} />}</span><div><strong>{s.title}</strong><span>{formatPrice(s.price)} · {s.district}</span></div><StatusBadge status={s.status} /></Link>)}</div> : <EmptyState title="Give your skills a home" body="Create a service so clients can discover what you do best." to="/dashboard/seller/new-service" action="Create your first service" />}</Panel>
    </div><div className="dashboard-column">
      <Panel title="Make a strong first impression" subtitle={`${complete} of ${checks.length} essentials complete`}><div className="profile-progress"><span style={{width:`${complete/checks.length*100}%`}} /></div><div className="setup-checklist">{checks.map(c=><Link key={c.label} to={c.to}>{c.done ? <Check size={18} className="text-primary" /> : <Circle size={18} />}<span>{c.label}</span><ArrowUpRight size={14} /></Link>)}</div></Panel>
      <Panel title="Recent conversations" to="/dashboard/seller/inbox" action="Inbox">{conversations.length ? <div className="conversation-preview">{conversations.slice(0,4).map(c=><Link key={c.id} to="/dashboard/seller/inbox"><span className="small-avatar">{c.buyerInitial}</span><div><strong>{c.buyerName}</strong><span>{c.lastMessage || c.serviceName}</span></div>{c.unreadSeller>0 && <b>{c.unreadSeller}</b>}</Link>)}</div> : <EmptyState title="Every job starts with a conversation" body="Client messages appear here as people reach out about your services." to="/dashboard/seller/inbox" action="Open inbox" />}</Panel>
      <section className="workspace-tip"><BarChart3 size={24} /><div><h3>Know what’s working</h3><p>Compare bookings by category and district, then export a report for your records.</p><Link to="/dashboard/seller/analytics">View analytics <ArrowRightIcon /></Link></div></section>
    </div></div>
  </DashboardShell>;
}
function ArrowRightIcon() { return <ArrowUpRight size={14} />; }
