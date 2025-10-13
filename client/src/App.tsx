import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider } from "./components/theme-provider";
import { Dashboard } from "./components/dashboard";
import { BottomNavBar, NavSection } from "./components/bottom-nav-bar";
import { LocationSearchBar } from "./components/location-search-bar";
import { ChatPanel } from "./components/chat-panel";
import { ScreenshotFAB } from "./components/screenshot-fab";
import { useState } from "react";
import i18n from "./lib/i18n";
import { ChevronDown, ChevronUp, MessageSquare } from "lucide-react";

interface AOI {
  name?: string;
  lat: number;
  lng: number;
  radiusKm?: number;
}

function App() {
  // Top panels (right side of nav): intelligence, analytics, social - only one at a time
  // Note: chat is now permanently visible on the left, not part of the panel toggle system
  const [activeTopPanel, setActiveTopPanel] = useState<NavSection | null>(null)
  
  // Bottom panels (left side of nav): timeline, weather, files, settings - only one at a time  
  const [activeBottomPanel, setActiveBottomPanel] = useState<NavSection | null>(null)
  
  // Chat panel collapse state
  const [isChatMinimized, setIsChatMinimized] = useState(false)
  
  const [currentAOI, setCurrentAOI] = useState<AOI>({
    name: "Dhaka",
    lat: 23.8103,
    lng: 90.4125,
    radiusKm: 5
  })

  const [mediaContextIds, setMediaContextIds] = useState<string[]>([])
  const [selectedODINCountry, setSelectedODINCountry] = useState<string | undefined>(undefined)

  const handleQuerySubmit = (query: string, contextIds?: string[]) => {
    // Query submitted with context
  }

  // Define panel groups
  // Top panels (right side of nav): intelligence, analytics, social - displayed in top container
  // Note: chat is now a permanent left sidebar, not a toggleable panel
  const topPanels: NavSection[] = ["intelligence", "analytics", "social"]
  // Bottom panels (left side of nav): timeline, weather, files, settings - displayed in bottom container
  const bottomPanels: NavSection[] = ["timeline", "weather", "files", "settings"]

  const togglePanel = (section: NavSection) => {
    // Home button clears all panels and minimizes chat
    if (section === "map") {
      setActiveTopPanel(null)
      setActiveBottomPanel(null)
      setIsChatMinimized(true)
      return
    }

    // Top panels - only one active at a time, toggle off if clicking same one
    if (topPanels.includes(section)) {
      setActiveTopPanel(prev => prev === section ? null : section)
    }
    
    // Bottom panels - only one active at a time, toggle off if clicking same one  
    if (bottomPanels.includes(section)) {
      setActiveBottomPanel(prev => prev === section ? null : section)
    }
  }

  const handleLocationSelect = (location: { name: string; lat: number; lng: number }) => {
    setCurrentAOI({
      name: location.name,
      lat: location.lat,
      lng: location.lng,
      radiusKm: 5
    })
  }

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider>
          <TooltipProvider>
            {/* Map-centric layout: everything is absolutely positioned over the map */}
            <div className="relative h-screen w-screen overflow-hidden bg-background">
              {/* Dashboard with map and panels */}
              <div className="absolute inset-0 z-0 h-full w-full">
                <Dashboard 
                  activeTopPanel={activeTopPanel}
                  activeBottomPanel={activeBottomPanel}
                  currentAOI={currentAOI}
                  onAOIChange={setCurrentAOI}
                  onMediaContextChange={setMediaContextIds}
                  selectedODINCountry={selectedODINCountry}
                  onODINCountryChange={setSelectedODINCountry}
                />
              </div>

              {/* Top center: location search bar */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30">
                <LocationSearchBar 
                  onLocationSelect={handleLocationSelect}
                  currentLocation={currentAOI.name}
                />
              </div>

              {/* Left side: chat assistant - always visible */}
              <div className={`absolute bottom-20 left-4 z-30 transition-all duration-300 ${isChatMinimized ? 'w-72' : 'w-80'}`}>
                <div 
                  className="bg-card/95 backdrop-blur-xl rounded-xl border flex flex-col transition-all duration-300 shadow-lg" 
                  id="chat-assistant-container"
                  style={{ height: isChatMinimized ? '56px' : 'calc(100vh - 140px)', maxHeight: isChatMinimized ? '56px' : 'calc(100vh - 140px)' }}
                >
                  <div className="p-3 border-b flex items-center justify-between shrink-0">
                    <h2 className="text-sm font-semibold flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Chat Assistant
                    </h2>
                    <div className="flex items-center gap-2">
                      {!isChatMinimized && (
                        <ScreenshotFAB 
                          elementId="chat-assistant-container"
                          viewName="chat"
                          className="relative"
                        />
                      )}
                      <button
                        onClick={() => setIsChatMinimized(!isChatMinimized)}
                        className="p-1.5 rounded hover-elevate active-elevate-2"
                        data-testid="button-toggle-chat"
                      >
                        {isChatMinimized ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  {!isChatMinimized && (
                    <div className="flex-1 overflow-hidden" data-testid="panel-chat">
                      <ChatPanel 
                        onQuerySubmit={handleQuerySubmit}
                        mediaContextIds={mediaContextIds}
                        odinCountry={selectedODINCountry}
                        className="h-full"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom navigation bar */}
              <BottomNavBar 
                activeTopPanel={activeTopPanel}
                activeBottomPanel={activeBottomPanel}
                onTogglePanel={togglePanel}
              />

              {/* Toast notifications */}
              <Toaster />
            </div>
          </TooltipProvider>
        </ThemeProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
}

export default App;
