import { Home, MessageSquare, Brain, Upload, TrendingUp, CloudRain, Share2, Clock } from "lucide-react";
import { useLocation } from "wouter";

export type NavSection = "map" | "chat" | "intelligence" | "files" | "timeline" | "weather" | "analytics" | "social";

interface BottomNavBarProps {
  activeSection: NavSection;
  onSectionChange: (section: NavSection) => void;
}

export function BottomNavBar({ activeSection, onSectionChange }: BottomNavBarProps) {
  const [, setLocation] = useLocation();

  const handleNavClick = (section: NavSection, route?: string) => {
    onSectionChange(section);
    if (route) {
      setLocation(route);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30" data-testid="bottom-nav-bar">
      <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md rounded-full p-2 shadow-lg">
        <NavButton
          icon={Home}
          label="Map"
          active={activeSection === "map"}
          onClick={() => handleNavClick("map", "/")}
          testId="nav-map"
        />
        <NavButton
          icon={MessageSquare}
          label="Chat"
          active={activeSection === "chat"}
          onClick={() => handleNavClick("chat", "/chat")}
          testId="nav-chat"
        />
        <NavButton
          icon={Brain}
          label="Intelligence"
          active={activeSection === "intelligence"}
          onClick={() => handleNavClick("intelligence", "/intelligence")}
          testId="nav-intelligence"
        />
        <NavButton
          icon={Upload}
          label="Files"
          active={activeSection === "files"}
          onClick={() => handleNavClick("files", "/files")}
          testId="nav-files"
        />
        
        {/* Divider */}
        <div className="w-px h-8 bg-gray-300 mx-1" />
        
        <NavButton
          icon={Clock}
          label="Timeline"
          active={activeSection === "timeline"}
          onClick={() => handleNavClick("timeline", "/timeline")}
          testId="nav-timeline"
        />
        <NavButton
          icon={CloudRain}
          label="Weather"
          active={activeSection === "weather"}
          onClick={() => handleNavClick("weather", "/weather")}
          testId="nav-weather"
        />
        <NavButton
          icon={TrendingUp}
          label="Analytics"
          active={activeSection === "analytics"}
          onClick={() => handleNavClick("analytics", "/analytics")}
          testId="nav-analytics"
        />
        <NavButton
          icon={Share2}
          label="Social"
          active={activeSection === "social"}
          onClick={() => handleNavClick("social", "/social-media")}
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
