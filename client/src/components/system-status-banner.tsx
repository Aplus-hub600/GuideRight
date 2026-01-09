import { useSystemStatus, type SystemMode } from "@/lib/system-status";
import { AlertTriangle, CheckCircle, RefreshCw, WifiOff, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusConfig {
  icon: typeof AlertTriangle;
  bgClass: string;
  textClass: string;
  borderClass: string;
}

const statusConfigs: Record<SystemMode, StatusConfig> = {
  live: {
    icon: CheckCircle,
    bgClass: "bg-green-950/80",
    textClass: "text-green-200",
    borderClass: "border-green-800",
  },
  updating: {
    icon: RefreshCw,
    bgClass: "bg-blue-950/80",
    textClass: "text-blue-200",
    borderClass: "border-blue-800",
  },
  degraded: {
    icon: AlertTriangle,
    bgClass: "bg-amber-950/90",
    textClass: "text-amber-200",
    borderClass: "border-amber-700",
  },
  offline: {
    icon: WifiOff,
    bgClass: "bg-red-950/90",
    textClass: "text-red-200",
    borderClass: "border-red-700",
  },
};

const modeLabels: Record<SystemMode, string> = {
  live: "LIVE",
  updating: "UPDATING",
  degraded: "DEGRADED MODE",
  offline: "OFFLINE",
};

export function SystemStatusBanner() {
  const { status } = useSystemStatus();
  
  // Only show banner for non-live states, or show a minimal indicator for live
  if (status.mode === "live") {
    return null; // Don't show banner when everything is working
  }
  
  const config = statusConfigs[status.mode];
  const Icon = config.icon;
  
  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "flex items-center justify-center gap-3 px-4 py-2",
        "border-b backdrop-blur-sm",
        "transition-all duration-150",
        config.bgClass,
        config.textClass,
        config.borderClass
      )}
    >
      <Icon 
        className={cn(
          "h-4 w-4 flex-shrink-0",
          status.mode === "updating" && "animate-spin"
        )} 
      />
      
      <div className="flex items-center gap-3 text-sm font-medium">
        <span className="font-bold uppercase tracking-wide">
          {modeLabels[status.mode]}
        </span>
        
        <span className="opacity-80">
          {status.message}
        </span>
        
        {status.cachedDataAge !== null && status.cachedDataAge > 0 && (
          <span className="flex items-center gap-1 opacity-70 text-xs">
            <Clock className="h-3 w-3" />
            Cached data: {status.cachedDataAge}m ago
          </span>
        )}
        
        {status.confidenceDecay > 0 && (
          <span className="opacity-70 text-xs">
            Confidence reduced by {Math.round(status.confidenceDecay * 100)}%
          </span>
        )}
      </div>
      
      {status.errorCode && (
        <span className="text-xs opacity-60 font-mono">
          [{status.errorCode}]
        </span>
      )}
    </div>
  );
}

// Compact inline status indicator for use in panels
export function SystemStatusIndicator({ className }: { className?: string }) {
  const { status } = useSystemStatus();
  
  const config = statusConfigs[status.mode];
  const Icon = config.icon;
  
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium",
        config.bgClass,
        config.textClass,
        className
      )}
    >
      <Icon 
        className={cn(
          "h-3 w-3",
          status.mode === "updating" && "animate-spin"
        )} 
      />
      <span className="uppercase tracking-wide">
        {modeLabels[status.mode]}
      </span>
    </div>
  );
}
