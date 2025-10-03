import { cn } from "@/lib/utils";

interface MapOverlayContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
}

export function MapOverlayContainer({ 
  children, 
  className,
  maxWidth = "max-w-6xl"
}: MapOverlayContainerProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 pb-28 overflow-auto">
      <div 
        className={cn(
          "w-full bg-white/70 backdrop-blur-md rounded-3xl shadow-lg",
          maxWidth,
          className
        )}
        data-testid="map-overlay-container"
      >
        {children}
      </div>
    </div>
  );
}
