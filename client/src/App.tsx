import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider } from "./components/theme-provider";
import { BottomNavBar, NavSection } from "./components/bottom-nav-bar";
import { UnifiedSearchBar, ParsedQuery } from "./components/unified-search-bar";
import { SystemStatusBanner } from "./components/system-status-banner";
import { SystemStatusProvider } from "./lib/system-status";
import { useState, useCallback } from "react";
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
  const [activeSearchFilters, setActiveSearchFilters] = useState<ParsedQuery | null>(null)

  const handleQuerySubmit = (query: string, contextIds?: string[]) => {
  }

  const handleSearchQuery = useCallback((parsed: ParsedQuery) => {
    // Update location if parsed
    if (parsed.location) {
      setCurrentAOI({
        name: parsed.location.name,
        lat: parsed.location.lat,
        lng: parsed.location.lng,
        radiusKm: 5
      });
    }
    
    // Update lens based on infrastructure focus
    if (parsed.infrastructure?.length) {
      const infraFocus = parsed.infrastructure[0];
      if (["hospitals", "power", "rail", "water", "airports", "ports", "roads", "bridges"].includes(infraFocus)) {
        setActiveLens("infrastructure");
      }
    }
    
    // Update lens based on event type
    if (parsed.events?.length) {
      setActiveLens("risk-stress");
    }
    
    // Store active filters for display
    setActiveSearchFilters(parsed);
  }, []);

  const clearSearchFilters = useCallback(() => {
    // Reset filters
    setActiveSearchFilters(null);
    // Reset to default AOI (Dhaka)
    setCurrentAOI({
      name: "Dhaka",
      lat: 23.8103,
      lng: 90.4125,
      radiusKm: 5
    });
    // Reset to default lens
    setActiveLens("infrastructure");
  }, []);

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
                {/* Main Content - Two Column Layout */}
                <div className="flex-1 flex min-h-0">
                  
                  {/* LEFT COLUMN: Map Container (60%) */}
                  <div 
                    className={cn(
                      "flex flex-col min-h-0",
                      "w-full md:w-[60%] md:flex-shrink-0",
                      mobileView === "intel" ? "hidden md:flex" : "flex"
                    )}
                  >
                    {/* Map Header - Compact, docked, solid background */}
                    <div className="flex-shrink-0 bg-background border-b p-2">
                      <div className="flex items-center gap-2">
                        {/* Unified Search Bar - handles location, time, events, infrastructure */}
                        <div className="flex-1 min-w-0">
                          <UnifiedSearchBar 
                            onQueryParsed={handleSearchQuery}
                            currentLocation={currentAOI.name}
                            activeFilters={activeSearchFilters || undefined}
                            onClearFilters={clearSearchFilters}
                          />
                        </div>
                        {/* Mobile toggle */}
                        <button
                          onClick={() => setMobileView("intel")}
                          className="md:hidden flex-shrink-0 px-3 py-2 text-xs font-medium bg-muted rounded-md hover-elevate"
                        >
                          Intel
                        </button>
                      </div>
                    </div>
                    
                    {/* Map Canvas - fills remaining space */}
                    <div className="flex-1 min-h-0 relative">
                      <MapLibrePanel
                        aoi={currentAOI}
                        onAOIChange={setCurrentAOI}
                        activeLens={activeLens}
                        hideLensSelector={true}
                        className="h-full w-full"
                      />
                      
                      {/* Bottom Navigation Bar - Centered on map */}
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10">
                        <BottomNavBar 
                          activeTopPanel={activeTopPanel}
                          activeBottomPanel={activeBottomPanel}
                          onTogglePanel={togglePanel}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* RIGHT COLUMN: Intelligence Panel (40%) - Full height, docked */}
                  <div 
                    className={cn(
                      "flex flex-col min-h-0 border-l bg-background",
                      "w-full md:w-[40%] md:flex-shrink-0",
                      mobileView === "map" ? "hidden md:flex" : "flex"
                    )}
                  >
                    {/* Mobile: Back to Map button */}
                    <div className="md:hidden flex-shrink-0 p-2 border-b bg-muted/30">
                      <button
                        onClick={() => setMobileView("map")}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-background border rounded-md hover-elevate w-full justify-center"
                      >
                        <Map className="h-4 w-4" />
                        Back to Map
                      </button>
                    </div>
                    
                    {/* Intelligence Panel - fills column */}
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
                      activeSearchFilters={activeSearchFilters || undefined}
                      className="flex-1 min-h-0"
                    />
                  </div>
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
