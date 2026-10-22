import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { clearUser,getUser,setUser,type AuthUser } from "@/lib/auth";
import { render,screen } from "@testing-library/react";
import { MemoryRouter,Route,Routes } from "react-router-dom";
import { beforeEach,describe,expect,it,vi } from "vitest";

// Route unit tests stub the authoritative auth subscription.
vi.mock("@/lib/firebase", () => ({
  isFirebaseConfigured: false,
  auth: {},
  db: {},
  storage: {},
}));

vi.mock("@/hooks/useAuth",()=>({useAuth:()=>({user:getUser(),loading:false,error:null})}));

const buyer: AuthUser = {
  id: "U1",
  name: "Test Buyer",
  email: "b@test.com",
  phone: "+94770000000",
  role: "buyer",
  district: "Colombo",
  verified: true,
  joinedAt: "2024-01-01",
};

function renderAt(path: string, roles?: AuthUser["role"][]) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/secret"
          element={
            <ProtectedRoute roles={roles}>
              <div>secret content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>login page</div>} />
        <Route path="/dashboard/buyer" element={<div>buyer home</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    localStorage.clear();clearUser();
  });

  it("does not accept a forged localStorage role",()=>{localStorage.setItem("needly_auth_user",JSON.stringify({...buyer,role:"admin"}));renderAt("/secret",["admin"]);expect(screen.getByText("login page")).toBeInTheDocument();});

  it("redirects anonymous users to /login", () => {
    clearUser();
    renderAt("/secret");
    expect(screen.getByText("login page")).toBeInTheDocument();
    expect(screen.queryByText("secret content")).not.toBeInTheDocument();
  });

  it("renders children for a signed-in user", () => {
    setUser(buyer);
    renderAt("/secret");
    expect(screen.getByText("secret content")).toBeInTheDocument();
  });

  it("allows a user whose role is in the allowed list", () => {
    setUser(buyer);
    renderAt("/secret", ["buyer", "admin"]);
    expect(screen.getByText("secret content")).toBeInTheDocument();
  });

  it("redirects a user with the wrong role to their own dashboard", () => {
    setUser(buyer);
    renderAt("/secret", ["admin"]);
    expect(screen.queryByText("secret content")).not.toBeInTheDocument();
    expect(screen.getByText("buyer home")).toBeInTheDocument();
  });
});
