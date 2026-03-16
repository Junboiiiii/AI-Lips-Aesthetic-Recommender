import { useCallback, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Image as ImageIcon, X, Camera, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  preview: string | null;
  onClear: () => void;
}

const ImageUploader = ({ onImageSelect, preview, onClear }: ImageUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files && files[0]) {
        const file = files[0];
        if (file.type.startsWith("image/")) {
          onImageSelect(file);
        }
      }
    },
    [onImageSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files[0]) {
        onImageSelect(files[0]);
      }
    },
    [onImageSelect]
  );

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true 
      });
      streamRef.current = stream;
      setIsCameraOpen(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
            onImageSelect(file);
            closeCamera();
          }
        }, "image/jpeg", 0.9);
      }
    }
  };

  // Face Alignment Guide Overlay Component
  const FaceGuideOverlay = () => (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      <svg 
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
      >
        <ellipse
          cx="50"
          cy="48"
          rx="22"
          ry="30"
          fill="none"
          stroke="white"
          strokeWidth="0.5"
          strokeDasharray="2 2"
          opacity="0.8"
        />
        <line x1="50" y1="35" x2="50" y2="61" stroke="hsl(15 50% 75%)" strokeWidth="0.3" opacity="0.8" />
        <line x1="35" y1="48" x2="65" y2="48" stroke="hsl(15 50% 75%)" strokeWidth="0.3" opacity="0.8" />
        <circle cx="50" cy="48" r="1.5" fill="none" stroke="hsl(15 50% 75%)" strokeWidth="0.3" opacity="0.8" />
      </svg>
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-card/90 text-sm font-medium glass-card px-4 py-2 rounded-full inline-block">
          Align your face within the guide
        </p>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <canvas ref={canvasRef} className="hidden" />
      
      <AnimatePresence mode="wait">
        {isCameraOpen ? (
          <motion.div
            key="camera"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-3xl overflow-hidden glass-premium bg-foreground/5"
          >
            <video
              ref={(node) => {
                videoRef.current = node;
                if (node && streamRef.current) {
                  node.srcObject = streamRef.current;
                  node.play().catch(console.error);
                }
              }}
              autoPlay
              playsInline
              muted
              className="w-full h-64 object-cover"
            />
            <FaceGuideOverlay />
            
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
              <Button
                variant="glass"
                size="sm"
                onClick={closeCamera}
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
              <Button
                variant="gradient"
                size="sm"
                onClick={capturePhoto}
              >
                <Camera className="w-4 h-4 mr-1" />
                Capture
              </Button>
            </div>
          </motion.div>
        ) : preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-3xl overflow-hidden glass-premium shadow-deep"
          >
            <img
              src={preview}
              alt="Uploaded preview"
              className="w-full h-64 object-cover"
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClear}
              className="absolute top-4 right-4 w-9 h-9 rounded-full glass-card flex items-center justify-center text-foreground btn-spring"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="uploader"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <label
              onDragEnter={handleDragIn}
              onDragLeave={handleDragOut}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`
                relative flex flex-col items-center justify-center w-full h-52 
                border-2 border-dashed rounded-3xl cursor-pointer
                transition-all duration-500 ease-out
                ${
                  isDragging
                    ? "border-rose-gold bg-rose-gold/10 scale-[1.02] shadow-glow"
                    : "border-border/60 hover:border-rose-gold/50 hover:bg-secondary/30 glass-card"
                }
              `}
            >
              <motion.div
                animate={isDragging ? { scale: 1.15, rotate: 5 } : { scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={`
                  w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-soft
                  ${isDragging ? "gradient-rose-gold" : "bg-secondary"}
                `}
              >
                {isDragging ? (
                  <ImageIcon className="w-7 h-7 text-foreground" />
                ) : (
                  <Upload className="w-7 h-7 text-muted-foreground" />
                )}
              </motion.div>
              <p className="text-sm font-medium text-foreground mb-1">
                {isDragging ? "Drop your image here" : "Drag & drop your photo"}
              </p>
              <p className="text-xs text-muted-foreground">
                or click to browse files
              </p>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileInput}
              />
            </label>
            
            {/* Camera Button */}
            <Button
              variant="glass"
              className="w-full rounded-2xl h-12"
              onClick={openCamera}
            >
              <Video className="w-4 h-4 mr-2" />
              Use Camera
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageUploader;