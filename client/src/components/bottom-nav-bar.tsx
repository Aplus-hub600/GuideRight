import { Home, MessageSquare, Brain, Upload, Settings, Map } from "lucide-react";
import { useState } from "react";

export type NavSection = "map" | "chat" | "intelligence" | "files" | "settings";

interface BottomNavBarProps {
  activeSection: NavSection;
  onSectionChange: (section: NavSection) => void;
}

export function BottomNavBar({ activeSection, onSectionChange }: BottomNavBarProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30" data-testid="bottom-nav-bar">
      <div className="flex items-center gap-2 bg-white/70 backdrop-blur-md rounded-full p-2 shadow-lg">
        <NavButton
          icon={Map}
          label="Map"
          active={activeSection === "map"}
          onClick={() => onSectionChange("map")}
          testId="nav-map"
        />
        <NavButton
          icon={MessageSquare}
          label="Chat"
          active={activeSection === "chat"}
          onClick={() => onSectionChange("chat")}
          testId="nav-chat"
        />
        <NavButton
          icon={Brain}
          label="Intelligence"
          active={activeSection === "intelligence"}
          onClick={() => onSectionChange("intelligence")}
          testId="nav-intelligence"
        />
        <NavButton
          icon={Upload}
          label="Files"
          active={activeSection === "files"}
          onClick={() => onSectionChange("files")}
          testId="nav-files"
        />
        <NavButton
          icon={Settings}
          label="Settings"
          active={activeSection === "settings"}
          onClick={() => onSectionChange("settings")}
          testId="nav-settings"
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
          : "bg-white/50 text-gray-600 hover:bg-white/80"
        }
      `}
      title={label}
      data-testid={testId}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}
