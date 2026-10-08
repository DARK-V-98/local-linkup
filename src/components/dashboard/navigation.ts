import { Home, ShoppingBag, Heart, CreditCard, Settings, BarChart3, Briefcase, MessageSquare, Wallet, Users, Store, Layers, Tags, ShieldCheck, CircleAlert, FileBarChart, type LucideIcon } from "lucide-react";
export type WorkspaceRole = "buyer" | "seller" | "admin";
export interface WorkspaceLink { label: string; to: string; Icon: LucideIcon; group: string; }
export const WORKSPACE_NAV: Record<WorkspaceRole, WorkspaceLink[]> = {
  buyer: [
    { label: "Overview", to: "/dashboard/buyer", Icon: Home, group: "Your workspace" },
    { label: "My bookings", to: "/dashboard/buyer/orders", Icon: ShoppingBag, group: "Your workspace" },
    { label: "Messages", to: "/dashboard/buyer/inbox", Icon: MessageSquare, group: "Your workspace" },
    { label: "Saved services", to: "/dashboard/buyer/saved", Icon: Heart, group: "Your workspace" },
    { label: "Payments", to: "/dashboard/buyer/payments", Icon: CreditCard, group: "Account" },
    { label: "Settings", to: "/dashboard/buyer/settings", Icon: Settings, group: "Account" },
  ],
  seller: [
    { label: "Overview", to: "/dashboard/seller", Icon: Home, group: "Your business" },
    { label: "Orders", to: "/dashboard/seller/orders", Icon: ShoppingBag, group: "Your business" },
    { label: "My services", to: "/dashboard/seller/services", Icon: Briefcase, group: "Your business" },
    { label: "Messages", to: "/dashboard/seller/inbox", Icon: MessageSquare, group: "Your business" },
    { label: "Analytics", to: "/dashboard/seller/analytics", Icon: BarChart3, group: "Your business" },
    { label: "Earnings", to: "/dashboard/seller/earnings", Icon: Wallet, group: "Account" },
    { label: "Settings", to: "/dashboard/seller/settings", Icon: Settings, group: "Account" },
  ],
  admin: [
    { label: "Overview", to: "/admin", Icon: Home, group: "Operations" },
    { label: "Orders", to: "/admin/orders", Icon: ShoppingBag, group: "Operations" },
    { label: "Payments", to: "/admin/payments", Icon: CreditCard, group: "Operations" },
    { label: "Verifications", to: "/admin/verifications", Icon: ShieldCheck, group: "Operations" },
    { label: "Disputes", to: "/admin/disputes", Icon: CircleAlert, group: "Operations" },
    { label: "Users", to: "/admin/users", Icon: Users, group: "Marketplace" },
    { label: "Sellers", to: "/admin/sellers", Icon: Store, group: "Marketplace" },
    { label: "Services", to: "/admin/services", Icon: Layers, group: "Marketplace" },
    { label: "Categories", to: "/admin/categories", Icon: Tags, group: "Marketplace" },
    { label: "Reports", to: "/admin/reports", Icon: FileBarChart, group: "Management" },
    { label: "Settings", to: "/admin/settings", Icon: Settings, group: "Management" },
  ],
};
