import { LandingNavbar } from "@/components/LandingNavbar";
import { LandingHero } from "@/components/LandingHero";
import { LandingFeatures } from "@/components/LandingFeatures";
import { LandingPricing } from "@/components/LandingPricing";
import { LandingFooter } from "@/components/LandingFooter";
import { AnimatedBackground } from "@/components/AnimatedBackground";

export default function LandingPage() {
  return (
    <main className="relative bg-[#0B0F19] min-h-screen">
      {/* Background persistente de todas as telas */}
      <AnimatedBackground />
      
      {/* Navegação Fixa */}
      <LandingNavbar />

      {/* Conteúdo da Landing Page */}
      <div className="relative z-10 w-full">
        <LandingHero />
        <LandingFeatures />
        
        <div className="bg-primary/5">
          <LandingPricing />
        </div>

        <LandingFooter />
      </div>
    </main>
  );
}
