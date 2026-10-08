import { describe,it,expect,vi } from "vitest";
import { render,screen,fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Reports from "@/pages/admin/Reports";
vi.mock("@/components/dashboard/DashboardShell",()=>({default:({children}:{children:React.ReactNode})=><main>{children}</main>}));
vi.mock("@/hooks/useAllBookings",()=>({useAllBookings:()=>({loading:false,error:null,bookings:[{id:"ONE",serviceTitle:"Web design",category:"Technology",district:"Colombo",status:"completed",price:2000,customerName:"Test",vendorName:"Test",createdAt:new Date().toISOString(),date:"2026-10-08",time:"10:00"},{id:"TWO",serviceTitle:"Home clean",category:"Home Services",district:"Kandy",status:"pending",price:500,customerName:"Test",vendorName:"Test",createdAt:new Date().toISOString(),date:"2026-10-08",time:"11:00"}]})}));
vi.mock("@/hooks/useBookings",()=>({useBookings:()=>({bookings:[],loading:false})}));
describe("report controls",()=> {
  it("supports all-time reports without trying to construct an invalid date",()=> {
    render(<MemoryRouter><Reports/></MemoryRouter>);
    fireEvent.change(screen.getByLabelText("Period"),{target:{value:"all"}});
    expect(screen.getByText("2 matching records · Page 1 of 1")).toBeInTheDocument();
  });
  it("filters actual records by status and restores them on Reset",()=> {
    render(<MemoryRouter><Reports/></MemoryRouter>);
    expect(screen.getByText("2 matching records · Page 1 of 1")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Order status"),{target:{value:"completed"}});
    expect(screen.getByText("1 matching records · Page 1 of 1")).toBeInTheDocument();
    expect(screen.queryByText("Home clean")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button",{name:"Reset"}));
    expect(screen.getByText("Home clean")).toBeInTheDocument();
  });
  it("does not export an empty search result",()=> {
    render(<MemoryRouter><Reports/></MemoryRouter>);
    fireEvent.change(screen.getByLabelText("Search records"),{target:{value:"not-present"}});
    expect(screen.getByRole("button",{name:"Export CSV"})).toBeDisabled();
    expect(screen.getByText("No records match these filters")).toBeInTheDocument();
  });
});
