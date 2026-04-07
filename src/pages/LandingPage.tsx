import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { PrivacySection } from "@/components/landing/PrivacySection";
import { MetricsSection } from "@/components/landing/MetricsSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <PrivacySection />
      <MetricsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
