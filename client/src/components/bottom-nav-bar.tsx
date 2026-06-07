import { Home, Brain, TrendingUp, Upload, CloudRain, Clock, Settings, Share2 } from "lucide-react";
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
    <div className="flex items-center pb-3" data-testid="bottom-nav-bar">
      <div
        className="flex items-center gap-1 p-1.5 rounded-xl border"
        style={{
          background: "hsl(var(--background) / 0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderColor: "hsl(var(--border) / 0.7)",
          boxShadow: "0 4px 24px hsl(224 71% 4% / 0.6), 0 1px 0 hsl(var(--primary) / 0.04) inset",
        }}
      >
        {/* Primary Action — Map/Home */}
        <NavButton
          icon={Home}
          label="Map View"
          description="Return to map focus"
          active={activeTopPanel === null && activeBottomPanel === null}
          onClick={() => onTogglePanel("map")}
          testId="nav-map"
          variant="primary"
        />

        <Divider />

        {/* Intel Group */}
        <div className="flex items-center gap-0.5 px-1">
          <GroupLabel>Intel</GroupLabel>
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

        <Divider />

        {/* Tools Group */}
        <div className="flex items-center gap-0.5 px-1">
          <GroupLabel>Tools</GroupLabel>
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

export default BottomNavBar;

function Divider() {
  return (
    <div
      className="w-px h-7 mx-1 shrink-0"
      style={{ background: "hsl(var(--border) / 0.5)" }}
    />
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="text-[9px] uppercase tracking-widest font-bold shrink-0 mr-1 hidden sm:block"
      style={{ color: "hsl(var(--muted-foreground) / 0.45)" }}
    >
      {children}
    </span>
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
          data-testid={testId}
          className={cn(
            "rounded-lg flex items-center justify-center transition-all duration-150 hover-elevate active-elevate-2",
            isPrimary ? "w-11 h-11" : "w-9 h-9",
          )}
          style={
            active
              ? isPrimary
                ? {
                    background: "hsl(var(--primary))",
                    color: "hsl(var(--primary-foreground))",
                    boxShadow: "0 0 16px hsl(var(--primary) / 0.4)",
                  }
                : {
                    background: "hsl(var(--primary) / 0.15)",
                    color: "hsl(var(--primary))",
                    boxShadow: "0 0 10px hsl(var(--primary) / 0.2), inset 0 0 0 1px hsl(var(--primary) / 0.35)",
                  }
              : isPrimary
              ? {
                  background: "hsl(var(--secondary))",
                  color: "hsl(var(--foreground) / 0.7)",
                }
              : {
                  background: "transparent",
                  color: "hsl(var(--muted-foreground))",
                }
          }
        >
          <Icon className={cn("transition-all", isPrimary ? "w-5 h-5" : "w-4 h-4")} />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        style={{
          background: "hsl(var(--card))",
          borderColor: "hsl(var(--border))",
        }}
      >
        <div className="text-center">
          <p className="font-semibold text-xs text-foreground">{label}</p>
          <p className="text-[11px] text-muted-foreground">{description}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
