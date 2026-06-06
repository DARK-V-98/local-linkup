import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { auth, isFirebaseConfigured } from "@/lib/firebase";
import { getUser, setUser, clearUser } from "@/lib/auth";
import { getUserProfile } from "@/lib/firestore/users";
import Index from "./pages/Index.tsx";
import RoleSelection from "./pages/RoleSelection.tsx";
import RegisterBuyer from "./pages/RegisterBuyer.tsx";
import RegisterSeller from "./pages/RegisterSeller.tsx";
import Browse from "./pages/Browse.tsx";
import ServiceDetail from "./pages/ServiceDetail.tsx";
import Feed from "./pages/Feed.tsx";
import About from "./pages/About.tsx";
import Contact from "./pages/Contact.tsx";
import Terms from "./pages/Terms.tsx";
import Privacy from "./pages/Privacy.tsx";
import Login from "./pages/Login.tsx";
import AdminDashboard from "./pages/dashboard/AdminDashboard.tsx";
import SellerDashboard from "./pages/dashboard/SellerDashboard.tsx";
import BuyerDashboard from "./pages/dashboard/BuyerDashboard.tsx";
import BookingConfirm from "./pages/BookingConfirm.tsx";
import NewService from "./pages/dashboard/seller/NewService.tsx";
import MyServices from "./pages/dashboard/seller/MyServices.tsx";
import SellerOrders from "./pages/dashboard/seller/SellerOrders.tsx";
import BuyerOrders from "./pages/dashboard/buyer/BuyerOrders.tsx";
import VendorProfile from "./pages/VendorProfile.tsx";
import Emergency from "./pages/Emergency.tsx";
import Overseas from "./pages/Overseas.tsx";
import PostRequest from "./pages/PostRequest.tsx";
import AdminVerifications from "./pages/admin/Verifications.tsx";
import AdminDisputes from "./pages/admin/Disputes.tsx";
import AdminUsers from "./pages/admin/Users.tsx";
import AdminServices from "./pages/admin/Services.tsx";
import AdminSettings from "./pages/admin/Settings.tsx";
import AdminCategories from "./pages/admin/Categories.tsx";
import AdminOrders from "./pages/admin/Orders.tsx";
import AdminPayments from "./pages/admin/Payments.tsx";
import AdminSellers from "./pages/admin/Sellers.tsx";
import SellerSettings from "./pages/dashboard/seller/SellerSettings.tsx";
import SellerEarnings from "./pages/dashboard/seller/SellerEarnings.tsx";
import BuyerSettings from "./pages/dashboard/buyer/BuyerSettings.tsx";
import BuyerPayments from "./pages/dashboard/buyer/BuyerPayments.tsx";
import SavedSellers from "./pages/dashboard/buyer/SavedSellers.tsx";
import SellerInbox from "./pages/dashboard/seller/SellerInbox.tsx";
import NotFound from "./pages/NotFound.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";

import { seedLocalStorage } from "./lib/seed";
seedLocalStorage();

const queryClient = new QueryClient();

function AuthStateWatcher() {
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    let unsubscribe: (() => void) | undefined;
    import("firebase/auth").then(({ onAuthStateChanged }) => {
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const current = getUser();
          // Only sync if not already a demo account
          if (!current || (!current.id.startsWith("UDEMO") && current.id !== firebaseUser.uid)) {
            const profile = await getUserProfile(firebaseUser.uid);
            if (profile) {
              setUser(profile);
              window.dispatchEvent(new Event("needly-auth-change"));
            }
          }
        } else {
          const current = getUser();
          // Only clear if it was a real Firebase user (not demo)
          if (current && !current.id.startsWith("UDEMO")) {
            clearUser();
            window.dispatchEvent(new Event("needly-auth-change"));
          }
        }
      });
    });
    return () => unsubscribe?.();
  }, []);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthStateWatcher />
      <BrowserRouter>
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
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/buyer" element={<BuyerDashboard />} />
          <Route path="/dashboard/buyer/orders" element={<BuyerOrders />} />
          <Route path="/dashboard/seller" element={<SellerDashboard />} />
          <Route path="/dashboard/seller/services" element={<MyServices />} />
          <Route path="/dashboard/seller/new-service" element={<NewService />} />
          <Route path="/dashboard/seller/orders" element={<SellerOrders />} />
          <Route path="/booking/confirm/:id" element={<BookingConfirm />} />
          <Route path="/vendor/:vendorSlug" element={<VendorProfile />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/overseas" element={<Overseas />} />
          <Route path="/post-request" element={<PostRequest />} />
          <Route path="/admin/verifications" element={<AdminVerifications />} />
          <Route path="/admin/disputes" element={<AdminDisputes />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/services" element={<AdminServices />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/admin/sellers" element={<AdminSellers />} />
          <Route path="/dashboard/seller/settings" element={<SellerSettings />} />
          <Route path="/dashboard/seller/earnings" element={<SellerEarnings />} />
          <Route path="/dashboard/buyer/settings" element={<BuyerSettings />} />
          <Route path="/dashboard/buyer/payments" element={<BuyerPayments />} />
          <Route path="/dashboard/buyer/saved" element={<SavedSellers />} />
          <Route path="/dashboard/seller/inbox" element={<SellerInbox />} />
          <Route path="/role-selection" element={<RoleSelection />} />
          <Route path="/register/buyer" element={<RegisterBuyer />} />
          <Route path="/register/seller" element={<RegisterSeller />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
