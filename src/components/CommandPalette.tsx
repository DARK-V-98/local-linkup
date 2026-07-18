import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useServices } from "@/hooks/useServices";
import { useCategories } from "@/hooks/useCategories";
import { useAuth } from "@/hooks/useAuth";

const PAGES = [
  { label: "Home", to: "/", icon: "fa-house" },
  { label: "Browse Services", to: "/browse", icon: "fa-magnifying-glass" },
  { label: "Post a Job Request", to: "/post-request", icon: "fa-pen-to-square" },
  { label: "Community Feed", to: "/feed", icon: "fa-newspaper" },
  { label: "Emergency Services", to: "/emergency", icon: "fa-truck-medical" },
  { label: "Overseas Services", to: "/overseas", icon: "fa-globe" },
  { label: "About", to: "/about", icon: "fa-circle-info" },
  { label: "Contact", to: "/contact", icon: "fa-envelope" },
];

const ROLE_LINKS: Record<string, Array<{ label: string; to: string; icon: string }>> = {
  buyer: [
    { label: "Buyer Dashboard", to: "/dashboard/buyer", icon: "fa-gauge" },
    { label: "My Bookings", to: "/dashboard/buyer/orders", icon: "fa-bag-shopping" },
    { label: "Saved Sellers", to: "/dashboard/buyer/saved", icon: "fa-heart" },
    { label: "Payments", to: "/dashboard/buyer/payments", icon: "fa-credit-card" },
    { label: "Settings", to: "/dashboard/buyer/settings", icon: "fa-gear" },
  ],
  seller: [
    { label: "Seller Dashboard", to: "/dashboard/seller", icon: "fa-gauge" },
    { label: "My Services", to: "/dashboard/seller/services", icon: "fa-briefcase" },
    { label: "New Service", to: "/dashboard/seller/new-service", icon: "fa-plus" },
    { label: "Orders", to: "/dashboard/seller/orders", icon: "fa-cart-shopping" },
    { label: "Inbox", to: "/dashboard/seller/inbox", icon: "fa-inbox" },
    { label: "Earnings", to: "/dashboard/seller/earnings", icon: "fa-wallet" },
  ],
  admin: [
    { label: "Admin Dashboard", to: "/admin", icon: "fa-gauge" },
    { label: "Verifications", to: "/admin/verifications", icon: "fa-user-check" },
    { label: "Users", to: "/admin/users", icon: "fa-users" },
    { label: "Services", to: "/admin/services", icon: "fa-briefcase" },
    { label: "Orders", to: "/admin/orders", icon: "fa-cart-shopping" },
    { label: "Payments", to: "/admin/payments", icon: "fa-credit-card" },
    { label: "Disputes", to: "/admin/disputes", icon: "fa-scale-balanced" },
  ],
};


/**
 * Global Ctrl+K / Cmd+K command palette: quick navigation to pages,
 * categories, services and role-specific dashboard shortcuts.
 */
export default function CommandPalette() {
  const { categories } = useCategories();
  const { services } = useServices();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const go = useCallback(
    (to: string) => {
      setOpen(false);
      navigate(to);
    },
    [navigate]
  );

  const roleLinks = user ? ROLE_LINKS[user.role] ?? [] : [];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages, categories, services…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {roleLinks.length > 0 && (
          <>
            <CommandGroup heading="My Workspace">
              {roleLinks.map((l) => (
                <CommandItem key={l.to} value={`workspace ${l.label}`} onSelect={() => go(l.to)}>
                  <i className={`fas ${l.icon} mr-2 w-4 text-muted-foreground`} />
                  {l.label}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        <CommandGroup heading="Pages">
          {PAGES.map((p) => (
            <CommandItem key={p.to} value={`page ${p.label}`} onSelect={() => go(p.to)}>
              <i className={`fas ${p.icon} mr-2 w-4 text-muted-foreground`} />
              {p.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />

        <CommandGroup heading="Categories">
          {categories.map((c) => (
            <CommandItem
              key={c.id}
              value={`category ${c.name} ${c.description}`}
              onSelect={() => go(`/browse?category=${encodeURIComponent(c.name)}`)}
            >
              <i className={`fas ${c.icon} mr-2 w-4 text-muted-foreground`} />
              {c.name}
              <span className="ml-2 text-xs text-muted-foreground">{c.description}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />

        <CommandGroup heading="Services">
          {services.map((s) => (
            <CommandItem
              key={s.id}
              value={`service ${s.title} ${s.category} ${s.seller} ${s.district}`}
              onSelect={() => go(`/service/${s.id}`)}
            >
              <i className={`fas ${s.categoryIcon} mr-2 w-4 text-muted-foreground`} />
              <span className="truncate">{s.title}</span>
              <span className="ml-auto pl-3 text-xs text-muted-foreground whitespace-nowrap">
                Rs {s.price.toLocaleString()}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
