import { Home, MessageSquare, Brain, Upload, TrendingUp, CloudRain, Share2, Clock, Settings } from "lucide-react";

export type NavSection = "map" | "chat" | "intelligence" | "files" | "settings" | "timeline" | "weather" | "analytics" | "social";

interface BottomNavBarProps {
  activeTopPanel: NavSection | null;
  activeBottomPanel: NavSection | null;
  onTogglePanel: (section: NavSection) => void;
}

export function BottomNavBar({ activeTopPanel, activeBottomPanel, onTogglePanel }: BottomNavBarProps) {

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-30 pb-4" data-testid="bottom-nav-bar">
      <div className="flex items-center gap-3 bg-gradient-to-r from-blue-950/95 via-slate-900/95 to-blue-950/95 backdrop-blur-2xl rounded-full p-3 shadow-[0_0_40px_rgba(59,130,246,0.3)] border-2 border-blue-500/30">
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
        <div className="w-px h-10 bg-gradient-to-b from-transparent via-blue-400/60 to-transparent mx-1 shadow-[0_0_10px_rgba(59,130,246,0.4)]" />
        
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
        w-14 h-14 rounded-full flex items-center justify-center
        transition-all duration-300 ease-out
        ${active 
          ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-[0_0_25px_rgba(59,130,246,0.7)] border-2 border-blue-400/60 scale-110" 
          : "bg-slate-700/60 text-slate-300 hover:bg-blue-500/30 hover:text-blue-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] border-2 border-transparent hover:border-blue-500/30"
        }
      `}
      title={label}
      data-testid={testId}
    >
      <Icon className={`w-6 h-6 ${active ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : ''}`} />
    </button>
  );
}
