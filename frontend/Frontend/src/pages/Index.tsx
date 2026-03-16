import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import Workspace from "@/components/Workspace";
import { AlertTriangle } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtle hero gradient overlay */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{ background: "var(--gradient-hero)" }}
      />
      
      <Header />
      <main className="relative z-10">
        <HeroSection />
        <Workspace />
      </main>
      
      {/* Premium Medical Disclaimer */}
      <div className="relative z-10 glass-card border-t border-border/30 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-start gap-4">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">Disclaimer:</span> This tool is for visualization purposes only and does not constitute medical advice. Results are AI-simulated. Always consult a certified aesthetic professional.
          </p>
        </div>
      </div>
      
      {/* Premium Footer */}
      <footer className="relative z-10 py-10 px-6 text-center">
        <p className="text-sm text-muted-foreground">
          © 2024 <span className="font-editorial font-medium text-foreground">Beu</span>. Powered by advanced AI technology.
        </p>
      </footer>
    </div>
  );
};

export default Index;