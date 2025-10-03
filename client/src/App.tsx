import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider } from "./components/theme-provider";
import { Dashboard } from "./components/dashboard";
import { GoogleMapPanel } from "./components/google-map-panel";
import { MapOverlayContainer } from "./components/map-overlay-container";
import { GlobalSearch } from "./components/global-search";
import { BottomNavBar, NavSection } from "./components/bottom-nav-bar";
import { Search } from "lucide-react";
import { useSearchNavigation } from "./hooks/use-search-navigation";
import { useState, useEffect } from "react";
import NotFound from "@/pages/not-found";
import Timeline from "@/pages/timeline";
import Weather from "@/pages/weather";
import SocialMedia from "@/pages/social-media";
import Analytics from "@/pages/analytics";
import i18n from "./lib/i18n";

function Router({ activePanel }: { activePanel: string }) {
  const [location] = useLocation();
  
  // Dashboard routes render their own map, others show map background + overlay
  const isDashboardRoute = ["/", "/chat", "/intelligence", "/files", "/map", "/pmesii", "/analysis", "/risk"].includes(location);
  
  return (
    <>
      {/* Map background for non-dashboard pages */}
      {!isDashboardRoute && (
        <div className="absolute inset-0 z-0">
          <GoogleMapPanel
            aoi={{ name: "Dhaka", lat: 23.8103, lng: 90.4125, radiusKm: 5 }}
            riskScore={0}
            onAOIChange={() => {}}
            onMovementPlanRequest={() => {}}
            className="h-full w-full"
          />
        </div>
      )}
      
      {/* Page content */}
      <Switch>
        {/* Dashboard routes - handle their own map and layout */}
        <Route path="/"><Dashboard activePanel={activePanel} /></Route>
        <Route path="/chat"><Dashboard activePanel={activePanel} /></Route>
        <Route path="/intelligence"><Dashboard activePanel={activePanel} /></Route>
        <Route path="/files"><Dashboard activePanel={activePanel} /></Route>
        <Route path="/map"><Dashboard activePanel={activePanel} /></Route>
        <Route path="/pmesii"><Dashboard activePanel={activePanel} /></Route>
        <Route path="/analysis"><Dashboard activePanel={activePanel} /></Route>
        <Route path="/risk"><Dashboard activePanel={activePanel} /></Route>
        
        {/* Other pages - centered overlay on map */}
        <Route path="/analytics">
          <MapOverlayContainer>
            <Analytics />
          </MapOverlayContainer>
        </Route>
        <Route path="/timeline">
          <MapOverlayContainer>
            <Timeline />
          </MapOverlayContainer>
        </Route>
        <Route path="/weather">
          <MapOverlayContainer>
            <Weather />
          </MapOverlayContainer>
        </Route>
        <Route path="/social-media">
          <MapOverlayContainer>
            <SocialMedia />
          </MapOverlayContainer>
        </Route>
        <Route>
          <MapOverlayContainer maxWidth="max-w-2xl">
            <NotFound />
          </MapOverlayContainer>
        </Route>
      </Switch>
    </>
  );
}

function App() {
  const { handleResultSelect } = useSearchNavigation()
  const [searchOpen, setSearchOpen] = useState(false)
  const [activeNav, setActiveNav] = useState<NavSection>("map")
  const [location] = useLocation()

  // Sync activeNav with current route
  useEffect(() => {
    // Page routes
    if (location === "/timeline") setActiveNav("timeline")
    else if (location === "/weather") setActiveNav("weather")
    else if (location === "/analytics") setActiveNav("analytics")
    else if (location === "/social-media") setActiveNav("social")
    // Dashboard routes
    else if (location === "/chat") setActiveNav("chat")
    else if (location === "/intelligence" || location === "/pmesii") setActiveNav("intelligence")
    else if (location === "/files") setActiveNav("files")
    else if (location === "/" || location === "/map" || location === "/analysis" || location === "/risk") setActiveNav("map")
  }, [location])

  // Keyboard shortcut for global search (Cmd/Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider>
          <TooltipProvider>
            {/* Map-centric layout: everything is absolutely positioned over the map */}
            <div className="relative h-screen w-screen overflow-hidden bg-gray-100">
              {/* Main content area */}
              <div className="absolute inset-0 z-0">
                <Router activePanel={activeNav} />
              </div>

              {/* Floating header search button - top right */}
              <div className="absolute top-4 right-4 z-20">
                <button 
                  onClick={() => setSearchOpen(true)}
                  className="bg-white/70 backdrop-blur-md rounded-full px-6 py-3 text-gray-800 text-sm hover:bg-white/90 transition-all shadow-lg flex items-center gap-2"
                  data-testid="button-global-search"
                >
                  <Search className="h-4 w-4" />
                  <span className="hidden lg:inline-flex">Search...</span>
                  <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-gray-300 bg-white/50 px-1.5 text-[10px] font-medium sm:flex">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </button>
              </div>

              {/* Bottom navigation bar */}
              <BottomNavBar 
                activeSection={activeNav} 
                onSectionChange={setActiveNav}
              />

              {/* Global search modal */}
              <GlobalSearch 
                open={searchOpen} 
                onOpenChange={setSearchOpen}
                onSelectResult={handleResultSelect}
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
