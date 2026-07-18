import { lazy, Suspense, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { auth, isFirebaseConfigured } from "@/lib/firebase";
import { getUser, setUser, clearUser, ensureProfileForUser } from "@/lib/auth";
import ErrorBoundary from "@/components/ErrorBoundary";
import ScrollToTop from "@/components/ScrollToTop";
import CommandPalette from "@/components/CommandPalette";
import ProtectedRoute, { PageLoader } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index.tsx";

// ─── Lazy-loaded pages (code-split per route) ─────────────────────────────────
const RoleSelection = lazy(() => import("./pages/RoleSelection.tsx"));
const RegisterBuyer = lazy(() => import("./pages/RegisterBuyer.tsx"));
const RegisterSeller = lazy(() => import("./pages/RegisterSeller.tsx"));
const Browse = lazy(() => import("./pages/Browse.tsx"));
const ServiceDetail = lazy(() => import("./pages/ServiceDetail.tsx"));
const Feed = lazy(() => import("./pages/Feed.tsx"));
const About = lazy(() => import("./pages/About.tsx"));
const Contact = lazy(() => import("./pages/Contact.tsx"));
const Terms = lazy(() => import("./pages/Terms.tsx"));
const Privacy = lazy(() => import("./pages/Privacy.tsx"));
const Login = lazy(() => import("./pages/Login.tsx"));
const AdminDashboard = lazy(() => import("./pages/dashboard/AdminDashboard.tsx"));
const SellerDashboard = lazy(() => import("./pages/dashboard/SellerDashboard.tsx"));
const BuyerDashboard = lazy(() => import("./pages/dashboard/BuyerDashboard.tsx"));
const BookingConfirm = lazy(() => import("./pages/BookingConfirm.tsx"));
const NewService = lazy(() => import("./pages/dashboard/seller/NewService.tsx"));
const MyServices = lazy(() => import("./pages/dashboard/seller/MyServices.tsx"));
const SellerOrders = lazy(() => import("./pages/dashboard/seller/SellerOrders.tsx"));
const BuyerOrders = lazy(() => import("./pages/dashboard/buyer/BuyerOrders.tsx"));
const VendorProfile = lazy(() => import("./pages/VendorProfile.tsx"));
const Emergency = lazy(() => import("./pages/Emergency.tsx"));
const Overseas = lazy(() => import("./pages/Overseas.tsx"));
const PostRequest = lazy(() => import("./pages/PostRequest.tsx"));
const AdminVerifications = lazy(() => import("./pages/admin/Verifications.tsx"));
const AdminDisputes = lazy(() => import("./pages/admin/Disputes.tsx"));
const AdminUsers = lazy(() => import("./pages/admin/Users.tsx"));
const AdminServices = lazy(() => import("./pages/admin/Services.tsx"));
const AdminSettings = lazy(() => import("./pages/admin/Settings.tsx"));
const AdminCategories = lazy(() => import("./pages/admin/Categories.tsx"));
const AdminOrders = lazy(() => import("./pages/admin/Orders.tsx"));
const AdminPayments = lazy(() => import("./pages/admin/Payments.tsx"));
const AdminSellers = lazy(() => import("./pages/admin/Sellers.tsx"));
const SellerSettings = lazy(() => import("./pages/dashboard/seller/SellerSettings.tsx"));
const SellerEarnings = lazy(() => import("./pages/dashboard/seller/SellerEarnings.tsx"));
const BuyerSettings = lazy(() => import("./pages/dashboard/buyer/BuyerSettings.tsx"));
const BuyerPayments = lazy(() => import("./pages/dashboard/buyer/BuyerPayments.tsx"));
const SavedSellers = lazy(() => import("./pages/dashboard/buyer/SavedSellers.tsx"));
const SellerInbox = lazy(() => import("./pages/dashboard/seller/SellerInbox.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword.tsx"));

const queryClient = new QueryClient();

function AuthStateWatcher() {
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    let unsubscribe: (() => void) | undefined;
    import("firebase/auth").then(({ onAuthStateChanged }) => {
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const current = getUser();
          if (!current || current.id !== firebaseUser.uid) {
            try {
              // Creates the Firestore profile when absent, so it exists even if
              // the user never passes through the login screen this session.
              const profile = await ensureProfileForUser(firebaseUser);
              setUser(profile);
              window.dispatchEvent(new Event("needly-auth-change"));
            } catch {
              // Offline — leave the cached session untouched rather than
              // risk overwriting a profile we simply could not read.
            }
          }
        } else if (getUser()) {
          clearUser();
          window.dispatchEvent(new Event("needly-auth-change"));
        }
      });
    });
    return () => unsubscribe?.();
  }, []);
  return null;
}

// ─── Route guard helpers ──────────────────────────────────────────────────────
// The developer role outranks admin, so it is allowed everywhere admin is.
const admin = (el: React.ReactNode) => <ProtectedRoute roles={["admin", "developer"]}>{el}</ProtectedRoute>;
const seller = (el: React.ReactNode) => <ProtectedRoute roles={["seller", "admin", "developer"]}>{el}</ProtectedRoute>;
const buyer = (el: React.ReactNode) => <ProtectedRoute roles={["buyer", "admin", "developer"]}>{el}</ProtectedRoute>;
const authed = (el: React.ReactNode) => <ProtectedRoute>{el}</ProtectedRoute>;

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthStateWatcher />
        <BrowserRouter>
          <ScrollToTop />
          <CommandPalette />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/service/:id" element={<ServiceDetail />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={admin(<AdminDashboard />)} />
              <Route path="/dashboard/buyer" element={buyer(<BuyerDashboard />)} />
              <Route path="/dashboard/buyer/orders" element={buyer(<BuyerOrders />)} />
              <Route path="/dashboard/seller" element={seller(<SellerDashboard />)} />
              <Route path="/dashboard/seller/services" element={seller(<MyServices />)} />
              <Route path="/dashboard/seller/new-service" element={seller(<NewService />)} />
              <Route path="/dashboard/seller/orders" element={seller(<SellerOrders />)} />
              <Route path="/booking/confirm/:id" element={authed(<BookingConfirm />)} />
              <Route path="/vendor/:vendorSlug" element={<VendorProfile />} />
              <Route path="/emergency" element={<Emergency />} />
              <Route path="/overseas" element={<Overseas />} />
              <Route path="/post-request" element={<PostRequest />} />
              <Route path="/admin/verifications" element={admin(<AdminVerifications />)} />
              <Route path="/admin/disputes" element={admin(<AdminDisputes />)} />
              <Route path="/admin/users" element={admin(<AdminUsers />)} />
              <Route path="/admin/services" element={admin(<AdminServices />)} />
              <Route path="/admin/settings" element={admin(<AdminSettings />)} />
              <Route path="/admin/categories" element={admin(<AdminCategories />)} />
              <Route path="/admin/orders" element={admin(<AdminOrders />)} />
              <Route path="/admin/payments" element={admin(<AdminPayments />)} />
              <Route path="/admin/sellers" element={admin(<AdminSellers />)} />
              <Route path="/dashboard/seller/settings" element={seller(<SellerSettings />)} />
              <Route path="/dashboard/seller/earnings" element={seller(<SellerEarnings />)} />
              <Route path="/dashboard/buyer/settings" element={buyer(<BuyerSettings />)} />
              <Route path="/dashboard/buyer/payments" element={buyer(<BuyerPayments />)} />
              <Route path="/dashboard/buyer/saved" element={buyer(<SavedSellers />)} />
              <Route path="/dashboard/seller/inbox" element={seller(<SellerInbox />)} />
              <Route path="/role-selection" element={<RoleSelection />} />
              <Route path="/register/buyer" element={<RegisterBuyer />} />
              <Route path="/register/seller" element={<RegisterSeller />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
