import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, TrendingUp, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScenario } from "@/context/scenario-context";

const windowIcons = {
  baseline: Calendar,
  focused: AlertTriangle,
  recent: Clock,
};

const windowColors = {
  baseline: "border-blue-600 bg-blue-900/30",
  focused: "border-orange-600 bg-orange-900/30",
  recent: "border-green-600 bg-green-900/30",
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
      
      <div className="flex gap-1">
        {currentScenario.timeWindows.map((window) => {
          const Icon = windowIcons[window.id as keyof typeof windowIcons] || Clock;
          const isActive = activeTimeWindow === window.id;
          
          return (
            <Button
              key={window.id}
              variant={isActive ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "flex-1 h-auto py-2 flex flex-col items-center gap-1",
                isActive && "border-2 " + (windowColors[window.id as keyof typeof windowColors] || "")
              )}
              onClick={() => setActiveTimeWindow(window.id)}
            >
              <Icon className="h-3 w-3" />
              <span className="text-[10px] font-medium">{window.label}</span>
            </Button>
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
    <div className={cn("flex items-center gap-1", className)}>
      {currentScenario.timeWindows.map((window) => {
        const isActive = activeTimeWindow === window.id;
        
        return (
          <Button
            key={window.id}
            variant={isActive ? "secondary" : "ghost"}
            size="sm"
            className="h-6 px-2 text-[10px]"
            onClick={() => setActiveTimeWindow(window.id)}
          >
            {window.label}
          </Button>
        );
      })}
    </div>
  );
}
