import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
const Header = () => {
  return <motion.header initial={{
    opacity: 0,
    y: -20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.8,
    ease: [0.16, 1, 0.3, 1]
  }} className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto">
        <nav className="glass-premium rounded-2xl px-6 py-3 flex items-center justify-between">
          {/* Beu Logo - Editorial Typography */}
          <motion.div className="flex items-center gap-3" whileHover={{
          scale: 1.02
        }} transition={{
          type: "spring",
          stiffness: 400,
          damping: 25
        }}>
            {/* Logo Mark */}
            <motion.div whileHover={{
            scale: 1.05
          }} transition={{
            type: "spring",
            stiffness: 400,
            damping: 20
          }} className="w-10 h-10 rounded-xl gradient-rose-gold flex items-center justify-center shadow-soft overflow-hidden text-primary-foreground bg-primary-foreground">
              <span className="text-foreground/90 font-serif text-4xl font-bold">B</span>
            </motion.div>
            
            {/* Brand Name */}
            <span className="logo-editorial tracking-tight text-foreground text-4xl font-serif">
              Beu
            </span>
          </motion.div>

          {/* About Button */}
          <Button variant="ghost" size="sm" className="btn-spring gap-2 rounded-full px-4 text-muted-foreground hover:text-foreground hover:bg-secondary/50">
            <Info className="w-4 h-4" />
            About
          </Button>
        </nav>
      </div>
    </motion.header>;
};
export default Header;