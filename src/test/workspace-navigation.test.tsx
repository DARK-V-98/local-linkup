import { describe, it, expect, beforeEach, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import DashboardShell from "@/components/dashboard/DashboardShell";
vi.mock("@/lib/auth",()=>({getUser:()=>({name:"Test User"}),signOutFirebase:vi.fn()}));
vi.mock("@/components/NotificationsDropdown",()=>({getNotifications:()=>[]}));

function mount(path:string) {
  return render(<MemoryRouter initialEntries={[path]}><Routes><Route path="*" element={<DashboardShell><div>Workspace content</div></DashboardShell>} /></Routes></MemoryRouter>);
}
describe("workspace navigation",()=> {
  beforeEach(()=>localStorage.clear());
  it("includes buyer messaging and uses the correct account destination",()=> {
    mount("/dashboard/buyer");
    expect(screen.getAllByRole("link",{name:"Messages"}).every(l=>l.getAttribute("href")==="/dashboard/buyer/inbox")).toBe(true);
    expect(screen.getByRole("link",{name:"Account settings"})).toHaveAttribute("href","/dashboard/buyer/settings");
  });
  it("makes new admin reports discoverable through functional search",()=> {
    mount("/admin");
    fireEvent.change(screen.getByLabelText("Find a dashboard page"),{target:{value:"reports"}});
    expect(screen.getAllByRole("link",{name:"Reports"}).every(l=>l.getAttribute("href")==="/admin/reports")).toBe(true);
    fireEvent.keyDown(screen.getByLabelText("Find a dashboard page"),{key:"Enter"});
    const active = screen.getAllByRole("link",{name:"Reports"}).filter(l=>l.getAttribute("aria-current")==="page");
    expect(active.length).toBeGreaterThan(0);
  });
  it("shows seller analytics and closes the mobile drawer with Escape",()=> {
    mount("/dashboard/seller/analytics");
    expect(screen.getByRole("link",{name:"Analytics"})).toHaveAttribute("aria-current","page");
    fireEvent.click(screen.getByRole("button",{name:"Open workspace menu"}));
    expect(screen.getByRole("button",{name:"Open workspace menu"})).toHaveAttribute("aria-expanded","true");
    fireEvent.keyDown(document,{key:"Escape"});
    expect(screen.getByRole("button",{name:"Open workspace menu"})).toHaveAttribute("aria-expanded","false");
  });
});
