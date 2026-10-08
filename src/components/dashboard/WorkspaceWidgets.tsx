import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, CalendarDays, type LucideIcon } from "lucide-react";
import CategoryIcon from "@/components/CategoryIcon";
import { formatPrice } from "@/lib/format";
import { type StoredBooking } from "@/lib/store";

export function DashboardHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="dashboard-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}
export function Metric({ label, value, detail, Icon, to, tone = "green" }: { label: string; value: ReactNode; detail: string; Icon: LucideIcon; to: string; tone?: string }) {
  return <Link className={`dashboard-metric metric-${tone}`} to={to}><div><span>{label}</span><Icon size={19} /></div><strong className={typeof value === "string" && value.startsWith("Rs.") ? "metric-currency" : ""}>{value}</strong><p>{detail}<ArrowUpRight size={14} /></p></Link>;
}
export function Panel({ title, subtitle, to, action = "View all", children, className = "" }: { title: string; subtitle?: string; to?: string; action?: string; children: ReactNode; className?: string }) {
  return <section className={`dashboard-panel ${className}`}><div className="panel-heading"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{to && <Link to={to}>{action}<ArrowRight size={15} /></Link>}</div>{children}</section>;
}
export function EmptyState({ title, body, to, action }: { title: string; body: string; to?: string; action?: string }) {
  return <div className="dashboard-empty"><CalendarDays size={28} strokeWidth={1.5} /><h3>{title}</h3><p>{body}</p>{to && <Link to={to}>{action}<ArrowRight size={15} /></Link>}</div>;
}
export function StatusBadge({ status }: { status: string }) {
  return <span className={`status-pill status-${status}`}>{status.replace(/_/g, " ")}</span>;
}
export function BookingRows({ bookings, perspective = "buyer", to }: { bookings: Pick<StoredBooking, "id" | "serviceTitle" | "vendorName" | "customerName" | "category" | "date" | "time" | "price" | "status">[]; perspective?: "buyer" | "seller" | "admin"; to: string }) {
  return <div className="booking-rows">{bookings.map(b => <Link key={b.id} to={to} className="booking-row"><span className="booking-category-icon"><CategoryIcon category={b.category} size={21} /></span><div className="booking-row-copy"><strong>{b.serviceTitle}</strong><span>{perspective === "buyer" ? b.vendorName : b.customerName} · {b.date}{b.time ? ` · ${b.time}` : ""}</span></div><div className="booking-row-end"><strong>{formatPrice(b.price)}</strong><StatusBadge status={b.status} /></div><ArrowUpRight size={16} className="row-arrow" /></Link>)}</div>;
}
export function QuickActions({ actions }: { actions: { title: string; description: string; to: string; Icon: LucideIcon }[] }) {
  return <div className="dashboard-quick-actions">{actions.map(a => <Link key={a.title} to={a.to}><a.Icon size={23} strokeWidth={1.7} /><div><strong>{a.title}</strong><span>{a.description}</span></div><ArrowUpRight size={16} /></Link>)}</div>;
}
export function LoadingState() { return <div className="dashboard-loading" role="status">Loading your workspace…</div>; }

