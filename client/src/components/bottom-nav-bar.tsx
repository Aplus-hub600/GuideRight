import { Home, Brain, TrendingUp, Upload, CloudRain, Clock, Settings, Share2, Layers, Target } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type NavSection = "map" | "chat" | "intelligence" | "files" | "settings" | "timeline" | "weather" | "analytics" | "social";

interface BottomNavBarProps {
  activeTopPanel: NavSection | null;
  activeBottomPanel: NavSection | null;
  onTogglePanel: (section: NavSection) => void;
}

export function BottomNavBar({ activeTopPanel, activeBottomPanel, onTogglePanel }: BottomNavBarProps) {
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-30 pb-4" data-testid="bottom-nav-bar">
      <div className="flex items-center gap-1 bg-slate-900/95 backdrop-blur-xl rounded-2xl p-2 shadow-2xl border border-slate-700/50">
        
        {/* Primary Action - Map/Home */}
        <NavButton
          icon={Home}
          label="Map View"
          description="Return to map focus"
          active={activeTopPanel === null && activeBottomPanel === null}
          onClick={() => onTogglePanel("map")}
          testId="nav-map"
          variant="primary"
        />
        
        {/* Divider */}
        <div className="w-px h-8 bg-slate-700/50 mx-1" />
        
        {/* Mission Tools Group */}
        <div className="flex items-center gap-1 px-1">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mr-1 hidden sm:block">Intel</span>
          <NavButton
            icon={Brain}
            label="Intelligence"
            description="PMESII analysis & risk assessment"
            active={activeTopPanel === "intelligence"}
            onClick={() => onTogglePanel("intelligence")}
            testId="nav-intelligence"
          />
          <NavButton
            icon={TrendingUp}
            label="Analytics"
            description="Data trends & patterns"
            active={activeTopPanel === "analytics"}
            onClick={() => onTogglePanel("analytics")}
            testId="nav-analytics"
          />
          <NavButton
            icon={Share2}
            label="Social"
            description="Social media monitoring"
            active={activeTopPanel === "social"}
            onClick={() => onTogglePanel("social")}
            testId="nav-social"
          />
        </div>
        
        {/* Divider */}
        <div className="w-px h-8 bg-slate-700/50 mx-1" />
        
        {/* Utility Tools Group */}
        <div className="flex items-center gap-1 px-1">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mr-1 hidden sm:block">Tools</span>
          <NavButton
            icon={Clock}
            label="Timeline"
            description="Event chronology"
            active={activeBottomPanel === "timeline"}
            onClick={() => onTogglePanel("timeline")}
            testId="nav-timeline"
          />
          <NavButton
            icon={CloudRain}
            label="Weather"
            description="Environmental conditions"
            active={activeBottomPanel === "weather"}
            onClick={() => onTogglePanel("weather")}
            testId="nav-weather"
          />
          <NavButton
            icon={Upload}
            label="Files"
            description="Upload & analyze media"
            active={activeBottomPanel === "files"}
            onClick={() => onTogglePanel("files")}
            testId="nav-files"
          />
          <NavButton
            icon={Settings}
            label="Export"
            description="Export & settings"
            active={activeBottomPanel === "settings"}
            onClick={() => onTogglePanel("settings")}
            testId="nav-export"
          />
        </div>
      </div>
    </div>
  );
}

interface NavButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
  testId: string;
  variant?: "primary" | "default";
}

function NavButton({ icon: Icon, label, description, active, onClick, testId, variant = "default" }: NavButtonProps) {
  const isPrimary = variant === "primary";
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={cn(
            "rounded-xl flex items-center justify-center transition-all duration-200",
            isPrimary ? "w-12 h-12" : "w-10 h-10",
            active 
              ? isPrimary
                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                : "bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/50"
              : isPrimary
                ? "bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white"
                : "text-slate-400 hover:bg-slate-700/50 hover:text-slate-200"
          )}
          data-testid={testId}
        >
          <Icon className={cn("transition-all", isPrimary ? "w-5 h-5" : "w-4 h-4")} />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="bg-slate-800 border-slate-700">
        <div className="text-center">
          <p className="font-medium text-sm">{label}</p>
          <p className="text-xs text-slate-400">{description}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
