import { Link } from "react-router-dom";
import { CalendarDays, Heart, Wallet, CheckCircle2, Search, Plus, MessageSquare, ArrowUpRight, ArrowRight, ShieldCheck, Settings } from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { DashboardHeading, Metric, Panel, EmptyState, BookingRows, QuickActions, LoadingState } from "@/components/dashboard/WorkspaceWidgets";
import { useBookings } from "@/hooks/useBookings";
import { useSaved } from "@/hooks/useSaved";
import { useServices } from "@/hooks/useServices";
import { useConversations } from "@/hooks/useConversations";
import { getUser } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import { dateKey } from "@/lib/dashboard";
import { usePageTitle } from "@/lib/usePageTitle";
import ServiceImage from "@/components/ServiceImage";

export default function BuyerDashboard() {
  usePageTitle("Your workspace");
  const user = getUser();
  const { bookings, loading, error } = useBookings("buyer");
  const { savedIds } = useSaved();
  const { services } = useServices();
  const { totalUnread } = useConversations("buyer");
  const active = bookings.filter(b => ["pending", "confirmed", "in_progress"].includes(b.status));
  const completed = bookings.filter(b => b.status === "completed");
  const spent = completed.reduce((sum, b) => sum + b.price, 0);
  const today = dateKey(new Date());
  const upcoming = active.filter(b => b.date >= today).sort((a,b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  const next = upcoming[0];
  const savedServices = services.filter(s => savedIds.has(s.id)).slice(0,3);
  const categorySpending = Object.entries(completed.reduce<Record<string,number>>((acc,b) => { acc[b.category] = (acc[b.category] ?? 0) + b.price; return acc; }, {})).sort((a,b) => b[1]-a[1]);
  return <DashboardShell>
    <DashboardHeading eyebrow="YOUR DAY, A LITTLE EASIER" title={`Welcome back${user?.name ? `, ${user.name.split(" ")[0]}` : ""}.`} description="Your people, your plans, and everything you need to get it done." action={<Link className="workspace-primary-button" to="/browse"><Search size={17} />Find a service</Link>} />
    {error && <div className="dashboard-data-warning" role="alert">{error}</div>}
    <div className="dashboard-metrics"><Metric label="Active bookings" value={loading ? "—" : active.length} detail="Keep your plans on track" Icon={CalendarDays} to="/dashboard/buyer/orders" /><Metric label="Completed" value={loading ? "—" : completed.length} detail="Jobs taken off your list" Icon={CheckCircle2} to="/dashboard/buyer/orders" tone="blue" /><Metric label="Saved services" value={savedIds.size} detail="Your shortlist, ready when you are" Icon={Heart} to="/dashboard/buyer/saved" /><Metric label="Completed booking value" value={loading ? "—" : formatPrice(spent)} detail="Value of completed services" Icon={Wallet} to="/dashboard/buyer/payments" tone="blue" /></div>
    <QuickActions actions={[{title:"Post a request",description:"Let professionals come to you",to:"/post-request",Icon:Plus},{title:"Your conversations",description:totalUnread ? `${totalUnread} unread messages` : "Keep every detail in one place",to:"/dashboard/buyer/inbox",Icon:MessageSquare},{title:"Account preferences",description:"Update your details and location",to:"/dashboard/buyer/settings",Icon:Settings}]} />
    <div className="dashboard-columns"><div className="dashboard-column">
      <Panel title="Your active bookings" subtitle="A clear view of what’s happening next." to="/dashboard/buyer/orders">{loading ? <LoadingState /> : active.length ? <BookingRows bookings={active.slice(0,5)} to="/dashboard/buyer/orders" /> : <EmptyState title="Make room for something good" body="Your next booking will appear here. Find a professional and get one more thing off your to-do list." to="/browse" action="Explore services" />}</Panel>
      <Panel title="Your saved shortlist" subtitle="Good people to come back to." to="/dashboard/buyer/saved">{savedServices.length ? <div className="saved-preview-list">{savedServices.map(s => <Link key={s.id} to={`/service/${s.id}`}><div className="saved-preview-image"><ServiceImage category={s.category} imageUrl={s.imageUrl} /></div><div><strong>{s.title}</strong><span>{s.district} · From {formatPrice(s.price)}</span></div><ArrowUpRight size={17} /></Link>)}</div> : <EmptyState title={savedIds.size ? "Your shortlist is saved" : "A shortlist for later"} body={savedIds.size ? "Open saved services to check your full list." : "Tap the heart on a service to keep it here for your next project."} to="/dashboard/buyer/saved" action="View saved services" />}</Panel>
    </div><div className="dashboard-column">
      <section className="next-booking-card"><p className="eyebrow">NEXT ON YOUR CALENDAR</p><CalendarDays size={26} /><h2>{next ? next.serviceTitle : "A little space in your day"}</h2><p>{next ? `${next.date} · ${next.time || "Time to be arranged"}` : "Upcoming bookings appear here, so you always know what’s next."}</p>{next && <span>With {next.vendorName}</span>}<Link to={next ? "/dashboard/buyer/orders" : "/browse"}>{next ? "View your booking" : "Find your next professional"}<ArrowUpRight size={16} /></Link></section>
      <Panel title="Where your bookings go" subtitle="Completed services by category.">{categorySpending.length ? <div className="dashboard-breakdown">{categorySpending.map(([category,value]) => <div key={category}><div><span>{category}</span><strong>{formatPrice(value)}</strong></div><div className="breakdown-track"><span style={{width:`${spent ? value/spent*100 : 0}%`}} /></div></div>)}</div> : <EmptyState title="A fresh start" body="Your category breakdown appears after your first completed booking." />}</Panel>
      <section className="workspace-tip"><ShieldCheck size={23} /><div><h3>Keep the details together</h3><p>Agree on timing and scope in Messages before your booking starts.</p><Link to="/dashboard/buyer/inbox">Open messages <ArrowRight size={14} /></Link></div></section>
    </div></div>
  </DashboardShell>;
}
