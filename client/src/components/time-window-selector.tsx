import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, TrendingUp, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScenario, type TimeWindowId } from "@/context/scenario-context";

const windowIcons = {
  baseline: Calendar,
  focused: AlertTriangle,
  recent: Clock,
};

const windowColors = {
  baseline: {
    active: "border-blue-500 bg-gradient-to-br from-blue-900/50 to-blue-950/50 text-blue-200 shadow-blue-500/20 shadow-md",
    inactive: "text-blue-400/70 hover:bg-blue-900/20",
    icon: "text-blue-400",
    glow: "ring-2 ring-blue-500/30"
  },
  focused: {
    active: "border-orange-500 bg-gradient-to-br from-orange-900/50 to-orange-950/50 text-orange-200 shadow-orange-500/20 shadow-md",
    inactive: "text-orange-400/70 hover:bg-orange-900/20",
    icon: "text-orange-400",
    glow: "ring-2 ring-orange-500/30"
  },
  recent: {
    active: "border-green-500 bg-gradient-to-br from-green-900/50 to-green-950/50 text-green-200 shadow-green-500/20 shadow-md",
    inactive: "text-green-400/70 hover:bg-green-900/20",
    icon: "text-green-400",
    glow: "ring-2 ring-green-500/30"
  },
};

export function TimeWindowSelector({ className }: { className?: string }) {
  const { currentScenario, activeTimeWindow, setActiveTimeWindow, getActiveTimeWindowLabel } = useScenario();
  
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wide">Time Window</span>
        </div>
        <Badge variant="outline" className="text-[10px]">
          {currentScenario.name}
        </Badge>
      </div>
      
      <div className="flex gap-2">
        {currentScenario.timeWindows.map((window) => {
          const Icon = windowIcons[window.id as keyof typeof windowIcons] || Clock;
          const colors = windowColors[window.id as keyof typeof windowColors];
          const isActive = activeTimeWindow === window.id;
          
          return (
            <button
              key={window.id}
              className={cn(
                "flex-1 py-2.5 px-2 flex flex-col items-center gap-1.5 rounded-lg border transition-all duration-200",
                isActive 
                  ? cn("border-2", colors?.active, colors?.glow)
                  : cn("border-transparent", colors?.inactive)
              )}
              onClick={() => setActiveTimeWindow(window.id as TimeWindowId)}
            >
              <Icon className={cn("h-4 w-4 transition-transform duration-200", isActive && "scale-110", colors?.icon)} />
              <span className="text-[11px] font-semibold">{window.label}</span>
              {isActive && (
                <div className="w-6 h-0.5 rounded-full bg-current animate-in fade-in duration-300" />
              )}
            </button>
          );
        })}
      </div>
      
      <p className="text-[10px] text-muted-foreground text-center">
        {currentScenario.timeWindows.find(w => w.id === activeTimeWindow)?.description}
      </p>
    </div>
  );
}

export function TimeWindowCompact({ className }: { className?: string }) {
  const { currentScenario, activeTimeWindow, setActiveTimeWindow } = useScenario();
  
  return (
    <div className={cn("flex items-center gap-1 p-0.5 rounded-lg bg-muted/50", className)}>
      {currentScenario.timeWindows.map((window) => {
        const colors = windowColors[window.id as keyof typeof windowColors];
        const isActive = activeTimeWindow === window.id;
        
        return (
          <button
            key={window.id}
            className={cn(
              "px-2.5 py-1 text-[10px] font-medium rounded-md transition-all duration-200",
              isActive 
                ? cn("bg-gradient-to-r shadow-sm", colors?.active)
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
            onClick={() => setActiveTimeWindow(window.id as TimeWindowId)}
          >
            {window.label}
          </button>
        );
      })}
    </div>
  );
}
