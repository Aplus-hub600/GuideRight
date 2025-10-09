import { Home, MessageSquare, Brain, Upload, TrendingUp, CloudRain, Share2, Clock, Settings } from "lucide-react";

export type NavSection = "map" | "chat" | "intelligence" | "files" | "settings" | "timeline" | "weather" | "analytics" | "social";

interface BottomNavBarProps {
  activeTopPanel: NavSection | null;
  activeBottomPanel: NavSection | null;
  onTogglePanel: (section: NavSection) => void;
}

export function BottomNavBar({ activeTopPanel, activeBottomPanel, onTogglePanel }: BottomNavBarProps) {

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-30" data-testid="bottom-nav-bar">
      <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md rounded-full p-2 shadow-lg">
        {/* Home button - clears all panels */}
        <NavButton
          icon={Home}
          label="Map"
          active={activeTopPanel === null && activeBottomPanel === null}
          onClick={() => onTogglePanel("map")}
          testId="nav-map"
        />
        
        {/* Left group - bottom panels (timeline, weather, files, settings) */}
        <NavButton
          icon={Clock}
          label="Timeline"
          active={activeBottomPanel === "timeline"}
          onClick={() => onTogglePanel("timeline")}
          testId="nav-timeline"
        />
        <NavButton
          icon={CloudRain}
          label="Weather"
          active={activeBottomPanel === "weather"}
          onClick={() => onTogglePanel("weather")}
          testId="nav-weather"
        />
        <NavButton
          icon={Upload}
          label="Files"
          active={activeBottomPanel === "files"}
          onClick={() => onTogglePanel("files")}
          testId="nav-files"
        />
        <NavButton
          icon={Settings}
          label="Export"
          active={activeBottomPanel === "settings"}
          onClick={() => onTogglePanel("settings")}
          testId="nav-export"
        />
        
        {/* Divider */}
        <div className="w-px h-8 bg-gray-300 mx-1" />
        
        {/* Right group - top panels (chat, intelligence, analytics, social) */}
        {/* Chat is now a permanent left sidebar, removed from navigation */}
        <NavButton
          icon={Brain}
          label="Intelligence"
          active={activeTopPanel === "intelligence"}
          onClick={() => onTogglePanel("intelligence")}
          testId="nav-intelligence"
        />
        <NavButton
          icon={TrendingUp}
          label="Analytics"
          active={activeTopPanel === "analytics"}
          onClick={() => onTogglePanel("analytics")}
          testId="nav-analytics"
        />
        <NavButton
          icon={Share2}
          label="Social"
          active={activeTopPanel === "social"}
          onClick={() => onTogglePanel("social")}
          testId="nav-social"
        />
      </div>
    </div>
  );
}

interface NavButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
  testId: string;
}

function NavButton({ icon: Icon, label, active, onClick, testId }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-12 h-12 rounded-full flex items-center justify-center
        transition-all duration-200
        ${active 
          ? "bg-blue-600 text-white shadow-md" 
          : "bg-white/60 text-gray-600 hover:bg-white/90"
        }
      `}
      title={label}
      data-testid={testId}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}
