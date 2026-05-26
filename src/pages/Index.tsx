import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import HeroSection from "@/components/home/HeroSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import StatsStrip from "@/components/home/StatsStrip";
import TopRatedServices from "@/components/home/TopRatedServices";
import SellerCTA from "@/components/home/SellerCTA";
import LatestServices from "@/components/home/LatestServices";
import HowItWorks from "@/components/home/HowItWorks";
import TrustSection from "@/components/home/TrustSection";
import DistrictSection from "@/components/home/DistrictSection";
import BottomCTA from "@/components/home/BottomCTA";
import WhatsAppButton from "@/components/WhatsAppButton";

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      <main>
        <HeroSection />
        <CategoriesSection />
        <StatsStrip />
        <TopRatedServices />
        <HowItWorks />
        <TrustSection />
        <DistrictSection />
        <SellerCTA />
        <LatestServices />
        <BottomCTA />
      </main>
      <Footer />
      <MobileNav />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
