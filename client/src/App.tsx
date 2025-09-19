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
import { ThemeToggle } from "./components/theme-toggle";
import NotFound from "@/pages/not-found";
import i18n from "./lib/i18n";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/chat" component={Dashboard} />
      <Route path="/intelligence" component={Dashboard} />
      <Route path="/analytics" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
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
                  <header className="flex items-center justify-between p-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <SidebarTrigger data-testid="button-sidebar-toggle" />
                    <div className="flex items-center gap-2">
                      <ThemeToggle />
                    </div>
                  </header>
                  <main className="flex-1 overflow-hidden">
                    <Router />
                  </main>
                </div>
              </div>
              <Toaster />
            </SidebarProvider>
          </TooltipProvider>
        </ThemeProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
}

export default App;
