import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Building2, 
  Users, 
  AlertTriangle, 
  Truck,
  TrendingUp,
  Share2,
  BarChart3,
  Clock,
  CloudRain,
  Upload,
  Settings,
  X,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  MapPin,
  Zap,
  Filter,
  Download,
  Shield,
  WifiOff
} from "lucide-react"
import { cn } from "@/lib/utils"
import { MapContextPanel } from "./map-context-panel"
import { IntelligenceIntegration } from "./intelligence-integration"
import { PMESIIBriefing } from "./pmesii-briefing"
import { RiskAssessment } from "./risk-assessment"
import { SocialMediaPanel } from "./social-media-panel"
import { WeatherPanel } from "./weather-panel"
import { FileDrop } from "./file-drop"
import { ExportPanel } from "./export-panel"
import { ChatPanel } from "./chat-panel"
import Timeline from "@/pages/timeline"
import Analytics from "@/pages/analytics"
import type { NavSection } from "./bottom-nav-bar"
import type { MapLens } from "./map-lens-selector"
import type { ParsedQuery } from "./unified-search-bar"

interface AOI {
  name?: string
  lat: number
  lng: number
  radiusKm?: number
}

interface LensConfig {
  id: MapLens
  label: string
  shortLabel: string
  icon: typeof Building2
  description: string
}

const LENS_OPTIONS: LensConfig[] = [
  {
    id: "infrastructure",
    label: "Infrastructure",
    shortLabel: "Infra",
    icon: Building2,
    description: "Facilities, utilities, transport nodes"
  },
  {
    id: "human-activity",
    label: "Human Activity",
    shortLabel: "Activity",
    icon: Users,
    description: "Population movement, gatherings"
  },
  {
    id: "risk-stress",
    label: "Risk & Stress",
    shortLabel: "Risk",
    icon: AlertTriangle,
    description: "Threat indicators, vulnerabilities"
  },
  {
    id: "logistics",
    label: "Logistics",
    shortLabel: "Logistics",
    icon: Truck,
    description: "Supply routes, access points"
  }
]

interface IntelligencePanelProps {
  currentAOI: AOI
  activeTopPanel: NavSection | null
  activeBottomPanel: NavSection | null
  onClosePanel: () => void
  onMediaContextChange?: (ids: string[]) => void
  activeLens: MapLens
  onLensChange: (lens: MapLens) => void
  isChatOpen: boolean
  onToggleChat: () => void
  onQuerySubmit: (query: string, contextIds?: string[]) => void
  mediaContextIds: string[]
  activeSearchFilters?: ParsedQuery
  className?: string
}

export function IntelligencePanel({
  currentAOI,
  activeTopPanel,
  activeBottomPanel,
  onClosePanel,
  onMediaContextChange,
  activeLens,
  onLensChange,
  isChatOpen,
  onToggleChat,
  onQuerySubmit,
  mediaContextIds,
  activeSearchFilters,
  className
}: IntelligencePanelProps) {
  const [riskScore, setRiskScore] = useState(67)

  const handleRiskUpdate = (score: number, level: string) => {
    setRiskScore(score)
  }

  const handleFileAnalysis = (fileId: string, items: any[]) => {}

  const handleMediaContextChange = (ids: string[]) => {
    if (onMediaContextChange) {
      onMediaContextChange(ids)
    }
  }

  const hasActiveOverlay = activeTopPanel || activeBottomPanel

  const handleExport = () => {
    const riskLevel = riskScore >= 70 ? "HIGH" : riskScore >= 40 ? "MEDIUM" : "LOW";
    const exportData = {
      classification: "UNCLASSIFIED // FOUO",
      exportTimestamp: new Date().toISOString(),
      areaOfInterest: {
        name: currentAOI.name,
        coordinates: { lat: currentAOI.lat, lng: currentAOI.lng },
        radiusKm: currentAOI.radiusKm
      },
      contextSummary: `Intelligence assessment for ${currentAOI.name || "selected area"}. Analysis conducted using ${activeLens} lens with focus on ${activeSearchFilters?.events?.join(", ") || "general intelligence"}.`,
      riskAssessment: {
        score: riskScore,
        level: riskLevel,
        confidence: "MEDIUM",
        methodology: "Dempster-Shafer aggregation"
      },
      sources: [
        { name: "Field Report", reliability: "A" },
        { name: "Open Source", reliability: "B" },
        { name: "Social Media", reliability: "C" }
      ],
      activeFilters: activeSearchFilters,
      activeLens: activeLens,
      disclaimer: "This assessment is based on available open-source and reported intelligence. Confidence levels reflect source reliability aggregation."
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guideright-intel-${currentAOI.name || 'export'}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn("flex flex-col overflow-hidden", className)}>
      {/* Operational Status Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/50 border-b text-[10px] text-muted-foreground flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Shield className="h-3 w-3" />
            <span>All queries logged for audit and OPSEC review</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-amber-600">
          <WifiOff className="h-3 w-3" />
          <span>Offline cache: Not available</span>
        </div>
      </div>

      {/* Header - matches map header padding (p-3) */}
      <div className="flex-shrink-0 p-3 border-b bg-background space-y-3">
        {/* Row 1: AOI + Risk Badge + Export */}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-base font-semibold truncate">{currentAOI.name || "Area of Interest"}</h1>
            <p className="text-xs text-muted-foreground">
              {currentAOI.lat.toFixed(4)}, {currentAOI.lng.toFixed(4)}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExport}
              className="h-7 text-xs gap-1"
            >
              <Download className="h-3 w-3" />
              Export
            </Button>
            <div className="flex flex-col items-end gap-0.5">
              <Badge 
                variant={riskScore >= 70 ? "destructive" : riskScore >= 40 ? "secondary" : "outline"}
              >
                Risk: {riskScore}%
              </Badge>
              {activeSearchFilters && (activeSearchFilters.timeRange || activeSearchFilters.events?.length) && (
                <span className="text-[10px] text-muted-foreground">reflects current filter set</span>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Active Filters Indicator - shows when search filters are active */}
        {activeSearchFilters && (activeSearchFilters.timeRange || activeSearchFilters.events?.length || activeSearchFilters.infrastructure?.length) && (
          <div className="flex items-center gap-1.5 flex-wrap p-2 bg-muted/40 rounded-md">
            <Filter className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            {activeSearchFilters.timeRange && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <Clock className="h-3 w-3" />
                {activeSearchFilters.timeRange.label}
              </Badge>
            )}
            {activeSearchFilters.events?.map(event => (
              <Badge key={event} variant="outline" className="gap-1 text-xs border-amber-500/50 text-amber-600 dark:text-amber-400">
                <Zap className="h-3 w-3" />
                {event}
              </Badge>
            ))}
            {activeSearchFilters.infrastructure?.map(infra => (
              <Badge key={infra} variant="outline" className="gap-1 text-xs">
                <Building2 className="h-3 w-3" />
                {infra}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Row 3: Lens Selector - 2x2 grid */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Analysis Lens</p>
          <div className="grid grid-cols-2 gap-1.5">
            {LENS_OPTIONS.map((lens) => {
              const Icon = lens.icon
              const isActive = activeLens === lens.id
              return (
                <button
                  key={lens.id}
                  onClick={() => onLensChange(lens.id)}
                  className={cn(
                    "flex items-center gap-2 px-2.5 py-2 rounded-md text-left transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 hover-elevate text-muted-foreground hover:text-foreground"
                  )}
                  data-testid={`lens-${lens.id}`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm font-medium truncate">{lens.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content Area - proper flex layout, no absolute positioning */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {!hasActiveOverlay ? (
          /* Default View: Context Panel for selected lens */
          <ScrollArea className="flex-1">
            <MapContextPanel
              aoiName={currentAOI.name || "Dhaka"}
              activeLens={activeLens}
              onQuerySelect={(query) => {
                onQuerySubmit(query)
                if (!isChatOpen) onToggleChat()
              }}
              className="border-0 rounded-none"
            />
          </ScrollArea>
        ) : (
          /* Nav Panel Content - replaces context panel when active */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Panel Header */}
            <div className="p-3 border-b flex items-center justify-between bg-muted/30 flex-shrink-0">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                {activeTopPanel === "intelligence" && <><TrendingUp className="h-4 w-4" />Intelligence</>}
                {activeTopPanel === "analytics" && <><BarChart3 className="h-4 w-4" />Analytics</>}
                {activeTopPanel === "social" && <><Share2 className="h-4 w-4" />Social Media</>}
                {activeBottomPanel === "timeline" && <><Clock className="h-4 w-4" />Timeline</>}
                {activeBottomPanel === "weather" && <><CloudRain className="h-4 w-4" />Weather</>}
                {activeBottomPanel === "files" && <><Upload className="h-4 w-4" />Files</>}
                {activeBottomPanel === "settings" && <><Settings className="h-4 w-4" />Export</>}
              </h2>
              <Button size="icon" variant="ghost" onClick={onClosePanel}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Panel Content */}
            <div className="flex-1 overflow-auto">
              {activeTopPanel === "intelligence" && (
                <Tabs defaultValue="intelligence" className="h-full flex flex-col">
                  <TabsList className="mx-3 mt-3">
                    <TabsTrigger value="intelligence" className="flex-1">Intel</TabsTrigger>
                    <TabsTrigger value="pmesii" className="flex-1">PMESII</TabsTrigger>
                    <TabsTrigger value="risk" className="flex-1">Risk</TabsTrigger>
                  </TabsList>
                  <TabsContent value="intelligence" className="flex-1 p-3 overflow-auto">
                    <IntelligenceIntegration />
                  </TabsContent>
                  <TabsContent value="pmesii" className="flex-1 p-3 overflow-auto">
                    <PMESIIBriefing aoi={currentAOI} />
                  </TabsContent>
                  <TabsContent value="risk" className="flex-1 p-3 overflow-auto">
                    <RiskAssessment aoi={currentAOI} onRiskUpdate={handleRiskUpdate} />
                  </TabsContent>
                </Tabs>
              )}
              
              {activeTopPanel === "analytics" && <Analytics />}
              {activeTopPanel === "social" && <div className="p-3"><SocialMediaPanel /></div>}
              {activeBottomPanel === "timeline" && <Timeline />}
              {activeBottomPanel === "weather" && <div className="p-3"><WeatherPanel /></div>}
              {activeBottomPanel === "files" && (
                <div className="p-3">
                  <FileDrop 
                    onAnalysisComplete={handleFileAnalysis}
                    onFilesChange={handleMediaContextChange}
                    maxFiles={5}
                    compact={false}
                  />
                </div>
              )}
              {activeBottomPanel === "settings" && (
                <ExportPanel 
                  currentAOI={currentAOI}
                  activeTopPanel={activeTopPanel}
                  activeBottomPanel={activeBottomPanel}
                />
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Chat Panel - Docked at bottom */}
      <div className={cn(
        "border-t flex-shrink-0 flex flex-col",
        isChatOpen ? "h-64" : "h-12"
      )}>
        <button
          onClick={onToggleChat}
          className="w-full h-12 flex-shrink-0 px-4 flex items-center justify-between bg-muted/50 hover-elevate"
          data-testid="button-toggle-chat"
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <MessageSquare className="h-4 w-4" />
            Chat Assistant
          </span>
          {isChatOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronUp className="h-4 w-4" />
          )}
        </button>
        {isChatOpen && (
          <div className="flex-1 overflow-hidden">
            <ChatPanel 
              onQuerySubmit={onQuerySubmit}
              mediaContextIds={mediaContextIds}
              className="h-full"
            />
          </div>
        )}
      </div>
    </div>
  )
}
