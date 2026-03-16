import { motion } from "framer-motion";
import { ArrowDown, Sparkles } from "lucide-react";
const HeroSection = () => {
  return <section className="relative min-h-[60vh] flex items-center justify-center pt-32 pb-16 px-6 overflow-hidden">
      {/* Animated floating gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary rose-gold orb */}
        <motion.div initial={{
        opacity: 0,
        scale: 0.5
      }} animate={{
        opacity: 0.6,
        scale: 1
      }} transition={{
        duration: 2,
        ease: "easeOut"
      }} className="floating-orb w-[500px] h-[500px] top-10 left-1/4 -translate-x-1/2 gradient-pearl" style={{
        filter: "blur(80px)"
      }} />
        
        {/* Secondary accent orb */}
        <motion.div initial={{
        opacity: 0,
        scale: 0.5
      }} animate={{
        opacity: 0.4,
        scale: 1
      }} transition={{
        duration: 2,
        delay: 0.3,
        ease: "easeOut"
      }} className="floating-orb floating-orb-secondary w-[400px] h-[400px] top-32 right-1/4 translate-x-1/2 gradient-rose-gold" style={{
        filter: "blur(100px)"
      }} />

        {/* Subtle holographic accent */}
        <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 0.3
      }} transition={{
        duration: 2,
        delay: 0.6
      }} className="floating-orb w-[300px] h-[300px] bottom-20 left-1/3 gradient-holographic" style={{
        filter: "blur(60px)"
      }} />
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* AI Badge */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.8,
        delay: 0.2,
        ease: [0.16, 1, 0.3, 1]
      }} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-premium mb-8 border border-dashed">
          <Sparkles className="w-4 h-4 text-rose-gold" />
          <span className="text-sm font-medium text-muted-foreground tracking-wide">
            AI-Powered Virtual Try-On
          </span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1 initial={{
        opacity: 0,
        y: 30
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.8,
        delay: 0.3,
        ease: [0.16, 1, 0.3, 1]
      }} className="text-5xl md:text-6xl font-medium mb-6 leading-[1.1] tracking-tight font-serif text-primary lg:text-8xl">Enhance your smile with Beu<br />
          <span className="text-gradient-rose font-editorial font-semibold"></span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p initial={{
        opacity: 0,
        y: 30
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.8,
        delay: 0.4,
        ease: [0.16, 1, 0.3, 1]
      }} className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
          Upload your photo and let our clinical-grade AI show you stunning 
          lip enhancement possibilities tailored to your unique features.
        </motion.p>

        {/* Scroll indicator */}
        <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        duration: 0.8,
        delay: 0.8
      }} className="flex justify-center bg-[#f9f4f1]">
          <motion.div animate={{
          y: [0, 10, 0]
        }} transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut"
        }} className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-secondary shadow-xl bg-primary-foreground">
            <ArrowDown className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        </motion.div>
      </div>
    </section>;
};
export default HeroSection;