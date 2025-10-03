import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider } from "./components/theme-provider";
import { AppSidebar } from "./components/app-sidebar";
import { Dashboard } from "./components/dashboard";
import { GlobalSearch } from "./components/global-search";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useSearchNavigation } from "./hooks/use-search-navigation";
import { useState, useEffect } from "react";
import NotFound from "@/pages/not-found";
import Timeline from "@/pages/timeline";
import Weather from "@/pages/weather";
import SocialMedia from "@/pages/social-media";
import Analytics from "@/pages/analytics";
import i18n from "./lib/i18n";

function Router() {
  return (
    <Switch>
      <Route path="/"><Dashboard /></Route>
      <Route path="/chat"><Dashboard /></Route>
      <Route path="/intelligence"><Dashboard /></Route>
      <Route path="/analytics"><Analytics /></Route>
      <Route path="/map"><Dashboard /></Route>
      <Route path="/pmesii"><Dashboard /></Route>
      <Route path="/analysis"><Dashboard /></Route>
      <Route path="/risk"><Dashboard /></Route>
      <Route path="/timeline"><Timeline /></Route>
      <Route path="/weather"><Weather /></Route>
      <Route path="/social-media"><SocialMedia /></Route>
      <Route><NotFound /></Route>
    </Switch>
  );
}

function App() {
  const { handleResultSelect } = useSearchNavigation()
  const [searchOpen, setSearchOpen] = useState(false)

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

  // Custom sidebar width for tactical interface
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider>
          <TooltipProvider>
            <SidebarProvider style={style as React.CSSProperties}>
              <div className="flex h-screen w-full">
                <AppSidebar />
                <div className="flex flex-col flex-1">
                  <header className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
                    <SidebarTrigger data-testid="button-sidebar-toggle" />
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setSearchOpen(true)}
                        className="bg-gray-200 rounded-3xl px-4 py-2 text-gray-800 text-sm hover:bg-gray-300 transition-colors flex items-center gap-2"
                        data-testid="button-global-search"
                      >
                        <Search className="h-4 w-4" />
                        <span className="hidden lg:inline-flex">Search...</span>
                        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-gray-300 bg-gray-100 px-1.5 text-[10px] font-medium sm:flex">
                          <span className="text-xs">⌘</span>K
                        </kbd>
                      </button>
                    </div>
                  </header>
                  <main className="flex-1 overflow-hidden">
                    <Router />
                  </main>
                </div>
              </div>
              <GlobalSearch 
                open={searchOpen} 
                onOpenChange={setSearchOpen}
                onSelectResult={handleResultSelect}
              />
              <Toaster />
            </SidebarProvider>
          </TooltipProvider>
        </ThemeProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
}

export default App;
