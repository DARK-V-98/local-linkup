import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
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
          <Route path="/role-selection" element={<RoleSelection />} />
          <Route path="/register/buyer" element={<RegisterBuyer />} />
          <Route path="/register/seller" element={<RegisterSeller />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
