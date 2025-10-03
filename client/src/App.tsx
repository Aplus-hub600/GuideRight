import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider } from "./components/theme-provider";
import { Dashboard } from "./components/dashboard";
import { GlobalSearch } from "./components/global-search";
import { BottomNavBar, NavSection } from "./components/bottom-nav-bar";
import { LocationSearchBar } from "./components/location-search-bar";
import { Filter } from "lucide-react";
import { useSearchNavigation } from "./hooks/use-search-navigation";
import { useState, useEffect } from "react";
import i18n from "./lib/i18n";

interface AOI {
  name?: string;
  lat: number;
  lng: number;
  radiusKm?: number;
}

function App() {
  const { handleResultSelect } = useSearchNavigation()
  const [searchOpen, setSearchOpen] = useState(false)
  const [activePanels, setActivePanels] = useState<Set<NavSection>>(new Set(["map"]))
  const [currentAOI, setCurrentAOI] = useState<AOI>({
    name: "Dhaka",
    lat: 23.8103,
    lng: 90.4125,
    radiusKm: 5
  })

  // Keyboard shortcut for advanced search/filter (Cmd/Ctrl+K)
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

  const togglePanel = (section: NavSection) => {
    setActivePanels(prev => {
      const newPanels = new Set(prev)
      if (newPanels.has(section)) {
        newPanels.delete(section)
      } else {
        newPanels.add(section)
      }
      // Always keep at least map visible
      if (newPanels.size === 0) {
        newPanels.add("map")
      }
      return newPanels
    })
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
              <div className="absolute inset-0 z-0">
                <Dashboard 
                  activePanels={activePanels}
                  currentAOI={currentAOI}
                  onAOIChange={setCurrentAOI}
                />
              </div>

              {/* Top centered search bar with filter button */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                <LocationSearchBar 
                  onLocationSelect={handleLocationSelect}
                  currentLocation={currentAOI.name}
                />
                <button 
                  onClick={() => setSearchOpen(true)}
                  className="bg-white/80 backdrop-blur-md rounded-full px-4 py-3 text-gray-800 text-sm hover:bg-white/90 transition-all shadow-lg flex items-center gap-2"
                  data-testid="button-advanced-filter"
                  title="Advanced Filters"
                >
                  <Filter className="h-4 w-4" />
                </button>
              </div>

              {/* Bottom navigation bar */}
              <BottomNavBar 
                activePanels={activePanels}
                onTogglePanel={togglePanel}
              />

              {/* Advanced search/filter modal */}
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
