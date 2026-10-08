import { describe,it,expect,vi,beforeEach } from "vitest";
import { render,screen,fireEvent,waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MyServices from "@/pages/dashboard/seller/MyServices";
const mocks=vi.hoisted(()=>({update:vi.fn().mockResolvedValue(undefined),remove:vi.fn()}));
vi.mock("@/components/dashboard/DashboardShell",()=>({default:({children}:{children:React.ReactNode})=><main>{children}</main>}));
vi.mock("@/hooks/useMyServices",()=>({useMyServices:()=>({services:[{id:"S1",title:"Test service",category:"Technology",price:100,status:"active",description:"A service",district:"Colombo",priceUnit:"project"}],loading:false,error:null,update:mocks.update,remove:mocks.remove})}));
describe("service editing",()=>{
  beforeEach(()=>vi.clearAllMocks());
  it("persists a service image link with the actual service record",async()=> {
    render(<MemoryRouter><MyServices/></MemoryRouter>);
    fireEvent.click(screen.getByRole("button",{name:/^Edit$/}));
    fireEvent.change(screen.getByLabelText("Photo of your work"),{target:{value:"https://example.com/work.jpg"}});
    fireEvent.click(screen.getByRole("button",{name:"Save changes"}));
    await waitFor(()=>expect(mocks.update).toHaveBeenCalledWith("S1",expect.objectContaining({imageUrl:"https://example.com/work.jpg"})));
    await waitFor(()=>expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
  it("keeps the editor open when saving fails",async()=> {
    mocks.update.mockRejectedValueOnce(new Error("offline"));
    render(<MemoryRouter><MyServices/></MemoryRouter>);
    fireEvent.click(screen.getByRole("button",{name:/^Edit$/}));
    fireEvent.click(screen.getByRole("button",{name:"Save changes"}));
    await waitFor(()=>expect(screen.getByRole("button",{name:"Save changes"})).not.toBeDisabled());
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
