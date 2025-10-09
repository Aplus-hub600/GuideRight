import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider } from "./components/theme-provider";
import { Dashboard } from "./components/dashboard";
import { BottomNavBar, NavSection } from "./components/bottom-nav-bar";
import { LocationSearchBar } from "./components/location-search-bar";
import { AoiInfo } from "./components/aoi-info";
import { ChatPanel } from "./components/chat-panel";
import { ScreenshotFAB } from "./components/screenshot-fab";
import { useState } from "react";
import i18n from "./lib/i18n";

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
  
  const [currentAOI, setCurrentAOI] = useState<AOI>({
    name: "Dhaka",
    lat: 23.8103,
    lng: 90.4125,
    radiusKm: 5
  })

  const [mediaContextIds, setMediaContextIds] = useState<string[]>([])

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
    // Home button clears all panels
    if (section === "map") {
      setActiveTopPanel(null)
      setActiveBottomPanel(null)
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
            <div className="relative h-screen w-screen overflow-hidden bg-gray-100">
              {/* Dashboard with map and panels */}
              <div className="absolute inset-0 z-0 h-full w-full">
                <Dashboard 
                  activeTopPanel={activeTopPanel}
                  activeBottomPanel={activeBottomPanel}
                  currentAOI={currentAOI}
                  onAOIChange={setCurrentAOI}
                  onMediaContextChange={setMediaContextIds}
                />
              </div>

              {/* Top right: location panel and chat underneath */}
              <div className="absolute top-4 right-4 z-30 flex flex-col gap-3 items-end">
                {/* Location search bar with integrated advanced search and AOI info */}
                <div className="flex items-center gap-3 flex-wrap justify-end">
                  <LocationSearchBar 
                    onLocationSelect={handleLocationSelect}
                    currentLocation={currentAOI.name}
                  />
                  <AoiInfo aoi={currentAOI} />
                </div>

                {/* Chat Assistant - underneath location panel - hidden when top panels are active */}
                {!activeTopPanel && (
                  <div className="w-80 max-h-[60vh] bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 flex flex-col" id="chat-assistant-container">
                    <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                      <h2 className="text-base font-semibold text-slate-100">Chat Assistant</h2>
                      <ScreenshotFAB 
                        elementId="chat-assistant-container"
                        viewName="chat"
                        className="relative"
                      />
                    </div>
                    <div className="flex-1 overflow-hidden" data-testid="panel-chat">
                      <ChatPanel 
                        onQuerySubmit={handleQuerySubmit}
                        mediaContextIds={mediaContextIds}
                        className="h-full"
                      />
                    </div>
                  </div>
                )}
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
