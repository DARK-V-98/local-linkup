import DashboardShell from "@/components/dashboard/DashboardShell";
import StayRequests from "./StayRequests";
import { Link } from "react-router-dom";
export default function BuyerStays() { return <DashboardShell><div className="business-page"><p className="business-eyebrow">YOUR STAYS</p><h1>Hotel requests and proposals</h1><p>Track your tailored stay requests. Proposal agreement is separate from room confirmation and payment.</p><Link to="/hotels" className="business-secondary">Explore hotels</Link><StayRequests /></div></DashboardShell>; }
