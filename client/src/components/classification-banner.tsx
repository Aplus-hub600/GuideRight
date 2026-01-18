import { cn } from "@/lib/utils";

type ClassificationLevel = "UNCLASSIFIED" | "UNCLASSIFIED_FOUO" | "SECRET" | "TOP_SECRET";

interface ClassificationBannerProps {
  level?: ClassificationLevel;
  className?: string;
}

const CLASSIFICATION_CONFIG: Record<ClassificationLevel, { label: string; bgColor: string; textColor: string }> = {
  UNCLASSIFIED: {
    label: "UNCLASSIFIED",
    bgColor: "bg-green-700",
    textColor: "text-white"
  },
  UNCLASSIFIED_FOUO: {
    label: "UNCLASSIFIED // FOUO",
    bgColor: "bg-green-700", 
    textColor: "text-white"
  },
  SECRET: {
    label: "SECRET",
    bgColor: "bg-red-700",
    textColor: "text-white"
  },
  TOP_SECRET: {
    label: "TOP SECRET",
    bgColor: "bg-orange-500",
    textColor: "text-black"
  }
};

export function ClassificationBanner({ 
  level = "UNCLASSIFIED_FOUO",
  className 
}: ClassificationBannerProps) {
  const config = CLASSIFICATION_CONFIG[level];
  
  return (
    <div 
      className={cn(
        "w-full flex-shrink-0 text-center py-1 font-bold text-xs tracking-widest uppercase",
        config.bgColor,
        config.textColor,
        className
      )}
      role="banner"
      aria-label={`Classification level: ${config.label}`}
    >
      {config.label}
    </div>
  );
}

export default ClassificationBanner;
