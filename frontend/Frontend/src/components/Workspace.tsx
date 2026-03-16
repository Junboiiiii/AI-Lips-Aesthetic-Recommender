import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Wand2, AlertCircle, ArrowDown, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import ImageUploader from "./ImageUploader";
import StyleSelector from "./StyleSelector";
import ControlSlider from "./ControlSlider";
import ResultDisplay from "./ResultDisplay";
import FeatureAnalysis from "./FeatureAnalysis";
import { toast } from "sonner";

// Helper function to convert data URL to Blob
const dataURLtoBlob = (dataurl: string): Blob => {
  const arr = dataurl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], {
    type: mime
  });
};
interface FeatureData {
  [key: string]: number;
}
const Workspace = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [transformedImage, setTransformedImage] = useState<string | null>(null);
  const [originalFeatures, setOriginalFeatures] = useState<FeatureData | null>(null);
  const [targetFeatures, setTargetFeatures] = useState<FeatureData | null>(null);
  const [selectedStyle, setSelectedStyle] = useState("asian");
  const [warpStrength, setWarpStrength] = useState(50);
  const [sensitivity, setSensitivity] = useState(70);
  const [isLoading, setIsLoading] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const handleImageSelect = useCallback((file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = e => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    setTransformedImage(null);
    setOriginalFeatures(null);
    setTargetFeatures(null);
  }, []);
  const handleClear = useCallback(() => {
    setSelectedFile(null);
    setPreview(null);
    setTransformedImage(null);
    setOriginalFeatures(null);
    setTargetFeatures(null);
  }, []);
  useEffect(() => {
    if (transformedImage && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }, 500);
    }
  }, [transformedImage]);
  const handleGenerate = async () => {
    if (!selectedFile) {
      toast.error("Please upload an image first", {
        icon: <AlertCircle className="w-4 h-4" />
      });
      return;
    }
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("style", selectedStyle);
      formData.append("intensity", warpStrength.toString());
      formData.append("sensitivity", sensitivity.toString());
      const response = await fetch("https://milagros-epistemological-marquis.ngrok-free.dev/analyze", {
        method: "POST",
        body: formData
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to process image");
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setTransformedImage(data.image);
      setOriginalFeatures(data.original_features);
      setTargetFeatures(data.target_features);
      toast.success("Transformation complete!", {
        icon: <Sparkles className="w-4 h-4" />
      });
    } catch (error) {
      console.error("Error:", error);
      if (error instanceof TypeError && error.message.includes("fetch")) {
        toast.error("Backend server is offline.", {
          description: "Please check your Python server and Ngrok connection.",
          duration: 5000
        });
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };
  return <section className="py-16 px-6 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Main Grid Layout */}
        <motion.div initial={{
        opacity: 0,
        y: 30
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.8,
        delay: 0.2,
        ease: [0.16, 1, 0.3, 1]
      }} className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Left Panel - Controls */}
          <motion.div initial={{
          opacity: 0,
          x: -30
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          duration: 0.8,
          delay: 0.3,
          ease: [0.16, 1, 0.3, 1]
        }} className="glass-premium rounded-4xl p-8 lg:p-10 space-y-8 shadow-deep border-double border-secondary-foreground bg-primary-foreground">
            {/* Panel Header */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl gradient-rose-gold flex items-center justify-center shadow-glow">
                <Wand2 className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-semibold font-editorial text-primary">
                  Upload & Configure
                </h2>
                <p className="text-sm text-accent">
                  Customize your transformation
                </p>
              </div>
            </div>

            <ImageUploader onImageSelect={handleImageSelect} preview={preview} onClear={handleClear} />

            <StyleSelector selectedStyle={selectedStyle} onStyleChange={setSelectedStyle} />

            {/* Premium slider section */}
            <div className="space-y-6 p-6 glass-card rounded-3xl bg-border bg-[rose-gold-light]">
              <ControlSlider label="Warp Strength" value={warpStrength} onChange={setWarpStrength} />
              <ControlSlider label="Analysis Sensitivity" value={sensitivity} onChange={setSensitivity} />
            </div>

            {/* Premium Generate Button */}
            <Button variant="gradient" size="xl" className="w-full rounded-2xl h-14" onClick={handleGenerate} disabled={!selectedFile || isLoading}>
              {isLoading ? <div className="flex items-center gap-3">
                  <motion.div animate={{
                rotate: 360
              }} transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear"
              }}>
                    <Sparkles className="w-5 h-5" />
                  </motion.div>
                  Processing...
                </div> : <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5" />
                  Generate Transformation
                </div>}
            </Button>
          </motion.div>

          {/* Right Panel - Results */}
          <motion.div initial={{
          opacity: 0,
          x: 30
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          duration: 0.8,
          delay: 0.4,
          ease: [0.16, 1, 0.3, 1]
        }} className="glass-premium rounded-4xl p-8 lg:p-10 h-full flex flex-col shadow-deep bg-primary-foreground">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-primary">
                  <Sparkles className="w-6 h-6 bg-destructive text-secondary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold font-editorial text-primary">
                    Results Preview
                  </h2>
                  <p className="text-sm text-blush">
                    Compare before and after
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-grow flex items-center justify-center min-h-[400px]">
              <ResultDisplay originalImage={preview} transformedImage={transformedImage} isLoading={isLoading} />
            </div>

            {/* Download Report Button */}
            {transformedImage && preview && <div className="mt-6">
                <Button variant="glass" className="w-full rounded-2xl h-12" onClick={async () => {
              try {
                toast.info("Generating clinical report...");
                const originalBlob = dataURLtoBlob(preview);
                const warpedBlob = dataURLtoBlob(transformedImage);
                const formData = new FormData();
                formData.append("original_file", originalBlob, "original.jpg");
                formData.append("warped_file", warpedBlob, "warped.jpg");
                formData.append("data", JSON.stringify({
                  original_features: originalFeatures,
                  target_features: targetFeatures,
                  style: selectedStyle
                }));
                const response = await fetch("https://milagros-epistemological-marquis.ngrok-free.dev/generate-report", {
                  method: "POST",
                  body: formData
                });
                if (!response.ok) {
                  throw new Error("Failed to generate report");
                }
                const pdfBlob = await response.blob();
                const url = window.URL.createObjectURL(pdfBlob);
                const link = document.createElement("a");
                link.href = url;
                link.download = "Clinical_Report.pdf";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                toast.success("Clinical report downloaded!");
              } catch (error) {
                console.error("Error generating report:", error);
                toast.error("Failed to generate clinical report");
              }
            }}>
                  <FileText className="w-4 h-4 mr-2" />
                  Download Clinical Report
                </Button>
              </div>}
          </motion.div>
        </motion.div>

        {/* Feature Analysis Section */}
        <AnimatePresence>
          {(originalFeatures || targetFeatures) && <motion.div ref={resultsRef} initial={{
          opacity: 0,
          y: 50
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0,
          y: 30
        }} transition={{
          duration: 0.6,
          ease: [0.16, 1, 0.3, 1]
        }} className="w-full">
              <div className="flex items-center justify-center mb-10 opacity-40">
                <ArrowDown className="animate-bounce w-6 h-6 text-rose-gold" />
              </div>
              
              <div className="glass-premium rounded-4xl p-10 shadow-deep">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 rounded-2xl gradient-pearl flex items-center justify-center shadow-soft">
                    <Sparkles className="w-6 h-6 text-foreground" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground font-editorial">Feature Analysis</h2>
                    <p className="text-muted-foreground">Detailed AI measurement comparison</p>
                  </div>
                </div>

                <FeatureAnalysis originalFeatures={originalFeatures} targetFeatures={targetFeatures} />
              </div>
            </motion.div>}
        </AnimatePresence>

      </div>
    </section>;
};
export default Workspace;