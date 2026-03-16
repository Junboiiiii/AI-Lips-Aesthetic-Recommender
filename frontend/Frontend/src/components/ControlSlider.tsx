import { Slider } from "@/components/ui/slider";

interface ControlSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

const ControlSlider = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
}: ControlSliderProps) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <label className="text-sm font-medium text-foreground tracking-wide">{label}</label>
        <span className="text-sm font-semibold text-foreground gradient-rose-gold px-3 py-1 rounded-full shadow-soft">
          {value}%
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
    </div>
  );
};

export default ControlSlider;