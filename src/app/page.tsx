import HeroSection from "@/components/HeroSection";
import MapSection from "@/components/MapSection";
import WorkflowSection from "@/components/WorkflowSection";
import BeforeAfterSection from "@/components/BeforeAfterSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <main className="flex-1">
        <HeroSection />
        <MapSection />
        <WorkflowSection />
        <BeforeAfterSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
