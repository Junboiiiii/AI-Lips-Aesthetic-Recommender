import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex w-full touch-none select-none items-center group", className)}
    {...props}
  >
    {/* Glass track */}
    <SliderPrimitive.Track className="relative h-3 w-full grow overflow-hidden rounded-full bg-secondary/60 backdrop-blur-sm border border-border/30 shadow-inner">
      {/* Gradient fill */}
      <SliderPrimitive.Range className="absolute h-full gradient-rose-gold" />
    </SliderPrimitive.Track>
    
    {/* Premium thumb with glow */}
    <SliderPrimitive.Thumb className="block h-6 w-6 rounded-full bg-card border-2 border-rose-gold shadow-deep ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-110 hover:shadow-glow cursor-grab active:cursor-grabbing active:scale-95 group-hover:shadow-glow" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };