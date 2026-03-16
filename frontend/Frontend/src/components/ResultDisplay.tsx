import { motion, AnimatePresence } from "framer-motion";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";
import { Sparkles, Image as ImageIcon } from "lucide-react";

interface ResultDisplayProps {
  originalImage: string | null;
  transformedImage: string | null;
  isLoading: boolean;
}

const ResultDisplay = ({
  originalImage,
  transformedImage,
  isLoading,
}: ResultDisplayProps) => {
  return (
    <div className="w-full h-full min-h-[400px] rounded-3xl overflow-hidden">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full min-h-[400px] glass-premium rounded-3xl flex flex-col items-center justify-center"
          >
            {/* Premium loading spinner */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 rounded-3xl gradient-rose-gold flex items-center justify-center mb-6 shadow-glow"
            >
              <Sparkles className="w-10 h-10 text-foreground" />
            </motion.div>
            <p className="text-xl font-medium text-foreground mb-2 font-editorial">
              Analyzing your features...
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              This may take a few moments
            </p>
            
            {/* Premium progress bar */}
            <div className="h-1.5 w-56 rounded-full bg-secondary/60 overflow-hidden backdrop-blur-sm">
              <motion.div
                className="h-full gradient-rose-gold"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                style={{ width: "50%" }}
              />
            </div>
          </motion.div>
        ) : transformedImage && originalImage ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full min-h-[400px]"
          >
            <ReactCompareSlider
              itemOne={
                <ReactCompareSliderImage
                  src={originalImage}
                  alt="Original"
                  style={{ objectFit: "cover", height: "100%", width: "100%" }}
                />
              }
              itemTwo={
                <ReactCompareSliderImage
                  src={transformedImage}
                  alt="Transformed"
                  style={{ objectFit: "cover", height: "100%", width: "100%" }}
                />
              }
              position={50}
              className="w-full h-full min-h-[400px] rounded-3xl shadow-deep"
              style={{ height: "400px" }}
            />
            {/* Premium comparison labels */}
            <div className="flex justify-between px-6 py-4 glass-card rounded-b-3xl -mt-3 relative z-10">
              <span className="text-sm font-medium text-muted-foreground">
                Before
              </span>
              <span className="text-sm font-medium text-foreground gradient-rose-gold px-4 py-1 rounded-full shadow-soft">
                Drag to compare
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                After
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full min-h-[400px] glass-premium rounded-3xl flex flex-col items-center justify-center"
          >
            <div className="w-24 h-24 rounded-3xl bg-secondary/50 flex items-center justify-center mb-6">
              <ImageIcon className="w-12 h-12 text-muted-foreground/60" />
            </div>
            <p className="text-xl font-medium text-foreground mb-2 font-editorial">
              Your transformation will appear here
            </p>
            <p className="text-sm text-muted-foreground text-center max-w-xs leading-relaxed">
              Upload a photo and click "Generate Transformation" to see the AI-powered results
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResultDisplay;