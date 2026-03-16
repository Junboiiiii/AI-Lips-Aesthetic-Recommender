import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Target } from "lucide-react";

interface FeatureData {
  [key: string]: number;
}

interface FeatureAnalysisProps {
  originalFeatures: FeatureData | null;
  targetFeatures: FeatureData | null;
}

const formatValue = (value: number): string => {
  return Number(value).toFixed(2);
};

const FeatureCard = ({
  title,
  icon: Icon,
  features,
  variant,
}: {
  title: string;
  icon: React.ElementType;
  features: FeatureData;
  variant: "original" | "target";
}) => (
  <Card className="flex-1 glass-card border-border/30">
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-2 text-base">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            variant === "original" ? "bg-muted" : "gradient-rose"
          }`}
        >
          <Icon
            className={`w-4 h-4 ${
              variant === "original" ? "text-muted-foreground" : "text-primary-foreground"
            }`}
          />
        </div>
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="space-y-2">
        {Object.entries(features).map(([key, value]) => (
          <div
            key={key}
            className="flex justify-between items-center py-1.5 border-b border-border/20 last:border-0"
          >
            <span className="text-sm text-muted-foreground">{key}</span>
            <span className="text-sm font-medium text-foreground">
              {formatValue(value)}
            </span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const FeatureAnalysis = ({
  originalFeatures,
  targetFeatures,
}: FeatureAnalysisProps) => {
  if (!originalFeatures || !targetFeatures) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-6"
    >
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Feature Analysis
      </h3>
      <div className="grid md:grid-cols-2 gap-4">
        <FeatureCard
          title="Original Measurements"
          icon={Activity}
          features={originalFeatures}
          variant="original"
        />
        <FeatureCard
          title="AI Target Measurements"
          icon={Target}
          features={targetFeatures}
          variant="target"
        />
      </div>
    </motion.div>
  );
};

export default FeatureAnalysis;
