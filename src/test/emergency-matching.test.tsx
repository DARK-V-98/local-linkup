import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import Emergency from "@/pages/Emergency";
vi.mock("@/components/layout/AppShell", () => ({ default: ({ children }: {
        children: React.ReactNode;
    }) => <div>{children}</div> }));
vi.mock("@/lib/usePageTitle", () => ({ usePageTitle: () => { } }));
vi.mock("@/hooks/useServices", () => ({ useServices: () => ({ loading: false, error: null, services: [{ id: "plumbing-service", sellerId: "plumber", title: "Pipe repairs", price: 4500 }, { id: "electric-service", sellerId: "electrician", title: "Wiring repairs", price: 5500 }] }) }));
vi.mock("@/hooks/useHospitality", () => ({ useBusinessRows: () => ({ loading: false, error: "", rows: [{ id: "plumber", ownerId: "plumber", displayName: "Registered Plumber", types: ["plumbing"], district: "Galle", hours: "8am–6pm", description: "Urgent plumbing", serviceIds: ["plumbing-service"] }, { id: "electrician", ownerId: "electrician", displayName: "Registered Electrician", types: ["electric"], district: "Colombo", hours: "9am–5pm", description: "Electrical work", serviceIds: ["electric-service"] }] }) }));
describe("urgent-service discovery", () => {
    it("selects matching registered sellers without showing fixed prices", () => { render(<MemoryRouter><Emergency /></MemoryRouter>); fireEvent.click(screen.getByRole("button", { name: /Plumbing Burst pipes/ })); expect(screen.getByText("Registered Plumber")).toBeInTheDocument(); expect(screen.queryByText("Registered Electrician")).not.toBeInTheDocument(); expect(screen.getByRole("link", { name: /Pipe repairs/ })).toHaveAttribute("href", "/service/plumbing-service?urgent=plumbing"); expect(screen.queryByText(/4,500|4500|surge/i)).not.toBeInTheDocument(); });
    it("filters coverage districts and shows an honest empty state", () => { render(<MemoryRouter initialEntries={["/emergency?type=plumbing&district=Colombo"]}><Emergency /></MemoryRouter>); expect(screen.getByText("No matching providers yet")).toBeInTheDocument(); expect(screen.queryByText("Registered Plumber")).not.toBeInTheDocument(); });
});
