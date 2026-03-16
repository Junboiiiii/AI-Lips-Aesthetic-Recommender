import { motion } from "framer-motion";
interface StyleSelectorProps {
  selectedStyle: string;
  onStyleChange: (style: string) => void;
}
const styles = [{
  id: "asian",
  label: "Asian Style",
  description: "Subtle, natural enhancement"
}, {
  id: "caucasian",
  label: "Caucasian Style",
  description: "Fuller, defined look"
}];
const StyleSelector = ({
  selectedStyle,
  onStyleChange
}: StyleSelectorProps) => {
  return <div className="w-full">
      <label className="block text-sm font-medium mb-4 tracking-wide text-primary">
        Enhancement Style
      </label>
      <div className="grid grid-cols-2 gap-4">
        {styles.map(style => <motion.button key={style.id} whileHover={{
        scale: 1.02,
        y: -2
      }} whileTap={{
        scale: 0.98
      }} transition={{
        type: "spring",
        stiffness: 400,
        damping: 25
      }} onClick={() => onStyleChange(style.id)} className={`
              relative p-5 rounded-2xl text-left transition-all duration-300
              ${selectedStyle === style.id ? "glass-premium ring-2 ring-rose-gold shadow-glow" : "glass-card hover:shadow-soft"}
            `}>
            <div className="flex items-start gap-3">
              {/* Premium radio indicator */}
              <div className={`
                  w-5 h-5 rounded-full border-2 transition-all duration-300 flex items-center justify-center flex-shrink-0 mt-0.5
                  ${selectedStyle === style.id ? "border-rose-gold gradient-rose-gold shadow-soft" : "border-muted-foreground/40"}
                `}>
                {selectedStyle === style.id && <motion.div initial={{
              scale: 0
            }} animate={{
              scale: 1
            }} transition={{
              type: "spring",
              stiffness: 500,
              damping: 30
            }} className="w-2 h-2 rounded-full bg-foreground/80" />}
              </div>
              <div>
                <p className="font-medium text-foreground text-sm mb-1">
                  {style.label}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {style.description}
                </p>
              </div>
            </div>
          </motion.button>)}
      </div>
    </div>;
};
export default StyleSelector;