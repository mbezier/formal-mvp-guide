import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { AcademicSection } from "@/components/landing/AcademicSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { PrivacySection } from "@/components/landing/PrivacySection";
import { MetricsSection } from "@/components/landing/MetricsSection";
import { SampleReportSection } from "@/components/landing/SampleReportSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <AcademicSection />
      <HowItWorksSection />
      <PrivacySection />
      <MetricsSection />
      <SampleReportSection />
      <CTASection />
      <Footer />
    </div>
  );
}
