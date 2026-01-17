import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider } from "./components/theme-provider";
import { BottomNavBar, NavSection } from "./components/bottom-nav-bar";
import { LocationSearchBar } from "./components/location-search-bar";
import { SystemStatusBanner } from "./components/system-status-banner";
import { SystemStatusProvider } from "./lib/system-status";
import { useState } from "react";
import i18n from "./lib/i18n";
import { Map } from "lucide-react";
import { cn } from "@/lib/utils";
import { MapLibrePanel } from "./components/maplibre-panel";
import { IntelligencePanel } from "./components/intelligence-panel";
import type { MapLens } from "./components/map-lens-selector";

interface AOI {
  name?: string;
  lat: number;
  lng: number;
  radiusKm?: number;
}

function App() {
  const [activeTopPanel, setActiveTopPanel] = useState<NavSection | null>(null)
  const [activeBottomPanel, setActiveBottomPanel] = useState<NavSection | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [mobileView, setMobileView] = useState<"map" | "intel">("map")
  const [activeLens, setActiveLens] = useState<MapLens>("infrastructure")
  
  const [currentAOI, setCurrentAOI] = useState<AOI>({
    name: "Dhaka",
    lat: 23.8103,
    lng: 90.4125,
    radiusKm: 5
  })

  const [mediaContextIds, setMediaContextIds] = useState<string[]>([])

  const handleQuerySubmit = (query: string, contextIds?: string[]) => {
  }

  const topPanels: NavSection[] = ["intelligence", "analytics", "social"]
  const bottomPanels: NavSection[] = ["timeline", "weather", "files", "settings"]

  const closeActivePanel = () => {
    setActiveTopPanel(null)
    setActiveBottomPanel(null)
  }

  const togglePanel = (section: NavSection) => {
    if (section === "map") {
      setActiveTopPanel(null)
      setActiveBottomPanel(null)
      setIsChatOpen(false)
      return
    }

    if (section === "chat") {
      setIsChatOpen(prev => !prev)
      return
    }

    if (topPanels.includes(section)) {
      setActiveTopPanel(prev => prev === section ? null : section)
    }
    
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
          <SystemStatusProvider>
            <TooltipProvider>
              <SystemStatusBanner />
              
              <div className="h-screen w-screen bg-background flex flex-col overflow-hidden">
                {/* Main Content Area - Fixed 60/40 Split */}
                <div className="flex-1 flex overflow-hidden">
                  {/* Left: Map Panel (60%) */}
                  <div 
                    className={cn(
                      "h-full relative",
                      "w-full md:w-[60%] md:flex-shrink-0",
                      mobileView === "intel" ? "hidden md:block" : "block"
                    )}
                  >
                    {/* Location Search Bar */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 w-full max-w-md px-4">
                      <LocationSearchBar 
                        onLocationSelect={handleLocationSelect}
                        currentLocation={currentAOI.name}
                      />
                    </div>
                    
                    <MapLibrePanel
                      aoi={currentAOI}
                      onAOIChange={setCurrentAOI}
                      activeLens={activeLens}
                      hideLensSelector={true}
                      className="h-full w-full"
                    />
                  </div>
                  
                  {/* Right: Intelligence Panel (40%) */}
                  <div 
                    className={cn(
                      "h-full border-l bg-background overflow-hidden",
                      "w-full md:w-[40%] md:flex-shrink-0",
                      mobileView === "map" ? "hidden md:block" : "block"
                    )}
                  >
                    <IntelligencePanel
                      currentAOI={currentAOI}
                      activeTopPanel={activeTopPanel}
                      activeBottomPanel={activeBottomPanel}
                      onClosePanel={closeActivePanel}
                      onMediaContextChange={setMediaContextIds}
                      activeLens={activeLens}
                      onLensChange={setActiveLens}
                      isChatOpen={isChatOpen}
                      onToggleChat={() => setIsChatOpen(!isChatOpen)}
                      onQuerySubmit={handleQuerySubmit}
                      mediaContextIds={mediaContextIds}
                      className="h-full"
                    />
                  </div>
                </div>
                
                {/* Mobile View Toggle */}
                <div className="md:hidden fixed top-3 right-3 z-30">
                  <button
                    onClick={() => setMobileView(mobileView === "map" ? "intel" : "map")}
                    className="flex items-center gap-2 px-3 py-2 bg-background/95 backdrop-blur border rounded-lg shadow-sm"
                  >
                    {mobileView === "map" ? (
                      <span className="text-sm font-medium">Intel</span>
                    ) : (
                      <>
                        <Map className="h-4 w-4" />
                        <span className="text-sm font-medium">Map</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Bottom Navigation Bar */}
                <div className="h-12 flex-shrink-0 border-t bg-background flex items-center justify-center px-4">
                  <BottomNavBar 
                    activeTopPanel={activeTopPanel}
                    activeBottomPanel={activeBottomPanel}
                    onTogglePanel={togglePanel}
                  />
                </div>
              </div>

              <Toaster />
            </TooltipProvider>
          </SystemStatusProvider>
        </ThemeProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
}

export default App;
